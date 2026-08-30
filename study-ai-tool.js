/*
 * ADMISSION HUB · v113 · স্টাডি বন্ধু AI (Admihub AI) — Chorcha-স্টাইল চ্যাট
 * ── ল্যান্ডিং: Admihub AI লোগো + "হ্যালো, {নাম}!" + একবারের ডেটা-শেয়ার কার্ড (সেটিংস মাত্র ১ বার)
 * ── ইঞ্জিন: Browser Use cloud এজেন্ট (dedicated key, worker /api/ask) — ডেটা/তথ্য-কাজ এখানেই
 * ── Gemini (ক্যাজুয়াল চ্যাট) অপশনাল — পরে যোগ হবে
 * ── Zero-access নীতি: এজেন্ট কোথাও কিছু অ্যাক্সেস করে না; শুধু পাঠানো টেক্সট।
 */
(function installStudyAi() {
  'use strict';
  if (window.StudyAiTool) return;
  const ROUTE = 'study-ai';
  const route = () => (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const WORKER = 'https://admission-gk.rashelzayan213.workers.dev';
  const APP_HEADER = { 'X-AH-App': 'admission-hub' };
  const LS_CTX = 'studyAiCtx', LS_SHARED = 'studyAiShared', LS_CHAT = 'studyAiChat', LS_NAME = 'studyAiName';

  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const nameOf = () => localStorage.getItem(LS_NAME) || 'রাশেল';

  let state = { msgs: [], busy: false, topics: false };

  const cache = () => (typeof CACHE !== 'undefined' && CACHE) || window.CACHE || {};

  // ── ডেটা-সারসংক্ষেপ (সম্পূর্ণ defensive — কোনো ডেটা-টাইপেই ক্র্যাশ নয়) ─────────
  const dateStr = v => { try { if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10); if (typeof v === 'number' && isFinite(v)) return new Date(v).toISOString().slice(0, 10); return String(v ?? '').slice(0, 10); } catch (_) { return ''; } };
  const buildStudyContext = () => {
    try {
      const c = cache();
      const qs = Array.isArray(c.questions) ? c.questions : [];
      const ex = Array.isArray(c.examResults) ? c.examResults : [];
      const voc = Array.isArray(c.vocabulary) ? c.vocabulary : [];
      const mis = Array.isArray(c.mistakes) ? c.mistakes : [];
      const bySub = {};
      qs.forEach(q => { const s = String((q && q.subjectId) || 'অন্য'); bySub[s] = (bySub[s] || 0) + 1; });
      const subName = id => { try { const s = (c.subjects || []).find(x => x && x.id === id); return (s && s.name) ? String(s.name) : String(id).slice(0, 16); } catch (_) { return '?'; } };
      const topSubs = Object.entries(bySub).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s, n]) => `${subName(s)} ${bn(n)}টি`);
      const recents = ex.slice(0, 8).map(e => {
        try {
          const total = Number(e && (e.totalQuestions ?? (Array.isArray(e.questions) ? e.questions.length : 0))) || 0;
          const correct = Number(e && (e.correctCount ?? e.correct)) || 0;
          return `${dateStr(e && (e.completedAt ?? e.date))}: ${bn(correct)}/${bn(total)}`;
        } catch (_) { return ''; }
      }).filter(Boolean);
      const accs = ex.map(e => { try { const t = Number(e && (e.totalQuestions ?? (Array.isArray(e.questions) ? e.questions.length : 0))) || 0; return t ? (Number(e && (e.correctCount ?? e.correct)) || 0) / t * 100 : null; } catch (_) { return null; } }).filter(x => x !== null);
      const avg = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null;
      const wrongTopics = {};
      mis.forEach(m => { try { const t = String((m && m.q && m.q.topicId) || (m && m.topic) || '?'); wrongTopics[t] = (wrongTopics[t] || 0) + 1; } catch (_) {} });
      const weak = Object.entries(wrongTopics).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t, n]) => `${t}(${bn(n)}বার)`);
      return `প্রশ্নব্যাংক: ${bn(qs.length)}টি প্রশ্ন। মূল বিষয়: ${topSubs.join(', ') || '—'}। পরীক্ষা: ${bn(ex.length)}টি${avg !== null ? `, গড় নির্ভুলতা ${bn(avg)}%` : ''}। সাম্প্রতিক স্কোর: ${recents.slice(0, 5).join(' | ') || '—'}। ভোকাবুলারি: ${bn(voc.length)}টি। দুর্বল টপিক: ${weak.join(', ') || 'এখনো যথেষ্ট ভুল নেই'}।`;
    } catch (_) { return 'ডেটা-সারসংক্ষেপ এবার পড়া গেল না।'; }
  };

  const sysPrompt = () => `তুমি "স্টাডি বন্ধু" — বাংলাদেশি বিশ্ববিদ্যালয় ভর্তি-প্রস্তুতির বন্ধুসুলভ AI সহকারী (অ্যাপ: Admission Hub / Admihub AI)।
নিয়ম: সহজ-উষ্ণ বাংলায় তুমি-ফর্মে কথা বলো; উত্তর ছোট ও সোজা (সাধারণত ২-৬ লাইন; ব্যাখ্যা দরকার হলে ধাপে ধাপে); হালকা emoji ঠিক আছে কিন্তু অতিরিক্ত নয়; ভুল তথ্য কখনো বানাবে না — নিশ্চিত না হলে স্বচ্ছভাবে বলবে বা ওয়েব ঘেঁটে যাচাই করবে। পড়াশোনা, GK, পরীক্ষা-কৌশল, রিভিশন-প্ল্যান, ইংরেজি/গণিত/সাধারণ জ্ঞান — সবে সাহায্য করবে।
${localStorage.getItem(LS_CTX) ? `শিক্ষার্থীর ডেটা (প্রসঙ্গ হিসেবে কাজে লাগাও, কাঁচা ডেটা ফেরত লিখো না):\n${localStorage.getItem(LS_CTX)}` : ''}`;

  // ── Browser Use এজেন্ট (dedicated key, worker) ──────────────────────────────
  const askAgent = async question => {
    const res = await fetch(WORKER + '/api/ask', { method: 'POST', headers: { ...APP_HEADER, 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: (localStorage.getItem(LS_CTX) || '').slice(0, 500) }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error === 'all-keys-exhausted' ? 'এজেন্ট এখন ব্যস্ত — ১-২ মিনিট পরে আবার পাঠাও' : d.error === 'ask-key-not-configured' ? 'চ্যাট-এজেন্ট key এখনো জোড়া হয়নি' : 'সংযোগ করা গেল না — নেট দেখে আবার চেষ্টা করো');
    if (!d.id) throw new Error('এজেন্ট শুরু করা যায়নি — আবার চেষ্টা করো');
    const started = Date.now();
    while (Date.now() - started < 4.5 * 60000) {
      await new Promise(r => setTimeout(r, 7000));
      const st = await fetch(WORKER + '/api/ask/' + d.id, { headers: APP_HEADER }).then(r => r.json()).catch(() => ({}));
      if (st.status === 'finished') return { text: st.answer, sources: st.sources || [] };
      if (st.status === 'failed') throw new Error('এজেন্ট এবার উত্তর দিতে পারেনি — প্রশ্নটা আবার পাঠাও');
    }
    throw new Error('সময় শেষ — প্রশ্নটা বেশ ভারী ছিল; আবার পাঠাও');
  };

  const saveMsgs = () => { try { localStorage.setItem(LS_CHAT, JSON.stringify(state.msgs.slice(-40))); } catch (_) {} };
  const loadMsgs = () => { try { state.msgs = JSON.parse(localStorage.getItem(LS_CHAT) || '[]'); } catch (_) { state.msgs = []; } };

  // ── UI ───────────────────────────────────────────────────────────────────────
  const bubble = m => `<div class="sai-row ${m.who}"><div class="sai-bubble">${m.who === 'ai' && !m.text ? '<span class="sai-dots"><i></i><i></i><i></i></span>' : esc(m.text).replace(/\n/g, '<br>')}${m.sources?.length ? `<div class="sai-src">🔗 ${m.sources.map(esc).join(' · ')}</div>` : ''}</div></div>`;
  const TOPICS = [['📚', 'বাংলা', 'বাংলা বিষয়ে সাহায্য করো — ভর্তি-পরীক্ষার গুরুত্বপূর্ণ অধ্যায় আর কৌশল বলো'], ['🔤', 'English', 'Help me with English for university admission — important grammar topics and strategy in Bangla'], ['🧮', 'গণিত', 'গণিতের ভর্তি-পরীক্ষার প্রস্তুতি নিয়ে সাহায্য করো — গুরুত্বপূর্ণ অধ্যায় ও শর্টকাট টেকনিক'], ['🧠', 'সাধারণ জ্ঞান', 'সাধারণ জ্ঞান (GK) কীভাবে কার্যকর পড়বো — রুটিনসহ বলো'], ['🌍', 'ভূগোল ও পরিবেশ', 'ভূগোল ও পরিবেশ বিষয়ের গুরুত্বপূর্ণ টপিক আর রিভিশন-কৌশল বলো'], ['📅', 'রিভিশন-প্ল্যান', 'আমার জন্য ৭ দিনের রিভিশন-প্ল্যান বানাও'], ['🎯', 'পরীক্ষা-কৌশল', 'ভর্তি পরীক্ষার হলে সময় ও নেগেটিভ মার্কিং ম্যানেজ করার কৌশল বলো'], ['📊', 'আমার অবস্থা-বিশ্লেষণ', 'আমার ডেটা দেখে বলো — কোথায় দুর্বল, এখন কী করা উচিত?'], ['⚡', 'GK কুইজ', 'আমাকে ৫টা GK কুইজ প্রশ্ন দাও — একে একে, উত্তর পরে জানাবো']];
  const chipText = ['আজ কী পড়বো?', 'দুর্বল টপিক বলো', '৭ দিনের রিভিশন প্ল্যান', 'GK কুইজ দাও'];

  const shareCard = () => `<div class="card sai-share"><b>📊 এজেন্টকে তোমার ডেটা দাও?</b><p class="muted" style="margin:6px 0 10px">একবার চাপ দিলে অ্যাপ পাঠাবে <b>সারসংক্ষেপ</b> — কত প্রশ্ন, কোন বিষয়ে কত, পরীক্ষার স্কোর আর দুর্বল টপিক। এরপর এজেন্ট তোমার অবস্থা বুঝে পরামর্শ দেবে। (কাঁচা ডেটা যায় না · এই প্রশ্নটা আর আসবে না)</p><button class="btn" onclick="StudyAiTool.shareData()">✅ ডেটা শেয়ার করো</button><button class="btn ghost sm" style="margin-left:8px" onclick="StudyAiTool.skipShare()">পরে</button></div>`;

  const landing = () => {
    const first = localStorage.getItem(LS_SHARED) !== '1';
    return `<div class="sai-landing"><div class="sai-logo"><span>🤖</span><i>✨</i></div><div class="sai-hello">হ্যালো, <b class="sai-name" onclick="StudyAiTool.editName()">${esc(nameOf())}</b>!</div><div class="sai-sub">আজ তোমাকে কীভাবে সাহায্য করবো?</div>${first ? shareCard() : ''}<div class="sai-note">🌐 ব্রাউজার-এজেন্ট সত্যিই ওয়েব ঘেঁটে যাচাই করে উত্তর দেয় — সাধারণত ১০ সেকেন্ড–৩ মিনিট, কাজ বড় হলে বেশি</div></div>`;
  };

  const inputBar = () => `<div class="sai-inputbar"><button class="sai-plus" onclick="StudyAiTool.openTopics()" aria-label="বিষয়">＋</button><input id="saiInput" type="text" placeholder="প্রশ্ন লেখো…" onkeydown="if(event.key==='Enter')StudyAiTool.send()"><button class="sai-send" ${state.busy ? 'disabled' : ''} onclick="StudyAiTool.send()" aria-label="পাঠাও">▲</button></div>`;

  const topicsSheet = () => !state.topics ? '' : `<div class="sai-sheet-bg" onclick="StudyAiTool.closeTopics()"><div class="sai-sheet" onclick="event.stopPropagation()"><div class="sai-sheet-grip"></div><h3>কোন বিষয়ে প্রথম করছো?</h3><div class="sai-sheet-list">${TOPICS.map(([e, n], i) => `<button class="sai-sheet-item" onclick="StudyAiTool.topicSend(${i})"><span>${e}</span> ${esc(n)}</button>`).join('')}</div></div></div>`;

  const renderChat = () => state.msgs.length ? `<div class="sai-msgs" id="saiMsgs">${state.msgs.map(bubble).join('')}</div><div class="sai-chips">${chipText.map(t => `<button class="chip" onclick="StudyAiTool.quick('${t}')">${t}</button>`).join('')}</div>` : landing();

  const paint = () => { const b = document.getElementById('saiBody'); if (b) { b.innerHTML = renderChat() + inputBar() + topicsSheet(); const el = document.getElementById('saiMsgs'); if (el) el.scrollTop = el.scrollHeight; } };

  const render = () => {
    if (!state.msgs.length) loadMsgs();
    renderShell(`<div id="saiBody"></div>`, { title: 'স্টাডি বন্ধু AI' });
    if (!document.getElementById('saiAgentStyle')) {
      const s = document.createElement('style'); s.id = 'saiAgentStyle'; s.textContent = `
.sai-page{display:flex;flex-direction:column;min-height:74vh}
.sai-landing{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:18px 8px}
.sai-logo{position:relative;width:88px;height:88px;border-radius:26px;background:linear-gradient(135deg,#5b5bf0,#a34ef0);display:flex;align-items:center;justify-content:center;box-shadow:0 10px 26px rgba(107,79,240,.32)}
.sai-logo span{font-size:46px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.18))}
.sai-logo i{position:absolute;top:-7px;right:-7px;font-style:normal;font-size:22px}
.sai-hello{font-size:27px;font-weight:800;margin-top:16px}
.sai-name{background:linear-gradient(90deg,#e0447c,#7a5cf0);-webkit-background-clip:text;background-clip:text;color:transparent}
.sai-sub{font-size:15px;color:var(--sub,#6b7280);margin-top:5px}
.sai-note{font-size:10.5px;color:var(--sub,#9ca3af);margin-top:14px;max-width:300px;line-height:1.5}
.sai-share{margin-top:18px;text-align:left;border-left:4px solid var(--emerald,#0f6b4f);font-size:12.5px;max-width:340px}
.sai-msgs{flex:1;overflow-y:auto;padding:4px 2px 8px;max-height:52vh}
.sai-row{display:flex;margin:8px 0}.sai-row.me{justify-content:flex-end}
.sai-bubble{max-width:82%;padding:10px 13px;border-radius:16px;font-size:14px;line-height:1.55;white-space:pre-wrap}
.me .sai-bubble{background:var(--emerald,#0f6b4f);color:#fff;border-bottom-right-radius:5px}
.ai .sai-bubble{background:var(--bg,#f3f4f6);border-bottom-left-radius:5px}
.sai-src{margin-top:8px;font-size:11px;color:var(--sub,#6b7280)}
.sai-dots{display:inline-flex;gap:4px;padding:4px 2px}.sai-dots i{width:7px;height:7px;border-radius:50%;background:var(--sub,#9ca3af);animation:saiB 1.1s infinite}
.sai-dots i:nth-child(2){animation-delay:.18s}.sai-dots i:nth-child(3){animation-delay:.36s}
@keyframes saiB{0%,60%,100%{opacity:.35;transform:translateY(0)}30%{opacity:1;transform:translateY(-3px)}}
.sai-inputbar{display:flex;gap:8px;align-items:center;padding:10px 0 6px;position:sticky;bottom:0;background:var(--bg,#fff)}
.sai-plus{flex:0 0 44px;height:44px;border-radius:50%;background:var(--bg,#f3f4f6);border:1px solid var(--line,#e5e7eb);font-size:22px;color:var(--sub,#4b5563)}
.sai-inputbar input{flex:1;padding:12px 16px;border-radius:24px;border:1.5px solid var(--line,#e5e7eb);background:#fff;font-size:14px}
.sai-send{flex:0 0 46px;height:46px;border-radius:50%;background:var(--emerald,#0f6b4f);color:#fff;font-size:17px;box-shadow:0 4px 10px rgba(15,107,79,.25)}
.sai-send:disabled{opacity:.5}
.sai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:4px 0 10px}
.sai-sheet-bg{position:fixed;inset:0;background:rgba(0,0,0,.42);z-index:90;display:flex;align-items:flex-end}
.sai-sheet{width:100%;background:var(--card,#fff);border-radius:22px 22px 0 0;padding:10px 14px 22px;max-height:72vh;overflow-y:auto}
.sai-sheet-grip{width:42px;height:4px;border-radius:4px;background:var(--line,#d1d5db);margin:2px auto 10px}
.sai-sheet h3{text-align:center;font-size:17px;margin:2px 0 12px}
.sai-sheet-item{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;margin:7px 0;border:1px solid var(--line,#e5e7eb);border-radius:14px;background:var(--card,#fff);font-size:14.5px;font-weight:600}
.sai-sheet-item span{font-size:19px}
`; document.head.appendChild(s);
    }
    paint();
    setTimeout(() => { const i = document.getElementById('saiInput'); i && i.focus(); }, 120);
  };

  const push = m => { state.msgs.push(m); saveMsgs(); paint(); };

  const send = async textArg => {
    if (state.busy) return;
    const input = document.getElementById('saiInput');
    const text = String(textArg || (input ? input.value : '')).trim();
    if (!text) return;
    if (input) input.value = '';
    state.busy = true;
    push({ who: 'me', text });
    push({ who: 'ai', text: '' });
    try {
      const r = await askAgent(text);
      state.msgs[state.msgs.length - 1] = { who: 'ai', text: r.text, sources: r.sources };
    } catch (e) {
      state.msgs[state.msgs.length - 1] = { who: 'ai', text: `দুঃখিত, এবার হয়নি: ${String(e?.message || e)}` };
    }
    state.busy = false; saveMsgs(); paint();
  };

  const shareData = () => {
    try {
      localStorage.setItem(LS_CTX, buildStudyContext());
      localStorage.setItem(LS_SHARED, '1');
      const c = cache();
      const nq = Array.isArray(c.questions) ? c.questions.length : 0;
      const ne = Array.isArray(c.examResults) ? c.examResults.length : 0;
      push({ who: 'ai', text: `রাখলাম! 📚\nতোমার ব্যাংকে ${bn(nq)}টি প্রশ্ন, ${bn(ne)}টি পরীক্ষা${ne ? ' — সাম্প্রতিক স্কোরগুলোও দেখলাম' : ''}। এখন থেকে তোমার অবস্থা বুঝে পরামর্শ দেব।\nবলো শুরু কোথা থেকে করবে? 😊` });
    } catch (e) {
      localStorage.setItem(LS_SHARED, '1');
      push({ who: 'ai', text: 'ডেটা-সারসংক্ষেপ এবার নিতে পারলাম না, তবে সমস্যা নেই — যেকোনো প্রশ্ন সরাসরি করো! 😊' });
    }
  };
  const skipShare = () => { localStorage.setItem(LS_SHARED, '1'); paint(); };
  const quick = t => send(t);
  const editName = () => { const n = prompt('তোমার নাম?', nameOf()); if (n && n.trim()) { localStorage.setItem(LS_NAME, n.trim().slice(0, 20)); paint(); } };
  const openTopics = () => { state.topics = true; paint(); };
  const closeTopics = () => { state.topics = false; paint(); };
  const topicSend = i => { const t = TOPICS[i]; if (!t) return; state.topics = false; paint(); send(t[2]); };

  // ── ড্যাশবোর্ড এন্ট্রি (প্রমাণিত observer-প্যাটার্ন) ────────────────────────────
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

  window.StudyAiTool = { render, send, quick, shareData, skipShare, editName, openTopics, closeTopics, topicSend, _state: () => state };
  if (typeof document !== 'undefined') bootMount();
})();
