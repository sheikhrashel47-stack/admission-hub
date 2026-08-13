(() => {
  const qEsc = s => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };
  const qStats = q => q.stats || { attempts: 0, correct: 0, wrong: 0 };
  
  function getAbbr(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('bangla 1')) return 'বা';
    if (n.includes('bangla 2')) return 'বা';
    if (n.includes('english')) return 'En';
    if (n.includes('gk') || n.includes('general')) return 'GK';
    if (n.includes('math') || n.includes('iba')) return 'M';
    if (n.includes('iq')) return 'IQ';
    if (n.includes('ict') || n.includes('computer')) return 'CS';
    return name.trim().slice(0, 2).toUpperCase();
  }

  function getBadgeColor(name) {
    const n = (name || '').toLowerCase();
    if (n.includes('bangla')) return '#10b981';
    if (n.includes('english')) return '#3b82f6';
    if (n.includes('gk')) return '#8b5cf6';
    if (n.includes('math') || n.includes('iba')) return '#f59e0b';
    if (n.includes('iq')) return '#06b6d4';
    if (n.includes('ict')) return '#64748b';
    return '#0f6b4f';
  }

  function subjectRow(s) {
    const qs = CACHE.questions.filter(q => q.subjectId === s.id);
    const topics = CACHE.topics.filter(t => t.subjectId === s.id);
    const color = getBadgeColor(s.name);
    const abbr = getAbbr(s.name);
    return `
      <button class="q-nav-card" onclick="openRedesignedSubject('${s.id}')">
        <div class="q-nav-badge" style="background:${color}">${qEsc(abbr)}</div>
        <div class="q-nav-info">
          <strong>${qEsc(s.name)}</strong>
          <span>${topics.length} Topics • ${qs.length} Questions</span>
        </div>
        <span class="q-nav-arrow">›</span>
      </button>`;
  }

  function topicRow(t) {
    const qs = CACHE.questions.filter(q => q.topicId === t.id);
    return `
      <button class="q-nav-card" onclick="openRedesignedTopic('${t.id}')">
        <span class="q-topic-icon">📄</span>
        <div class="q-nav-info">
          <strong>${qEsc(t.name)}</strong>
        </div>
        <div class="q-topic-count">${qs.length} Questions</div>
        <span class="q-nav-arrow">›</span>
      </button>`;
  }

  window.openRedesignedSubject = id => {
    ExplorerState.subjectId = id;
    ExplorerState.topicId = '';
    ExplorerState.query = '';
    // Use hash navigation for consistency with original app behavior
    location.hash = 'question-bank/subject/' + id;
  };

  window.openRedesignedTopic = id => {
    const t = CACHE.topics.find(x => x.id === id);
    ExplorerState.subjectId = t?.subjectId || '';
    ExplorerState.topicId = id;
    ExplorerState.status = 'all';
    ExplorerState.query = '';
    location.hash = 'question-bank/topic/' + id;
    window.BankAnswers = window.BankAnswers || {};
  };

  window.leaveTopic = () => {
    // Reset temporary highlights
    window.BankAnswers = {};
    location.hash = 'question-bank/subject/' + ExplorerState.subjectId;
  };

  function renderSubjectList() {
    const subs = [...CACHE.subjects].sort((a, b) => (a.order || 0) - (b.order || 0));
    const search = (ExplorerState.query || '').toLowerCase();
    const filtered = subs.filter(s => !search || s.name.toLowerCase().includes(search));
    
    const html = `
      <div class="q-bank-container">
        <header class="q-bank-header">
          <div class="row between">
            <div>
              <h1>প্রশ্ন ব্যাংক</h1>
              <p>সব Subject</p>
            </div>
            <div class="row">
              <button class="q-header-icon" onclick="toggleQSearch()">${ICONS.search || '🔍'}</button>
              <button class="q-header-icon" onclick="openSubjectForm(null)">+</button>
            </div>
          </div>
          <div id="qSearchBox" class="q-search-box ${ExplorerState.query ? '' : 'hide'}">
            <input type="text" placeholder="Search subjects..." value="${qEsc(ExplorerState.query)}" oninput="ExplorerState.query=this.value;renderQuestionBank()">
          </div>
        </header>
        <div class="q-list-body">
          ${filtered.map(subjectRow).join('') || '<div class="empty">No subjects found.</div>'}
        </div>
      </div>`;
    renderShell(html, { title: 'Question Bank', back: "navigate('dashboard')" });
  }

  function renderTopicList() {
    const sub = CACHE.subjects.find(s => s.id === ExplorerState.subjectId);
    if (!sub) { navigate('question-bank'); return; }
    const topics = CACHE.topics.filter(t => t.subjectId === sub.id).sort((a, b) => (a.order || 0) - (b.order || 0));
    const search = (ExplorerState.query || '').toLowerCase();
    const filtered = topics.filter(t => !search || t.name.toLowerCase().includes(search));

    const html = `
      <div class="q-bank-container">
        <header class="q-bank-header">
          <div class="row between">
            <div class="row">
              <button class="q-back-btn" onclick="location.hash='question-bank'">‹</button>
              <div>
                <h1>${qEsc(sub.name)}</h1>
                <p>${topics.length} Topics</p>
              </div>
            </div>
            <div class="row">
              <button class="q-header-icon" onclick="toggleQSearch()">${ICONS.search || '🔍'}</button>
              <button class="q-header-icon" onclick="openTopicForm('${sub.id}', null)">+</button>
            </div>
          </div>
          <div id="qSearchBox" class="q-search-box ${ExplorerState.query ? '' : 'hide'}">
            <input type="text" placeholder="Search topics..." value="${qEsc(ExplorerState.query)}" oninput="ExplorerState.query=this.value;renderQuestionBank()">
          </div>
        </header>
        <div class="q-list-body">
          ${filtered.map(topicRow).join('') || '<div class="empty">No topics found.</div>'}
        </div>
      </div>`;
    renderShell(html, { title: sub.name, back: "navigate('question-bank')" });
  }

  function renderFeed() {
    const topic = CACHE.topics.find(t => t.id === ExplorerState.topicId);
    const sub = CACHE.subjects.find(s => s.id === ExplorerState.subjectId);
    if (!topic) { navigate('question-bank'); return; }
    
    let qs = CACHE.questions.filter(q => q.topicId === topic.id);
    const totalCount = qs.length;
    
    const filter = ExplorerState.status || 'all';
    if (filter === 'unattempted') qs = qs.filter(q => !qStats(q).attempts);
    else if (filter === 'wrong') qs = qs.filter(q => qStats(q).wrong > 0);
    else if (filter === 'bookmarked') qs = qs.filter(q => q.bookmarked);

    const tabs = [
      ['all', `All (${totalCount})`],
      ['unattempted', 'Unattempted'],
      ['wrong', 'Wrong'],
      ['bookmarked', 'Bookmarked']
    ];

    const html = `
      <div class="q-bank-container">
        <header class="q-bank-header">
          <div class="row between">
            <div class="row">
              <button class="q-back-btn" onclick="leaveTopic()">‹</button>
              <div>
                <h1>${qEsc(topic.name)}</h1>
                <p>${qEsc(sub?.name || '')}</p>
              </div>
            </div>
            <div class="row">
              <button class="q-header-icon">${ICONS.search || '🔍'}</button>
              <button class="q-header-icon">${ICONS.filter || '▽'}</button>
            </div>
          </div>
        </header>
        <div class="q-filter-tabs-v2">
          ${tabs.map(([k, l]) => `<button class="${filter === k ? 'active' : ''}" onclick="ExplorerState.status='${k}';renderQuestionBank()">${l}</button>`).join('')}
        </div>
        <div class="q-feed-body">
          ${qs.map((q, i) => qCard(q, i)).join('') || '<div class="empty card">No questions found.</div>'}
        </div>
      </div>`;
    renderShell(html, { title: topic.name, back: "leaveTopic()" });
  }

  function qCard(q, i) {
    const st = qStats(q);
    const state = BankAnswers[q.id];
    const correct = Number(q.answerIndex ?? q.answer ?? 0);
    
    const opts = (q.options || []).map((o, j) => {
      let cls = '';
      let icon = '';
      if (state) {
        if (j === correct) {
          cls = 'correct';
          icon = '✓';
        } else if (j === state.selected) {
          cls = 'wrong';
          icon = '✕';
        }
      }
      return `
        <button class="q-opt-v2 ${cls}" ${state ? 'disabled' : ''} onclick="selectBankAnswer('${q.id}', ${j})">
          <span class="q-opt-letter">${String.fromCharCode(65 + j)}</span>
          <span class="q-opt-text">${qEsc(o)}</span>
          ${icon ? `<span class="q-opt-icon">${icon}</span>` : ''}
        </button>`;
    }).join('');

    return `
      <article class="q-card-v2 card">
        <div class="row between">
          <div class="q-card-num">Question ${i + 1}</div>
          <button class="q-bookmark-btn ${q.bookmarked ? 'active' : ''}" onclick="toggleQuestionBookmark('${q.id}')">
            ${q.bookmarked ? '★' : '☆'}
          </button>
        </div>
        <div class="q-text-v2">${qEsc(q.question)}</div>
        <div class="q-options-v2">${opts}</div>
        ${state ? `
          <div class="q-explanation-v2 ${state.correct ? 'correct' : 'wrong'}">
            <strong>${state.correct ? '✓ Correct' : '✕ Wrong'}</strong>
            ${q.explanation ? `<p>${qEsc(q.explanation)}</p>` : `<p>সঠিক উত্তর: ${qEsc((q.options || [])[correct])}</p>`}
          </div>
        ` : ''}
      </article>`;
  }

  window.toggleQSearch = () => {
    const box = document.getElementById('qSearchBox');
    if (box) {
      box.classList.toggle('hide');
      if (!box.classList.contains('hide')) box.querySelector('input').focus();
    }
  };

  window.renderQuestionBankV2 = () => {
    const p = Router.path;
    if (p.startsWith('question-bank/topic/')) {
      const tid = p.split('/')[2];
      if (tid) {
        ExplorerState.topicId = tid;
        const t = CACHE.topics.find(x => x.id === tid);
        ExplorerState.subjectId = t?.subjectId || '';
        return renderFeed();
      }
    }
    if (p.startsWith('question-bank/subject/')) {
      const sid = p.split('/')[2];
      if (sid) {
        ExplorerState.subjectId = sid;
        ExplorerState.topicId = '';
        return renderTopicList();
      }
    }
    ExplorerState.subjectId = '';
    ExplorerState.topicId = '';
    return renderSubjectList();
  };

  const css = `
    .q-bank-container { padding-bottom: 20px; }
    .q-bank-header { margin-bottom: 16px; }
    .q-bank-header h1 { font-size: 24px; font-weight: 800; margin: 0; color: var(--text); }
    .q-bank-header p { font-size: 13px; color: var(--sub); margin: 2px 0 0; }
    .q-header-icon { background: none; border: none; font-size: 20px; padding: 8px; cursor: pointer; color: var(--emerald); }
    .q-back-btn { background: none; border: none; font-size: 32px; padding: 0 12px 0 0; cursor: pointer; color: var(--emerald); line-height: 1; }
    .q-search-box { margin-top: 12px; animation: fadeDown 0.2s ease; }
    .q-search-box input { width: 100%; padding: 10px 14px; border-radius: 12px; border: 1px solid var(--line); background: #fff; }
    
    .q-nav-card { width: 100%; display: flex; align-items:center; gap: 14px; padding: 16px; background: #fff; border: 1px solid var(--line); border-radius: 16px; margin-bottom: 10px; text-align: left; cursor: pointer; box-shadow: var(--shadow); transition: transform 0.1s; }
    .q-nav-card:active { transform: scale(0.98); }
    .q-nav-badge { width: 44px; height: 44px; border-radius: 12px; display: grid; place-items: center; color: #fff; font-weight: 800; font-size: 16px; flex-shrink: 0; }
    .q-nav-info { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .q-nav-info strong { font-size: 16px; color: var(--text); }
    .q-nav-info span { font-size: 12px; color: var(--sub); }
    .q-nav-arrow { font-size: 20px; color: var(--line); font-weight: 300; }
    
    .q-topic-icon { font-size: 20px; opacity: 0.7; }
    .q-topic-count { font-size: 12px; color: var(--sub); margin-right: 4px; }
    
    .q-filter-tabs-v2 { display: flex; gap: 8px; overflow-x: auto; margin-bottom: 16px; padding-bottom: 4px; }
    .q-filter-tabs-v2 button { flex-shrink: 0; padding: 8px 14px; border-radius: 20px; font-size: 13px; font-weight: 600; background: #fff; border: 1px solid var(--line); color: var(--sub); cursor: pointer; }
    .q-filter-tabs-v2 button.active { background: var(--emerald); color: #fff; border-color: var(--emerald); }
    
    .q-card-v2 { padding: 18px; margin-bottom: 14px; }
    .q-card-num { font-size: 12px; font-weight: 800; color: var(--emerald); text-transform: uppercase; letter-spacing: 0.5px; }
    .q-bookmark-btn { background: none; border: none; font-size: 20px; color: var(--sub); cursor: pointer; }
    .q-bookmark-btn.active { color: var(--orange); }
    .q-text-v2 { font-size: 18px; font-weight: 700; line-height: 1.5; margin: 12px 0 18px; color: var(--text); }
    .q-options-v2 { display: flex; flex-direction: column; gap: 10px; }
    .q-opt-v2 { display: flex; align-items: center; gap: 12px; padding: 14px; border-radius: 12px; border: 1px solid var(--line); background: #fcfcfc; text-align: left; cursor: pointer; font-size: 15px; transition: all 0.2s; }
    .q-opt-letter { width: 28px; height: 28px; border-radius: 50%; border: 1px solid var(--line); display: grid; place-items: center; font-size: 12px; font-weight: 700; color: var(--sub); flex-shrink: 0; }
    .q-opt-text { flex: 1; }
    .q-opt-icon { font-weight: 800; font-size: 16px; }
    .q-opt-v2.correct { background: #ecfdf5; border-color: #10b981; color: #065f46; }
    .q-opt-v2.correct .q-opt-letter { background: #10b981; border-color: #10b981; color: #fff; }
    .q-opt-v2.wrong { background: #fef2f2; border-color: #ef4444; color: #991b1b; }
    .q-opt-v2.wrong .q-opt-letter { background: #ef4444; border-color: #ef4444; color: #fff; }
    
    .q-explanation-v2 { margin-top: 16px; padding: 14px; border-radius: 12px; font-size: 14px; line-height: 1.5; }
    .q-explanation-v2.correct { background: #f0fdf4; color: #166534; border-left: 4px solid #10b981; }
    .q-explanation-v2.wrong { background: #fffaf0; color: #9a3412; border-left: 4px solid #f59e0b; }
    .q-explanation-v2 strong { display: block; margin-bottom: 4px; font-size: 15px; }
    
    @keyframes fadeDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
  `;
  
  if (!document.getElementById('qbank-redesign-style')) {
    const s = document.createElement('style');
    s.id = 'qbank-redesign-style';
    s.textContent = css;
    document.head.appendChild(s);
  }
})();
