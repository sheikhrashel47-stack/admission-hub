(() => {
  'use strict';

  const CHILD_KEY = 'parentTopicId';
  if (!document.getElementById('ah-topic-card-layout-fix')) {
    const style = document.createElement('style');
    style.id = 'ah-topic-card-layout-fix';
    style.textContent = '.q-nav-card-topic{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:8px}.q-nav-card-topic>.row{grid-column:1/-1;margin-top:0 !important;width:100% !important}.ah-settings-page{padding-bottom:24px}.ah-settings-intro{display:flex;flex-direction:column;gap:4px;margin:4px 0 12px;color:var(--text)}.ah-settings-intro span,.ah-settings-subject small,.ah-settings-topic small{color:var(--sub);font-size:12px;line-height:1.4}.ah-settings-toolbar{display:flex;justify-content:flex-end;margin:10px 0}.ah-settings-subject{padding:14px;margin:10px 0}.ah-settings-subject-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.ah-settings-subject-title{display:flex;align-items:center;gap:10px;min-width:0}.ah-settings-subject-title>span{font-size:24px}.ah-settings-subject-title h2{font-size:17px;margin:0 0 2px}.ah-settings-actions{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end}.ah-settings-topic-list{margin-top:12px;border-top:1px solid var(--line);padding-top:4px}.ah-settings-topic{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:10px 0 10px calc(var(--ah-topic-depth, 0) * 18px);border-bottom:1px solid color-mix(in srgb, var(--line) 65%, transparent)}.ah-settings-topic-main{display:flex;align-items:center;gap:8px;min-width:0}.ah-settings-topic-main>div{display:flex;flex-direction:column;min-width:0}.ah-settings-topic-main strong{font-size:14px;overflow-wrap:anywhere}.ah-settings-topic-icon{font-size:18px;flex-shrink:0}.ah-settings-empty{color:var(--sub);font-size:13px;padding:12px 0}@media(max-width:620px){.ah-settings-subject-head{flex-direction:column}.ah-settings-actions{justify-content:flex-start}.ah-settings-topic{align-items:flex-start;flex-direction:column}.ah-settings-topic .ah-settings-actions{padding-left:26px}}';
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
  const topicLeaves = (id, seen = new Set()) => {
    if (seen.has(id)) return [];
    seen.add(id);
    const children = topicChildren(id);
    return children.length ? children.flatMap(child => topicLeaves(child.id, new Set(seen))) : (appCache().topics || []).filter(t => t.id === id);
  };
  const descendantIds = id => topicLeaves(id).map(t => t.id);
  const topicDisplayName = topic => {
    if (!topic) return '';
    const topics = appCache().topics || [];
    const parts = [];
    const seen = new Set();
    let current = topic;
    while (current && !seen.has(current.id)) {
      seen.add(current.id);
      parts.unshift(String(current.name || ''));
      current = current[CHILD_KEY] ? topics.find(t => t.id === current[CHILD_KEY]) : null;
    }
    return parts.join(' · ');
  };
  const topicQuestionCount = id => {
    const ids = new Set(descendantIds(id));
    return (appCache().questions || []).filter(q => ids.has(q.topicId)).length;
  };
  const leafPickerOptions = subjectId => topicRoots(subjectId).flatMap(root => {
    const leaves = topicLeaves(root.id);
    return leaves.map(leaf => ({ ...leaf, pickerName: topicDisplayName(leaf) }));
  });

  async function ensureDirectQuestionsLeaf(parentId) {
    const parent = appCache().topics?.find(t => t.id === parentId);
    if (!parent) return null;
    const directQuestions = (appCache().questions || []).filter(q => q.topicId === parentId);
    if (!directQuestions.length) return null;
    let children = topicChildren(parentId);
    let leaf = children.find(t => String(t.name || '').trim().toLowerCase() === 'general') || null;
    if (!leaf) {
      for (let i = 0; i < children.length; i++) {
        children[i].order = i + 1;
        children[i].updatedAt = Date.now();
        await dbPut('topics', children[i]);
      }
      leaf = { id: uid(), subjectId: parent.subjectId, parentTopicId: parentId, name: 'General', order: 0, createdAt: Date.now(), updatedAt: Date.now() };
      await dbPut('topics', leaf);
    }
    for (const question of directQuestions) {
      await dbPut('questions', { ...question, topicId: leaf.id, updatedAt: Date.now() });
    }
    CACHE.topics = await dbGetAll('topics');
    CACHE.questions = await dbGetAll('questions');
    return leaf;
  }

  window.topicHierarchy = { topicChildren, topicRoots, topicLeaves, descendantIds, topicDisplayName, topicQuestionCount, leafPickerOptions };
  window.topicPickerOptions = leafPickerOptions;

  async function migrateDirectParentQuestions() {
    let changed = false;
    const parents = [...(appCache().topics || [])].filter(topic => topicChildren(topic.id).length);
    for (const parent of parents) {
      const direct = (appCache().questions || []).filter(q => q.topicId === parent.id);
      if (direct.length) {
        await ensureDirectQuestionsLeaf(parent.id);
        changed = true;
      }
    }
    return changed;
  }

  async function migrateMemorizingVocabulary() {
    if (!Array.isArray(appCache().subjects) || !Array.isArray(appCache().topics) || typeof dbPut !== 'function') return false;
    const changedSubjects = new Set();
    const rangePattern = /^Vocabulary\s*\(\s*\d+\s*-\s*\d+\s*\)$/i;
    const subjects = [...CACHE.subjects];
    for (const subject of subjects) {
      const roots = CACHE.topics.filter(t => t.subjectId === subject.id && !t[CHILD_KEY]);
      const vocabularyTopics = roots.filter(t => rangePattern.test(String(t.name || ''))).sort((a, b) => (a.order || 0) - (b.order || 0));
      if (!vocabularyTopics.length) continue;
      let parent = roots.find(t => String(t.name || '').trim().toLowerCase() === 'vocabulary');
      if (!parent) {
        parent = { id: uid(), subjectId: subject.id, name: 'Vocabulary', order: vocabularyTopics[0].order || 0, createdAt: Date.now(), updatedAt: Date.now() };
        await dbPut('topics', parent);
        CACHE.topics.push(parent);
      }
      for (const topic of vocabularyTopics) {
        if (topic.id === parent.id || topic[CHILD_KEY] === parent.id) continue;
        topic[CHILD_KEY] = parent.id;
        topic.updatedAt = Date.now();
        await dbPut('topics', topic);
        changedSubjects.add(subject.id);
      }
    }
    if (!changedSubjects.size) return false;
    CACHE.topics = await dbGetAll('topics');
    CACHE.settings = { ...(CACHE.settings || { id: 'main' }), subtopicMigrationV2: true };
    await dbPut('settings', CACHE.settings);
    return true;
  }

  async function ensureMigration() {
    if (migrationState === 'done') return false;
    if (migrationPromise) return migrationPromise;
    migrationState = 'running';
    migrationPromise = migrateMemorizingVocabulary().then(vocabularyChanged => migrateDirectParentQuestions().then(directQuestionChanged => {
      const changed = vocabularyChanged || directQuestionChanged;
      if (changed || (CACHE.subjects?.length && CACHE.topics?.length)) migrationState = 'done';
      else migrationState = 'idle';
      migrationPromise = null;
      return changed;
    })).catch(error => {
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
    const addSubtopic = `openTopicForm('${escH(subjectId)}',null,'${escH(topic.id)}')`;
    const addQuestion = `navigate('add-question?sub=${escH(subjectId)}&top=${escH(topic.id)}')`;
    return `<article class="q-nav-card q-nav-card-topic" role="button" tabindex="0" onclick="openRedesignedTopic('${escH(topic.id)}')" onkeydown="if(event.key==='Enter')openRedesignedTopic('${escH(topic.id)}')">
      <span class="q-topic-icon" aria-hidden="true">${children.length ? '📂' : '📄'}</span>
      <div class="q-nav-info"><strong>${escH(topic.name)}</strong><span>${childLabel}${count} question${count === 1 ? '' : 's'}</span></div>
      <span class="q-nav-arrow" aria-hidden="true">›</span>
      <div class="row" style="width:100%;margin-top:8px;gap:8px" onclick="event.stopPropagation()">${children.length ? `<button class="btn ghost sm" style="flex:1" onclick="openRedesignedTopic('${escH(topic.id)}')">Open Sub-topics</button>` : `<button class="btn ghost sm" style="flex:1" onclick="${addQuestion}">+ Question</button><button class="btn secondary sm" style="flex:1" onclick="startExamFor([],['${escH(topic.id)}'])">Start Exam</button>`}</div>
    </article>`;
  }

  function renderRootTopicList(subjectId) {
    const subject = CACHE.subjects.find(s => s.id === subjectId);
    if (!subject) { navigate('question-bank'); return; }
    const roots = topicRoots(subjectId);
    const search = String(ExplorerState.query || '').toLowerCase();
    const filtered = roots.filter(t => !search || String(t.name).toLowerCase().includes(search));
    const html = `<div class="q-bank-container"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to subjects" onclick="location.hash='question-bank'">‹</button><div><h1>${escH(subject.name)}</h1><p>${roots.length} Topics · ${CACHE.questions.filter(q => q.subjectId === subjectId).length} Questions</p></div></div><div class="row"><button class="q-header-icon" type="button" aria-label="Search topics" onclick="toggleQSearch()">${window.ICONS?.search || '🔍'}</button><button class="q-header-icon" type="button" aria-label="Add question" onclick="ahAddQuestion()">＋Q</button></div></div><div id="qSearchBox" class="q-search-box ${ExplorerState.query ? '' : 'hide'}"><input type="search" placeholder="Search topics..." value="${escH(ExplorerState.query)}" oninput="ExplorerState.query=this.value;window.renderQuestionBankV2()"></div></header><div class="q-list-body">${filtered.map(t => renderTopicCard(t, subjectId)).join('') || '<div class="empty">No topics found.</div>'}</div></div>`;
    renderShell(html, { title: subject.name, back: "navigate('question-bank')" });
  }

  function settingsTopicRow(topic, subjectId, depth = 0) {
    const children = topicChildren(topic.id);
    const count = topicQuestionCount(topic.id);
    return `<div class="ah-settings-topic" style="--ah-topic-depth:${Math.min(depth, 6)}"><div class="ah-settings-topic-main"><span class="ah-settings-topic-icon">${children.length ? '📂' : '📄'}</span><div><strong>${escH(topic.name)}</strong><small>${count} question${count === 1 ? '' : 's'}${children.length ? ` · ${children.length} sub-topic${children.length === 1 ? '' : 's'}` : ''}</small></div></div><div class="ah-settings-actions"><button class="btn ghost sm" type="button" onclick="ahRenameTopic('${escH(topic.id)}')">Rename</button><button class="btn danger sm" type="button" onclick="ahDeleteTopic('${escH(topic.id)}')">Delete</button><button class="btn secondary sm" type="button" onclick="openTopicForm('${escH(subjectId)}',null,'${escH(topic.id)}')">+ Sub-topic</button></div></div>${children.map(child => settingsTopicRow(child, subjectId, depth + 1)).join('')}`;
  }

  function renderQuestionBankSettings() {
    const subjects = [...(CACHE.subjects || [])].sort((a, b) => (a.order || 0) - (b.order || 0));
    const html = `<div class="q-bank-container ah-settings-page"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to Question Bank" onclick="location.hash='question-bank'">‹</button><div><h1>Question Bank Settings</h1><p>Subject, Topic এবং Sub-topic পরিচালনা করুন</p></div></div><button class="q-header-icon" type="button" aria-label="Close settings" onclick="location.hash='question-bank'">✓</button></div></header><div class="ah-settings-intro card"><strong>Content management</strong><span>Browse page পরিষ্কার রাখা হয়েছে। সব rename, delete এবং নতুন Topic/Sub-topic এখানে পরিচালনা করুন।</span></div><div class="ah-settings-toolbar"><button class="btn" type="button" onclick="ahAddSubject()">+ Add Subject</button></div><div class="ah-settings-subject-list">${subjects.map(subject => { const roots = topicRoots(subject.id); const subjectQuestions = (CACHE.questions || []).filter(q => q.subjectId === subject.id).length; return `<section class="ah-settings-subject card"><div class="ah-settings-subject-head"><div class="ah-settings-subject-title"><span>${escH(subject.icon || '📘')}</span><div><h2>${escH(subject.name)}</h2><small>${subjectQuestions} questions · ${roots.length} top-level topics</small></div></div><div class="ah-settings-actions"><button class="btn ghost sm" type="button" onclick="ahRenameSubject('${escH(subject.id)}')">Rename</button><button class="btn danger sm" type="button" onclick="ahDeleteSubject('${escH(subject.id)}')">Delete</button><button class="btn secondary sm" type="button" onclick="openTopicForm('${escH(subject.id)}',null)">+ Topic</button></div></div><div class="ah-settings-topic-list">${roots.map(topic => settingsTopicRow(topic, subject.id)).join('') || '<div class="ah-settings-empty">No topics yet. Add the first Topic above.</div>'}</div></section>`; }).join('') || '<div class="empty">No subjects yet.</div>'}</div></div>`;
    renderShell(html, { title: 'Question Bank Settings', back: "navigate('question-bank')" });
  }

  window.openQuestionBankSettings = () => { location.hash = 'question-bank/settings'; };

  function renderSubtopicList(parentId) {
    const parent = CACHE.topics.find(t => t.id === parentId);
    const subject = CACHE.subjects.find(s => s.id === parent?.subjectId);
    if (!parent || !subject) { navigate('question-bank'); return; }
    const children = topicChildren(parentId);
    const parentOfParent = parent[CHILD_KEY] ? CACHE.topics.find(t => t.id === parent[CHILD_KEY]) : null;
    const backPath = parentOfParent ? `question-bank/topic/${encodeURIComponent(parentOfParent.id)}` : `question-bank/subject/${encodeURIComponent(subject.id)}`;
    const breadcrumb = topicDisplayName(parent);
    const html = `<div class="q-bank-container"><header class="q-bank-header"><div class="row between"><div class="row"><button class="q-back-btn" type="button" aria-label="Back to parent" onclick="location.hash='${backPath}'">‹</button><div><h1>${escH(parent.name)}</h1><p>${escH(breadcrumb)} · ${children.length} Sub-topics</p></div></div><div class="row"></div></div></header><div class="q-list-body">${children.map(t => renderTopicCard(t, subject.id, true)).join('') || '<div class="empty">No sub-topics yet.</div>'}</div></div>`;
    renderShell(html, { title: parent.name, back: `navigate('${backPath}')` });
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
    await ensureDirectQuestionsLeaf(parentId);
    const order = topicChildren(parentId).length;
    await dbPut('topics', { id: uid(), subjectId, [CHILD_KEY]: parentId, name, order, createdAt: Date.now(), updatedAt: Date.now() });
    CACHE.topics = await dbGetAll('topics');
    CACHE.questions = await dbGetAll('questions');
    closeModal(); toast('Sub-topic saved'); render();
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
      const currentRoute = String(location.hash.slice(1) || window.Router?.path || '');
      if (currentRoute === 'question-bank/settings') {
        renderQuestionBankSettings();
        if (migrationState !== 'done' && CACHE?.subjects?.length) ensureMigration().then(changed => { if (changed) renderQuestionBankSettings(); });
        return;
      }
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
