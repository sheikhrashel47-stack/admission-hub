/*
 * ADMISSION HUB · v112 · স্টাডি বন্ধু AI (chat-style study helper)
 * ── Chorcha-স্টাইল চ্যাট UI; দুই ইঞ্জিন:
 *   ⚡ দ্রুত: অ্যাপের নিজস্ব AI-provider key (Settings → AI Assistant) — ৩–৮ সেকেন্ড, প্রায়-ফ্রি
 *   🌐 ব্রাউজার এজেন্ট: Browser Use cloud (worker /api/ask, 11-key pool) — ওয়েব ঘেঁটে সত্যি-তথ্য, ১–৩ মিনিট
 * ── প্রথম খোলায় একবার: ডেটা-শেয়ার কার্ড (প্রশ্নব্যাংক + পরীক্ষা-ইতিহাসের সারসংক্ষেপ → এজেন্ট প্রসঙ্গ)
 * ── Zero-access নীতি বহাল: এজেন্টের অ্যাপ/কোড/CF/GitHub-এ কোনো অ্যাক্সেস নেই; শুধু পাঠানো টেক্সট।
 */
(function installStudyAi() {
  'use strict';
  if (window.StudyAiTool) return;
  const ROUTE = 'study-ai';
  const route = () => (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const WORKER = 'https://admission-gk.rashelzayan213.workers.dev';
  const APP_HEADER = { 'X-AH-App': 'admission-hub' };
  const LS_CTX = 'studyAiCtx', LS_SHARED = 'studyAiShared', LS_CHAT = 'studyAiChat', LS_ENGINE = 'studyAiEngine';

  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'm' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);

  let state = { msgs: [], engine: localStorage.getItem(LS_ENGINE) || 'fast', busy: false, askPoll: null };

  // ── ডেটা-সংগ্রহ (সারসংক্ষেপ, কাঁচা ব্যাংক নয়) ────────────────────────────────
  const cache = () => (typeof CACHE !== 'undefined' && CACHE) || window.CACHE || {};
  const buildStudyContext = () => {
    const c = cache();
    const qs = c.questions || [], ex = c.examResults || [], voc = c.vocabulary || [];
    const bySub = {};
    qs.forEach(q => { const s = (q.subjectId || 'অন্য'); bySub[s] = (bySub[s] || 0) + 1; });
    const topSubs = Object.entries(bySub).sort((a, b) => b[1] - a[1]).slice(0, 6);
    const subName = id => { try { const s = (c.subjects || []).find(x => x.id === id); return (s && s.name) || String(id).slice(0, 20); } catch (_) { return '?'; } };
    const recents = ex.slice(0, 10).map(e => {
      const total = (e.totalQuestions || e.questions?.length || 0);
      const correct = Number(e.correctCount ?? e.correct ?? 0);
      return `${(e.completedAt || e.date || '').slice(0, 10)}: ${correct}/${total}`;
    });
    const accs = ex.map(e => { const t = (e.totalQuestions || e.questions?.length || 0); return t ? (Number(e.correctCount ?? e.correct ?? 0) / t) * 100 : null; }).filter(x => x !== null);
    const avg = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null;
    const wrongTopics = {};
    (c.mistakes || []).forEach(m => { const t = m?.q?.topicId || m?.topic || '?'; wrongTopics[t] = (wrongTopics[t] || 0) + 1; });
    const weak = Object.entries(wrongTopics).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t, n]) => `${t}(${n}বার)`);
    return `প্রশ্নব্যাংক: ${bn(qs.length)}টি প্রশ্ন। মূল বিষয়: ${topSubs.map(([s, n]) => `${subName(s)} ${bn(n)}টি`).join(', ') || '—'}। পরীক্ষা: ${bn(ex.length)}টি${avg !== null ? `, গড় নির্ভুলতা ${bn(avg)}%` : ''}। সাম্প্রতিক: ${recents.slice(0, 5).join(' | ') || '—'}। ভোকাবুলারি: ${bn(voc.length)}টি। দুর্বল টপিক: ${weak.join(', ') || 'এখনো যথেষ্ট ভুল নেই'}।`;
  };

  const sysPrompt = () => `তুমি "স্টাডি বন্ধু" — বাংলাদেশি বিশ্ববিদ্যালয় ভর্তি-প্রস্তুতির বন্ধুসুলভ AI সহকারী (অ্যাপ: Admission Hub)।
নিয়ম: সহজ-উষ্ণ বাংলায় তুমি-ফর্মে কথা বলো; উত্তর ছোট ও সোজা (সাধারণত ২-৬ লাইন; ব্যাখ্যা দরকার হলে ধাপে ধাপে); হালকা emoji ঠিক আছে কিন্তু অতিরিক্ত নয়; ভুল তথ্য কখনো বানাবে না — নিশ্চিত না হলে স্বচ্ছভাবে বলবে। পড়াশোনা, GK, পরীক্ষা-কৌশল, রিভিশন-প্ল্যান, ইংরেজি/গণিত/সাধারণ জ্ঞান — সবে সাহায্য করবে।
${localStorage.getItem(LS_CTX) ? `শিক্ষার্থীর ডেটা (এই প্রসঙ্গ কাজে লাগাও, কাঁচা ডেটা ফেরত লিখো না):\n${localStorage.getItem(LS_CTX)}` : ''}`;

  // ── ⚡ দ্রুত ইঞ্জিন: অ্যাপের provider key → Gemini/Groq ──────────────────────
  const hasKey = () => { try { return typeof getProviderKey === 'function' ? !!getProviderKey() : !!(typeof getAiProvider === 'function'); } catch (_) { return false; } };
  const askFast = async question => {
    const provider = (typeof getAiProvider === 'function' ? getAiProvider() : 'gemini');
    const key = (typeof getProviderKey === 'function' ? getProviderKey(provider) : localStorage.getItem('ai_key_gemini') || '');
    if (!key) throw new Error('no-key');
    const contents = state.msgs.filter(m => !m.err).slice(-10).map(m => ({ role: m.who === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
    const sys = { system_instruction: { parts: [{ text: sysPrompt() }] }, contents, generationConfig: { temperature: 0.5, maxOutputTokens: 1024 } };
    if (provider === 'groq') {
      const model = (typeof getProviderModel === 'function' && getProviderModel(provider)) || 'llama-3.3-70b-versatile';
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify({ model, messages: [{ role: 'system', content: sysPrompt() }, ...contents.map(c => ({ role: c.role, content: c.parts[0].text }))], temperature: 0.5, max_tokens: 1024 }) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
      return String(d.choices?.[0]?.message?.content || '').trim() || 'উত্তর পাইনি — আবার লেখো?';
    }
    const model = (typeof getProviderModel === 'function' && getProviderModel(provider)) || 'gemini-3.5-flash-lite';
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sys) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
    const text = (d.candidates?.[0]?.content?.parts || []).map(p => p.text || '').join('');
    return String(text).trim() || 'উত্তর পাইনি — আবার লেখো?';
  };

  // ── 🌐 ব্রাউজার-এজেন্ট ইঞ্জিন: worker /api/ask ───────────────────────────────
  const askAgent = async question => {
    const res = await fetch(WORKER + '/api/ask', { method: 'POST', headers: { ...APP_HEADER, 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: (localStorage.getItem(LS_CTX) || '').slice(0, 500) }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error === 'all-keys-exhausted' ? 'সব key ব্যস্ত — একটু পরে আবার' : d.error || 'HTTP ' + res.status);
    if (!d.id) throw new Error('এজেন্ট শুরু করা যায়নি — আবার চেষ্টা করো');
    const started = Date.now();
    while (Date.now() - started < 4.5 * 60000) {
      await new Promise(r => setTimeout(r, 8000));
      const st = await fetch(WORKER + '/api/ask/' + d.id, { headers: APP_HEADER }).then(r => r.json()).catch(() => ({}));
      if (st.status === 'finished') return { text: st.answer, sources: st.sources || [] };
      if (st.status === 'failed') throw new Error('এজেন্ট এবার উত্তর দিতে পারেনি — আবার চেষ্টা করো');
    }
    throw new Error('সময় শেষ — প্রশ্নটা বেশ ভারী ছিল; আবার পাঠাও');
  };

  const saveMsgs = () => { try { localStorage.setItem(LS_CHAT, JSON.stringify(state.msgs.slice(-40))); } catch (_) {} };
  const loadMsgs = () => { try { state.msgs = JSON.parse(localStorage.getItem(LS_CHAT) || '[]'); } catch (_) { state.msgs = []; } };

  // ── UI ───────────────────────────────────────────────────────────────────────
  const bubble = m => `<div class="sai-row ${m.who}"><div class="sai-bubble">${m.who === 'ai' && !m.text ? '<span class="sai-dots"><i></i><i></i><i></i></span>' : esc(m.text).replace(/\n/g, '<br>')}${m.sources?.length ? `<div class="sai-src">🔗 ${m.sources.map(esc).join(' · ')}</div>` : ''}</div></div>`;
  const greetingMsg = () => ({ who: 'ai', text: `হ্যালো! আমি তোমার স্টাডি বন্ধু 🤝\nযা চাও বলো — GK, ইংরেজি, গণিত, রিভিশন-প্ল্যান, পরীক্ষার কৌশল…\n${hasKey() ? '⚡ দ্রুত-উত্তর মোডে আছি!' : '⚡ দ্রুত-উত্তরের জন্য Settings → AI Assistant-এ ফ্রি Gemini key বসাও (২ মিনিট) — ততক্ষণ 🌐 ব্রাউজার-এজেন্ট মোডে সাহায্য করব।'}` });

  const renderChat = () => {
    const shared = localStorage.getItem(LS_SHARED) === '1';
    const shareCard = shared ? '' : `<div class="card sai-share"><b>📊 এজেন্টকে তোমার ডেটা দাও?</b><p class="muted" style="margin:6px 0 10px">একবার চাপ দিলে অ্যাপ পাঠাবে <b>সারসংক্ষেপ</b> — কত প্রশ্ন, কোন বিষয়ে কত, পরীক্ষার স্কোর আর দুর্বল টপিক। এরপর এজেন্ট তোমার অবস্থা বুঝে পরামর্শ দেবে। (কাঁচা ডেটা যায় না; যখন চাও মুছে ফেলা যাবে)</p><button class="btn" onclick="StudyAiTool.shareData()">✅ ডেটা শেয়ার করো</button><button class="btn ghost sm" style="margin-left:8px" onclick="StudyAiTool.skipShare()">পরে</button></div>`;
    const chips = ['আজ কী পড়বো?', 'দুর্বল টপিক বলো', '৭ দিনের রিভিশন প্ল্যান', 'GK কুইজ দাও'].map(t => `<button class="chip" onclick="StudyAiTool.quick('${t}')">${t}</button>`).join('');
    const eng = `<div class="sai-engbar"><button class="chip ${state.engine === 'fast' ? 'active' : ''}" onclick="StudyAiTool.setEngine('fast')">⚡ দ্রুত ${hasKey() ? '' : '(key নেই)'}</button><button class="chip ${state.engine === 'agent' ? 'active' : ''}" onclick="StudyAiTool.setEngine('agent')">🌐 ব্রাউজার এজেন্ট</button><span class="muted" style="font-size:10.5px;margin-left:6px">${state.engine === 'fast' ? '৩–৮ সেকেন্ড · প্রায়-ফ্রি' : 'ওয়েব ঘেঁটে · ১–৩ মিনিট · BU কোটা'}</span></div>`;
    const msgs = state.msgs.map(bubble).join('');
    return `<div class="sai-page">${shareCard}<div class="sai-msgs" id="saiMsgs">${msgs || ''}</div>${eng}<div class="sai-inputbar"><input id="saiInput" type="text" placeholder="প্রশ্ন লেখো…" onkeydown="if(event.key==='Enter')StudyAiTool.send()"><button class="btn" ${state.busy ? 'disabled' : ''} onclick="StudyAiTool.send()">➤</button></div><div class="sai-chips">${chips}</div></div>`;
  };

  const scrollEnd = () => { const el = document.getElementById('saiMsgs'); if (el) el.scrollTop = el.scrollHeight; };
  const paint = () => { const b = document.getElementById('saiBody'); if (b) { b.innerHTML = renderChat(); scrollEnd(); } };

  const push = m => { state.msgs.push(m); saveMsgs(); paint(); };

  const send = async () => {
    if (state.busy) return;
    const input = document.getElementById('saiInput');
    const text = String(input?.value || '').trim();
    if (!text) return;
    if (input) input.value = '';
    state.busy = true;
    push({ who: 'me', text });
    push({ who: 'ai', text: '' });
    try {
      if (state.engine === 'agent') {
        const r = await askAgent(text);
        state.msgs[state.msgs.length - 1] = { who: 'ai', text: r.text, sources: r.sources };
      } else {
        if (!hasKey()) throw new Error('no-key');
        const r = await askFast(text);
        state.msgs[state.msgs.length - 1] = { who: 'ai', text: r };
      }
    } catch (e) {
      const msg = String(e?.message || e);
      state.msgs[state.msgs.length - 1] = { who: 'ai', text: msg === 'no-key' ? '⚡ দ্রুত-উত্তরের জন্য ফ্রি Gemini key দরকার — Settings → AI Assistant-এ বসাও (aistudio.google.com থেকে ১ মিনিটে পাওয়া যায়)। অথবা 🌐 ব্রাউজার-এজেন্ট মোডে পাঠাও।' : `দুঃখিত, এবার হয়নি: ${msg}` };
    }
    state.busy = false; saveMsgs(); paint();
  };

  const shareData = () => {
    localStorage.setItem(LS_CTX, buildStudyContext());
    localStorage.setItem(LS_SHARED, '1');
    const c = cache();
    push({ who: 'ai', text: `রাখলাম! 📚\nতোমার ব্যাংকে ${bn((c.questions || []).length)}টি প্রশ্ন, ${bn((c.examResults || []).length)}টি পরীক্ষা${(c.examResults || []).length ? ' — সাম্প্রতিক স্কোরগুলোও দেখলাম' : ''}। এখন থেকে তোমার অবস্থা বুঝে পরামর্শ দেব।\nবলো শুরু কোথা থেকে করবে? 😊` });
  };
  const skipShare = () => { localStorage.setItem(LS_SHARED, '1'); paint(); };
  const quick = t => { const i = document.getElementById('saiInput'); if (i) { i.value = t; send(); } };
  const setEngine = e => { state.engine = e; localStorage.setItem(LS_ENGINE, e); paint(); };

  const render = () => {
    if (!state.msgs.length) { loadMsgs(); if (!state.msgs.length) state.msgs = [greetingMsg()]; }
    renderShell(`<div id="saiBody">${renderChat()}</div>`, { title: 'স্টাডি বন্ধু AI' });
    const st = document.getElementById('saiAgentStyle');
    if (!st) { const s = document.createElement('style'); s.id = 'saiAgentStyle'; s.textContent = `
.sai-page{display:flex;flex-direction:column;min-height:70vh}
.sai-share{margin-bottom:10px;border-left:4px solid var(--emerald,#0f6b4f)}
.sai-msgs{flex:1;overflow-y:auto;padding:4px 2px 10px;max-height:52vh}
.sai-row{display:flex;margin:8px 0}.sai-row.me{justify-content:flex-end}
.sai-bubble{max-width:82%;padding:10px 13px;border-radius:16px;font-size:14px;line-height:1.55;white-space:pre-wrap}
.me .sai-bubble{background:var(--emerald,#0f6b4f);color:#fff;border-bottom-right-radius:5px}
.ai .sai-bubble{background:var(--bg,#f3f4f6);border-bottom-left-radius:5px}
.sai-src{margin-top:8px;font-size:11px;color:var(--sub,#6b7280)}
.sai-dots{display:inline-flex;gap:4px;padding:4px 2px}.sai-dots i{width:7px;height:7px;border-radius:50%;background:var(--sub,#9ca3af);animation:saiB 1.1s infinite}
.sai-dots i:nth-child(2){animation-delay:.18s}.sai-dots i:nth-child(3){animation-delay:.36s}
@keyframes saiB{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.sai-engbar{display:flex;align-items:center;gap:6px;padding:6px 0;flex-wrap:wrap}
.sai-inputbar{display:flex;gap:8px;padding:8px 0 4px;position:sticky;bottom:0;background:var(--bg,#fff)}
.sai-inputbar input{flex:1;padding:12px 14px;border-radius:14px;border:1.5px solid var(--line,#e5e7eb);background:#fff;font-size:14px}
.sai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:6px 0 12px}
`; document.head.appendChild(s); }
    setTimeout(() => { const i = document.getElementById('saiInput'); i && i.focus(); }, 120);
    paint();
  };

  // ── ড্যাশবোর্ড এন্ট্রি (GK-এর প্রমাণিত observer-প্যাটার্ন) ────────────────────
  const MOUNT_ID = 'studyAiDashboardEntry';
  const mountDashboard = () => {
    try {
      const page = document.getElementById('app');
      if (!page || document.getElementById(MOUNT_ID)) return;
      if (route() !== 'dashboard' && !page.querySelector('[data-unified-study-tools-list]')) return;
      const host = page.querySelector('[data-unified-study-tools-list]');
      if (!host) return;
      const entry = document.createElement('button');
      entry.type = 'button';
      entry.id = MOUNT_ID;
      entry.className = 'standalone-mock-dashboard-entry p3-unified-tool-row-v3';
      entry.setAttribute('aria-label', 'স্টাডি বন্ধু AI খুলুন');
      entry.onclick = () => navigate(ROUTE);
      entry.innerHTML = `<span class="standalone-mock-dashboard-mark" aria-hidden="true">🎓</span><span class="standalone-mock-dashboard-copy"><b>স্টাডি বন্ধু AI</b><small>যেকোনো পড়ায় বন্ধুর মতো সাহায্য — চ্যাটে, তোমার ডেটা বুঝে</small></span><span class="standalone-mock-dashboard-arrow" aria-hidden="true">›</span>`;
      host.appendChild(entry);
    } catch (_) {}
  };
  const bootMount = () => {
    const app = document.getElementById('app');
    if (!app || window.__studyAiObserver) return;
    window.__studyAiObserver = new MutationObserver(() => setTimeout(mountDashboard, 60));
    window.__studyAiObserver.observe(app, { childList: true, subtree: true });
    window.addEventListener?.('hashchange', () => setTimeout(mountDashboard, 250));
    [1200, 2500, 4500].forEach(d => setTimeout(mountDashboard, d));
  };

  window.StudyAiTool = { render, send, quick, setEngine, shareData, skipShare };
  if (typeof document !== 'undefined') bootMount();
})();
