/* Today Command Center — settings-driven target and active learning time. */
(() => {
  'use strict';
  const route = () => String(location.hash || '').replace(/^#\/?/, '').split('?')[0] || 'dashboard';
  const cache = () => typeof CACHE !== 'undefined' ? CACHE : (window.CACHE || {});
  const activeExam = () => typeof ActiveExam !== 'undefined' ? ActiveExam : (window.__admissionHubGetActiveExam?.() || null);
  const clearGoalOrphans = () => { const app = document.getElementById('app'); document.querySelectorAll('#today-command-goal-settings').forEach(panel => { if (!app?.contains(panel)) panel.remove(); }); };
  const todayId = () => typeof todayKey === 'function' ? todayKey() : new Date().toISOString().slice(0, 10);
  const validGoal = value => Math.max(1, Math.min(5000, Math.round(Number(value) || 100)));
  const activeRoute = () => {
    const path = route();
    return path === 'question-bank' || path.startsWith('question-bank/') || path === 'vocabulary' || path.startsWith('vocabulary/') || path === 'exam/running';
  };
  const todayRow = () => {
    const id = todayId();
    return (cache().dailyStats || []).find(row => String(row?.id) === String(id)) || { id, date:id, questions:0, correct:0, wrong:0, exams:0, timeMs:0 };
  };
  const upsertLocal = row => {
    const rows = cache().dailyStats || [];
    const index = rows.findIndex(item => String(item?.id) === String(row.id));
    if (index >= 0) rows[index] = row;
    else rows.push(row);
    cache().dailyStats = rows;
  };
  const formatClock = ms => {
    const sec = Math.max(0, Math.floor(Number(ms || 0) / 1000));
    return `${String(Math.floor(sec / 3600)).padStart(2, '0')}:${String(Math.floor((sec % 3600) / 60)).padStart(2, '0')}`;
  };
  const metrics = () => {
    const row = todayRow();
    const fallback = (cache().examResults || []).filter(item => todayId() === (typeof todayKey === 'function' ? todayKey(new Date(item.date || item.createdAt || 0)) : '')).reduce((sum, item) => ({ questions:sum.questions + Number(item.correct || 0) + Number(item.wrong || 0), correct:sum.correct + Number(item.correct || 0), wrong:sum.wrong + Number(item.wrong || 0) }), {questions:0,correct:0,wrong:0});
    const questions = Math.max(Number(row.questions || 0), fallback.questions);
    const correct = Math.max(Number(row.correct || 0), fallback.correct);
    const wrong = Math.max(Number(row.wrong || 0), fallback.wrong);
    const goal = validGoal(cache().settings?.dailyTarget || 100);
    return { row, questions, correct, wrong, goal, percent:Math.min(100, Math.round(questions / goal * 100)), timeMs:Number(row.timeMs || 0) };
  };
  const paint = () => {
    if (route() !== 'dashboard') return;
    const value = metrics();
    document.querySelectorAll('[data-today-goal]').forEach(node => node.textContent = value.goal);
    document.querySelectorAll('[data-today-done]').forEach(node => node.textContent = value.questions);
    document.querySelectorAll('[data-today-correct]').forEach(node => node.textContent = value.correct);
    document.querySelectorAll('[data-today-wrong]').forEach(node => node.textContent = value.wrong);
    document.querySelectorAll('[data-today-accuracy]').forEach(node => node.textContent = `${value.questions ? Math.round(value.correct / Math.max(1, value.correct + value.wrong) * 100) : 0}%`);
    document.querySelectorAll('[data-today-study-time]').forEach(node => node.textContent = formatClock(value.timeMs));
    document.querySelectorAll('[data-today-percent]').forEach(node => node.textContent = `${value.percent}%`);
    document.querySelectorAll('[data-today-progress]').forEach(node => node.style.width = `${value.percent}%`);
    document.querySelectorAll('[data-today-goal-status]').forEach(node => { const complete = value.questions >= value.goal; node.textContent = complete ? 'আজকের লক্ষ্য পূর্ণ ✓' : `${Math.max(0, value.goal - value.questions)} MCQ বাকি`; node.classList.toggle('is-complete', complete); });
  };
  let lastTouch = 0, lastTick = Date.now(), writeTimer = null;
  const touch = () => { lastTouch = Date.now(); };
  ['pointerdown','keydown','touchstart','scroll'].forEach(name => window.addEventListener(name, touch, { passive:true }));
  const persist = async () => {
    const row = { ...todayRow(), updatedAt:Date.now() };
    upsertLocal(row); paint();
    try { if (typeof dbPut === 'function') await dbPut('dailyStats', row); } catch (_) {}
  };
  const tick = () => {
    const now = Date.now();
    const delta = Math.min(10000, Math.max(0, now - lastTick));
    lastTick = now;
    if (document.visibilityState === 'visible' && activeRoute() && now - lastTouch < 75000) { const row = { ...todayRow(), timeMs:Number(todayRow().timeMs || 0) + delta, updatedAt:now }; upsertLocal(row); paint(); if (!writeTimer) writeTimer = window.setTimeout(async () => { writeTimer = null; await persist(); }, 20000); }
  };
  window.setInterval(tick, 5000);
  document.addEventListener('visibilitychange', () => { if (document.visibilityState !== 'visible') void persist(); else { lastTick = Date.now(); lastTouch = 0; } });
  window.addEventListener('pagehide', () => void persist(), { passive:true });
  const recordAnswer = async correct => {
    const row = { ...todayRow(), questions:Number(todayRow().questions || 0) + 1, correct:Number(todayRow().correct || 0) + (correct ? 1 : 0), wrong:Number(todayRow().wrong || 0) + (correct ? 0 : 1), updatedAt:Date.now() };
    upsertLocal(row); paint();
    try { if (typeof dbPut === 'function') await dbPut('dailyStats', row); } catch (_) {}
  };
  const wrapAnswer = (name, answered, isCorrect) => {
    const original = window[name];
    if (typeof original !== 'function' || original.__todayLiveWrapped) return;
    const wrapped = async function () { const before = answered.apply(this, arguments); const output = await original.apply(this, arguments); if (!before) void recordAnswer(!!isCorrect.apply(this, arguments)); return output; };
    wrapped.__todayLiveWrapped = true; window[name] = wrapped;
  };
  wrapAnswer('selectBankAnswer', qid => !!window.BankAnswers?.[qid], (qid, idx) => Number(cache().questions?.find(q => String(q.id) === String(qid))?.answerIndex) === Number(idx));
  wrapAnswer('selectMockAnswer', qid => activeExam()?.selectedAnswers?.[qid] !== undefined, (qid, idx) => Number(activeExam()?.questions?.find(q => String(q.id) === String(qid))?.answerIndex) === Number(idx));
  wrapAnswer('selectFlashAnswer', qid => !!activeExam()?.flashResults?.[qid], (qid, idx) => Number(activeExam()?.questions?.find(q => String(q.id) === String(qid))?.answerIndex) === Number(idx));
  function goalPanel() {
    const app = document.getElementById('app');
    if (!app || route() !== 'settings') return;
    clearGoalOrphans();
    const current = validGoal(cache().settings?.dailyTarget || 100);
    const existing = app.querySelector('#today-command-goal-settings');
    if (existing) return;
    const section = document.createElement('section');
    section.id = 'today-command-goal-settings';
    section.innerHTML = `<div class="h2">Today Command Center</div><div class="card today-goal-settings-card"><b>Daily MCQ Goal</b><p class="muted">প্রতিদিন কতটি MCQ solve করতে চাও সেটি নির্ধারণ করো। Goal dashboard card-এ live দেখা যাবে।</p><div class="today-goal-setting-row"><input id="todayGoalInput" type="number" min="1" max="5000" inputmode="numeric" value="${current}"><button class="btn" type="button" onclick="TodayCommandCenter.saveGoal()">Save goal</button></div></div>`;
    const anchor = [...app.querySelectorAll('.h2')].find(node => node.textContent.trim().toLowerCase() === 'feedback controls');
    if (anchor?.parentElement) anchor.parentElement.before(section); else app.append(section);
  }
  window.TodayCommandCenter = { saveGoal: async () => { const input = document.querySelector('#app #todayGoalInput'); const goal = validGoal(input?.value); const settings = { ...(cache().settings || {}), dailyTarget:goal }; cache().settings = settings; if (typeof dbPut === 'function') await dbPut('settings', settings); window.toast?.(`Daily MCQ Goal ${goal} সেট করা হয়েছে`); paint(); } };
  const app = document.getElementById('app');
  if (app) new MutationObserver(() => { requestAnimationFrame(() => { goalPanel(); paint(); }); }).observe(app, {childList:true,subtree:true});
  new MutationObserver(clearGoalOrphans).observe(document.body, {childList:true});
  setTimeout(clearGoalOrphans, 0); setTimeout(clearGoalOrphans, 100); setTimeout(clearGoalOrphans, 500);
  window.addEventListener('hashchange', () => { setTimeout(() => { goalPanel(); paint(); }, 0); }, {passive:true});
  const style = document.createElement('style');
  style.textContent = `.p3-today-hero-card{overflow:hidden;position:relative;background:linear-gradient(142deg,#ffffff 0%,#f0fbf5 68%,#dcf5e8 100%)}.p3-today-hero-card:after{content:'';position:absolute;width:150px;height:150px;border-radius:50%;right:-58px;top:-70px;border:1px solid rgba(15,107,79,.12);pointer-events:none}.p3-goal-status-v3{position:relative;z-index:1;display:inline-flex;margin-top:8px;padding:4px 8px;border-radius:999px;background:#edf8f2;color:#357762;font-size:10px;font-weight:800}.p3-goal-status-v3.is-complete{background:#0f6b4f;color:#fff}.today-goal-settings-card{padding:15px}.today-goal-settings-card p{margin:5px 0 12px;line-height:1.55}.today-goal-setting-row{display:flex;gap:9px}.today-goal-setting-row input{min-width:0;flex:1}.today-goal-setting-row .btn{width:auto;white-space:nowrap}@media(max-width:380px){.today-goal-setting-row{flex-direction:column}.today-goal-setting-row .btn{width:100%}}`;
  document.head.append(style);
  window.TodayCommandCenter?.refresh?.();
})();
