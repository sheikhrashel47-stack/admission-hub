(() => {
  'use strict';

  // Performance-only layer: preserve qbank-redesign markup/classes and behavior while
  // replacing whole-feed answer renders with a stable, windowed item boundary.
  const legacyRenderQuestionBankV2 = window.renderQuestionBankV2;
  const practice = window.QuestionBankPracticeSession || { topicId: '', answers: {}, revealed: {}, recent: [], query: '', visibleCount: 100 };
  window.QuestionBankPracticeSession = practice;
  const scrollKey = 'admission_qbank_scroll_v1';
  const topicCache = new Map();
  const scrollState = (() => {
    try { return JSON.parse(sessionStorage.getItem(scrollKey) || '{}') || {}; } catch (_) { return {}; }
  })();
  const perf = {
    root: null,
    host: null,
    topicId: '',
    ids: [],
    filteredIds: [],
    displayIds: [],
    positionById: new Map(),
    heights: new Map(),
    offsets: [],
    metricsSignature: '',
    renderedStart: -1,
    renderedEnd: -1,
    velocity: 0,
    lastScrollTop: 0,
    lastScrollTime: 0,
    frame: 0,
    measureFrame: 0,
    restoring: false,
    listenersAttached: false,
    anchor: null,
  };

  const esc = value => {
    const d = document.createElement('div');
    d.textContent = String(value ?? '');
    return d.innerHTML;
  };
  const answerIndex = q => Number(q?.answerIndex ?? q?.answer ?? 0);
  const subjectName = id => (typeof window.subjectName === 'function' ? window.subjectName(id) : (CACHE.subjects || []).find(x => x.id === id)?.name || '');
  const topicName = id => (typeof window.topicName === 'function' ? window.topicName(id) : (CACHE.topics || []).find(x => x.id === id)?.name || '');
  const host = () => {
    const candidates = [document.body, document.getElementById('app'), document.scrollingElement].filter(Boolean);
    return candidates.find(el => el.scrollHeight > el.clientHeight + 2 && getComputedStyle(el).overflowY !== 'hidden') || document.body;
  };
  const qById = id => (CACHE.questions || []).find(q => q.id === id);
  const sessionAnswer = id => practice.answers?.[id];
  const currentTopic = () => CACHE.topics?.find(t => t.id === ExplorerState.topicId);
  const currentSubject = topic => CACHE.subjects?.find(s => s.id === topic?.subjectId);

  function explicitNumber(q) {
    const fields = [q?.questionNumber, q?.number];
    for (const value of fields) {
      if (typeof value === 'number' && Number.isFinite(value)) return value;
      if (typeof value === 'string' && /^\s*\d+(?:\.\d+)?\s*$/.test(value)) return Number(value);
    }
    const source = String(q?.sourceQuestionId || q?.id || '');
    if (!/^(?:mcq|q|question)[-_]/i.test(source)) return null;
    const match = source.match(/(?:^|[-_])0*(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  function topicSignature(rows) {
    return rows.map(q => `${q.id}:${q.topicId}:${q.updatedAt || q.createdAt || 0}:${q.questionNumber ?? ''}:${q.number ?? ''}`).join('|');
  }

  function topicModel(topicId) {
    const rows = (CACHE.questions || []).filter(q => q.topicId === topicId);
    const signature = topicSignature(rows);
    const cached = topicCache.get(topicId);
    if (cached?.signature === signature) return cached;
    const ordered = rows.map((q, sourceIndex) => ({ q, sourceIndex })).sort((a, b) => {
      const an = explicitNumber(a.q), bn = explicitNumber(b.q);
      if (an !== null && bn !== null && an !== bn) return an - bn;
      if (an !== null && bn === null) return -1;
      if (an === null && bn !== null) return 1;
      return a.sourceIndex - b.sourceIndex;
    });
    const model = {
      signature,
      ids: ordered.map(x => x.q.id),
      byId: new Map(ordered.map(x => [x.q.id, x.q])),
    };
    topicCache.set(topicId, model);
    return model;
  }

  function saveScrollState() {
    if (!perf.topicId || !perf.host) return;
    const anchor = visibleAnchor();
    scrollState[perf.topicId] = {
      scrollOffset: perf.host.scrollTop || 0,
      anchorQuestionId: anchor?.id || '',
      anchorOffset: anchor?.offset || 0,
      timestamp: Date.now(),
    };
    try { sessionStorage.setItem(scrollKey, JSON.stringify(scrollState)); } catch (_) { /* storage is optional */ }
  }

  function visibleAnchor() {
    if (!perf.root || !perf.host) return null;
    const hostRect = perf.host.getBoundingClientRect();
    const cards = [...perf.root.querySelectorAll('[data-question-id]')];
    const candidate = cards.find(card => card.getBoundingClientRect().bottom >= hostRect.top + 8) || cards[0];
    if (!candidate) return null;
    return { id: candidate.dataset.questionId, offset: candidate.getBoundingClientRect().top - hostRect.top };
  }

  function restoreAnchor(anchor, fallbackScroll) {
    if (!perf.host) return;
    const target = anchor?.id ? perf.root?.querySelector(`[data-question-id="${CSS.escape(anchor.id)}"]`) : null;
    if (target) {
      const hostRect = perf.host.getBoundingClientRect();
      perf.host.scrollTop += target.getBoundingClientRect().top - hostRect.top - Number(anchor.offset || 0);
    } else if (Number.isFinite(fallbackScroll)) {
      perf.host.scrollTop = Math.max(0, fallbackScroll);
    }
  }

  function captureAnchor() { perf.anchor = visibleAnchor(); }

  function buildMetrics(ids) {
    const signature = `${ids.join('|')}|${[...perf.heights].map(([id, h]) => `${id}:${h}`).join('|')}`;
    if (perf.metricsSignature === signature && perf.offsets.length === ids.length + 1) return;
    perf.metricsSignature = signature;
    perf.offsets = new Array(ids.length + 1);
    perf.offsets[0] = 0;
    for (let i = 0; i < ids.length; i += 1) {
      perf.offsets[i + 1] = perf.offsets[i] + (perf.heights.get(ids[i]) || 410);
    }
  }

  function upperBound(values, target) {
    let lo = 0, hi = values.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (values[mid] <= target) lo = mid + 1; else hi = mid;
    }
    return Math.max(0, lo - 1);
  }

  function listWindow() {
    const ids = perf.displayIds;
    buildMetrics(ids);
    const scrollTop = perf.host?.scrollTop || 0;
    const viewport = perf.host?.clientHeight || window.innerHeight || 800;
    const fast = Math.abs(perf.velocity) > 1.2;
    const overscan = fast ? viewport * 2.6 : viewport * 0.9;
    const start = Math.max(0, upperBound(perf.offsets, Math.max(0, scrollTop - overscan)) - 1);
    const end = Math.min(ids.length, upperBound(perf.offsets, scrollTop + viewport + overscan) + 2);
    return { start, end, top: perf.offsets[start] || 0, bottom: Math.max(0, (perf.offsets[ids.length] || 0) - (perf.offsets[end] || 0)) };
  }

  function answeredIds(ids) { return ids.filter(id => sessionAnswer(id)); }
  function accuracy(ids) {
    const answered = answeredIds(ids);
    return answered.length ? Math.round(answered.filter(id => sessionAnswer(id).correct).length / answered.length * 100) : 0;
  }
  function mistakes(ids) { return answeredIds(ids).filter(id => !sessionAnswer(id).correct).length; }

  function filteredIds(topicId) {
    const model = topicModel(topicId);
    let ids = model.ids.slice();
    const query = String(practice.query || '').trim().toLocaleLowerCase();
    if (query) ids = ids.filter(id => {
      const q = model.byId.get(id);
      return [q?.question, ...(Array.isArray(q?.options) ? q.options : [])].join(' ').toLocaleLowerCase().includes(query);
    });
    const filter = ExplorerState.status || 'all';
    if (filter === 'unattempted') ids = ids.filter(id => !sessionAnswer(id));
    else if (filter === 'mistakes') ids = ids.filter(id => sessionAnswer(id) && !sessionAnswer(id).correct);
    else if (filter === 'bookmarked') ids = ids.filter(id => model.byId.get(id)?.bookmarked === true);
    else if (filter === 'recent') ids = practice.recent.map(id => id).filter(id => model.byId.has(id));
    return ids;
  }

  function qCard(q, index, topic, subject) {
    const state = sessionAnswer(q.id);
    const revealed = practice.revealed?.[q.id] || state;
    const correct = answerIndex(q);
    const status = state ? (state.correct ? 'Correct' : 'Wrong') : 'Unattempted';
    const statusClass = state ? (state.correct ? 'correct' : 'wrong') : 'unattempted';
    const opts = (q.options || []).map((o, j) => {
      let cls = '';
      if (state) { if (j === correct) cls = 'correct'; else if (j === state.selected) cls = 'wrong'; }
      else if (revealed && j === correct) cls = 'correct';
      return `<button class="q-opt-v2 ${cls}" type="button" ${state ? 'disabled' : ''} aria-label="Option ${String.fromCharCode(65 + j)}" onclick="qPerfSelect('${esc(q.id)}',${j})"><span class="q-opt-letter">${String.fromCharCode(65 + j)}</span><span class="q-opt-text">${esc(o)}</span>${cls === 'correct' && (state || revealed) ? '<span class="q-opt-icon">✓</span>' : ''}${cls === 'wrong' ? '<span class="q-opt-icon">✕</span>' : ''}</button>`;
    }).join('');
    return `<article class="q-card-v2 card" data-question-id="${esc(q.id)}"><div class="q-card-header"><div class="q-card-meta"><span class="q-card-num">Q ${String(index + 1).padStart(2, '0')}</span><span class="q-breadcrumb">${esc(subject?.name || '')} • ${esc(topic.name)}</span></div><span class="q-status ${statusClass}">${status}</span></div><div class="q-text-v2">${esc(q.question)}</div><div class="q-options-v2">${opts}</div>${revealed ? `<div class="q-explanation-v2 ${state?.correct ? 'correct' : state ? 'wrong' : 'revealed'}"><strong>${state ? (state.correct ? '✓ Correct' : '✕ Wrong') : 'Answer revealed'}</strong><p>Correct answer: ${esc((q.options || [])[correct] || '')}</p>${q.explanation ? `<p>${esc(q.explanation)}</p>` : ''}</div>` : ''}<footer class="q-card-footer"><span data-q-accuracy>Accuracy <strong>${accuracy(topicModel(topic.id).ids)}%</strong></span><span data-q-mistakes>Mistakes <strong>${mistakes(topicModel(topic.id).ids)}</strong></span><button class="q-footer-btn ${q.bookmarked ? 'active' : ''}" type="button" aria-pressed="${!!q.bookmarked}" onclick="qPerfBookmark('${esc(q.id)}')">⭐ ${q.bookmarked ? 'Bookmarked' : 'Bookmark'}</button>${!revealed ? `<button class="q-footer-btn" type="button" onclick="qPerfReveal('${esc(q.id)}')">Show Answer</button>` : ''}<button class="q-footer-btn" type="button" onclick="ahEditQuestion('${esc(q.id)}')">Edit</button><button class="q-footer-btn danger" type="button" onclick="ahDuplicateQuestion('${esc(q.id)}')">Duplicate</button><button class="q-footer-btn danger" type="button" onclick="ahDeleteQuestion('${esc(q.id)}')">Delete</button></footer></article>`;
  }

  function updateSummary() {
    if (!perf.root) return;
    const all = topicModel(perf.topicId).ids;
    const filtered = perf.filteredIds;
    const shown = filtered.length;
    const summary = perf.root.querySelector('[data-q-summary]');
    if (summary) summary.textContent = `${filtered.length} question${filtered.length === 1 ? '' : 's'}`;
    const answered = answeredIds(all).length;
    const answeredNode = perf.root.querySelector('[data-q-answered]');
    if (answeredNode) answeredNode.textContent = `${answered}/${all.length} answered`;
    const counts = {
      all: all.length,
      unattempted: all.filter(id => !sessionAnswer(id)).length,
      mistakes: all.filter(id => sessionAnswer(id) && !sessionAnswer(id).correct).length,
      bookmarked: all.filter(id => qById(id)?.bookmarked === true).length,
      recent: practice.recent.filter(id => all.includes(id)).length,
    };
    perf.root.querySelectorAll('[data-q-tab]').forEach(tab => {
      const key = tab.dataset.qTab;
      const count = tab.querySelector('[data-q-tab-count]');
      if (count) count.textContent = counts[key] ?? 0;
      tab.setAttribute('aria-selected', String((ExplorerState.status || 'all') === key));
      tab.classList.toggle('active', (ExplorerState.status || 'all') === key);
    });
    perf.root.querySelectorAll('[data-q-accuracy]').forEach(node => { node.innerHTML = `Accuracy <strong>${accuracy(all)}%</strong>`; });
    perf.root.querySelectorAll('[data-q-mistakes]').forEach(node => { node.innerHTML = `Mistakes <strong>${mistakes(all)}</strong>`; });
  }

  function measureRendered() {
    if (!perf.root) return;
    const currentScroll = perf.host?.scrollTop || 0;
    const currentAnchor = visibleAnchor();
    let changed = false;
    perf.root.querySelectorAll('[data-question-id]').forEach(card => {
      const h = Math.ceil(card.getBoundingClientRect().height);
      const id = card.dataset.questionId;
      if (h > 0 && Math.abs((perf.heights.get(id) || 410) - h) > 1) { perf.heights.set(id, h); changed = true; }
    });
    if (changed) {
      perf.metricsSignature = '';
      const anchor = perf.anchor || currentAnchor;
      if (perf.measureFrame) cancelAnimationFrame(perf.measureFrame);
      perf.measureFrame = requestAnimationFrame(() => { perf.measureFrame = 0; renderWindow(anchor, false, currentScroll); });
    }
  }

  function renderWindow(anchor = null, force = true, fallbackScroll = null) {
    if (!perf.root || !perf.host) return;
    const list = perf.root.querySelector('[data-q-window-list]');
    const top = perf.root.querySelector('[data-q-window-top]');
    const bottom = perf.root.querySelector('[data-q-window-bottom]');
    if (!list || !top || !bottom) return;
    perf.displayIds = perf.filteredIds.slice();
    perf.positionById = new Map(perf.filteredIds.map((id, index) => [id, index]));
    const w = listWindow();
    if (!force && w.start === perf.renderedStart && w.end === perf.renderedEnd && perf.metricsSignature) return;
    const topic = currentTopic();
    const subject = currentSubject(topic);
    top.style.height = `${w.top}px`;
    bottom.style.height = `${w.bottom}px`;
    const html = perf.displayIds.slice(w.start, w.end).map(id => qCard(topicModel(perf.topicId).byId.get(id), perf.positionById.get(id) || 0, topic, subject)).join('');
    list.innerHTML = html;
    perf.renderedStart = w.start;
    perf.renderedEnd = w.end;
    if (anchor || Number.isFinite(fallbackScroll)) requestAnimationFrame(() => restoreAnchor(anchor, Number.isFinite(fallbackScroll) ? fallbackScroll : scrollState[perf.topicId]?.scrollOffset));
    requestAnimationFrame(measureRendered);
    updateSummary();
  }

  function scheduleWindow() {
    if (perf.frame) return;
    perf.frame = requestAnimationFrame(() => { perf.frame = 0; renderWindow(null, true); });
  }

  function onScroll() {
    const now = performance.now();
    const current = perf.host?.scrollTop || 0;
    const dt = Math.max(1, now - (perf.lastScrollTime || now));
    perf.velocity = (current - perf.lastScrollTop) / dt;
    perf.lastScrollTop = current;
    perf.lastScrollTime = now;
    saveScrollState();
    scheduleWindow();
  }

  function detachScroll() {
    if (perf.host && perf.listenersAttached) perf.host.removeEventListener('scroll', onScroll);
    perf.listenersAttached = false;
  }
  function attachScroll() {
    const next = host();
    if (perf.host !== next) { detachScroll(); perf.host = next; }
    if (!perf.listenersAttached && perf.host) {
      perf.host.addEventListener('scroll', onScroll, { passive: true });
      perf.listenersAttached = true;
    }
    perf.lastScrollTop = perf.host?.scrollTop || 0;
    perf.lastScrollTime = performance.now();
  }

  function patchCard(qid, anchor = null) {
    const oldCard = perf.root?.querySelector(`[data-question-id="${CSS.escape(qid)}"]`);
    if (!oldCard) { updateSummary(); return; }
    const q = qById(qid), topic = currentTopic(), subject = currentSubject(topic);
    const index = perf.positionById.get(qid) || 0;
    const holder = document.createElement('div');
    holder.innerHTML = qCard(q, index, topic, subject);
    const next = holder.firstElementChild;
    if (next) oldCard.replaceWith(next);
    updateSummary();
    requestAnimationFrame(() => { restoreAnchor(anchor, null); measureRendered(); });
  }

  function resetForTopic(topicId) {
    if (practice.topicId === topicId) return;
    practice.topicId = topicId;
    practice.answers = {};
    practice.revealed = {};
    practice.recent = [];
    practice.query = '';
    practice.visibleCount = 100;
    window.BankAnswers = {};
  }

  function renderTopicFeed() {
    const topic = currentTopic();
    const subject = currentSubject(topic);
    if (!topic || !subject) { if (typeof navigate === 'function') navigate('question-bank'); return; }
    resetForTopic(topic.id);
    const model = topicModel(topic.id);
    perf.topicId = topic.id;
    perf.filteredIds = filteredIds(topic.id);
    perf.displayIds = perf.filteredIds.slice();
    perf.heights = new Map([...perf.heights].filter(([id]) => model.byId.has(id)));
    perf.metricsSignature = '';
    perf.renderedStart = -1;
    perf.renderedEnd = -1;
    const filter = ExplorerState.status || 'all';
    const tabs = [['all', 'All'], ['unattempted', 'Unattempted'], ['mistakes', 'Mistakes'], ['bookmarked', 'Bookmarked'], ['recent', 'Recent']];
    const saved = scrollState[topic.id];
    const shown = perf.filteredIds.length;
    const html = `<div class="q-bank-container"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to topics" onclick="leaveTopic()">‹</button><div><h1>${esc(topic.name)}</h1><p>Practice / ${esc(subject.name)} / ${esc(topic.name)}</p></div></div></div></header><div class="q-filter-tabs-v2" role="tablist">${tabs.map(([key, label]) => `<button type="button" role="tab" data-q-tab="${key}" aria-selected="${filter === key}" class="${filter === key ? 'active' : ''}" onclick="qPerfFilter('${key}')">${label} <span data-q-tab-count>0</span></button>`).join('')}</div><div class="q-search-box"><input type="search" inputmode="search" aria-label="Search questions" placeholder="Search this topic..." value="${esc(practice.query || '')}" oninput="qPerfQuery(this.value)"></div><div class="q-feed-summary"><span data-q-summary>${perf.filteredIds.length} question${perf.filteredIds.length === 1 ? '' : 's'}</span><span data-q-answered>0/${model.ids.length} answered</span></div><div class="q-feed-body" data-q-perf-feed><div data-q-window-top class="q-window-spacer"></div><div data-q-window-list></div><div data-q-window-bottom class="q-window-spacer"></div></div></div>`;
    renderShell(html, { title: topic.name, back: 'leaveTopic()' });
    perf.root = document.querySelector('[data-q-perf-feed]')?.closest('.q-bank-container');
    attachScroll();
    perf.filteredIds = filteredIds(topic.id);
    perf.displayIds = perf.filteredIds.slice();
    if (!saved) perf.host.scrollTop = 0;
    renderWindow(null, true);
    if (saved) {
      const targetIndex = perf.displayIds.indexOf(saved.anchorQuestionId);
      if (targetIndex >= 0) {
        perf.host.scrollTop = perf.offsets[targetIndex] + Number(saved.anchorOffset || 0);
      } else {
        perf.host.scrollTop = Number(saved.scrollOffset || 0);
      }
      requestAnimationFrame(() => { renderWindow(saved, true); });
    }
  }

  window.qPerfSelect = (qid, idx) => {
    if (practice.topicId !== ExplorerState.topicId || sessionAnswer(qid)) return;
    const q = qById(qid);
    if (!q || q.topicId !== ExplorerState.topicId) return;
    const anchor = visibleAnchor();
    practice.answers[qid] = { selected: idx, correct: idx === answerIndex(q), answeredAt: Date.now() };
    practice.recent = [qid, ...practice.recent.filter(id => id !== qid)];
    patchCard(qid, anchor);
  };
  window.qPerfReveal = qid => {
    const q = qById(qid);
    if (!q || q.topicId !== ExplorerState.topicId || sessionAnswer(qid)) return;
    const anchor = visibleAnchor();
    practice.revealed[qid] = true;
    patchCard(qid, anchor);
  };
  window.qPerfFilter = filter => {
    saveScrollState();
    ExplorerState.status = filter;
    practice.visibleCount = 100;
    perf.filteredIds = filteredIds(perf.topicId);
    perf.renderedStart = -1;
    renderWindow(null, true);
  };
  window.qPerfQuery = value => {
    practice.query = String(value || '');
    practice.visibleCount = 100;
    clearTimeout(window.__qPerfQueryTimer);
    window.__qPerfQueryTimer = setTimeout(() => {
      perf.filteredIds = filteredIds(perf.topicId);
      perf.renderedStart = -1;
      renderWindow(null, true);
    }, 180);
  };
  window.qPerfLoadMore = () => {
    saveScrollState();
    practice.visibleCount = (Number(practice.visibleCount) || 100) + 100;
    perf.filteredIds = filteredIds(perf.topicId);
    perf.renderedStart = -1;
    renderWindow(null, true);
  };
  window.qPerfBookmark = async qid => {
    const q = qById(qid);
    if (!q) return;
    const anchor = visibleAnchor();
    q.bookmarked = !q.bookmarked;
    q.bookmarkUpdatedAt = Date.now();
    try {
      await dbPut('questions', q);
      const card = perf.root?.querySelector(`[data-question-id="${CSS.escape(qid)}"]`);
      if (card) {
        const button = [...card.querySelectorAll('.q-footer-btn')].find(node => node.textContent.includes('Bookmark') || node.textContent.includes('Bookmarked'));
        if (button) { button.classList.toggle('active', !!q.bookmarked); button.setAttribute('aria-pressed', String(!!q.bookmarked)); button.innerHTML = `⭐ ${q.bookmarked ? 'Bookmarked' : 'Bookmark'}`; }
      }
      updateSummary();
      toast(q.bookmarked ? 'Question bookmarked' : 'Bookmark removed');
    } catch (_) {
      q.bookmarked = !q.bookmarked;
      toast('Could not update bookmark');
      restoreAnchor(anchor, null);
    }
  };

  window.renderQuestionBankV2 = function () {
    const path = Router.path || location.hash.slice(1);
    if (String(path).startsWith('question-bank/topic/')) {
      const topicId = decodeURIComponent(String(path).split('/')[2] || '');
      const topic = CACHE.topics?.find(t => t.id === topicId);
      if (!topic) return legacyRenderQuestionBankV2 ? legacyRenderQuestionBankV2() : undefined;
      ExplorerState.topicId = topicId;
      ExplorerState.subjectId = topic.subjectId || '';
      return renderTopicFeed();
    }
    return legacyRenderQuestionBankV2 ? legacyRenderQuestionBankV2() : undefined;
  };
  window.__qbankPerformance = {
    version: 'windowed-v1',
    state: perf,
    getRenderedCount: () => perf.root?.querySelectorAll('[data-question-id]').length || 0,
    getTopicOrder: topicId => topicModel(topicId).ids.slice(),
    getScrollState: () => ({ host: perf.host?.tagName || '', scrollTop: perf.host?.scrollTop || 0, topicId: perf.topicId }),
  };

  window.addEventListener('hashchange', () => {
    const next = location.hash.slice(1) || 'dashboard';
    if (perf.topicId && !next.startsWith('question-bank/topic/')) saveScrollState();
  });
  window.addEventListener('resize', () => { if (perf.root) scheduleWindow(); }, { passive: true });

  const style = document.createElement('style');
  style.id = 'qbank-performance-style';
  style.textContent = '.q-window-spacer{display:block;width:1px;min-height:0;pointer-events:none;overflow:hidden}.q-window-spacer::after{content:"";display:block;width:1px;height:1px}';
  document.head.appendChild(style);
})();
