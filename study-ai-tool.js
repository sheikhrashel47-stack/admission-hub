/*
 * ADMISSION HUB · v114 · Admihub AI — Chorcha-স্টাইল ফুলস্ক্রিন 3D চ্যাট
 * ── ফুলস্ক্রিন (অ্যাপের নেভিগেশন-বার লুকানো) + ড্যাশবোর্ডে ফেরার back + topbar ⚙/＋
 * ── মাল্টি-চ্যাট branch (ChatGPT/Gemini-স্টাইল new chat)
 * ── সোর্স-পিকার: অ্যাপের প্রশ্নব্যাংকের আসল subject-তালিকা → সিলেক্ট = সোর্স নির্ধারণ (মেসেজ যায় না)
 * ── সাজেশন-চিপ: প্রথম টেক্সট পাঠানোর আগে পর্যন্তই
 * ── সম্পূর্ণ ডেটা-মেমোরি: সব প্রশ্ন+ইতিহাস worker-এ সেভ → এজেন্ট তোমার ব্যাংক থেকেই উত্তর দেয়
 * ── Settings: Gemini/Grok/Groq key add/remove/switch (অপশনাল ফাস্ট-ইঞ্জিন), থিম, ডেটা-টগল
 */
(function installStudyAi() {
  'use strict';
  if (window.StudyAiTool) return;
  const ROUTE = 'study-ai';
  const route = () => (window.location.hash || '').replace(/^#\/?/, '').split('?')[0];
  const WORKER = 'https://admission-gk.rashelzayan213.workers.dev';
  const APP_HEADER = { 'X-AH-App': 'admission-hub' };
  const LS_LIST = 'studyAiChats', LS_CUR = 'studyAiCur', LS_SHARED = 'studyAiShared', LS_NAME = 'studyAiName', LS_BANK = 'studyAiBankAt', LS_CFG = 'studyAiCfg';

  const bn = n => String(n).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d]);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const uid = () => 'c' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const nameOf = () => localStorage.getItem(LS_NAME) || 'রাশেল';
  const cfg = () => { try { return Object.assign({ engine: 'agent', provider: 'gemini', keys: {}, model: '', sendData: true, theme: 'aurora' }, JSON.parse(localStorage.getItem(LS_CFG) || '{}')); } catch (_) { return { engine: 'agent', provider: 'gemini', keys: {}, model: '', sendData: true, theme: 'aurora' }; } };
  const setCfg = c => localStorage.setItem(LS_CFG, JSON.stringify(c));

  let state = { busy: false, sheet: null, view: {}, page: null, attach: [], keyTest: null, bankInfo: undefined, autoSyncTried: false };

  // ── চ্যাট-লিস্ট (branches) ────────────────────────────────────────────────────
  const listChats = () => { try { const l = JSON.parse(localStorage.getItem(LS_LIST) || '[]'); return Array.isArray(l) ? l : []; } catch (_) { return []; } };
  const saveList = l => localStorage.setItem(LS_LIST, JSON.stringify(l.slice(0, 30)));
  const curId = () => localStorage.getItem(LS_CUR) || '';
  const msgsOf = id => { try { return JSON.parse(localStorage.getItem('studyAiChat:' + id) || '[]'); } catch (_) { return []; } };
  const saveMsgs = (id, m) => localStorage.setItem('studyAiChat:' + id, JSON.stringify(m.slice(-60)));
  const ensureChat = () => {
    if (curId() && listChats().some(c => c.id === curId())) return curId();
    const c = { id: uid(), title: 'নতুন চ্যাট', at: Date.now() };
    saveList([c, ...listChats()]); localStorage.setItem(LS_CUR, c.id);
    return c.id;
  };
  const touchChat = (id, firstText) => {
    const l = listChats(); const c = l.find(x => x.id === id);
    if (c) { if (firstText && c.title === 'নতুন চ্যাট') c.title = String(firstText).slice(0, 28); c.at = Date.now(); saveList(l.sort((a, b) => b.at - a.at)); }
  };
  const newChat = () => { const c = { id: uid(), title: 'নতুন চ্যাট', at: Date.now() }; saveList([c, ...listChats()]); localStorage.setItem(LS_CUR, c.id); state.sheet = null; paint(); };
  const openChat = id => { localStorage.setItem(LS_CUR, id); state.sheet = null; paint(); };
  const delChat = id => { let l = listChats().filter(c => c.id !== id); localStorage.removeItem('studyAiChat:' + id); if (!l.length) { const c = { id: uid(), title: 'নতুন চ্যাট', at: Date.now() }; l = [c]; } saveList(l); if (curId() === id) localStorage.setItem(LS_CUR, l[0].id); paint(); };
  const chatTitle = () => (listChats().find(c => c.id === curId()) || {}).title || 'নতুন চ্যাট';

  const cache = () => (typeof CACHE !== 'undefined' && CACHE) || window.CACHE || {};

  // ── ডেটা-সারসংক্ষেপ + সম্পূর্ণ ব্যাংক-আপলোড (defensive) ─────────────────────────
  const dateStr = v => { try { if (v instanceof Date && !isNaN(v)) return v.toISOString().slice(0, 10); if (typeof v === 'number' && isFinite(v)) return new Date(v).toISOString().slice(0, 10); return String(v ?? '').slice(0, 10); } catch (_) { return ''; } };
  const subName = id => { try { return String((cache().subjects || []).find(x => x && x.id === id)?.name || id || ''); } catch (_) { return String(id || ''); } };
  const topName = id => { try { return String((cache().topics || []).find(x => x && x.id === id)?.name || id || ''); } catch (_) { return String(id || ''); } };
  const buildContext = () => {
    try {
      const c = cache();
      const qs = Array.isArray(c.questions) ? c.questions : [], ex = Array.isArray(c.examResults) ? c.examResults : [], voc = Array.isArray(c.vocabulary) ? c.vocabulary : [], mis = Array.isArray(c.mistakes) ? c.mistakes : [];
      const bySub = {}; qs.forEach(q => { const s = String((q && q.subjectId) || 'অন্য'); bySub[s] = (bySub[s] || 0) + 1; });
      const topSubs = Object.entries(bySub).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([s, n]) => `${subName(s) || s} ${bn(n)}টি`);
      const accs = ex.map(e => { try { const t = Number(e && (e.totalQuestions ?? (Array.isArray(e.questions) ? e.questions.length : 0))) || 0; return t ? (Number(e && (e.correctCount ?? e.correct)) || 0) / t * 100 : null; } catch (_) { return null; } }).filter(x => x !== null);
      const avg = accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null;
      const recents = ex.slice(0, 8).map(e => { try { const t = Number(e && (e.totalQuestions ?? (Array.isArray(e.questions) ? e.questions.length : 0))) || 0; return `${dateStr(e && (e.completedAt ?? e.date))}: ${bn(Number(e && (e.correctCount ?? e.correct)) || 0)}/${bn(t)}`; } catch (_) { return ''; } }).filter(Boolean);
      const wrong = {}; mis.forEach(m => { try { const t = String((m && m.q && m.q.topicId) || (m && m.topic) || '?'); wrong[t] = (wrong[t] || 0) + 1; } catch (_) {} });
      const weak = Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t, n]) => `${topName(t) || t}(${bn(n)}বার)`);
      return `প্রশ্নব্যাংক: ${bn(qs.length)}টি প্রশ্ন। মূল বিষয়: ${topSubs.join(', ') || '—'}। পরীক্ষা: ${bn(ex.length)}টি${avg !== null ? `, গড় নির্ভুলতা ${bn(avg)}%` : ''}। সাম্প্রতিক: ${recents.slice(0, 5).join(' | ') || '—'}। ভোকাবুলারি: ${bn(voc.length)}টি। দুর্বল টপিক: ${weak.join(', ') || 'এখনো যথেষ্ট ভুল নেই'}।`;
    } catch (_) { return 'ডেটা-সারসংক্ষেপ এবার পড়া গেল না।'; }
  };
  const bankStats = () => {
    try {
      const c = cache();
      const ex = Array.isArray(c.examResults) ? c.examResults : [], mis = Array.isArray(c.mistakes) ? c.mistakes : [];
      const accs = ex.map(e => { try { const t = Number(e && (e.totalQuestions ?? (Array.isArray(e.questions) ? e.questions.length : 0))) || 0; return t ? (Number(e && (e.correctCount ?? e.correct)) || 0) / t * 100 : null; } catch (_) { return null; } }).filter(x => x !== null);
      const wrong = {}; mis.forEach(m => { try { const t = topName((m && m.q && m.q.topicId)) || (m && m.topic) || '?'; wrong[t] = (wrong[t] || 0) + 1; } catch (_) {} });
      return { exams: ex.length, avgAcc: accs.length ? Math.round(accs.reduce((a, b) => a + b, 0) / accs.length) : null, weak: Object.entries(wrong).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([t]) => t) };
    } catch (_) { return { exams: 0, avgAcc: null, weak: [] }; }
  };
  const buildBankUpload = () => {
    const c = cache();
    const qs = (Array.isArray(c.questions) ? c.questions : []).slice(0, 3000).map(q => {
      const opts = Array.isArray(q && q.options) ? q.options : [];
      const ai = Number(q && (q.answerIndex ?? q.answer ?? q.correctAnswerIndex));
      const answer = typeof q?.answer === 'string' && q.answer ? q.answer : (Number.isFinite(ai) && opts[ai] != null ? String(opts[ai]) : '');
      return { q: String((q && (q.question ?? q.q)) || '').slice(0, 400), o: opts.map(x => String(x).slice(0, 120)).slice(0, 6), a: answer.slice(0, 120), e: String((q && q.explain) || '').slice(0, 300), s: subName(q && q.subjectId).slice(0, 70), t: topName(q && q.topicId).slice(0, 70) };
    }).filter(x => x.q && x.o.length >= 2);
    return { questions: qs, stats: { count: qs.length, ...bankStats() } };
  };
  const syncBank = async () => {
    // অ্যাপ খুলে IndexedDB-তে প্রশ্ন আসা পর্যন্ত অপেক্ষা (সর্বোচ্চ ~১২ সেকেন্ড)
    for (let i = 0; i < 30 && !(cache().questions || []).length; i++) await new Promise(r => setTimeout(r, 400));
    const payload = buildBankUpload();
    if (!payload.questions.length) throw new Error('ব্যাংক খালি (অ্যাপে প্রশ্ন লোড হয়নি?)');
    try {
      const res = await fetch(WORKER + '/api/bank', { method: 'POST', headers: { ...APP_HEADER, 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const d = await res.json().catch(() => ({}));
      if (!res.ok || !d.saved) throw new Error('সেভ করা গেল না (' + res.status + ')');
    } catch (err) {
      // ফলব্যাক: sendBeacon (কোনো preflight/হেডার ছাড়াই যায়) → পরে GET দিয়ে নিশ্চিত
      const okBeacon = typeof navigator !== 'undefined' && navigator.sendBeacon && navigator.sendBeacon(WORKER + '/api/bank', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (!okBeacon) throw err;
      await new Promise(r => setTimeout(r, 1800));
      const chk = await fetch(WORKER + '/api/bank', { headers: APP_HEADER }).then(r => r.json()).catch(() => ({}));
      if (!chk.saved) throw new Error('beacon-ও কাজ করেনি — ' + String(err?.message || err).slice(0, 60));
    }
    localStorage.setItem(LS_BANK, String(Date.now()));
    localStorage.removeItem('studyAiSyncErr');
    localStorage.setItem('studyAiCtx', buildContext());
    return (payload.stats || {}).count || 0;
  };
  // অটো-সিঙ্ক: worker-এ ব্যাংক না থাকলে চ্যাট খোলামাত্র নিজে থেকেই পাঠিয়ে দাও — ট্যাপ লাগে না
  const ensureSync = async manual => {
    try {
      const info = await fetch(WORKER + '/api/bank', { headers: APP_HEADER }).then(r => r.json()).catch(() => ({}));
      state.bankInfo = info;
      if (info && info.saved) { if (!localStorage.getItem(LS_BANK)) localStorage.setItem(LS_BANK, String(info.savedAt || Date.now())); return; }
      const n = await syncBank();
      state.bankInfo = { saved: true, count: n, savedAt: Date.now() };
      localStorage.setItem(LS_SHARED, '1');
      if (window.toast) window.toast('📚 তোমার প্রশ্নব্যাংক এজেন্টের কাছে সেভ হয়েছে ✓');
    } catch (e) {
      localStorage.setItem('studyAiSyncErr', String(e?.message || e).slice(0, 90));
      if (manual && window.toast) window.toast('⚠️ ডেটা যায়নি: ' + String(e?.message || e).slice(0, 60));
    }
    paint(); // landing/সেটিংস — যে-ভিউতেই থাকি, নতুন স্ট্যাটাস দেখাও
  };

  const todayBd = () => { try { return new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 10); } catch (_) { return ''; } };
  const sysPrompt = () => `তুমি "স্টাডি বন্ধু" — বাংলাদেশি বিশ্ববিদ্যালয় ভর্তি-প্রস্তুতির বন্ধুসুলভ AI সহকারী (অ্যাপ: Admission Hub / Admihub AI)।
আজকের তারিখ: ${todayBd()} (বাংলাদেশ, Asia/Dhaka)। FRESHNESS নিয়ম: তারিখ/সংখ্যা/নাম/কারেন্ট-অ্যাফেয়ার্স/ভর্তি-তথ্য জাতীয় যেকোনো প্রশ্নে নিজের পুরনো জ্ঞানে (training memory) উত্তর দেওয়া নিষিদ্ধ — সর্বশেষ যাচাইকৃত তথ্য দাও; যাচাই করতে না পারলে স্পষ্ট করে বলো কোনটা যাচাই করা যায়নি।
নিয়ম: সহজ-উষ্ণ বাংলায় তুমি-ফর্মে কথা বলো; উত্তর ছোট ও সোজা (সাধারণত ২-৬ লাইন); হালকা emoji ঠিক আছে কিন্তু অতিরিক্ত নয়; ভুল তথ্য কখনো বানাবে না — নিশ্চিত না হলে স্বচ্ছভাবে বলবে বা ওয়েব ঘেঁটে যাচাই করবে।
${cfg().sendData && localStorage.getItem('studyAiCtx') ? `শিক্ষার্থীর ডেটা (প্রসঙ্গ কাজে লাগাও, কাঁচা ডেটা ফেরত লিখো না):\n${localStorage.getItem('studyAiCtx')}` : ''}`;

  // ── 🌐 Browser Use এজেন্ট ────────────────────────────────────────────────────
  const askAgent = async (question, source) => {
    const res = await fetch(WORKER + '/api/ask', { method: 'POST', headers: { ...APP_HEADER, 'Content-Type': 'application/json' }, body: JSON.stringify({ question, context: cfg().sendData ? (localStorage.getItem('studyAiCtx') || '').slice(0, 500) : '', source }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d.error === 'all-keys-exhausted' ? 'এজেন্ট এখন ব্যস্ত — ১-২ মিনিট পরে আবার' : d.error === 'ask-key-not-configured' ? 'চ্যাট-এজেন্ট key এখনো জোড়া হয়নি' : 'সংযোগ করা গেল না — নেট দেখে আবার চেষ্টা করো');
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

  // ── ⚡ অপশনাল ফাস্ট-ইঞ্জিন (Settings থেকে key) ─────────────────────────────────
  const fastAvailable = () => { const c = cfg(); return !!c.keys[c.provider]; };
  const gemSources = d => { try { const ch = (d.candidates?.[0]?.groundingMetadata?.groundingChunks || []).map(c => { try { return String(new URL(c.web.uri).hostname).replace(/^www\./, ''); } catch (_) { return ''; } }).filter(Boolean); return [...new Set(ch)].slice(0, 4); } catch (_) { return []; } };
  const askFast = async (question, atts) => {
    const c = cfg(); const key = c.keys[c.provider] || '';
    if (!key) throw new Error('Settings-এ key নেই — 🌐 এজেন্ট মোড়ে পাঠাও বা key বসাও');
    const list = Array.isArray(atts) ? atts : [];
    const imgs = list.filter(a => a.kind === 'image'), txts = list.filter(a => a.kind === 'text');
    const qText = question + txts.map(a => `\n\n📎 "${a.name}" ফাইলের বিষয়বস্তু:\n${(a.text || '').slice(0, 9000)}`).join('');
    if (c.provider === 'gemini') {
      const model = c.model || 'gemini-3.6-flash';
      const histParts = msgsOf(curId()).filter(m => m.text).slice(-8).map(m => ({ role: m.who === 'ai' ? 'model' : 'user', parts: [{ text: m.text }] }));
      if (histParts.length) histParts[histParts.length - 1] = { role: 'user', parts: [{ text: qText }, ...imgs.filter(i => i.data).map(i => ({ inline_data: { mime_type: i.mime || 'image/jpeg', data: i.data } }))] };
      else histParts.push({ role: 'user', parts: [{ text: qText }, ...imgs.filter(i => i.data).map(i => ({ inline_data: { mime_type: i.mime || 'image/jpeg', data: i.data } }))] });
      const call = useTools => fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(Object.assign({ system_instruction: { parts: [{ text: sysPrompt() }] }, contents: histParts, generationConfig: { temperature: 0.5, maxOutputTokens: 2048 } }, useTools ? { tools: [{ google_search: {} }] } : {})) });
      let res = await call(true);
      let d = await res.json().catch(() => ({}));
      // গ্রাউন্ডিং (google_search) কোটা/প্ল্যানে না চললে টুল-ছাড়া পুনঃপ্রচেষ্টা — উত্তর তো আসবেই
      if (!res.ok) { res = await call(false); d = await res.json().catch(() => ({})); }
      if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
      const text = String((d.candidates?.[0]?.content?.parts || []).map(pp => pp.text || '').join('')).trim();
      return { text: text || 'উত্তর পাইনি — আবার লেখো?', sources: gemSources(d) };
    }
    if (imgs.length) throw new Error('এই ইঞ্জিনে ছবি পড়া যায় না — Gemini নির্বাচন করো');
    const base = c.provider === 'groq' ? 'https://api.groq.com/openai/v1/chat/completions' : 'https://api.x.ai/v1/chat/completions';
    const model = c.model || (c.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'grok-3-mini');
    const msgs = [{ role: 'system', content: sysPrompt() }, ...msgsOf(curId()).filter(m => m.text).slice(-8).map((m, i, arr) => ({ role: m.who === 'ai' ? 'assistant' : 'user', content: i === arr.length - 1 ? qText : m.text }))].slice(0, 9);
    const res = await fetch(base, { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key }, body: JSON.stringify({ model, messages: msgs, temperature: 0.5, max_tokens: 1024 }) });
    const d = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
    return { text: String(d.choices?.[0]?.message?.content || '').trim() || 'উত্তর পাইনি — আবার লেখো?', sources: [] };
  };
  // 🔑 key-টেস্ট: আসলে কাজ করে কি না, কোন মডেল, লিমিট-হিন্ট — সেটিংস-পেজে দেখায়
  const testKey = async () => {
    const c = cfg(); const key = c.keys[c.provider] || '';
    if (!key) { state.keyTest = { ok: false, msg: 'আগে key বসাও, তারপর টেস্ট' }; paint(); return; }
    state.keyTest = { ok: null, msg: 'টেস্ট হচ্ছে…' }; paint();
    try {
      if (c.provider === 'gemini') {
        const model = c.model || 'gemini-3.6-flash';
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: 'ok?' }] }], generationConfig: { maxOutputTokens: 8 } }) });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
        state.keyTest = { ok: true, msg: `✓ কাজ করছে (${model}) · ফ্রি-লিমিট হিন্ট: Flash ~১৫ রিকোয়েস্ট/মিনিট, ~১০০০+/দিন — লিমিট শেষ হলে এরর আসবে` };
      } else {
        const base = c.provider === 'groq' ? 'https://api.groq.com/openai/v1/models' : 'https://api.x.ai/v1/models';
        const res = await fetch(base, { headers: { Authorization: 'Bearer ' + key } });
        const d = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(d?.error?.message || 'HTTP ' + res.status);
        const n = Array.isArray(d.data) ? d.data.length : 0;
        state.keyTest = { ok: true, msg: `✓ কাজ করছে · ${n}টি মডেল পাওয়া গেছে` };
      }
    } catch (e) { state.keyTest = { ok: false, msg: '✗ ' + String(e?.message || e).slice(0, 110) }; }
    paint();
  };

  // ── UI ───────────────────────────────────────────────────────────────────────
  const sourceLabel = () => { const s = state.source; if (!s || s === 'auto') return '🌐 ওয়েব + আমার ব্যাংক'; if (s === 'bank') return '📚 শুধু আমার ব্যাংক'; return '📚 ' + decodeURIComponent(String(s).slice(5)); };
  const bubble = m => `<div class="sai-row ${m.who}"><div class="sai-bubble">${(m.atts || []).map(a => a.kind === 'image' && a.thumb ? `<img class="sai-att" src="${a.thumb}" alt="${esc(a.name)}">` : `<span class="sai-attfile">📄 ${esc(a.name)}</span>`).join('')}${m.who === 'ai' && !m.text ? '<span class="sai-dots"><i></i><i></i><i></i></span><div class="sai-wait">🌐 ওয়েব ঘেঁটে যাচাই করছে…<br><small>সাধারণত ১০ সেকেন্ড–২ মিনিট, বড় কাজে বেশি</small></div>' : esc(m.text).replace(/\n/g, '<br>')}${m.sources?.length ? `<div class="sai-src">🔗 ${m.sources.map(esc).join(' · ')}</div>` : ''}</div></div>`;
  const shareCard = () => localStorage.getItem(LS_SHARED) === '1' ? '' : `<div class="card sai-share"><b>📊 এজেন্টকে তোমার সব ডেটা দাও?</b><p class="muted" style="margin:6px 0 10px">অ্যাপ পাঠাবে <b>সম্পূর্ণ প্রশ্নব্যাংক + পরীক্ষার ইতিহাস + প্রগ্রেস</b> — এজেন্টের নিজের ডাটাবেসে সেভ থাকবে। এরপর সে তোমার ব্যাংক থেকেই প্রশ্নের উত্তর দেবে। (এই কার্ড আর আসবে না; Settings-থেকে যখন খুশি আপডেট করা যাবে)</p><button class="btn" onclick="StudyAiTool.shareData()">✅ সব ডেটা পাঠাও</button><button class="btn ghost sm" style="margin-left:8px" onclick="StudyAiTool.skipShare()">পরে</button></div>`;
  const CHIPS = ['আজ কী পড়বো?', 'দুর্বল টপিক বলো', '৭ দিনের রিভিশন প্ল্যান', 'GK কুইজ দাও'];

  const landing = () => {
    const synced = localStorage.getItem(LS_BANK);
    const ghost = localStorage.getItem(LS_SHARED) === '1' && !synced;
    return `<div class="sai-landing">${ghost ? '<button class="sai-ghostbtn" onclick="StudyAiTool.shareData()">⚠️ ডেটা এখনো এজেন্টের কাছে পৌঁছায়নি — 📚 এখনই পাঠাও</button>' : ''}<div class="sai-logo"><span>🤖</span><i>✨</i></div><div class="sai-hello">হ্যালো, <b class="sai-name" onclick="StudyAiTool.editName()">${esc(nameOf())}</b>!</div><div class="sai-sub">আজ তোমাকে কীভাবে সাহায্য করবো?</div>${shareCard()}${synced ? `<div class="sai-memok">📚 মেমোরি: ${bn(new Date(Number(synced)).getDate())} তারিখে ${bn('…') || ''}ব্যাংক সেভ আছে · Settings-এ আপডেট করো</div>` : ''}<div class="sai-note">🌐 ব্রাউজার-এজেন্ট সত্যিই ওয়েব ঘেঁটে যাচাই করে উত্তর দেয় — সাধারণত ১০ সেকেন্ড–৩ মিনিট, কাজ বড় হলে বেশি</div></div>`;
  };

  const inputBar = () => `<div class="sai-srcbar"><button class="sai-srchip" onclick="StudyAiTool.openSheet('source')">${esc(sourceLabel())} ▾</button></div>${state.attach.length ? `<div class="sai-attachbar">${state.attach.map((a, i) => `<span class="sai-atchip">${a.kind === 'image' && a.thumb ? `<img src="${a.thumb}">` : '📄'} ${esc((a.name || '').slice(0, 18))}<b onclick="StudyAiTool.removeAttach(${i})">✕</b></span>`).join('')}</div>` : ''}<div class="sai-inputbar"><button class="sai-plus" onclick="StudyAiTool.openSheet('source')" aria-label="সোর্স">⊕</button><button class="sai-clip" onclick="StudyAiTool.pickAttach()" aria-label="ফাইল জোড়া">📎</button><input id="saiFile" type="file" multiple accept="image/*,.txt,.md,.json,.csv" style="display:none" onchange="StudyAiTool.handleFiles(this.files);this.value=''"><input id="saiInput" type="text" placeholder="প্রশ্ন লেখো…" onkeydown="if(event.key==='Enter')StudyAiTool.send()"><button class="sai-send" ${state.busy ? 'disabled' : ''} onclick="StudyAiTool.send()" aria-label="পাঠাও">▲</button></div>`;

  const sheet = () => {
    if (state.sheet === 'source') {
      const subs = (cache().subjects || []).map(s => ({ name: String(s.name || ''), n: (cache().questions || []).filter(q => q && q.subjectId === s.id).length })).sort((a, b) => b.n - a.n).filter(s => s.n > 0);
      return `<div class="sai-sheet-bg" onclick="StudyAiTool.closeSheet()"><div class="sai-sheet" onclick="event.stopPropagation()"><div class="sai-sheet-grip"></div><h3>AI কোন সোর্স থেকে উত্তর দেবে?</h3><div class="sai-sheet-list">
        <button class="sai-sheet-item ${!state.source || state.source === 'auto' ? 'on' : ''}" onclick="StudyAiTool.setSource('auto')"><span>🌐</span> ওয়েব + আমার ব্যাংক<small>${listChats().length ? '' : ''}সব ঘেঁটে সেরা উত্তর</small></button>
        <button class="sai-sheet-item ${state.source === 'bank' ? 'on' : ''}" onclick="StudyAiTool.setSource('bank')"><span>📚</span> শুধু আমার প্রশ্নব্যাংক<small>সেভ করা মেমোরি থেকে</small></button>
        ${subs.map(s => `<button class="sai-sheet-item ${state.source === 'bank:' + encodeURIComponent(s.name) ? 'on' : ''}" onclick="StudyAiTool.setSource('bank:${encodeURIComponent(s.name)}')"><span>📖</span> ${esc(s.name)}<small>${bn(s.n)}টি প্রশ্ন</small></button>`).join('')}
      </div></div></div>`;
    }
    if (state.sheet === 'chats') {
      return `<div class="sai-sheet-bg" onclick="StudyAiTool.closeSheet()"><div class="sai-sheet" onclick="event.stopPropagation()"><div class="sai-sheet-grip"></div><h3>চ্যাটসমূহ</h3><div class="sai-sheet-list">
        <button class="sai-sheet-item" onclick="StudyAiTool.newChat()"><span>＋</span> নতুন চ্যাট<small>আলাদা ব্রাঞ্চ</small></button>
        ${listChats().map(c => `<div class="sai-sheet-item ${c.id === curId() ? 'on' : ''}" onclick="StudyAiTool.openChat('${c.id}')"><span>💬</span> ${esc(c.title)}<small>${dateStr(c.at)}</small><b class="sai-del" onclick="event.stopPropagation();StudyAiTool.delChat('${c.id}')">🗑</b></div>`).join('')}
      </div></div></div>`;
    }
    return '';
  };

  const settingsPage = () => {
    const c = cfg();
    const bi = state.bankInfo;
    const syncErr = localStorage.getItem('studyAiSyncErr');
    const memLine = bi === null ? '<div class="muted" style="font-size:12.5px">📚 মেমোরি: দেখা হচ্ছে…</div>'
      : bi && bi.saved ? `<div class="sai-memok" style="display:inline-block">📚 এজেন্ট-মেমোরি: ${bn(bi.count)}টি প্রশ্ন সেভ ✓${bi.savedAt ? ' · ' + dateStr(bi.savedAt) : ''}</div>`
      : '<div class="sai-ghostbtn" style="display:inline-block;margin-top:6px">⚠️ এখনো কোনো ডেটা সেভ হয়নি — চ্যাট খুললে নিজে নিজে পাঠানোর চেষ্টা হবে, বা নিচের বাটনে চাপো</div>';
    const prov = (key, label) => `<div class="sai-setrow"><b>${label}</b><input type="password" placeholder="key বসাও…" value="${esc(c.keys[key] || '')}" onchange="StudyAiTool.setKey('${key}',this.value)"><div class="row" style="gap:6px"><button class="btn sm ${c.provider === key ? '' : 'ghost'}" onclick="StudyAiTool.setProvider('${key}')">${c.provider === key ? '✓ নির্বাচিত' : 'নাও'}</button>${c.keys[key] ? `<button class="btn ghost sm" onclick="StudyAiTool.setKey('${key}','')">মুছি</button>` : ''}</div></div>`;
    return `<div class="sai-settings-page">
      <div class="sai-sethead"><button class="sai-back2" onclick="StudyAiTool.closePage()" aria-label="ফিরে">←</button><b>⚙️ সেটিংস</b></div>
      <div class="sai-setwrap">
        <label class="flabel">উত্তর-ইঞ্জিন</label>
        <div class="filter-row" style="margin:6px 0 4px"><button class="chip ${c.engine === 'agent' ? 'active' : ''}" onclick="StudyAiTool.setEngine('agent')">🌐 ব্রাউজার এজেন্ট</button><button class="chip ${c.engine === 'fast' ? 'active' : ''}" onclick="StudyAiTool.setEngine('fast')">⚡ ফাস্ট (API key)</button></div>
        <div class="muted" style="font-size:11px;margin-bottom:12px">${c.engine === 'agent' ? 'সত্যিই ওয়েব ঘেঁটে যাচাই করে উত্তর দেয় — ১০ সেকেন্ড–৩ মিনিট (সবচেয়ে নির্ভরযোগ্য)' : 'সরাসরি API — দ্রুত; চালু হলে Gemini Google-সার্চ করে টাটকা তথ্য দেয় (কোটা না চললে সাধারণ উত্তর)'}</div>
        <label class="flabel">API Provider — যেকোনো সময় বসাও/মুছো/বদলাও</label>
        ${prov('gemini', 'Gemini (ফ্রি key: aistudio.google.com)')}
        ${prov('xai', 'Grok (x.ai)')}
        ${prov('groq', 'Groq (console.groq.com)')}
        <label class="flabel">মডেল (ঐচ্ছিক)</label><input type="text" placeholder="${c.provider === 'xai' ? 'grok-3-mini' : c.provider === 'groq' ? 'llama-3.3-70b-versatile' : 'gemini-3.6-flash'}" value="${esc(c.model || '')}" onchange="StudyAiTool.setModel(this.value)">
        <div class="row" style="gap:8px;margin:10px 0 4px"><button class="btn secondary sm" onclick="StudyAiTool.testKey()">🔑 key-টেস্ট করো</button></div>
        ${state.keyTest ? `<div class="${state.keyTest.ok === true ? 'sai-memok' : state.keyTest.ok === false ? 'sai-ghostbtn' : 'muted'}" style="display:block;font-size:12px;margin-top:6px">${esc(state.keyTest.msg)}</div>` : ''}
        <label class="flabel" style="margin-top:16px">থিম</label>
        <div class="filter-row" style="margin:6px 0 12px">${[['aurora', '🌿 Emerald'], ['violet', '💜 Violet'], ['dark', '🌙 Dark']].map(([v, l]) => `<button class="chip ${c.theme === v ? 'active' : ''}" onclick="StudyAiTool.setTheme('${v}')">${l}</button>`).join('')}</div>
        <div class="sai-setrow"><b>এজেন্টকে আমার ডেটা পাঠাবে</b><div class="toggle ${c.sendData ? 'on' : ''}" onclick="StudyAiTool.toggleData()"><div class="dot"></div></div></div>
        <div style="margin-top:14px">${memLine}</div>
        ${syncErr ? `<div class="sai-ghostbtn" style="display:block;font-size:11.5px;margin-top:8px">শেষ সিঙ্ক-ত্রুটি: ${esc(syncErr)}</div>` : ''}
        <div class="row" style="gap:8px;margin-top:10px"><button class="btn secondary sm" onclick="StudyAiTool.shareData()">📚 ডেটা ${localStorage.getItem(LS_BANK) ? 'আপডেট' : 'পাঠাও'}</button><button class="btn ghost sm" onclick="StudyAiTool.clearChats()">সব চ্যাট মুছি</button></div>
        <div class="muted" style="font-size:10.5px;margin-top:12px">Keys শুধু তোমার ডিভাইসেই থাকে (localStorage) — কোথাও আপলোড হয় না। এজেন্ট zero-access: অ্যাপ/কোড/কোনো সার্ভারে প্রবেশাধিকার নেই।</div>
      </div>
    </div>`;
  };

  const renderChat = () => {
    const msgs = msgsOf(curId());
    const chips = `<div class="sai-chips">${CHIPS.map(t => `<button class="chip" onclick="StudyAiTool.quick('${t}')">${t}</button>`).join('')}</div>`;
    const noUserMsg = !msgs.some(m => m.who === 'me'); // ইউজার নিজে না পাঠিয়েছে বোধ্য পর্যন্ত সাজেশন থাকে
    if (!msgs.length) return landing() + chips;
    return `<div class="sai-msgs" id="saiMsgs">${msgs.map(bubble).join('')}</div>` + (noUserMsg ? chips : '');
  };

  const paint = () => {
    const b = document.getElementById('saiBody');
    if (b) {
      b.innerHTML = state.page === 'settings' ? settingsPage() : renderChat() + inputBar();
      const el = document.getElementById('saiMsgs'); if (el) el.scrollTop = el.scrollHeight;
    }
    const sh = document.getElementById('saiSheetRoot'); if (sh) sh.innerHTML = sheet();
  };

  const render = () => {
    ensureChat();
    if (!state.autoSyncTried) { state.autoSyncTried = true; setTimeout(() => ensureSync(false), 900); }
    renderShell(`<div id="saiBody"></div><div id="saiSheetRoot"></div>`, {
      title: 'Admihub AI',
      hideNav: true,
      back: "navigate('dashboard')",
      actions: [`<button class="sai-topicon" onclick="StudyAiTool.openSheet('chats')" aria-label="চ্যাট">💬</button>`, `<button class="sai-topicon" onclick="StudyAiTool.openSheet('settings')" aria-label="সেটিংস">⚙️</button>`]
    });
    if (!document.getElementById('saiAgentStyle')) {
      const s = document.createElement('style'); s.id = 'saiAgentStyle'; s.textContent = `
body{overflow-x:hidden}
.sai-page{min-height:calc(100vh - 92px);display:flex;flex-direction:column;background:var(--sai-bg,linear-gradient(160deg,#f7faf8,#eef4f0 60%,#f3f0fa))}
.sai-landing{flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:16px 8px;animation:saiFade .5s ease}
.sai-logo{position:relative;width:92px;height:92px;border-radius:28px;background:linear-gradient(135deg,#5b5bf0,#a34ef0);display:flex;align-items:center;justify-content:center;box-shadow:0 14px 34px rgba(107,79,240,.38),inset 0 1px 2px rgba(255,255,255,.5);animation:saiFloat 3.6s ease-in-out infinite;transform-style:preserve-3d}
.sai-logo span{font-size:48px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.22))}
.sai-logo i{position:absolute;top:-8px;right:-8px;font-style:normal;font-size:22px;animation:saiSpin 6s linear infinite}
@keyframes saiFloat{0%,100%{transform:translateY(0) rotateX(0)}50%{transform:translateY(-8px) rotateX(4deg)}}
@keyframes saiSpin{0%{transform:rotate(0)}100%{transform:rotate(360deg)}}
@keyframes saiFade{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
.sai-hello{font-size:28px;font-weight:800;margin-top:18px}
.sai-name{background:linear-gradient(90deg,#e0447c,#7a5cf0);-webkit-background-clip:text;background-clip:text;color:transparent;cursor:pointer}
.sai-sub{font-size:15px;color:var(--sub,#6b7280);margin-top:5px}
.sai-memok{font-size:11px;color:var(--emerald,#0f6b4f);background:#e7f6ee;border-radius:999px;padding:5px 12px;margin-top:12px}
.sai-ghostbtn{margin-top:14px;padding:10px 14px;border-radius:12px;border:1.5px solid #f0b428;background:#fdf6e3;color:#8a6100;font-size:12.5px;font-weight:700}
.sai-settings-page{flex:1;display:flex;flex-direction:column;animation:saiFade .3s ease}
.sai-sethead{display:flex;align-items:center;gap:10px;padding:14px 6px 8px;font-size:18px}
.sai-back2{background:var(--emerald-soft,#e8f3ec);border:none;width:40px;height:40px;border-radius:13px;font-size:20px;color:var(--emerald-d,#0f6b4f);cursor:pointer}
.sai-setwrap{background:#fff;border:1px solid var(--line,#e5e7eb);border-radius:18px;padding:16px 14px;box-shadow:0 6px 22px rgba(16,24,40,.05)}
.sai-clip{background:none;border:none;font-size:19px;cursor:pointer;padding:2px}
.sai-attachbar{display:flex;flex-wrap:wrap;gap:6px;padding:6px 2px}
.sai-atchip{display:inline-flex;align-items:center;gap:6px;background:#fff;border:1.5px solid var(--line,#e5e7eb);border-radius:12px;padding:4px 8px;font-size:11.5px;max-width:46vw}
.sai-atchip img{width:26px;height:26px;object-fit:cover;border-radius:7px}
.sai-atchip b{cursor:pointer;color:#b3261e;font-weight:700;padding:0 2px}
.sai-att{display:block;max-width:130px;max-height:110px;border-radius:12px;margin-bottom:6px;box-shadow:0 2px 8px rgba(0,0,0,.12)}
.sai-attfile{display:inline-block;background:rgba(255,255,255,.22);border-radius:9px;padding:3px 8px;font-size:11.5px;margin-bottom:5px}
.sai-note{font-size:10.5px;color:var(--sub,#9ca3af);margin-top:12px;max-width:300px;line-height:1.5}
.sai-share{margin-top:16px;text-align:left;border-left:4px solid var(--emerald,#0f6b4f);font-size:12.5px;max-width:340px;animation:saiPop .45s cubic-bezier(.2,.9,.3,1.2)}
@keyframes saiPop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
.sai-msgs{flex:1;overflow-y:auto;padding:6px 2px 8px;max-height:calc(100vh - 250px)}
.sai-row{display:flex;margin:9px 0;animation:saiIn .38s cubic-bezier(.2,.9,.3,1.1)}
.sai-row.me{justify-content:flex-end}
@keyframes saiIn{from{opacity:0;transform:translateY(14px) scale(.96)}to{opacity:1;transform:none}}
.sai-bubble{max-width:84%;padding:11px 14px;border-radius:18px;font-size:14px;line-height:1.6;white-space:pre-wrap;box-shadow:0 2px 8px rgba(16,24,40,.07)}
.me .sai-bubble{background:var(--sai-me,#0f6b4f);color:#fff;border-bottom-right-radius:6px;box-shadow:0 4px 12px rgba(15,107,79,.3)}
.ai .sai-bubble{background:#fff;border-bottom-left-radius:6px;border:1px solid var(--line,#e5e7eb)}
.sai-src{margin-top:8px;font-size:11px;color:var(--sub,#6b7280)}
.sai-wait{margin-top:8px;font-size:11px;color:var(--sub,#6b7280);line-height:1.5}
.sai-dots{display:inline-flex;gap:5px;padding:5px 2px}.sai-dots i{width:8px;height:8px;border-radius:50%;background:var(--sub,#9ca3af);animation:saiB 1.15s infinite}
.sai-dots i:nth-child(2){animation-delay:.16s}.sai-dots i:nth-child(3){animation-delay:.32s}
@keyframes saiB{0%,60%,100%{opacity:.35;transform:translateY(0) scale(.9)}30%{opacity:1;transform:translateY(-5px) scale(1.15)}}
.sai-srcbar{padding:8px 0 0}
.sai-srchip{display:inline-block;padding:5px 12px;border-radius:999px;border:1px solid var(--line,#e5e7eb);background:#fff;font-size:11.5px;font-weight:700;color:var(--emerald,#0f6b4f)}
.sai-topicon{background:none;border:none;font-size:21px;padding:4px 6px;color:var(--emerald-d,#0f6b4f);cursor:pointer;width:42px;height:42px;display:grid;place-items:center;border-radius:14px}
.sai-inputbar{display:flex;gap:8px;align-items:center;padding:8px 2px calc(10px + env(safe-area-inset-bottom,0px));position:fixed;bottom:0;left:0;right:0;z-index:60;background:linear-gradient(180deg,rgba(247,250,248,0),#f7faf8 26%,#f7faf8)}
.sai-page{padding-bottom:84px}
.sai-plus,.sai-send{flex:0 0 46px;height:46px;border-radius:50%;font-size:21px;transition:transform .15s ease}
.sai-plus{background:#fff;border:1.5px solid var(--line,#e5e7eb);color:var(--sub,#4b5563)}
.sai-plus:active,.sai-send:active{transform:scale(.88)}
.sai-inputbar input{flex:1;padding:13px 17px;border-radius:24px;border:1.5px solid var(--line,#e5e7eb);background:#fff;font-size:14px;box-shadow:0 3px 10px rgba(16,24,40,.06);transition:box-shadow .2s}
.sai-inputbar input:focus{outline:none;box-shadow:0 4px 16px rgba(15,107,79,.18);border-color:var(--emerald,#0f6b4f)}
.sai-send{background:linear-gradient(135deg,#0f6b4f,#12805f);color:#fff;box-shadow:0 6px 16px rgba(15,107,79,.35)}
.sai-send:disabled{opacity:.5}
.sai-chips{display:flex;gap:6px;flex-wrap:wrap;padding:2px 0 12px;animation:saiFade .5s ease}
.sai-sheet-bg{position:fixed;inset:0;background:rgba(15,23,42,.45);z-index:120;display:flex;align-items:flex-end;animation:saiF .25s ease;backdrop-filter:blur(2px)}
@keyframes saiF{from{opacity:0}to{opacity:1}}
.sai-sheet{width:100%;background:var(--card,#fff);border-radius:24px 24px 0 0;padding:10px 14px 26px;max-height:74vh;overflow-y:auto;animation:saiUp .32s cubic-bezier(.2,.9,.3,1)}
@keyframes saiUp{from{transform:translateY(40%)}to{transform:none}}
.sai-sheet-grip{width:44px;height:4px;border-radius:4px;background:var(--line,#d1d5db);margin:2px auto 10px}
.sai-sheet h3{text-align:center;font-size:17px;margin:2px 0 12px}
.sai-sheet-item{display:flex;align-items:center;gap:12px;width:100%;text-align:left;padding:13px 14px;margin:7px 0;border:1.5px solid var(--line,#e5e7eb);border-radius:15px;background:var(--card,#fff);font-size:14.5px;font-weight:700}
.sai-sheet-item span{font-size:19px}
.sai-sheet-item small{display:block;font-weight:500;font-size:11px;color:var(--sub,#6b7280)}
.sai-sheet-item.on{border-color:var(--emerald,#0f6b4f);background:#f0faf5}
.sai-del{margin-left:auto;font-weight:400}
.sai-setrow{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:10px 0}
.sai-setrow input[type=password],.sai-setwrap input[type=text]{width:100%;margin-top:4px}
.sai-setwrap .flabel{margin-top:12px}
`; document.head.appendChild(s);
    }
    paint();
    if (!window.__saiVvBound && window.visualViewport) {
      window.__saiVvBound = true;
      const vv = window.visualViewport;
      const onVV = () => { const bar = document.querySelector('.sai-inputbar'); if (!bar) return; const kb = Math.max(0, Math.round(window.innerHeight - vv.height - vv.offsetTop)); bar.style.bottom = kb + 'px'; const ms = document.getElementById('saiMsgs'); if (ms) ms.scrollTop = ms.scrollHeight; };
      vv.addEventListener('resize', onVV); vv.addEventListener('scroll', onVV);
    }
    setTimeout(() => { const i = document.getElementById('saiInput'); i && i.focus(); }, 150);
  };

  const push = m => { const id = ensureChat(); const msgs = msgsOf(id); msgs.push(m); saveMsgs(id, msgs); touchChat(id, m.who === 'me' ? m.text : null); paint(); };

  const send = async textArg => {
    if (state.busy) return;
    const input = document.getElementById('saiInput');
    let text = String(textArg || (input ? input.value : '')).trim();
    const atts = state.attach.slice();
    if (!text && !atts.length) return;
    if (!text) text = 'সংযুক্ত ফাইলটা দেখে বলো';
    const imgs = atts.filter(a => a.kind === 'image');
    if (imgs.length && !(cfg().engine === 'fast' && cfg().provider === 'gemini' && cfg().keys.gemini)) {
      if (window.toast) window.toast('📎 ছবি পড়তে ⚡ ফাস্ট-ইঞ্জিনে Gemini key দরকার — Settings-এ বসাও');
      return;
    }
    if (input) input.value = '';
    state.busy = true;
    push({ who: 'me', text, atts: atts.map(a => ({ kind: a.kind, name: a.name, thumb: a.thumb || '' })) });
    state.attach = [];
    push({ who: 'ai', text: '' });
    try {
      if (cfg().engine === 'fast' && fastAvailable()) {
        const r = await askFast(text, atts);
        const id = curId(); const msgs = msgsOf(id); msgs[msgs.length - 1] = { who: 'ai', text: r.text, sources: r.sources || [] }; saveMsgs(id, msgs);
      } else {
        const source = state.source || 'auto';
        const r = await askAgent(text, source);
        const id = curId(); const msgs = msgsOf(id); msgs[msgs.length - 1] = { who: 'ai', text: r.text, sources: r.sources }; saveMsgs(id, msgs);
      }
    } catch (e) {
      const id = curId(); const msgs = msgsOf(id); msgs[msgs.length - 1] = { who: 'ai', text: `দুঃখিত, এবার হয়নি: ${String(e?.message || e)}` }; saveMsgs(id, msgs);
    }
    state.busy = false; paint();
  };

  const shareData = async () => {
    push({ who: 'me', text: '📚 ডেটা পাঠাচ্ছি…' });
    push({ who: 'ai', text: '' });
    try {
      const count = await syncBank();
      state.bankInfo = { saved: true, count, savedAt: Date.now() };
      localStorage.setItem(LS_SHARED, '1');
      const id = curId(); const msgs = msgsOf(id); msgs[msgs.length - 1] = { who: 'ai', text: `রাখলাম! 📚\nতোমার সম্পূর্ণ প্রশ্নব্যাংক (${bn(count)}টি প্রশ্ন), পরীক্ষার ইতিহাস আর প্রগ্রেস আমার ডাটাবেসে সেভ হয়ে গেছে।\nএখন থেকে তোমার ব্যাংক থেকেই উত্তর দিতে পারব — ⊕ থেকে বিষয় বেছে নাও! 😊` }; saveMsgs(id, msgs);
    } catch (e) {
      localStorage.setItem('studyAiSyncErr', String(e?.message || e).slice(0, 90));
      const id = curId(); const msgs = msgsOf(id); msgs[msgs.length - 1] = { who: 'ai', text: `ডেটা এবার সেভ হয়নি (${String(e?.message || e)})।\nচিন্তা নেই — চ্যাট খোলা থাকলে আমি নিজে নিজেই আবার চেষ্টা করবো, আর Settings-এ 📚 বাটনেও চাপা যাবে।` }; saveMsgs(id, msgs);
    }
    state.page === 'settings' ? paint() : paint();
  };
  const skipShare = () => { localStorage.setItem(LS_SHARED, '1'); paint(); };
  const quick = t => send(t);
  const editName = () => { const n = prompt('তোমার নাম?', nameOf()); if (n && n.trim()) { localStorage.setItem(LS_NAME, n.trim().slice(0, 20)); paint(); } };
  const openSheet = w => {
    if (w === 'settings') { state.page = 'settings'; state.sheet = null; state.keyTest = null; paint(); } // ⚙️ = আলাদা পরিষ্কার পেজ (পপআপ নয়)
    else { state.sheet = w; paint(); }
    if (w === 'settings' && state.bankInfo === undefined && typeof fetch === 'function') {
      state.bankInfo = null;
      fetch(WORKER + '/api/bank', { headers: APP_HEADER }).then(r => r.json()).then(d => { state.bankInfo = d; if (state.page === 'settings') paint(); }).catch(() => { state.bankInfo = { saved: false }; if (state.page === 'settings') paint(); });
    }
  };
  const closePage = () => { state.page = null; state.keyTest = null; paint(); };
  const closeSheet = () => { state.sheet = null; paint(); };
  // ── 📎 অ্যাটাচমেন্ট: ছবি (canvas-ডাউনস্কেল) + টেক্সট-ফাইল ──
  const pickAttach = () => { const el = document.getElementById('saiFile'); if (el) el.click(); };
  const removeAttach = i => { state.attach.splice(i, 1); paint(); };
  const handleFiles = files => {
    [...(files || [])].slice(0, 4).forEach(f => {
      try {
        if (/^image\//.test(f.type || '')) {
          const rd = new FileReader();
          rd.onload = () => {
            const raw = String(rd.result || '');
            let data = '', thumb = '', mime = 'image/jpeg';
            try {
              const im = new Image();
              im.onload = () => {
                try {
                  const k = Math.min(1, 1280 / Math.max(im.width || 1, im.height || 1));
                  const cv = document.createElement('canvas'); cv.width = Math.max(1, Math.round((im.width || 1) * k)); cv.height = Math.max(1, Math.round((im.height || 1) * k));
                  cv.getContext('2d').drawImage(im, 0, 0, cv.width, cv.height);
                  data = cv.toDataURL('image/jpeg', 0.82).split(',')[1] || '';
                  const tk = Math.min(1, 112 / Math.max(im.width || 1, im.height || 1));
                  const tv = document.createElement('canvas'); tv.width = Math.max(1, Math.round((im.width || 1) * tk)); tv.height = Math.max(1, Math.round((im.height || 1) * tk));
                  tv.getContext('2d').drawImage(im, 0, 0, tv.width, tv.height);
                  thumb = tv.toDataURL('image/jpeg', 0.7);
                } catch (_) { if (raw.length < 350000) { const ps = raw.split(','); data = ps[1] || ''; mime = (ps[0].match(/data:([^;]+)/) || [])[1] || 'image/jpeg'; thumb = raw; } }
                if (data) { state.attach.push({ kind: 'image', name: f.name || 'ছবি', mime, data, thumb }); paint(); }
                else if (window.toast) window.toast('ছবিটা বড় হয়ে গেছে — ছোট ছবি দাও');
              };
              im.onerror = () => { if (window.toast) window.toast('ছবিটা খোলা গেল না'); };
              im.src = raw;
            } catch (_) { if (window.toast) window.toast('ছবি প্রক্রিয়া করা গেল না'); }
          };
          rd.readAsDataURL(f);
        } else if (/^text\//.test(f.type || '') || /\.(txt|md|json|csv)$/i.test(f.name || '')) {
          const rd = new FileReader();
          rd.onload = () => { state.attach.push({ kind: 'text', name: f.name || 'ফাইল', text: String(rd.result || '').slice(0, 12000) }); paint(); };
          rd.readAsText(f);
        } else if (window.toast) window.toast('এই ধরনের ফাইল এখনো না — ছবি বা টেক্সট ফাইল দাও (PDF আসছে)');
      } catch (_) {}
    });
  };
  const setSource = s => { state.source = s; state.sheet = null; paint(); };
  const setEngine = e => { const c = cfg(); c.engine = e; setCfg(c); paint(); };
  const setProvider = p => { const c = cfg(); c.provider = p; setCfg(c); paint(); };
  const setKey = (k, v) => { const c = cfg(); c.keys[k] = String(v || '').trim(); setCfg(c); paint(); };
  const setModel = m => { const c = cfg(); c.model = String(m || '').trim(); setCfg(c); paint(); };
  const setTheme = t => { const c = cfg(); c.theme = t; setCfg(c); applyTheme(); paint(); };
  const toggleData = () => { const c = cfg(); c.sendData = !c.sendData; setCfg(c); paint(); };
  const clearChats = () => { if (!confirm('সব চ্যাট মুছে ফেলবো?')) return; listChats().forEach(c => localStorage.removeItem('studyAiChat:' + c.id)); localStorage.removeItem(LS_LIST); localStorage.removeItem(LS_CUR); state.sheet = null; paint(); };
  const applyTheme = () => {
    const t = cfg().theme;
    const root = document.getElementById('saiThemeStyle') || (() => { const el = document.createElement('style'); el.id = 'saiThemeStyle'; document.head.appendChild(el); return el; })();
    root.textContent = t === 'violet' ? '.sai-page{--sai-bg:linear-gradient(160deg,#faf7ff,#f3eefc 60%,#fdeef6);--sai-me:#7a5cf0}.me .sai-bubble{background:var(--sai-me,#7a5cf0)!important;box-shadow:0 4px 12px rgba(122,92,240,.3)!important}.sai-send{background:linear-gradient(135deg,#7a5cf0,#a34ef0)!important;box-shadow:0 6px 16px rgba(122,92,240,.35)!important}.sai-srchip,.sai-sheet-item.on{color:#7a5cf0!important;border-color:#a88ff5!important}'
      : t === 'dark' ? '.sai-page{--sai-bg:linear-gradient(160deg,#0f172a,#111c30 60%,#171f35);--sai-me:#0ea371}.sai-page .ai .sai-bubble{background:#1c2740!important;color:#e5e7eb;border-color:#2a3757!important}.sai-page .sai-sub,.sai-page .sai-note{color:#94a3b8!important}.sai-page .sai-hello{color:#f1f5f9}.sai-page .sai-inputbar input{background:#1c2740;color:#e5e7eb;border-color:#2a3757}.sai-page .sai-plus{background:#1c2740;color:#e5e7eb;border-color:#2a3757}.sai-send{background:linear-gradient(135deg,#0ea371,#0f6b4f)!important}.sai-page .sai-share{background:#1c2740;color:#e5e7eb}.sai-page .sai-share .muted{color:#94a3b8}.sai-page .sai-srchip{background:#1c2740;color:#34d399;border-color:#2a3757}'
      : '';
  };

  // ── ড্যাশবোর্ড এন্ট্রি ─────────────────────────────────────────────────────────
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
      entry.setAttribute('aria-label', 'Admihub AI খুলুন');
      entry.onclick = () => navigate(ROUTE);
      entry.innerHTML = `<span class="standalone-mock-dashboard-mark" aria-hidden="true">🎓</span><span class="standalone-mock-dashboard-copy"><b>Admihub AI</b><small>তোমার প্রশ্নব্যাংক বুঝে বন্ধুর মতো সাহায্য — ফুলস্ক্রিন চ্যাটে</small></span><span class="standalone-mock-dashboard-arrow" aria-hidden="true">›</span>`;
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

  window.StudyAiTool = { render, send, quick, shareData, skipShare, editName, openSheet, closeSheet, closePage, setSource, newChat, openChat, delChat, clearChats, setEngine, setProvider, setKey, setModel, setTheme, toggleData, pickAttach, handleFiles, removeAttach, testKey, ensureSync, _state: () => state };
  if (typeof document !== 'undefined') bootMount();
})();
