/* Admission Hub — Progress Tool
 * Reads the shared CACHE only; it does not create a duplicate question database.
 */
(() => {
  'use strict';
  const ROUTE = 'progress-overview';
  const q = (s, root = document) => root.querySelector(s);
  const esc = (v) => String(v ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const n = (v) => Number.isFinite(Number(v)) ? Number(v) : 0;
  const pct = (a, b) => b > 0 ? Math.max(0, Math.min(100, Math.round((a / b) * 100))) : null;
  const cache = () => typeof CACHE !== 'undefined' ? CACHE : { questions:[], topics:[], subjects:[], examResults:[], dailyStats:[], activityLogs:[] };
  const route = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || window.Router?.path || 'dashboard');
  const questionStats = (question) => question?.stats || question?.statistics || {};
  const answered = (question) => n(questionStats(question).attempts || question.attempts || 0);
  const correct = (question) => n(questionStats(question).correct || question.correctCount || 0);
  const validQuestions = () => (cache().questions || []).filter(row => row && row.id != null);
  const subjects = () => (cache().subjects || []).filter(row => row && row.id != null);
  const topicById = id => (cache().topics || []).find(row => String(row.id) === String(id));

  function subjectPerformance(subjectId) {
    const rows = validQuestions().filter(row => !subjectId || String(row.subjectId) === String(subjectId));
    const attempts = rows.reduce((sum, row) => sum + answered(row), 0);
    const right = rows.reduce((sum, row) => sum + correct(row), 0);
    const topics = (cache().topics || []).filter(topic => String(topic.subjectId) === String(subjectId));
    const practicedTopics = topics.filter(topic => rows.some(row => String(row.topicId) === String(topic.id) && answered(row) > 0)).length;
    const progress = topics.length ? pct(practicedTopics, topics.length) : (rows.length ? pct(rows.filter(row => answered(row) > 0).length, rows.length) : null);
    return { attempts, correct:right, accuracy:pct(right, attempts), progress, rows, topics };
  }

  function topicPerformance(topicId) {
    const rows = validQuestions().filter(row => String(row.topicId) === String(topicId));
    const attempts = rows.reduce((sum, row) => sum + answered(row), 0);
    const right = rows.reduce((sum, row) => sum + correct(row), 0);
    return { topicId, attempts, correct:right, accuracy:pct(right, attempts), progress:rows.length ? pct(rows.filter(row => answered(row) > 0).length, rows.length) : null };
  }

  function studyDays() {
    const days = new Set();
    (cache().dailyStats || []).forEach(row => { if (row?.id) days.add(String(row.id).slice(0, 10)); else if (row?.date) days.add(String(row.date).slice(0, 10)); });
    (cache().activityLogs || []).forEach(row => { if (row?.date) days.add(String(row.date).slice(0, 10)); else if (row?.createdAt) days.add(new Date(row.createdAt).toISOString().slice(0, 10)); });
    (cache().examResults || []).forEach(row => { if (row?.date) days.add(String(row.date).slice(0, 10)); else if (row?.createdAt) days.add(new Date(row.createdAt).toISOString().slice(0, 10)); });
    return days.size || null;
  }

  function validTests() {
    return (cache().examResults || []).filter(row => row && row.status !== 'running' && row.status !== 'incomplete' && row.status !== 'abandoned');
  }
  function testMetrics() {
    const tests = validTests();
    const scores = tests.map(row => n(row.scorePct ?? row.percentage ?? (n(row.score) && n(row.total) ? n(row.score) / n(row.total) * 100 : 0))).filter(Number.isFinite);
    const accuracies = tests.map(row => n(row.accuracy ?? row.accuracyPct ?? row.percentage ?? 0)).filter(Number.isFinite);
    return { tests, averageScore:scores.length ? Math.round(scores.reduce((a,b)=>a+b,0)/scores.length) : null, averageAccuracy:accuracies.length ? Math.round(accuracies.reduce((a,b)=>a+b,0)/accuracies.length) : null, bestScore:scores.length ? Math.round(Math.max(...scores)) : null };
  }

  function getOverview() {
    const rows = validQuestions();
    const totalAnswered = rows.reduce((sum, row) => sum + answered(row), 0);
    const totalCorrect = rows.reduce((sum, row) => sum + correct(row), 0);
    const topicRows = (cache().topics || []).map(topicPerformance).filter(row => row.attempts > 0);
    const prepared = (cache().topics || []).filter(topic => validQuestions().some(row => String(row.topicId) === String(topic.id) && answered(row) > 0)).length;
    const totalTopics = (cache().topics || []).length;
    const tests = testMetrics();
    return { questionsSolved:rows.filter(row => answered(row) > 0).length, totalAnswered, totalCorrect, accuracy:pct(totalCorrect, totalAnswered), tests:tests.tests.length, studyDays:studyDays(), preparationProgress:totalTopics ? pct(prepared, totalTopics) : null, topicRows };
  }

  function getStrongestWeakest() {
    const rows = (cache().topics || []).map(topic => ({...topic, ...topicPerformance(topic.id)})).filter(row => row.attempts >= 3 && row.accuracy != null).sort((a,b) => b.accuracy - a.accuracy);
    return { strongest:rows.slice(0, 3), weakest:[...rows].reverse().slice(0, 3) };
  }

  window.ProgressEngine = { getOverview, getSubjectPerformance:subjectPerformance, getAllSubjectPerformance:() => subjects().map(subject => ({...subject, ...subjectPerformance(subject.id)})), getTopicPerformance:topicPerformance, getTestPerformance:testMetrics, calculatePreparationProgress:() => getOverview().preparationProgress, getStrongestTopics:() => getStrongestWeakest().strongest, getWeakestTopics:() => getStrongestWeakest().weakest };

  function shell(inner) { if (typeof window.renderShell === 'function') window.renderShell(`<main class="progress-tool">${inner}</main>`, { topbar:false, hideNav:true }); else q('#app').innerHTML = `<main class="progress-tool">${inner}</main>`; }
  function metric(label, value) { return `<div class="progress-metric"><b>${value == null ? '—' : esc(value)}</b><small>${label}</small></div>`; }
  function subjectRows() { return window.ProgressEngine.getAllSubjectPerformance().map(row => `<button type="button" class="progress-subject-row" onclick="navigate('${ROUTE}/subject/${encodeURIComponent(row.id)}')"><span><b>${esc(row.name || 'Subject')}</b><small>${row.accuracy == null ? 'Not started' : `Accuracy ${row.accuracy}%`}</small></span><em>${row.progress == null ? '—' : `${row.progress}%`}</em><i><span style="width:${row.progress || 0}%"></span></i></button>`).join('') || `<p class="progress-muted">No active subjects yet.</p>`; }
  function topicRows(rows) { return rows.map(row => `<div class="progress-topic-row"><span>${esc(row.name || 'Topic')}</span><b>${row.progress == null ? '—' : `${row.progress}%`}</b></div>`).join('') || `<p class="progress-muted">No topic performance data yet.</p>`; }
  function renderOverview() {
    const o = window.ProgressEngine.getOverview(); const tests = window.ProgressEngine.getTestPerformance(); const sw = getStrongestWeakest();
    const empty = !o.totalAnswered && !o.tests;
    shell(`<header class="progress-tool-head"><button type="button" class="progress-back" onclick="navigate('dashboard')">←</button><div><span>PROGRESS</span><h1>Your Preparation Overview</h1></div></header><section class="progress-hero"><div class="progress-section-label">OVERALL PERFORMANCE</div><div class="progress-metrics">${metric('Questions Solved', empty ? null : o.questionsSolved)}${metric('Accuracy', empty ? null : (o.accuracy == null ? null : `${o.accuracy}%`))}${metric('Tests', o.tests)}${metric('Study Days', empty ? null : o.studyDays)}</div>${empty ? '<p class="progress-empty-title">No performance data yet.</p><p class="progress-muted">Complete your first practice session to start tracking your progress.</p>' : ''}</section><section class="progress-card"><div class="progress-card-head"><b>PREPARATION PROGRESS</b><strong>${o.preparationProgress == null ? '—' : `${o.preparationProgress}%`}</strong></div><div class="progress-bar"><i style="width:${o.preparationProgress || 0}%"></i></div><p class="progress-muted">${o.preparationProgress == null ? 'Progress will appear as you practice configured topics.' : `${o.preparationProgress}% of configured topics practiced`}</p></section><section class="progress-card"><div class="progress-card-head"><b>SUBJECT PERFORMANCE</b></div><div class="progress-subject-list">${subjectRows()}</div></section><section class="progress-card"><div class="progress-card-head"><b>TEST PERFORMANCE</b></div><div class="progress-test-grid">${metric('Average Score', tests.averageScore == null ? null : `${tests.averageScore}%`)}${metric('Average Accuracy', tests.averageAccuracy == null ? null : `${tests.averageAccuracy}%`)}${metric('Best Score', tests.bestScore == null ? null : `${tests.bestScore}%`)}${metric('Tests Completed', tests.tests.length)}</div>${tests.tests.slice(-5).reverse().map((row,index) => `<button class="progress-test-row" type="button" onclick="navigate('history')"><span>${esc(row.title || row.name || `Test ${tests.tests.length - index}`)}</span><b>${esc(row.scorePct ?? row.percentage ?? '—')}${row.scorePct != null || row.percentage != null ? '%' : ''}</b></button>`).join('')}</section>${sw.strongest.length || sw.weakest.length ? `<section class="progress-card progress-two-col"><div><b>STRONGEST</b>${topicRows(sw.strongest)}</div><div><b>NEEDS PRACTICE</b>${topicRows(sw.weakest)}</div></section>` : ''}`);
  }
  function renderSubjectDetail(id) {
    const subject = subjects().find(row => String(row.id) === String(id)); if (!subject) return renderOverview();
    const perf = window.ProgressEngine.getSubjectPerformance(id);
    shell(`<header class="progress-tool-head"><button type="button" class="progress-back" onclick="navigate('${ROUTE}')">←</button><div><span>SUBJECT DETAIL</span><h1>${esc(subject.name || 'Subject')}</h1></div></header><section class="progress-hero"><div class="progress-metrics">${metric('Progress', perf.progress == null ? null : `${perf.progress}%`)}${metric('Accuracy', perf.accuracy == null ? null : `${perf.accuracy}%`)}${metric('Questions Solved', perf.rows.filter(row => answered(row) > 0).length)}${metric('Tests', '—')}</div></section><section class="progress-card"><div class="progress-card-head"><b>TOPICS</b></div>${topicRows(perf.topics.map(topic => ({...topic, ...topicPerformance(topic.id)})))}</section>`);
  }
  function render() { const path = route(); if (path === ROUTE) return renderOverview(); if (path.startsWith(`${ROUTE}/subject/`)) return renderSubjectDetail(decodeURIComponent(path.split('/').slice(2).join('/'))); }
  const previousRoute = window.__admissionRenderRoute;
  if (typeof previousRoute === 'function') window.__admissionRenderRoute = function progressRoute() { if (route() === ROUTE || route().startsWith(`${ROUTE}/subject/`)) return render(); return previousRoute.apply(this, arguments); };
  const previousRender = window.render;
  if (typeof previousRender === 'function') window.render = function progressRender() { if (route() === ROUTE || route().startsWith(`${ROUTE}/subject/`)) return render(); return previousRender.apply(this, arguments); };
  window.addEventListener('hashchange', () => { if (route() === ROUTE || route().startsWith(`${ROUTE}/subject/`)) setTimeout(render, 0); });
  window.addEventListener('admission:route-rendered', () => { if (route() === ROUTE || route().startsWith(`${ROUTE}/subject/`)) setTimeout(render, 0); });
  installProgressStyles();
  function installProgressStyles() { if (q('#progress-tool-styles')) return; const style = document.createElement('style'); style.id = 'progress-tool-styles'; style.textContent = `.progress-tool{max-width:680px;margin:0 auto;padding:18px 0 40px;color:#173128}.progress-tool-head{display:flex;align-items:center;gap:12px;margin-bottom:16px}.progress-tool-head span{color:#168062;font-size:10px;font-weight:900;letter-spacing:.14em}.progress-tool-head h1{margin:4px 0 0;font-size:25px;line-height:1.2}.progress-back{width:40px;height:40px;border:1px solid var(--line);border-radius:12px;background:var(--card);font-size:22px;color:var(--emerald-d)}.progress-hero,.progress-card{padding:17px;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:var(--shadow);margin-top:13px}.progress-section-label,.progress-card-head b{color:var(--emerald-d);font-size:11px;letter-spacing:.12em}.progress-card-head{display:flex;justify-content:space-between;align-items:center;gap:10px}.progress-card-head strong{font-size:21px;color:var(--emerald)}.progress-metrics{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-top:14px}.progress-metric{min-width:0;text-align:center;padding:10px 5px;border-right:1px solid var(--line)}.progress-metric:last-child{border-right:0}.progress-metric b{display:block;font-size:20px;color:var(--text);overflow-wrap:anywhere}.progress-metric small{display:block;margin-top:4px;color:var(--sub);font-size:10px;line-height:1.25}.progress-bar{height:9px;margin-top:14px;border-radius:99px;background:var(--mint);overflow:hidden}.progress-bar i{display:block;height:100%;border-radius:inherit;background:var(--emerald)}.progress-muted{margin:8px 0 0;color:var(--sub);font-size:12px;line-height:1.5}.progress-empty-title{margin:16px 0 0;font-weight:850}.progress-subject-list{display:grid;gap:9px;margin-top:12px}.progress-subject-row{position:relative;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;padding:12px;border:1px solid var(--line);border-radius:12px;background:rgba(255,255,255,.65);text-align:left;color:inherit;font:inherit}.progress-subject-row b,.progress-subject-row small{display:block}.progress-subject-row b{font-size:14px}.progress-subject-row small{margin-top:3px;color:var(--sub);font-size:11px}.progress-subject-row em{font-style:normal;font-weight:850;color:var(--emerald)}.progress-subject-row i{grid-column:1/-1;height:5px;border-radius:99px;background:var(--mint);overflow:hidden}.progress-subject-row i span{display:block;height:100%;border-radius:inherit;background:var(--emerald)}.progress-test-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:4px;margin-top:12px}.progress-test-row{display:flex;justify-content:space-between;gap:10px;width:100%;padding:10px 0;border:0;border-bottom:1px solid var(--line);background:transparent;color:inherit;font:inherit;text-align:left}.progress-test-row b{color:var(--emerald)}.progress-two-col{display:grid;grid-template-columns:1fr 1fr;gap:18px}.progress-two-col>b{display:block}.progress-topic-row{display:flex;justify-content:space-between;gap:8px;padding:10px 0;border-bottom:1px solid var(--line);font-size:13px}.progress-topic-row b{color:var(--emerald)}@media(max-width:500px){.progress-metrics{grid-template-columns:repeat(2,1fr)}.progress-metric:nth-child(2){border-right:0}.progress-test-grid{grid-template-columns:repeat(2,1fr)}.progress-two-col{grid-template-columns:1fr;gap:14px}}`; document.head.appendChild(style); }
})();
