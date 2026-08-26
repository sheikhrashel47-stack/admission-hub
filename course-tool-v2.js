(() => {
  'use strict';
  const MANIFEST = [{
    id: 'somas-visual-admission',
    category: 'bangla',
    language: 'বাংলা',
    title: 'সমাস — Visual Admission Master Guide',
    subtitle: 'বাংলা ২য় পত্র · সম্পূর্ণ অধ্যায়',
    icon: 'বাংলা',
    sourcePages: 102,
    lessons: 14,
    mcqs: 100,
    description: 'PDF-এর প্রতিটি original page source-locked Exact View-তে সংরক্ষিত।'
  }];
  const state = {
    category: 'all',
    mcq: Object.create(null),
    lessonMode: 'visual',
    dataPromise: null,
    dataLoaded: false
  };
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const path = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const query = () => new URLSearchParams(String(location.hash).split('?')[1] || '');
  const coursePath = () => {
    const p = path();
    const lesson = p.match(/^pdf-courses(?:\/([^/]+))?(?:\/lesson\/([^/]+))?(?:\/slide\/(\d+))?$/);
    if (lesson) return {id: lesson[1], lessonId: lesson[2], slide: lesson[3], mode: lesson[1] ? 'course' : 'library'};
    const exam = p.match(/^pdf-courses\/([^/]+)\/(exam|result)$/);
    return exam ? {id: exam[1], mode: exam[2]} : null;
  };
  const courseById = id => (window.__admissionCoursePacks || []).find(c => c && c.id === id) || null;
  const manifestById = id => MANIFEST.find(c => c.id === id) || null;
  const allManifest = () => MANIFEST.slice();
  const notify = message => { if (typeof window.toast === 'function') window.toast(message); else if (typeof window.notify === 'function') window.notify(message); };
  const saveJson = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) {} };
  const readJson = (key, fallback) => { try { const x = JSON.parse(localStorage.getItem(key) || 'null'); return x ?? fallback; } catch (_) { return fallback; } };
  const packKey = id => `admission-course-v2-${id}`;
  const pageUrl = (course, page) => {
    const template = course?.source?.pagePath || './course-assets/somas/pages/p{page:03d}.webp';
    return template.replace('{page:03d}', String(page).padStart(3, '0'));
  };
  const sourcePageLink = (course, page) => `${course?.source?.pdfPath || './course-assets/somas/somas-master-guide.pdf'}#page=${page}`;
  const courseProgress = course => {
    const saved = readJson(`${packKey(course.id)}-progress`, {});
    return saved && typeof saved === 'object' ? saved : {};
  };
  const saveProgress = (course, patch) => saveJson(`${packKey(course.id)}-progress`, {...courseProgress(course), ...patch, updatedAt: Date.now()});
  const ensurePack = () => {
    if (state.dataLoaded) return Promise.resolve(true);
    if (state.dataPromise) return state.dataPromise;
    state.dataPromise = new Promise((resolve, reject) => {
      if (courseById(MANIFEST[0].id)) { state.dataLoaded = true; resolve(true); return; }
      const script = document.createElement('script');
      script.src = './course-somas-data.js?v=somas-source-locked-v2';
      script.dataset.admissionCoursePack = 'somas-visual-admission';
      script.onload = () => { state.dataLoaded = !!courseById(MANIFEST[0].id); state.dataLoaded ? resolve(true) : reject(new Error('Course pack did not register')); };
      script.onerror = () => reject(new Error('Course source pack could not load'));
      document.head.appendChild(script);
    });
    return state.dataPromise;
  };
  const shell = (inner, opts = {}) => {
    if (typeof window.renderShell === 'function') return window.renderShell(inner, opts);
    const app = document.getElementById('app');
    if (app) app.innerHTML = `<main class="course-v2-fallback">${inner}</main>`;
  };
  const loading = message => `<section class="course-v2-loading" role="status"><div class="course-v2-loader-mark">✦</div><strong>${esc(message || 'Preparing your course…')}</strong><span>Source-locked content is loading safely.</span></section>`;
  const overviewCard = (course, index) => {
    const m = manifestById(course.id) || course;
    const progress = courseProgress(course);
    const percent = Math.round(Number(progress.percent || 0));
    return `<article class="course-v2-card">
      <div class="course-v2-card-orb">${esc(m.icon || '📘')}</div>
      <div class="course-v2-card-body"><span class="course-v2-kicker">${esc(String(m.category || 'bangla').toUpperCase())} · SOURCE LOCKED</span><h2>${esc(m.title)}</h2><p>${esc(m.subtitle || m.description || '')}</p><div class="course-v2-stats"><span>${m.lessons || 0} Lessons</span><span>${m.sourcePages || m.source?.pages || 0} PDF pages</span><span>${m.mcqs || m.stats?.mcqs || 0} MCQ</span></div><div class="course-v2-progress"><i style="width:${Math.min(100, Math.max(0, percent))}%"></i></div><small>${percent}% complete</small></div>
      <button class="btn course-v2-open" type="button" onclick="navigate('pdf-courses/${esc(course.id)}')">Open Course <span>→</span></button>
    </article>`;
  };
  const renderLibrary = () => {
    const categories = [{id:'all', label:'All Courses'}, {id:'bangla', label:'বাংলা Courses'}, {id:'english', label:'English Courses'}];
    const visible = allManifest().filter(c => state.category === 'all' || c.category === state.category);
    const banglaCount = allManifest().filter(c => c.category === 'bangla').length;
    const englishCount = allManifest().filter(c => c.category === 'english').length;
    return shell(`<main class="course-v2-page course-v2-library">
      <header class="course-v2-hero"><div><span class="course-v2-kicker">ADMISSION HUB · SOURCE-LOCKED LEARNING</span><h1>Visual Courses</h1><p>PDF-এর exact source, premium visual reading এবং Question Bank-style practice এক জায়গায়।</p></div><div class="course-v2-hero-mark">✦</div></header>
      <nav class="course-v2-tabs" aria-label="Course categories">${categories.map(c => `<button type="button" class="${state.category === c.id ? 'active' : ''}" onclick="window.CourseToolV2.filter('${c.id}')">${esc(c.label)} <b>${c.id === 'bangla' ? banglaCount : c.id === 'english' ? englishCount : allManifest().length}</b></button>`).join('')}</nav>
      <section class="course-v2-source-note"><strong>Lossless rule</strong><span>Original PDF page-ই authority। Visual view কোনো verified source block silently বাদ দেয় না।</span></section>
      <section class="course-v2-grid">${visible.length ? visible.map(overviewCard).join('') : `<div class="course-v2-empty"><strong>${state.category === 'english' ? 'English Courses' : 'No courses in this category yet'}</strong><span>নতুন source pack যোগ হলে এই category-তে দেখাবে।</span></div>`}</section>
    </main>`, {title:'Visual Courses', back:"navigate('dashboard')"});
  };
  const lessonList = course => (course.lessons || []).map((lesson, i) => {
    const progress = courseProgress(course);
    const done = Array.isArray(progress.lessons) && progress.lessons.includes(lesson.id);
    return `<button type="button" class="course-v2-lesson-row ${done ? 'done' : ''}" onclick="navigate('pdf-courses/${esc(course.id)}/lesson/${esc(lesson.id)}/slide/0')"><span class="course-v2-lesson-number">${done ? '✓' : String(i + 1).padStart(2, '0')}</span><span><strong>${esc(lesson.title)}</strong><small>Source pages ${lesson.startPage}–${lesson.endPage}</small></span><b>→</b></button>`;
  }).join('');
  const renderOverview = course => shell(`<main class="course-v2-page course-v2-overview">
    <header class="course-v2-detail-hero"><div><span class="course-v2-kicker">${esc(course.language || 'বাংলা')} · ${esc(course.category || 'bangla')} · ORIGINAL PDF</span><h1>${esc(course.title)}</h1><p>${esc(course.subtitle || '')}</p></div><div class="course-v2-detail-stat"><strong>${course.source?.pages || course.stats?.pages || 0}</strong><span>source pages</span></div></header>
    <section class="course-v2-action-grid"><button class="course-v2-primary-action" type="button" onclick="navigate('pdf-courses/${esc(course.id)}/lesson/${esc(course.lessons?.[0]?.id || '')}/slide/0')"><span>▶</span><strong>Start Visual Study</strong><small>Verified source pages in sequence</small></button><button class="course-v2-secondary-action" type="button" onclick="navigate('pdf-courses/${esc(course.id)}/exam')"><span>?</span><strong>Exam Zone</strong><small>${course.mcqs?.length || course.stats?.mcqs || 0} Question Bank-style MCQ</small></button></section>
    <section class="course-v2-overview-box"><div class="course-v2-section-heading"><span>COURSE MAP</span><strong>Source sequence</strong></div><div class="course-v2-lesson-list">${lessonList(course)}</div></section>
    <section class="course-v2-integrity-grid"><div><b>Exact View</b><span>Every original page stays reachable.</span></div><div><b>Visual View</b><span>Readable source page cards, no squeezed text.</span></div><div><b>Practice View</b><span>Question Bank interaction without data mixing.</span></div></section>
  </main>`, {title:course.title, back:"navigate('pdf-courses')"});
  const currentPageFor = (course, lesson, raw) => {
    const p = Number(raw || 0);
    return Math.min(Math.max(0, p), Math.max(0, (lesson.endPage - lesson.startPage)));
  };
  const renderLesson = (course, lesson, rawSlide) => {
    const offset = currentPageFor(course, lesson, rawSlide);
    const page = lesson.startPage + offset;
    const total = Math.max(1, lesson.endPage - lesson.startPage + 1);
    const progress = courseProgress(course);
    saveProgress(course, {lastLesson: lesson.id, lastPage: page, percent: Math.round(((page - 1) / Math.max(1, course.source.pages)) * 100)});
    const prev = offset > 0 ? `navigate('pdf-courses/${esc(course.id)}/lesson/${esc(lesson.id)}/slide/${offset - 1}')` : `navigate('pdf-courses/${esc(course.id)}')`;
    const next = offset < total - 1 ? `navigate('pdf-courses/${esc(course.id)}/lesson/${esc(lesson.id)}/slide/${offset + 1}')` : `window.CourseToolV2.markLessonDone('${esc(course.id)}','${esc(lesson.id)}');navigate('pdf-courses/${esc(course.id)}')`;
    const compare = query().get('compare') === '1';
    const visualPage = `<div class="course-v2-source-page"><div class="course-v2-source-page-bar"><span>VISUAL SOURCE PAGE · ${page}</span><span>NO CONTENT REMOVED</span></div><img src="${esc(pageUrl(course, page))}" alt="${esc(course.title)} original PDF page ${page}" decoding="async"><footer><span>এই page-এর অক্ষর, table, diagram ও layout original source থেকে সরাসরি রাখা হয়েছে।</span><a href="${esc(sourcePageLink(course, page))}" target="_blank" rel="noopener">Open exact page ↗</a></footer></div>`;
    const readerPage = compare ? `<div class="course-v2-compare-grid"><section>${visualPage}</section><section class="course-v2-pdf-panel"><div class="course-v2-source-page-bar"><span>EXACT PDF REFERENCE · ${page}</span><a href="${esc(sourcePageLink(course, page))}" target="_blank" rel="noopener">Open PDF ↗</a></div><iframe title="${esc(course.title)} exact PDF page ${page}" src="${esc(sourcePageLink(course, page))}"></iframe></section></div>` : visualPage;
    const compareHref = `pdf-courses/${esc(course.id)}/lesson/${esc(lesson.id)}/slide/${offset}?compare=1`;
    return shell(`<main class="course-v2-page course-v2-reader">
      <div class="course-v2-reader-head"><div><span class="course-v2-kicker">${esc(course.language || 'বাংলা')} · SOURCE PAGE ${page}/${course.source.pages}</span><h1>${esc(lesson.title)}</h1><p>${compare ? 'Compare View · visual source + exact PDF reference' : 'Visual Study View · source page ' + page + ' of ' + course.source.pages}</p></div><div class="course-v2-reader-actions"><button type="button" onclick="window.open('${esc(sourcePageLink(course, page))}','_blank','noopener')">Exact PDF</button><button type="button" onclick="navigate('${compareHref}')">${compare ? 'Visual View' : 'Compare'}</button><button type="button" onclick="navigate('pdf-courses/${esc(course.id)}')">Course Map</button></div></div>
      <div class="course-v2-page-progress"><i style="width:${Math.round((offset + 1) / total * 100)}%"></i></div>
      ${readerPage}
      <div class="course-v2-reader-nav"><button class="btn secondary" type="button" onclick="${prev}">← Previous</button><span>Page ${offset + 1} / ${total}</span><button class="btn" type="button" onclick="${next}">${offset === total - 1 ? 'Finish Lesson' : 'Next Page →'}</button></div>
    </main>`, {title:lesson.title, back:`navigate('pdf-courses/${esc(course.id)}')`});
  };
  const mcqState = course => {
    if (!state.mcq[course.id]) {
      const saved = courseProgress(course);
      state.mcq[course.id] = {index: Number(saved.examIndex || 0), answers: saved.examAnswers && typeof saved.examAnswers === 'object' ? saved.examAnswers : Object.create(null), revealed: Object.create(null), startedAt: Date.now(), finished: false};
    }
    return state.mcq[course.id];
  };
  const bookmarks = course => readJson(`${packKey(course.id)}-bookmarks`, []);
  const notes = course => readJson(`${packKey(course.id)}-notes`, {});
  const renderExam = course => {
    const qs = Array.isArray(course.mcqs) ? course.mcqs : [];
    const s = mcqState(course);
    if (!qs.length) return shell(loading('Preparing your exam…'), {title:'Exam Zone', back:`navigate('pdf-courses/${esc(course.id)}')`});
    const q = qs[Math.min(s.index, qs.length - 1)];
    const selected = s.answers[q.id];
    const revealed = !!s.revealed[q.id] || selected !== undefined;
    const isCorrect = selected !== undefined && Number(selected) === Number(q.answer);
    const savedBookmarks = bookmarks(course);
    const opts = (q.options || []).map((option, i) => {
      const chosen = selected !== undefined && Number(selected) === i;
      const correct = revealed && Number(q.answer) === i;
      const wrong = chosen && !correct;
      return `<button type="button" class="course-v2-option ${chosen ? 'chosen' : ''} ${correct ? 'correct' : ''} ${wrong ? 'wrong' : ''}" onclick="window.CourseToolV2.answer('${esc(course.id)}','${esc(q.id)}',${i})" ${selected !== undefined ? 'disabled' : ''}><span>${String.fromCharCode(65 + i)}</span><b>${esc(option)}</b>${correct ? '<em>✓</em>' : wrong ? '<em>✕</em>' : ''}</button>`;
    }).join('');
    const explanation = revealed ? `<section class="course-v2-explanation ${isCorrect ? 'correct' : selected !== undefined ? 'wrong' : ''}"><strong>${isCorrect ? '✓ Correct Answer' : selected !== undefined ? '✕ Wrong Answer' : 'Answer Revealed'}</strong><p><b>Correct:</b> ${esc(q.options?.[q.answer] || '')}</p><p>${esc(q.explanation || '')}</p><small>Source: PDF page ${q.sourcePage || '—'}</small></section>` : '';
    const note = notes(course)[q.id] || '';
    const finished = s.finished;
    return shell(`<main class="course-v2-page course-v2-exam"><header class="course-v2-exam-head"><div><span class="course-v2-kicker">QUESTION BANK STYLE · ${esc(q.family || 'SOURCE MCQ')}</span><h1>Course Exam Zone</h1><p>Question ${String(s.index + 1).padStart(2, '0')} of ${qs.length} · ${q.sourcePage ? `PDF page ${q.sourcePage}` : 'source linked'}</p></div><button class="course-v2-exit" type="button" onclick="window.CourseToolV2.exitExam('${esc(course.id)}')">Exit Exam</button></header><div class="course-v2-exam-progress"><i style="width:${Math.round((s.index + 1) / qs.length * 100)}%"></i></div><article class="course-v2-mcq-card"><div class="course-v2-mcq-meta"><span>Q ${String(q.number || s.index + 1).padStart(2, '0')}</span><span>${esc(q.family || 'Course MCQ')}</span><span class="course-v2-mcq-status">${selected === undefined ? 'Unanswered' : isCorrect ? 'Correct' : 'Wrong'}</span></div><h2>${esc(q.question)}</h2><div class="course-v2-options">${opts}</div>${explanation}<footer class="course-v2-mcq-footer"><span>Answered <b>${Object.keys(s.answers).length}/${qs.length}</b></span><button type="button" class="${savedBookmarks.includes(q.id) ? 'active' : ''}" onclick="window.CourseToolV2.bookmark('${esc(course.id)}','${esc(q.id)}')">⭐ ${savedBookmarks.includes(q.id) ? 'Bookmarked' : 'Bookmark'}</button><button type="button" onclick="window.CourseToolV2.note('${esc(course.id)}','${esc(q.id)}')">📝 Note</button><button type="button" onclick="window.CourseToolV2.reveal('${esc(course.id)}','${esc(q.id)}')">Show Answer</button></footer>${note ? `<div class="course-v2-note">📝 ${esc(note)}</div>` : ''}</article><div class="course-v2-exam-nav"><button class="btn secondary" type="button" onclick="window.CourseToolV2.prev('${esc(course.id)}')" ${s.index === 0 ? 'disabled' : ''}>← Previous</button><span>${Math.round(Object.keys(s.answers).length / qs.length * 100)}% answered</span><button class="btn" type="button" onclick="window.CourseToolV2.next('${esc(course.id)}')">${s.index === qs.length - 1 ? 'Finish & See Result' : 'Next →'}</button></div>${finished ? `<section class="course-v2-result-card"><strong>Exam session complete</strong><span>${Object.values(s.answers).filter((a, i) => Number(a) === Number(qs[i]?.answer)).length}/${qs.length} correct in this temporary Course session.</span><button class="btn" type="button" onclick="window.CourseToolV2.result('${esc(course.id)}')">Open Result Sheet</button></section>` : ''}</main>`, {title:'Exam Zone', back:`navigate('pdf-courses/${esc(course.id)}')`});
  };
  const renderResult = course => {
    const s = mcqState(course), qs = course.mcqs || [];
    const correct = qs.reduce((n, q) => n + (Number(s.answers[q.id]) === Number(q.answer) ? 1 : 0), 0);
    const answered = Object.keys(s.answers).length;
    const accuracy = answered ? Math.round(correct / answered * 100) : 0;
    return shell(`<main class="course-v2-page course-v2-result"><header class="course-v2-result-hero"><span class="course-v2-kicker">TEMPORARY COURSE RESULT</span><h1>Exam Result</h1><p>এই result Course session-এর জন্য; main Question Bank বা global History-তে automatically save হয়নি।</p><div class="course-v2-result-score"><strong>${accuracy}%</strong><span>Accuracy</span></div></header><section class="course-v2-result-grid"><div><b>${correct}</b><span>Correct</span></div><div><b>${Math.max(0, answered - correct)}</b><span>Wrong</span></div><div><b>${qs.length - answered}</b><span>Skipped</span></div><div><b>${answered}</b><span>Answered</span></div></section><div class="course-v2-result-actions"><button class="btn" type="button" onclick="window.CourseToolV2.restart('${esc(course.id)}')">Retake Exam</button><button class="btn secondary" type="button" onclick="navigate('pdf-courses/${esc(course.id)}')">Back to Course</button></div></main>`, {title:'Exam Result', back:`navigate('pdf-courses/${esc(course.id)}')`});
  };
  const routeRender = () => {
    const match = coursePath();
    if (!match) return false;
    const id = match.id;
    if (!id) { renderLibrary(); return true; }
    const course = courseById(id);
    if (!course) {
      renderLibrary();
      ensurePack().then(() => routeRender()).catch(() => notify('Course source pack could not load.'));
      return true;
    }
    if (match.mode === 'exam') { renderExam(course); return true; }
    if (match.mode === 'result') { renderResult(course); return true; }
    if (match.lessonId) {
      const lesson = (course.lessons || []).find(x => x.id === match.lessonId);
      if (lesson) { renderLesson(course, lesson, match.slide); return true; }
    }
    renderOverview(course); return true;
  };
  const originalRender = window.render;
  window.render = function courseAwareRender(...args) {
    if (path() === 'pdf-courses' || path().startsWith('pdf-courses/')) {
      if (routeRender()) return;
    }
    return typeof originalRender === 'function' ? originalRender.apply(this, args) : undefined;
  };
  window.CourseToolV2 = {
    filter(category) { state.category = category; routeRender(); },
    answer(courseId, qid, option) { const c = courseById(courseId); if (!c) return; const s = mcqState(c); if (s.answers[qid] !== undefined) return; s.answers[qid] = option; saveProgress(c, {examIndex: s.index, examAnswers: s.answers}); routeRender(); },
    reveal(courseId, qid) { const c = courseById(courseId); if (!c) return; mcqState(c).revealed[qid] = true; routeRender(); },
    bookmark(courseId, qid) { const c = courseById(courseId); if (!c) return; const list = bookmarks(c); const next = list.includes(qid) ? list.filter(x => x !== qid) : list.concat(qid); saveJson(`${packKey(c.id)}-bookmarks`, next); routeRender(); },
    note(courseId, qid) { const c = courseById(courseId); if (!c) return; const current = notes(c)[qid] || ''; const value = window.prompt('এই MCQ-এর personal note লিখুন', current); if (value !== null) { const n = notes(c); n[qid] = value.trim(); saveJson(`${packKey(c.id)}-notes`, n); routeRender(); } },
    prev(courseId) { const c = courseById(courseId); if (!c) return; const s = mcqState(c); s.index = Math.max(0, s.index - 1); saveProgress(c, {examIndex: s.index, examAnswers: s.answers}); routeRender(); },
    next(courseId) { const c = courseById(courseId); if (!c) return; const s = mcqState(c); if (s.index >= (c.mcqs || []).length - 1) { s.finished = true; saveProgress(c, {examIndex: s.index, examAnswers: s.answers}); navigate(`pdf-courses/${courseId}/result`); return; } s.index += 1; saveProgress(c, {examIndex: s.index, examAnswers: s.answers}); routeRender(); },
    exitExam(courseId) { const c = courseById(courseId); if (!c) return; const s = mcqState(c); saveProgress(c, {examIndex: s.index, examAnswers: s.answers}); navigate(`pdf-courses/${courseId}`); },
    restart(courseId) { delete state.mcq[courseId]; saveProgress(courseById(courseId), {examIndex: 0, examAnswers: {}}); navigate(`pdf-courses/${courseId}/exam`); },
    result(courseId) { navigate(`pdf-courses/${courseId}/result`); },
    markLessonDone(courseId, lessonId) { const c = courseById(courseId); if (!c) return; const p = courseProgress(c); const lessons = Array.isArray(p.lessons) ? p.lessons.slice() : []; if (!lessons.includes(lessonId)) lessons.push(lessonId); saveProgress(c, {lessons}); }
  };
  const originalRoute = window.__admissionRenderRoute;
  if (typeof originalRoute === 'function') {
    window.__admissionRenderRoute = function courseAwareRoute(...args) {
      if (path() === 'pdf-courses' || path().startsWith('pdf-courses/')) {
        if (routeRender()) return;
      }
      return originalRoute.apply(this, args);
    };
  }
  document.addEventListener('admission:route-rendered', () => { if (path() === 'pdf-courses' || path().startsWith('pdf-courses/')) routeRender(); });
  const style = document.createElement('style');
  style.textContent = `.course-v2-page{max-width:980px;margin:0 auto;padding:18px 14px 92px;color:#173128}.course-v2-hero,.course-v2-detail-hero{display:flex;justify-content:space-between;gap:18px;align-items:center;padding:24px 20px;border-radius:26px;background:linear-gradient(135deg,#e9f8f0,#f8fffb);border:1px solid #d2eee0;box-shadow:0 12px 30px rgba(15,107,79,.08)}.course-v2-kicker{display:block;color:#087653;font-size:10px;font-weight:900;letter-spacing:.12em}.course-v2-hero h1,.course-v2-detail-hero h1{margin:8px 0 6px;font-size:clamp(26px,5vw,42px);line-height:1.12;color:#103f30}.course-v2-hero p,.course-v2-detail-hero p{margin:0;color:#5c7168;line-height:1.6;font-size:14px}.course-v2-hero-mark,.course-v2-detail-stat{display:grid;place-items:center;min-width:74px;min-height:74px;border-radius:22px;background:#0f6b4f;color:#fff;font-size:36px;box-shadow:0 12px 24px rgba(15,107,79,.2)}.course-v2-detail-stat strong{font-size:26px;line-height:1}.course-v2-detail-stat span{font-size:9px;letter-spacing:.08em;margin-top:3px}.course-v2-tabs{display:flex;gap:8px;overflow:auto;padding:16px 0 10px}.course-v2-tabs button{border:1px solid #d5e9df;background:#fff;border-radius:999px;padding:10px 14px;color:#557066;font-weight:800;white-space:nowrap}.course-v2-tabs button.active{background:#0f6b4f;color:#fff;border-color:#0f6b4f}.course-v2-tabs b{margin-left:4px;font-size:11px}.course-v2-source-note{display:flex;gap:10px;align-items:center;margin:6px 0 16px;padding:12px 14px;border-radius:16px;background:#fff8df;color:#705600;font-size:12px;line-height:1.45}.course-v2-source-note strong{white-space:nowrap}.course-v2-grid{display:grid;gap:14px}.course-v2-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:14px;padding:16px;border:1px solid #dcece5;border-radius:22px;background:#fff;box-shadow:0 10px 24px rgba(15,107,79,.06)}.course-v2-card-orb{display:grid;place-items:center;width:54px;height:54px;border-radius:17px;background:#e6f6ed;color:#0f6b4f;font-weight:900;font-size:15px}.course-v2-card-body h2{margin:4px 0;font-size:18px;color:#173d30}.course-v2-card-body p{margin:0;color:#687b73;font-size:12px;line-height:1.45}.course-v2-stats{display:flex;gap:8px;flex-wrap:wrap;margin:8px 0 5px;color:#4f6c60;font-size:10px}.course-v2-progress,.course-v2-page-progress,.course-v2-exam-progress{height:6px;border-radius:99px;background:#eaf3ee;overflow:hidden}.course-v2-progress i,.course-v2-page-progress i,.course-v2-exam-progress i{display:block;height:100%;border-radius:inherit;background:#19a974}.course-v2-card-body small{color:#7b8b85;font-size:10px}.course-v2-open{min-height:42px;white-space:nowrap}.course-v2-open span{margin-left:6px}.course-v2-empty{padding:35px 18px;text-align:center;border:1px dashed #cddfd6;border-radius:20px;color:#638076;background:#fbfefc}.course-v2-empty strong,.course-v2-empty span{display:block}.course-v2-empty span{margin-top:6px;font-size:12px}.course-v2-action-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:16px 0}.course-v2-primary-action,.course-v2-secondary-action{display:grid;text-align:left;gap:4px;padding:17px;border-radius:20px;cursor:pointer}.course-v2-primary-action{border:0;background:#0f6b4f;color:#fff}.course-v2-secondary-action{border:1px solid #d4e9df;background:#fff;color:#173d30}.course-v2-primary-action span,.course-v2-secondary-action span{font-size:23px}.course-v2-primary-action strong,.course-v2-secondary-action strong{font-size:16px}.course-v2-primary-action small,.course-v2-secondary-action small{font-size:11px;opacity:.8}.course-v2-overview-box{padding:18px;border-radius:22px;background:#fff;border:1px solid #e0eee8}.course-v2-section-heading{display:flex;justify-content:space-between;align-items:end;margin-bottom:10px}.course-v2-section-heading span{font-size:10px;letter-spacing:.12em;color:#17805f;font-weight:900}.course-v2-section-heading strong{font-size:18px;color:#173d30}.course-v2-lesson-list{display:grid;gap:7px}.course-v2-lesson-row{display:grid;grid-template-columns:40px minmax(0,1fr) 20px;align-items:center;gap:10px;padding:11px;border:1px solid #e8f0ec;background:#fbfefc;border-radius:14px;text-align:left;color:#23483a}.course-v2-lesson-row.done{background:#eaf9f0;border-color:#bce2cd}.course-v2-lesson-number{display:grid;place-items:center;width:32px;height:32px;border-radius:11px;background:#e0f2e8;color:#0f6b4f;font-weight:900;font-size:12px}.course-v2-lesson-row strong,.course-v2-lesson-row small{display:block}.course-v2-lesson-row strong{font-size:13px}.course-v2-lesson-row small{margin-top:2px;font-size:10px;color:#769087}.course-v2-lesson-row>b{font-size:20px;color:#0f6b4f}.course-v2-integrity-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:12px}.course-v2-integrity-grid div{padding:13px;border-radius:15px;background:#f5faf7}.course-v2-integrity-grid b,.course-v2-integrity-grid span{display:block}.course-v2-integrity-grid b{font-size:12px;color:#0f6b4f}.course-v2-integrity-grid span{font-size:10px;line-height:1.45;color:#6a7f75;margin-top:3px}.course-v2-reader-head,.course-v2-exam-head{display:flex;justify-content:space-between;align-items:start;gap:12px}.course-v2-reader-head h1,.course-v2-exam-head h1{margin:6px 0 3px;font-size:24px;color:#173d30}.course-v2-reader-head p,.course-v2-exam-head p{margin:0;color:#6c7d76;font-size:12px}.course-v2-reader-actions{display:flex;gap:7px}.course-v2-reader-actions button,.course-v2-exit{border:1px solid #d4e9df;background:#fff;border-radius:12px;padding:9px 10px;color:#0f6b4f;font-weight:800;font-size:11px;white-space:nowrap}.course-v2-page-progress{margin:15px 0}.course-v2-source-page{background:#fff;border:1px solid #d9eae2;border-radius:20px;overflow:hidden;box-shadow:0 14px 30px rgba(15,107,79,.08)}.course-v2-source-page-bar{display:flex;justify-content:space-between;gap:8px;padding:11px 13px;background:#f1faf5;color:#087653;font-size:10px;font-weight:900;letter-spacing:.05em}.course-v2-source-page img{display:block;width:100%;height:auto;background:#faf9f6}.course-v2-source-page footer{display:flex;justify-content:space-between;gap:10px;padding:12px 13px;color:#61776d;font-size:10px;line-height:1.45}.course-v2-source-page footer a{color:#0f6b4f;font-weight:900;white-space:nowrap}.course-v2-compare-grid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:12px;align-items:start}.course-v2-pdf-panel{overflow:hidden;border:1px solid #d9eae2;border-radius:20px;background:#fff;box-shadow:0 14px 30px rgba(15,107,79,.08)}.course-v2-pdf-panel iframe{display:block;width:100%;height:720px;border:0;background:#f8faf9}.course-v2-reader-nav,.course-v2-exam-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:14px}.course-v2-reader-nav>span,.course-v2-exam-nav>span{font-size:11px;color:#6b7e75}.course-v2-exam-head{align-items:center}.course-v2-mcq-card{margin-top:15px;padding:18px;border:1px solid #dbece4;border-radius:22px;background:#fff;box-shadow:0 12px 26px rgba(15,107,79,.06)}.course-v2-mcq-meta{display:flex;align-items:center;gap:8px;flex-wrap:wrap;color:#698076;font-size:10px}.course-v2-mcq-meta>span:first-child{padding:6px 8px;border-radius:8px;background:#e9f7ef;color:#0f6b4f;font-weight:900}.course-v2-mcq-status{margin-left:auto}.course-v2-mcq-card h2{font-size:19px;line-height:1.55;color:#173d30;margin:16px 0}.course-v2-options{display:grid;gap:9px}.course-v2-option{display:grid;grid-template-columns:30px minmax(0,1fr) auto;align-items:center;gap:9px;width:100%;padding:12px;border:1px solid #dcebe4;border-radius:14px;background:#fbfefc;text-align:left;color:#254c3d;cursor:pointer}.course-v2-option>span{display:grid;place-items:center;width:26px;height:26px;border-radius:9px;background:#e7f4ed;color:#0f6b4f;font-weight:900}.course-v2-option b{font-size:13px;line-height:1.45;font-weight:700}.course-v2-option.chosen{border-color:#f2c6c6;background:#fff4f4}.course-v2-option.correct{border-color:#87d3a5;background:#eafaf0;color:#0d6b3d}.course-v2-option.correct>span{background:#14a05e;color:#fff}.course-v2-option.wrong{border-color:#ef9f9f;background:#fff0f0;color:#a32e2e}.course-v2-option.wrong>span{background:#df5353;color:#fff}.course-v2-option em{font-style:normal;font-weight:900;font-size:18px}.course-v2-explanation{margin-top:14px;padding:13px;border-radius:15px;background:#f3faf6;border-left:4px solid #18a66d;color:#385d4c;font-size:12px;line-height:1.55}.course-v2-explanation.wrong{background:#fff4f4;border-left-color:#e05252;color:#7d3b3b}.course-v2-explanation strong,.course-v2-explanation p{display:block;margin:0}.course-v2-explanation p{margin-top:5px}.course-v2-explanation small{display:block;margin-top:7px;color:#788a82}.course-v2-mcq-footer{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:14px;padding-top:12px;border-top:1px solid #edf2ef;color:#718179;font-size:10px}.course-v2-mcq-footer span{margin-right:auto}.course-v2-mcq-footer button{border:0;background:transparent;color:#0f6b4f;font-weight:800;font-size:10px;cursor:pointer}.course-v2-mcq-footer button.active{color:#c78200}.course-v2-note{margin-top:10px;padding:10px;border-radius:12px;background:#fff9e6;color:#78601c;font-size:11px}.course-v2-result-card,.course-v2-result-actions{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin-top:16px}.course-v2-result-card{padding:15px;background:#effaf3;border-radius:18px;color:#2c5d47;font-size:12px}.course-v2-result-card strong{display:block}.course-v2-result-hero{text-align:center;padding:30px 20px;border-radius:26px;background:linear-gradient(140deg,#e9f8f0,#f7fffb);border:1px solid #d4eee2}.course-v2-result-hero h1{margin:7px 0;font-size:32px;color:#103f30}.course-v2-result-hero p{max-width:560px;margin:0 auto;color:#60766c;font-size:12px;line-height:1.55}.course-v2-result-score{display:grid;place-items:center;width:112px;height:112px;margin:18px auto 0;border-radius:50%;background:#0f6b4f;color:#fff;box-shadow:0 0 0 10px #d9f1e3}.course-v2-result-score strong{font-size:30px}.course-v2-result-score span{font-size:10px}.course-v2-result-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:18px}.course-v2-result-grid div{padding:14px 8px;text-align:center;border-radius:15px;background:#fff;border:1px solid #e0eee8}.course-v2-result-grid b,.course-v2-result-grid span{display:block}.course-v2-result-grid b{font-size:23px;color:#0f6b4f}.course-v2-result-grid span{font-size:10px;color:#718279}.course-v2-loading{display:grid;place-items:center;gap:8px;min-height:55vh;padding:30px;text-align:center;color:#173d30}.course-v2-loader-mark{display:grid;place-items:center;width:52px;height:52px;border-radius:17px;background:#0f6b4f;color:#fff;font-size:26px}.course-v2-loading span{font-size:11px;color:#718179}@media(max-width:680px){.course-v2-card{grid-template-columns:auto minmax(0,1fr)}.course-v2-open{grid-column:1/-1;width:100%}.course-v2-action-grid,.course-v2-integrity-grid,.course-v2-result-grid{grid-template-columns:1fr 1fr}.course-v2-integrity-grid div:last-child{grid-column:1/-1}.course-v2-reader-head,.course-v2-exam-head{display:block}.course-v2-reader-actions{margin-top:10px}.course-v2-reader-actions button{flex:1}.course-v2-source-page footer{display:block}.course-v2-source-page footer a{display:block;margin-top:7px}.course-v2-compare-grid{grid-template-columns:1fr}.course-v2-pdf-panel iframe{height:480px}.course-v2-mcq-card h2{font-size:17px}.course-v2-result-grid div:nth-child(3),.course-v2-result-grid div:nth-child(4){display:none}}`;
  document.head.appendChild(style);
  window.renderCourseToolV2 = routeRender;
})();
