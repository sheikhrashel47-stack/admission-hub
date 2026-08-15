(() => {
  'use strict';

  const CHILD_KEY = 'parentTopicId';
  if (!document.getElementById('ah-topic-card-layout-fix')) {
    const style = document.createElement('style');
    style.id = 'ah-topic-card-layout-fix';
    style.textContent = '.q-nav-card-topic{display:grid;grid-template-columns:auto minmax(0,1fr) auto auto;align-items:center;gap:8px}.q-nav-card-topic>.row{grid-column:1/-1;margin-top:0 !important;width:100% !important}';
    document.head.appendChild(style);
  }
  const appCache = () => (typeof CACHE !== 'undefined' ? CACHE : { subjects: [], topics: [], questions: [], settings: {} });
  let migrationState = 'idle';
  let migrationPromise = null;

  const escH = value => {
    if (typeof window.esc === 'function') return window.esc(value);
    const d = document.createElement('div'); d.textContent = String(value ?? ''); return d.innerHTML;
  };
  const topicChildren = id => [...(appCache().topics || [])]
    .filter(t => t[CHILD_KEY] === id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const topicRoots = subjectId => [...(appCache().topics || [])]
    .filter(t => t.subjectId === subjectId && !t[CHILD_KEY])
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const topicLeaves = id => {
    const children = topicChildren(id);
    return children.length ? children.flatMap(child => topicLeaves(child.id)) : (appCache().topics || []).filter(t => t.id === id);
  };
  const descendantIds = id => topicLeaves(id).map(t => t.id);
  const topicDisplayName = topic => {
    const parent = topic?.[CHILD_KEY] ? appCache().topics?.find(t => t.id === topic[CHILD_KEY]) : null;
    return parent ? `${parent.name} · ${topic.name}` : String(topic?.name || '');
  };
  const topicQuestionCount = id => {
    const ids = new Set(descendantIds(id));
    return (appCache().questions || []).filter(q => ids.has(q.topicId)).length;
  };
  const leafPickerOptions = subjectId => topicRoots(subjectId).flatMap(root => {
    const leaves = topicLeaves(root.id);
    return leaves.map(leaf => ({ ...leaf, pickerName: topicDisplayName(leaf) }));
  });

  window.topicHierarchy = { topicChildren, topicRoots, topicLeaves, descendantIds, topicDisplayName, topicQuestionCount, leafPickerOptions };
  window.topicPickerOptions = leafPickerOptions;

  async function migrateMemorizingVocabulary() {
    if (!Array.isArray(appCache().subjects) || !Array.isArray(appCache().topics) || typeof dbPut !== 'function') return false;
    const memorizing = CACHE.subjects.find(s => String(s.name || '').trim().toLowerCase() === 'memorizing');
    if (!memorizing) return false;
    const vocabularyTopics = CACHE.topics
      .filter(t => t.subjectId === memorizing.id && /^Vocabulary \(\d+\s*-\s*\d+\)$/i.test(String(t.name || '')))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
    if (!vocabularyTopics.length) return false;
    let parent = CACHE.topics.find(t => t.subjectId === memorizing.id && !t[CHILD_KEY] && String(t.name || '').trim().toLowerCase() === 'vocabulary');
    if (!parent) {
      parent = { id: uid(), subjectId: memorizing.id, name: 'Vocabulary', order: vocabularyTopics[0].order || 0, createdAt: Date.now(), updatedAt: Date.now() };
      await dbPut('topics', parent);
    }
    let changed = false;
    for (const topic of vocabularyTopics) {
      if (topic[CHILD_KEY] !== parent.id) {
        topic[CHILD_KEY] = parent.id;
        topic.updatedAt = Date.now();
        await dbPut('topics', topic);
        changed = true;
      }
    }
    CACHE.topics = await dbGetAll('topics');
    if (changed || !CACHE.settings?.subtopicMigrationV1) {
      CACHE.settings = { ...(CACHE.settings || { id: 'main' }), subtopicMigrationV1: true };
      await dbPut('settings', CACHE.settings);
    }
    return changed || !!parent;
  }

  async function ensureMigration() {
    if (migrationState === 'done') return false;
    if (migrationPromise) return migrationPromise;
    migrationState = 'running';
    migrationPromise = migrateMemorizingVocabulary().then(changed => {
      if (changed || (CACHE.subjects?.length && CACHE.topics?.length)) migrationState = 'done';
      else migrationState = 'idle';
      migrationPromise = null;
      return changed;
    }).catch(error => {
      console.warn('[Admission Hub] Sub-topic migration deferred.', error);
      migrationState = 'idle';
      migrationPromise = null;
      return false;
    });
    return migrationPromise;
  }
  window.ensureTopicHierarchyMigration = ensureMigration;

  function renderTopicCard(topic, subjectId, isChild = false) {
    const children = topicChildren(topic.id);
    const count = topicQuestionCount(topic.id);
    const childLabel = children.length ? `${children.length} sub-topic${children.length === 1 ? '' : 's'} · ` : '';
    const addAction = children.length
      ? `openTopicForm('${escH(subjectId)}',null,'${escH(topic.id)}')`
      : `navigate('add-question?sub=${escH(subjectId)}&top=${escH(topic.id)}')`;
    return `<article class="q-nav-card q-nav-card-topic" role="button" tabindex="0" onclick="openRedesignedTopic('${escH(topic.id)}')" onkeydown="if(event.key==='Enter')openRedesignedTopic('${escH(topic.id)}')">
      <span class="q-topic-icon" aria-hidden="true">${children.length ? '📂' : '📄'}</span>
      <div class="q-nav-info"><strong>${escH(topic.name)}</strong><span>${childLabel}${count} question${count === 1 ? '' : 's'}</span></div>
      <div class="q-manage-actions"><button type="button" class="q-manage-btn q-manage-icon" title="Rename" aria-label="Rename" onclick="event.stopPropagation();ahRenameTopic('${escH(topic.id)}')">✏️</button><button type="button" class="q-manage-btn q-manage-icon danger" title="Delete" aria-label="Delete" onclick="event.stopPropagation();ahDeleteTopic('${escH(topic.id)}')">🗑️</button></div>
      <span class="q-nav-arrow" aria-hidden="true">›</span>
      <div class="row" style="width:100%;margin-top:8px;gap:8px" onclick="event.stopPropagation()"><button class="btn ghost sm" style="flex:1" onclick="${addAction}">${children.length ? '+ Sub-topic' : '+ Question'}</button>${children.length ? '' : `<button class="btn secondary sm" style="flex:1" onclick="startExamFor([],['${escH(topic.id)}'])">Start Exam</button>`}</div>
    </article>`;
  }

  function renderRootTopicList(subjectId) {
    const subject = CACHE.subjects.find(s => s.id === subjectId);
    if (!subject) { navigate('question-bank'); return; }
    const roots = topicRoots(subjectId);
    const search = String(ExplorerState.query || '').toLowerCase();
    const filtered = roots.filter(t => !search || String(t.name).toLowerCase().includes(search));
    const html = `<div class="q-bank-container"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to subjects" onclick="location.hash='question-bank'">‹</button><div><h1>${escH(subject.name)}</h1><p>${roots.length} Topics · ${CACHE.questions.filter(q => q.subjectId === subjectId).length} Questions</p></div></div><div class="row"><button class="q-header-icon" type="button" aria-label="Search topics" onclick="toggleQSearch()">${window.ICONS?.search || '🔍'}</button><button class="q-header-icon" type="button" aria-label="Add topic" onclick="openTopicForm('${escH(subjectId)}',null)">+</button><button class="q-header-icon" type="button" aria-label="Add question" onclick="ahAddQuestion()">＋Q</button></div></div><div id="qSearchBox" class="q-search-box ${ExplorerState.query ? '' : 'hide'}"><input type="search" placeholder="Search topics..." value="${escH(ExplorerState.query)}" oninput="ExplorerState.query=this.value;window.renderQuestionBankV2()"></div></header><div class="q-list-body">${filtered.map(t => renderTopicCard(t, subjectId)).join('') || '<div class="empty">No topics found.</div>'}</div></div>`;
    renderShell(html, { title: subject.name, back: "navigate('question-bank')" });
  }

  function renderSubtopicList(parentId) {
    const parent = CACHE.topics.find(t => t.id === parentId);
    const subject = CACHE.subjects.find(s => s.id === parent?.subjectId);
    if (!parent || !subject) { navigate('question-bank'); return; }
    const children = topicChildren(parentId);
    const html = `<div class="q-bank-container"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to topics" onclick="location.hash='question-bank/subject/${encodeURIComponent(subject.id)}'">‹</button><div><h1>${escH(parent.name)}</h1><p>${escH(subject.name)} · ${children.length} Sub-topics</p></div></div><div class="row"><button class="q-header-icon" type="button" aria-label="Add sub-topic" onclick="openTopicForm('${escH(subject.id)}',null,'${escH(parent.id)}')">+</button></div></div></header><div class="q-list-body">${children.map(t => renderTopicCard(t, subject.id, true)).join('') || '<div class="empty">No sub-topics yet.</div>'}</div></div>`;
    renderShell(html, { title: parent.name, back: `navigate('question-bank/subject/${encodeURIComponent(subject.id)}')` });
  }

  const originalOpenTopicForm = window.openTopicForm;
  window.openTopicForm = function(subjectId, topicId, parentId) {
    if (!parentId || topicId) return originalOpenTopicForm?.apply(this, arguments);
    openModal(`<h3>Add Sub-topic</h3><label class="flabel">Name</label><input type="text" id="topName" placeholder="e.g. Chapter 1"><button class="btn" style="margin-top:14px;" onclick="saveTopic('${escH(subjectId)}',null,'${escH(parentId || '')}')">Save</button>`);
  };
  const originalSaveTopic = window.saveTopic;
  window.saveTopic = async function(subjectId, topicId, parentId) {
    if (!parentId || topicId) return originalSaveTopic?.apply(this, arguments);
    const name = document.getElementById('topName')?.value.trim();
    if (!name) { toast('Name required'); return; }
    const order = topicChildren(parentId).length;
    await dbPut('topics', { id: uid(), subjectId, [CHILD_KEY]: parentId, name, order, createdAt: Date.now(), updatedAt: Date.now() });
    CACHE.topics = await dbGetAll('topics');
    closeModal(); toast('Saved'); render();
  };

  const originalImportAddTopic = window.openImportAddTopic;
  window.openImportAddTopic = function() {
    if (!ImportState?.destSubjectId) { toast('Select a subject first'); return; }
    const roots = topicRoots(ImportState.destSubjectId);
    openModal(`<h3>New Topic</h3><label class="flabel">Name</label><input type="text" id="newTopName" placeholder="e.g. Thermodynamics"><label class="flabel">Parent topic (optional)</label><select id="newTopParent"><option value="">Top-level topic</option>${roots.map(t => `<option value="${escH(t.id)}">${escH(t.name)}</option>`).join('')}</select><button class="btn" style="margin-top:12px;" onclick="saveImportTopic()">Create Topic</button>`);
  };
  const originalSaveImportTopic = window.saveImportTopic;
  window.saveImportTopic = async function() {
    if (!ImportState?.destSubjectId) return originalSaveImportTopic?.apply(this, arguments);
    const name = document.getElementById('newTopName')?.value.trim();
    const parentId = document.getElementById('newTopParent')?.value || '';
    if (!name) { toast('Name required'); return; }
    const id = uid();
    const siblings = parentId ? topicChildren(parentId) : topicRoots(ImportState.destSubjectId);
    await dbPut('topics', { id, subjectId: ImportState.destSubjectId, name, order: siblings.length, ...(parentId ? { [CHILD_KEY]: parentId } : {}), createdAt: Date.now(), updatedAt: Date.now() });
    CACHE.topics = await dbGetAll('topics');
    ImportState.destTopicId = id;
    closeModal(); render();
  };

  const originalQbank = window.renderQuestionBankV2;
  if (typeof originalQbank === 'function') {
    window.renderQuestionBankV2 = function(...args) {
      const path = String(window.Router?.path || location.hash.slice(1));
      if (migrationState !== 'done' && Array.isArray(CACHE?.subjects) && CACHE.subjects.length) {
        ensureMigration().then(changed => { if (changed) window.renderQuestionBankV2(); });
      }
      if (path.startsWith('question-bank/subject/')) {
        const subjectId = decodeURIComponent(path.split('/')[2] || '');
        return renderRootTopicList(subjectId);
      }
      if (path.startsWith('question-bank/topic/')) {
        const topicId = decodeURIComponent(path.split('/')[2] || '');
        if (topicChildren(topicId).length) return renderSubtopicList(topicId);
      }
      return originalQbank.apply(this, args);
    };
  }

  function setTopicSelectorOptions(selectedTopicId) {
    const subjectId = document.getElementById('qfSubject')?.value;
    const select = document.getElementById('qfTopic');
    if (!subjectId || !select) return;
    const options = leafPickerOptions(subjectId);
    select.innerHTML = options.length
      ? options.map(t => `<option value="${escH(t.id)}" ${t.id === selectedTopicId ? 'selected' : ''}>${escH(t.pickerName)}</option>`).join('')
      : '<option value="">(no topics — add one first)</option>';
  }
  window.refreshTopicSelect = setTopicSelectorOptions;

  const originalImportPreview = window.renderImportPreview;
  const originalTopicsOf = typeof topicsOf === 'function' ? topicsOf : window.topicsOf;
  const leafTopicsForUI = subjectId => leafPickerOptions(subjectId).map(t => ({ ...t, name: t.name }));
  const repaintImportTopicSelect = () => {
    const select = document.getElementById('impDestTopic');
    if (!select || !ImportState?.destSubjectId) return;
    const options = leafPickerOptions(ImportState.destSubjectId);
    select.innerHTML = `<option value="">Select Topic</option>${options.map(t => `<option value="${escH(t.id)}" ${t.id === ImportState.destTopicId ? 'selected' : ''}>${escH(t.pickerName)}</option>`).join('')}`;
  };
  if (typeof originalImportPreview === 'function') {
    window.renderImportPreview = function(...args) {
      let output;
      if (typeof topicsOf === 'function') {
        const prior = topicsOf;
        topicsOf = leafTopicsForUI;
        try { output = originalImportPreview.apply(this, args); } finally { topicsOf = prior; }
      } else output = originalImportPreview.apply(this, args);
      repaintImportTopicSelect();
      return output;
    };
  }
  const originalImportSubjectChange = window.onImportDestSubjectChange;
  if (typeof originalImportSubjectChange === 'function') {
    window.onImportDestSubjectChange = function(...args) {
      const output = originalImportSubjectChange.apply(this, args);
      setTimeout(repaintImportTopicSelect, 0);
      return output;
    };
  }

  const originalExamSetup = window.renderExamSetup;
  if (typeof originalExamSetup === 'function') {
    window.renderExamSetup = function(...args) {
      let output;
      if (typeof topicsOf === 'function') {
        const prior = topicsOf;
        topicsOf = leafTopicsForUI;
        try { output = originalExamSetup.apply(this, args); } finally { topicsOf = prior; }
      } else output = originalExamSetup.apply(this, args);
      const appendExamSubtopics = () => {
        const section = [...document.querySelectorAll('.setup-section')].find(node => node.textContent.includes('Step 3'));
        const row = section?.querySelector('.filter-row');
        const st = typeof ExamSetup !== 'undefined' ? ExamSetup : null;
        if (!row || !st) return;
        const existing = new Set([...row.querySelectorAll('button')].map(button => button.textContent.trim()));
        const subs = [...CACHE.subjects].sort((a, b) => (a.order || 0) - (b.order || 0));
        const selectedSubs = st.subjectIds.length ? st.subjectIds : subs.map(s => s.id);
        const additions = subs.filter(s => selectedSubs.includes(s.id)).flatMap(s => leafPickerOptions(s.id).map(t => ({ ...t, subjectName: s.name }))).filter(t => !existing.has(`${t.subjectName} · ${t.name}`) && !row.querySelector(`[onclick*="${t.id}"]`));
        if (additions.length) row.insertAdjacentHTML('beforeend', additions.map(t => `<button class="choice ${st.topicIds.includes(t.id) ? 'active' : ''}" onclick="toggleSetupTopic('${escH(t.id)}')"><b>${escH(t.subjectName)} · ${escH(t.name)}</b></button>`).join(''));
      };
      requestAnimationFrame(appendExamSubtopics);
      setTimeout(appendExamSubtopics, 40);
      return output;
    };
  }

  const originalCountAvailable = window.countAvailable;
  if (typeof originalCountAvailable === 'function') {
    window.countAvailable = function(...args) {
      const st = typeof ExamSetup !== 'undefined' ? ExamSetup : null;
      if (st?.topicIds?.length) {
        const ids = new Set(st.topicIds.flatMap(descendantIds));
        return CACHE.questions.filter(q => ids.has(q.topicId)).length;
      }
      return originalCountAvailable.apply(this, args);
    };
  }

  const originalBeginExam = window.beginExam;
  if (typeof originalBeginExam === 'function') {
    window.beginExam = async function(...args) {
      const st = typeof ExamSetup !== 'undefined' ? ExamSetup : null;
      const prior = st?.topicIds;
      if (st && Array.isArray(prior) && prior.length) st.topicIds = [...new Set(prior.flatMap(descendantIds))];
      try { return await originalBeginExam.apply(this, args); }
      finally { if (st && prior) st.topicIds = prior; }
    };
  }

  const originalRender = window.render;
  if (typeof originalRender === 'function') {
    window.render = function(...args) {
      const output = originalRender.apply(this, args);
      if (migrationState !== 'done' && CACHE?.subjects?.length) {
        ensureMigration().then(changed => { if (changed) originalRender.apply(this, args); });
      }
      return output;
    };
  }

  let attempts = 0;
  const reconcile = setInterval(() => {
    attempts += 1;
    if (CACHE?.subjects?.length) {
      ensureMigration().then(changed => { if (changed && typeof window.render === 'function') window.render(); });
    }
    if (migrationState === 'done' || attempts > 60) clearInterval(reconcile);
  }, 500);
})();
