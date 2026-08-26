(() => {
  'use strict';

  const COURSE_ID = 'sandhi-exact-native-v1';
  const SOURCE_PATH = './courses/sandhi/index.html';
  const SOURCE_HASH = 'bf1ecb9767937231a3dcf36250e62eda8645f996f06a3806edf51ed06e6bd0ff';
  const STORAGE_PREFIX = `admissionHubNativeCourseV1:${COURSE_ID}`;
  const SOURCE_STYLE_ID = 'source-course-native-style';
  const state = { payload: null, loading: null, routeMounted: false, flash: null, previousTheme: null };

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const coursePath = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const isCoursePath = path => path === 'source-courses' || path.startsWith('source-courses/');
  const shell = (html, opts = {}) => {
    if (typeof window.renderShell === 'function') return window.renderShell(html, opts);
    const app = document.getElementById('app');
    if (app) app.innerHTML = html;
  };
  const read = suffix => { try { return JSON.parse(localStorage.getItem(`${STORAGE_PREFIX}:${suffix}`) || 'null'); } catch (_) { return null; } };
  const write = (suffix, value) => { try { localStorage.setItem(`${STORAGE_PREFIX}:${suffix}`, JSON.stringify(value)); } catch (_) {} };
  const quizStore = () => {
    const value = read('quiz');
    return value && typeof value === 'object' ? { index: Number(value.index) || 0, filter: value.filter || 'all', answers: value.answers || {}, revealed: value.revealed || {}, bookmarks: Array.isArray(value.bookmarks) ? value.bookmarks : [], notes: value.notes || {} } : { index: 0, filter: 'all', answers: {}, revealed: {}, bookmarks: [], notes: {} };
  };
  const sourceQuestions = () => Array.isArray(state.payload?.mcq) ? state.payload.mcq : (Array.isArray(window.__sourceCourseMCQ) ? window.__sourceCourseMCQ : []);
  const filteredQuestions = store => {
    const all = sourceQuestions();
    if (store.filter === 'basic' || store.filter === 'inter' || store.filter === 'adm' || store.filter === 'trap') return all.filter(q => q.d === store.filter);
    if (store.filter === 'unattempted') return all.filter(q => store.answers[q.id] === undefined);
    if (store.filter === 'mistakes') return all.filter(q => q.answers?.correct === false || (store.answers[q.id] !== undefined && Number(store.answers[q.id]) !== Number(q.a)));
    if (store.filter === 'bookmarked') return all.filter(q => store.bookmarks.includes(q.id));
    return all;
  };
  const qId = (q, index) => q.id || `sandhi-source-q-${String(q.number || index + 1).padStart(2, '0')}`;
  const normalizeQuestions = questions => questions.map((q, index) => ({ ...q, id: qId(q, index), number: Number(q.number || index + 1), question: q.q || q.question || '', options: Array.isArray(q.o) ? q.o : (q.options || []), answer: Number(q.a ?? q.answer ?? 0), family: q.t || q.topic || 'Source MCQ', difficulty: q.d || 'basic', explanation: q.e || q.explanation || '' }));
  const questions = () => { const qs = normalizeQuestions(sourceQuestions()); if (state.payload) state.payload.mcq = qs; return qs; };

  const removeNativeState = () => {
    document.getElementById(SOURCE_STYLE_ID)?.remove();
    document.body.classList.remove('source-course-native-body');
    document.getElementById('app')?.classList.remove('source-course-native-app');
    document.documentElement.style.removeProperty('--source-course-active');
    if (state.previousTheme !== null) document.documentElement.setAttribute('data-theme', state.previousTheme);
    state.previousTheme = null;
    state.routeMounted = false;
    state.flash = null;
    delete window.__sourceCourseMCQ;
  };

  const addSourceStyle = text => {
    document.getElementById(SOURCE_STYLE_ID)?.remove();
    const style = document.createElement('style');
    style.id = SOURCE_STYLE_ID;
    style.textContent = `${text}\n#app.source-course-native-app{max-width:100%!important;padding-bottom:0!important;margin:0!important}\n#app.source-course-native-app .page.source-course-native-page{max-width:none!important;padding:0!important;margin:0!important;overflow:visible!important}\n#app.source-course-native-app .source-native-host{width:100%;min-height:100dvh;margin:0;padding:0}\n#app.source-course-native-app .native-course-quiz-wrap{margin-top:12px}\n#app.source-course-native-app .native-course-quiz-head{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0 14px}\n#app.source-course-native-app .native-course-quiz-head .native-course-quiz-tools{display:flex;gap:8px;flex-wrap:wrap}\n#app.source-course-native-app .native-course-quiz-head button{border:1px solid var(--line);background:var(--card);color:var(--text);padding:8px 12px;border-radius:10px;font-weight:800;cursor:pointer}\n#app.source-course-native-app .native-course-quiz-head button.primary{background:var(--brand);border-color:var(--brand);color:#fff}\n#app.source-course-native-app .native-course-quiz-filters{display:flex;gap:8px;flex-wrap:wrap;margin:0 0 14px}\n#app.source-course-native-app .native-course-quiz-filters button{border:1px solid var(--line);background:var(--card);color:var(--text);padding:7px 12px;border-radius:999px;font-size:12px;font-weight:800;cursor:pointer}\n#app.source-course-native-app .native-course-quiz-filters button.on{background:var(--brand);border-color:var(--brand);color:#fff}\n#app.source-course-native-app .native-course-quiz-nav{display:flex;justify-content:space-between;align-items:center;gap:10px;margin-top:14px;flex-wrap:wrap}\n#app.source-course-native-app .native-course-quiz-nav button{border:1px solid var(--line);background:var(--card);color:var(--text);padding:9px 14px;border-radius:10px;font-weight:800;cursor:pointer}\n#app.source-course-native-app .native-course-quiz-nav button:disabled{opacity:.45;cursor:not-allowed}\n#app.source-course-native-app .native-course-quiz-summary{display:flex;gap:10px;flex-wrap:wrap;color:var(--muted);font-size:12px;margin:8px 0}\n#app.source-course-native-app .native-course-flash{border:1px solid color-mix(in srgb,var(--brand) 22%,var(--line));background:linear-gradient(135deg,color-mix(in srgb,var(--brand) 8%,var(--card)),var(--card));border-radius:16px;padding:15px;margin:12px 0}\n#app.source-course-native-app .native-course-flash h3{margin:0 0 4px;color:var(--ink)}\n#app.source-course-native-app .native-course-flash p{margin:0;color:var(--muted);font-size:12px}\n#app.source-course-native-app .native-course-flash-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:10px}\n#app.source-course-native-app .native-course-flash-actions button{border:1px solid var(--line);background:var(--card);color:var(--text);padding:8px 12px;border-radius:10px;font-weight:800;cursor:pointer}\n@media(max-width:640px){#app.source-course-native-app .native-course-quiz-head{align-items:flex-start}#app.source-course-native-app .native-course-quiz-head .native-course-quiz-tools{width:100%}#app.source-course-native-app .native-course-quiz-head button{flex:1;min-width:140px}}`;
    document.head.appendChild(style);
  };

  const library = () => {
    removeNativeState();
    shell(`<main class="source-course-page"><header class="source-course-hero"><div><span>ADMISSION HUB · SOURCE COURSE</span><h1>বাংলা Courses</h1><p>তোমার supplied Course এখন Admission Hub-এর native tool হিসেবে চলছে।</p></div><b>SC</b></header><section class="source-course-card"><div class="source-course-icon">সন্ধি</div><div><span>SOURCE-LOCKED · NATIVE COURSE</span><h2>সন্ধি — University Admission Master Guide</h2><p>Visual University Admission Master Guide · Bangla 2nd Paper</p><small>Original lessons and design preserved · Native Question Bank MCQ · Temporary Flash Test</small></div><button class="btn" onclick="navigate('source-courses/sandhi')">Open Course →</button></section></main>`, {title:'বাংলা Courses', back:"navigate('dashboard')"});
    const page = document.querySelector('#app .page');
    if (page) page.insertAdjacentHTML('beforeend', `<style>.source-course-page{max-width:980px;margin:0 auto;padding:18px 14px 92px;color:#173128}.source-course-hero{display:flex;justify-content:space-between;align-items:center;gap:15px;padding:25px 20px;border-radius:24px;background:linear-gradient(135deg,#eef1ff,#faf7ff);border:1px solid #ddd9ff}.source-course-hero span,.source-course-card span{font-size:10px;font-weight:900;letter-spacing:.12em;color:#5846c7}.source-course-hero h1{margin:7px 0 5px;color:#20205c;font-size:32px}.source-course-hero p{margin:0;color:#657080;font-size:13px}.source-course-hero>b{display:grid;place-items:center;width:68px;height:68px;border-radius:20px;background:linear-gradient(135deg,#4f46e5,#7c3aed);color:#fff;font-size:20px}.source-course-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;margin-top:16px;padding:18px;border:1px solid #e0e4f0;border-radius:20px;background:#fff;box-shadow:0 10px 25px rgba(46,38,120,.07)}.source-course-icon{display:grid;place-items:center;width:58px;height:58px;border-radius:17px;background:#eeeaff;color:#5544c4;font-size:13px;font-weight:900}.source-course-card h2{margin:5px 0 4px;font-size:19px;color:#20283d}.source-course-card p{margin:0;color:#647085;font-size:12px}.source-course-card small{display:block;margin-top:9px;color:#7b8492;font-size:10px}@media(max-width:640px){.source-course-card{grid-template-columns:auto minmax(0,1fr)}.source-course-card .btn{grid-column:1/-1;width:100%}.source-course-hero h1{font-size:27px}}</style>`);
  };

  const loadSource = () => {
    if (state.payload) return Promise.resolve(state.payload);
    if (state.loading) return state.loading;
    state.loading = fetch(`${SOURCE_PATH}?nativeCourse=v2`, { cache: 'force-cache' }).then(response => {
      if (!response.ok) throw new Error(`source ${response.status}`);
      return response.text();
    }).then(text => {
      const doc = new DOMParser().parseFromString(text, 'text/html');
      const styles = Array.from(doc.querySelectorAll('style')).map(s => s.textContent || '').join('\n');
      const scripts = Array.from(doc.querySelectorAll('script')).map(s => s.textContent || '').join('\n');
      const bodyHtml = Array.from(doc.body.childNodes).filter(node => node.nodeName !== 'SCRIPT').map(node => node.outerHTML || node.textContent || '').join('');
      const transformed = scripts.replace('var MCQ = [', 'var MCQ = window.__sourceCourseMCQ = [');
      state.payload = { title: doc.title, styles, scripts: transformed, bodyHtml, sourceHash: SOURCE_HASH, mcq: [] };
      return state.payload;
    }).finally(() => { state.loading = null; });
    return state.loading;
  };

  const executeSource = payload => {
    state.previousTheme = document.documentElement.getAttribute('data-theme');
    addSourceStyle(payload.styles);
    document.body.classList.add('source-course-native-body');
    document.getElementById('app')?.classList.add('source-course-native-app');
    document.documentElement.style.setProperty('--source-course-active', '1');
    const page = document.querySelector('#app .page');
    if (!page) throw new Error('Course page shell missing');
    page.classList.add('source-course-native-page');
    const host = page.querySelector('.source-native-host');
    if (!host) throw new Error('Course host missing');
    host.innerHTML = payload.bodyHtml;
    if (payload.scripts) new Function('window', 'document', payload.scripts)(window, document);
    payload.mcq = normalizeQuestions(window.__sourceCourseMCQ || []);
    replaceQuizSection(payload.mcq);
    state.routeMounted = true;
  };

  const setQuizStore = value => write('quiz', value);
  const answerCount = store => Object.keys(store.answers || {}).length;
  const correctCount = store => questions().filter(q => store.answers[q.id] !== undefined && Number(store.answers[q.id]) === q.answer).length;
  const qbankCard = (q, store, position, total, mode = 'course') => {
    const selected = store.answers[q.id];
    const revealed = selected !== undefined || !!store.revealed[q.id];
    const correct = Number(selected) === Number(q.answer);
    const status = selected === undefined ? (store.revealed[q.id] ? 'Revealed' : 'Unattempted') : (correct ? 'Correct' : 'Wrong');
    const statusClass = selected === undefined ? 'unattempted' : (correct ? 'correct' : 'wrong');
    const opts = q.options.map((option, index) => {
      const isCorrect = revealed && index === q.answer;
      const isWrong = selected !== undefined && index === Number(selected) && !isCorrect;
      const cls = isCorrect ? 'correct' : isWrong ? 'wrong' : '';
      return `<button class="q-opt-v2 ${cls}" type="button" ${revealed ? 'disabled' : ''} aria-label="Option ${String.fromCharCode(65 + index)}" onclick="SourceCourse.answer('${esc(q.id)}',${index},'${mode}')"><span class="q-opt-letter">${String.fromCharCode(65 + index)}</span><span class="q-opt-text">${esc(option)}</span>${isCorrect ? '<span class="q-opt-icon">✓</span>' : isWrong ? '<span class="q-opt-icon">✕</span>' : ''}</button>`;
    }).join('');
    const explanation = revealed ? `<div class="q-explanation-v2 ${selected === undefined ? 'revealed' : correct ? 'correct' : 'wrong'}"><strong>${selected === undefined ? 'Answer revealed' : correct ? '✓ Correct' : '✕ Wrong'}</strong><p>Correct answer: ${esc(q.options[q.answer] || '')}</p>${q.explanation ? `<p>${esc(q.explanation)}</p>` : ''}</div>` : '';
    const isBookmarked = store.bookmarks.includes(q.id);
    const note = store.notes[q.id] || '';
    return `<article class="q-card-v2 card" data-qid="${esc(q.id)}"><div class="q-card-header"><div class="q-card-meta"><span class="q-card-num">Q ${String(q.number).padStart(2, '0')}</span><span class="q-breadcrumb">সন্ধি • ${esc(q.family)}</span></div><span class="q-status ${statusClass}">${status}</span></div><div class="q-text-v2">${esc(q.question)}</div><div class="q-options-v2">${opts}</div>${explanation}<footer class="q-card-footer"><span>Accuracy <strong>${answerCount(store) ? Math.round(correctCount(store) / answerCount(store) * 100) : 0}%</strong></span><span>Mistakes <strong>${questions().filter(x => store.answers[x.id] !== undefined && Number(store.answers[x.id]) !== x.answer).length}</strong></span>${mode === 'course' ? `<button class="q-footer-btn ${isBookmarked ? 'active' : ''}" type="button" aria-pressed="${isBookmarked}" onclick="SourceCourse.bookmark('${esc(q.id)}','course')">⭐ ${isBookmarked ? 'Bookmarked' : 'Bookmark'}</button>${!revealed ? `<button class="q-footer-btn" type="button" onclick="SourceCourse.reveal('${esc(q.id)}','course')">Show Answer</button>` : ''}<button class="q-footer-btn" type="button" onclick="SourceCourse.note('${esc(q.id)}','course')">✎ Note</button>` : ''}</footer>${note ? `<div class="q-note">✎ ${esc(note)}</div>` : ''}<small style="display:block;margin-top:10px;color:var(--sub);font-size:11px">Source: supplied Sandhi Course · Question ${String(q.number).padStart(2, '0')}</small></article>`;
  };

  const nativeQuiz = mcqs => {
    const store = quizStore();
    const visible = filteredQuestions(store);
    if (!visible.length) return `<div class="native-course-quiz-wrap"><div class="card empty">এই filter-এ কোনো প্রশ্ন নেই।</div></div>`;
    store.index = Math.min(Math.max(0, Number(store.index) || 0), visible.length - 1);
    const q = visible[store.index];
    const filters = [['all','সব'],['basic','Basic'],['inter','Intermediate'],['adm','Admission'],['trap','Trap'],['mistakes','Mistakes'],['bookmarked','Bookmarked']];
    const result = `<div class="native-course-quiz-summary"><span>${answerCount(store)}/${mcqs.length} answered</span><span>${correctCount(store)} correct</span><span>${mcqs.length ? Math.round(correctCount(store) / Math.max(1, answerCount(store)) * 100) : 0}% accuracy</span></div>`;
    return `<div class="native-course-quiz-wrap"><div class="native-course-quiz-head"><div><b>Native Question Bank MCQ Engine</b><div class="muted">Four-option card, instant feedback, bookmark, note ও result</div></div><div class="native-course-quiz-tools"><button class="primary" type="button" onclick="SourceCourse.startFlash()">⚡ Temporary Flash Test</button></div></div><div class="native-course-quiz-filters">${filters.map(([key,label]) => `<button class="${store.filter === key ? 'on' : ''}" type="button" onclick="SourceCourse.filter('${key}')">${label}</button>`).join('')}</div>${result}${qbankCard(q, store, store.index, visible.length)}<div class="native-course-quiz-nav"><button type="button" ${store.index === 0 ? 'disabled' : ''} onclick="SourceCourse.prev()">← Previous</button><span>Question ${store.index + 1} of ${visible.length}</span><button type="button" onclick="SourceCourse.next()">${store.index === visible.length - 1 ? 'See Result →' : 'Next →'}</button></div></div>`;
  };

  const flashCard = () => {
    const f = state.flash;
    if (!f) return '';
    const q = f.questions[f.index];
    const selected = f.answers[q.id];
    const revealed = selected !== undefined;
    const store = { answers: f.answers, revealed: {}, bookmarks: [], notes: {} };
    return `<div class="native-course-flash"><h3>⚡ Temporary Flash Test</h3><p>এই round-এর কোনো answer, result, progress বা bookmark save হবে না।</p><div class="native-course-flash-actions"><button type="button" onclick="SourceCourse.exitFlash()">Exit Flash Test</button></div></div>${qbankCard(q, store, f.index, f.questions.length, 'flash')}<div class="native-course-quiz-nav"><button type="button" ${f.index === 0 ? 'disabled' : ''} onclick="SourceCourse.flashPrev()">← Previous</button><span>Flash ${f.index + 1} of ${f.questions.length}</span><button type="button" onclick="SourceCourse.flashNext()">${f.index === f.questions.length - 1 ? 'Finish' : 'Next →'}</button></div>`;
  };

  const renderNativeQuiz = () => {
    const qSection = document.getElementById('quiz');
    if (!qSection) return;
    const heading = qSection.querySelector('.sec-head')?.outerHTML || '';
    const current = state.flash ? flashCard() : nativeQuiz(questions());
    qSection.innerHTML = `${heading}<div id="nativeCourseQuizMount">${current}</div>`;
  };

  const replaceQuizSection = mcqs => {
    const qSection = document.getElementById('quiz');
    if (!qSection) return;
    const heading = qSection.querySelector('.sec-head')?.outerHTML || '';
    qSection.innerHTML = `${heading}<div id="nativeCourseQuizMount"></div>`;
    renderNativeQuiz(mcqs);
  };

  const mount = payload => {
    removeNativeState();
    shell('<div class="source-native-host" aria-label="সন্ধি Course"></div>', { topbar: false, hideNav: true, title: '' });
    executeSource(payload);
  };

  const open = () => {
    if (state.routeMounted && document.querySelector('.source-native-host')) return true;
    shell('<div class="source-native-loading" style="min-height:100dvh;display:grid;place-items:center;padding:20px;text-align:center">Opening source course…</div>', { topbar: false, hideNav: true, title: '' });
    loadSource().then(mount).catch(error => {
      console.error('Source course failed', error);
      shell('<div style="padding:40px 20px;text-align:center">Course source could not load. Please try again.</div>', { topbar: false, hideNav: true, title: '' });
    });
    return true;
  };

  const render = () => {
    const p = coursePath();
    if (p === 'source-courses') { library(); return true; }
    if (p === 'source-courses/sandhi') { return open(); }
    removeNativeState();
    return false;
  };

  window.SourceCourse = {
    answer(qid, option, mode = 'course') {
      if (mode === 'flash') {
        if (!state.flash || state.flash.answers[qid] !== undefined) return;
        state.flash.answers[qid] = Number(option); renderNativeQuiz(); return;
      }
      const store = quizStore(); if (store.answers[qid] !== undefined) return;
      store.answers[qid] = Number(option); store.revealed[qid] = true; setQuizStore(store); renderNativeQuiz();
    },
    bookmark(qid, mode = 'course') {
      if (mode === 'flash') return;
      const store = quizStore(); store.bookmarks = store.bookmarks.includes(qid) ? store.bookmarks.filter(id => id !== qid) : [...store.bookmarks, qid]; setQuizStore(store); renderNativeQuiz();
    },
    note(qid, mode = 'course') {
      if (mode === 'flash') return;
      const store = quizStore(); const value = window.prompt('এই প্রশ্নের note লিখুন', store.notes[qid] || ''); if (value !== null) { store.notes[qid] = value.trim(); setQuizStore(store); renderNativeQuiz(); }
    },
    reveal(qid, mode = 'course') {
      if (mode === 'flash') return;
      const store = quizStore(); store.revealed[qid] = true; setQuizStore(store); renderNativeQuiz();
    },
    filter(value) { const store = quizStore(); store.filter = value; store.index = 0; setQuizStore(store); renderNativeQuiz(); },
    prev() { const store = quizStore(); store.index = Math.max(0, store.index - 1); setQuizStore(store); renderNativeQuiz(); },
    next() { const store = quizStore(); const visible = filteredQuestions(store); if (store.index >= visible.length - 1) { renderResult(); return; } store.index += 1; setQuizStore(store); renderNativeQuiz(); },
    startFlash() { const all = questions().slice().sort(() => Math.random() - 0.5); state.flash = { questions: all.slice(0, Math.min(20, all.length)), index: 0, answers: {} }; renderNativeQuiz(); },
    exitFlash() { state.flash = null; renderNativeQuiz(); },
    flashPrev() { if (!state.flash) return; state.flash.index = Math.max(0, state.flash.index - 1); renderNativeQuiz(); },
    flashNext() { if (!state.flash) return; if (state.flash.index >= state.flash.questions.length - 1) { renderFlashResult(); return; } state.flash.index += 1; renderNativeQuiz(); },
    reset() { write('quiz', { index: 0, filter: 'all', answers: {}, revealed: {}, bookmarks: [], notes: {} }); renderNativeQuiz(); }
  };

  function renderResult() {
    const store = quizStore(); const qs = questions(); const answered = answerCount(store); const correct = correctCount(store); const wrong = qs.filter(q => store.answers[q.id] !== undefined && Number(store.answers[q.id]) !== q.answer).length; const skipped = qs.length - answered; const accuracy = answered ? Math.round(correct / answered * 100) : 0;
    const mountPoint = document.getElementById('nativeCourseQuizMount'); if (!mountPoint) return;
    mountPoint.innerHTML = `<section class="card"><div class="kicker">NATIVE QUESTION BANK RESULT</div><h3>সন্ধি MCQ Result</h3><div class="stats"><div class="stat"><div class="n">${accuracy}%</div><div class="l">Accuracy</div></div><div class="stat"><div class="n">${correct}</div><div class="l">Correct</div></div><div class="stat"><div class="n">${wrong}</div><div class="l">Wrong</div></div><div class="stat"><div class="n">${skipped}</div><div class="l">Skipped</div></div></div><div class="native-course-flash-actions"><button class="btn" type="button" onclick="SourceCourse.reset()">Retry MCQ</button><button class="btn secondary" type="button" onclick="document.getElementById('quiz')?.scrollIntoView({behavior:'smooth'})">Back to Quiz</button></div></section>`;
  }

  function renderFlashResult() {
    const f = state.flash; if (!f) return;
    const correct = f.questions.filter(q => f.answers[q.id] !== undefined && Number(f.answers[q.id]) === q.answer).length; const answered = Object.keys(f.answers).length; const accuracy = answered ? Math.round(correct / answered * 100) : 0; const mountPoint = document.getElementById('nativeCourseQuizMount'); if (!mountPoint) return;
    mountPoint.innerHTML = `<section class="card"><div class="kicker">TEMPORARY FLASH RESULT</div><h3>Flash Test শেষ</h3><div class="stats"><div class="stat"><div class="n">${accuracy}%</div><div class="l">Accuracy</div></div><div class="stat"><div class="n">${correct}</div><div class="l">Correct</div></div><div class="stat"><div class="n">${f.questions.length - correct}</div><div class="l">Wrong/Skipped</div></div></div><p class="muted">এই result save করা হয়নি এবং Course progress বা Question Bank-এ যোগ হয়নি।</p><div class="native-course-flash-actions"><button class="btn" type="button" onclick="SourceCourse.startFlash()">New Temporary Flash Test</button><button class="btn secondary" type="button" onclick="SourceCourse.exitFlash()">Back to Course MCQ</button></div></section>`;
  }

  window.renderSourceCourseTool = render;
})();
