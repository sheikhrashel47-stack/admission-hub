(() => {
  'use strict';

  const V = window.VocabularyUpgrade = window.VocabularyUpgrade || {};
  const KEY = 'admission_hub_vocab_categories_v2';
  const uid = () => `vocab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const esc = (value) => { const node = document.createElement('div'); node.textContent = String(value ?? ''); return node.innerHTML; };
  const text = (value) => String(value ?? '').trim();
  const lower = (value) => text(value).toLocaleLowerCase();
  const asArray = (value) => Array.isArray(value) ? value : String(value ?? '').split(/[,;\n]/).map(text).filter(Boolean);
  const timestamp = () => Date.now();
  const statusOrder = ['new', 'learning', 'practicing', 'familiar', 'mastered'];
  const categories = [
    { id: 'common-admission', name: 'Common Admission', description: 'Core high-frequency words for every admission candidate.', color: 'emerald' },
    { id: 'university-admission', name: 'University Admission', description: 'Words commonly seen in university entrance reading and reasoning.', color: 'indigo' },
    { id: 'frequently-tested', name: 'Frequently Tested', description: 'Repeatedly tested words for fast revision.', color: 'coral' },
    { id: 'high-priority', name: 'High Priority', description: 'Important words selected for focused preparation.', color: 'red' },
    { id: 'bcs', name: 'BCS', description: 'Competitive-exam vocabulary with higher precision.', color: 'gold' },
    { id: 'advanced', name: 'Advanced', description: 'Challenging words for ambitious learners.', color: 'slate' },
    { id: 'literature', name: 'Literature', description: 'Words drawn from literary reading and expression.', color: 'plum' }
  ];
  const parserState = { input: '', preview: [], selected: new Set(), errors: [], category: 'common-admission' };
  const viewState = { search: '', category: 'all', status: 'all', bookmarked: false, expanded: new Set() };

  function categoryList() {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (Array.isArray(stored) && stored.length) return stored;
    } catch (_) {}
    try { localStorage.setItem(KEY, JSON.stringify(categories)); } catch (_) {}
    return categories.slice();
  }
  function saveCategories(list) { try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (_) {} }
  function allRecords() { return Array.isArray(window.CACHE?.vocabulary) ? window.CACHE.vocabulary : []; }
  function getCategory(id) { return categoryList().find((item) => item.id === id) || categoryList()[0]; }
  function pair(value) {
    if (value && typeof value === 'object') return { word: text(value.word || value.term), meaning: text(value.meaning || value.bengaliMeaning) };
    const raw = text(value); const parts = raw.split(/\s+[—–-]\s+/);
    return { word: text(parts[0]), meaning: text(parts.slice(1).join(' — ')) };
  }
  function normalize(record) {
    const source = record || {};
    const normalized = {
      id: source.id || uid(), word: text(source.word), banglaMeaning: text(source.banglaMeaning || source.bengaliMeaning || source.meaning),
      partsOfSpeech: text(source.partsOfSpeech || source.partOfSpeech), pronunciation: { bengali: text(source.pronunciation?.bengali), english: text(source.pronunciation?.english || source.pronunciation || source.phonetic) },
      synonyms: asArray(source.synonyms).map(pair).filter((item) => item.word), antonyms: asArray(source.antonyms).map(pair).filter((item) => item.word), explanation: text(source.explanation || source.definition),
      status: statusOrder.includes(lower(source.status)) ? lower(source.status) : 'new', accuracy: Number(source.accuracy || 0), mistakes: Number(source.mistakes ?? source.wrongAttempts ?? 0), attempts: Number(source.attempts ?? ((source.correctAttempts || 0) + (source.wrongAttempts || 0))), correctAttempts: Number(source.correctAttempts || 0),
      bookmarked: Boolean(source.bookmarked ?? source.bookmark), category: text(source.category || source.categoryName) || 'Common Admission', categoryId: text(source.categoryId), categoryIds: Array.isArray(source.categoryIds) ? source.categoryIds.slice() : [],
      createdAt: source.createdAt || timestamp(), lastReviewed: source.lastReviewed || source.lastPracticed || null, interval: Number(source.interval || 0), easeFactor: Number(source.easeFactor || 2.5), repetitions: Number(source.repetitions || 0), consecutiveCorrect: Number(source.consecutiveCorrect || source.streak || 0),
      // Legacy aliases are kept so other existing vocabulary views remain readable.
      bengaliMeaning: text(source.banglaMeaning || source.bengaliMeaning || source.meaning), meaning: text(source.banglaMeaning || source.bengaliMeaning || source.meaning), partOfSpeech: text(source.partsOfSpeech || source.partOfSpeech), pronunciationLegacy: text(source.pronunciation || source.phonetic), bookmark: Boolean(source.bookmarked ?? source.bookmark), wrongAttempts: Number(source.wrongAttempts ?? source.mistakes ?? 0), mistake: Boolean(source.mistake)
    };
    if (!normalized.categoryId) {
      const match = categoryList().find((item) => lower(item.name) === lower(normalized.category));
      normalized.categoryId = match?.id || 'common-admission';
    }
    if (!normalized.categoryIds.includes(normalized.categoryId)) normalized.categoryIds.push(normalized.categoryId);
    return normalized;
  }
  async function refresh() { if (typeof dbGetAll === 'function') CACHE.vocabulary = await dbGetAll('vocabulary'); return allRecords().map(normalize); }
  async function migrate() { const source = allRecords().slice(); for (const record of source) { const normalized = normalize(record); if (typeof dbPut === 'function') await dbPut('vocabulary', normalized); } await refresh(); }
  async function put(record) { const value = normalize(record); value.updatedAt = timestamp(); await dbPut('vocabulary', value); await refresh(); return value; }
  async function remove(id) { await dbDel('vocabulary', id); await refresh(); }

  class VocabularyParser {
    parseBatch(input) {
      return text(input).split(/\n\s*---\s*\n|^\s*---\s*$\s*/m).map((part) => part.trim()).filter(Boolean).map((part, index) => this.parse(part, index));
    }
    field(input, label) { const match = input.match(new RegExp(`^${label}\\s*(.*)$`, 'mi')); return match ? text(match[1]) : ''; }
    section(input, start, stops) {
      const lines = String(input || '').split(/\r?\n/); const wanted = lower(start); const stopSet = new Set(stops.map((item) => lower(item))); const begin = lines.findIndex((line) => lower(line) === wanted); if (begin < 0) return ''; const body = []; for (let index = begin + 1; index < lines.length; index += 1) { const current = lower(lines[index]); if (stopSet.has(current) || [...stopSet].some((stop) => current.startsWith(stop))) break; body.push(lines[index]); } return body.join('\n').trim();
    }
    list(input, label, stops) {
      const section = this.section(input, label, stops); if (!section) return [];
      return section.split(/\r?\n/).map((line) => line.trim()).filter(Boolean).map((line) => line.replace(/^\d+[.)]\s*/, '')).map((line) => pair(line)).filter((item) => item.word);
    }
    parse(input, index) {
      const pronunciationSection = this.section(input, 'উচ্চারণ:', ['Synonym:']);
      const bengali = this.field(pronunciationSection, 'বাংলা:'); const english = this.field(pronunciationSection, 'English:');
      const parsed = { _sourceIndex: index, word: this.field(input, 'Word:'), banglaMeaning: this.field(input, 'Bangla Meaning:'), partsOfSpeech: this.field(input, 'Parts of Speech:'), pronunciation: { bengali, english }, synonyms: this.list(input, 'Synonym:', ['Antonym:', 'Explain:']), antonyms: this.list(input, 'Antonym:', ['Explain:']), explanation: this.field(input, 'Explain:') };
      const validation = this.validate(parsed); return { ...parsed, errors: validation.errors, valid: validation.valid, selected: validation.valid };
    }
    validate(item) {
      const errors = []; if (!item.word) errors.push('Word is required.'); if (!item.banglaMeaning) errors.push('Bangla Meaning is required.'); if (!item.partsOfSpeech) errors.push('Parts of Speech is required.'); if (!item.pronunciation.english) errors.push('English pronunciation is required.'); if (!item.synonyms.length) errors.push('At least one synonym is required.'); if (!item.antonyms.length) errors.push('At least one antonym is required.'); if (!item.explanation) errors.push('Explanation is required.'); return { valid: !errors.length, errors };
    }
  }
  const parser = new VocabularyParser();

  function baseRecord(item, categoryId) { const category = getCategory(categoryId); return normalize({ ...item, id: uid(), categoryId, category: category.name, status: 'new', accuracy: 0, mistakes: 0, attempts: 0, correctAttempts: 0, bookmarked: false, createdAt: timestamp(), lastReviewed: null, interval: 0, easeFactor: 2.5, repetitions: 0, consecutiveCorrect: 0 }); }
  function mergeRecords(existing, incoming, mode) {
    const left = normalize(existing); const right = normalize(incoming); if (mode === 'replace') return normalize({ ...right, id: left.id, createdAt: left.createdAt, status: left.status, accuracy: left.accuracy, mistakes: left.mistakes, attempts: left.attempts, correctAttempts: left.correctAttempts, bookmarked: left.bookmarked, lastReviewed: left.lastReviewed, interval: left.interval, easeFactor: left.easeFactor, repetitions: left.repetitions, consecutiveCorrect: left.consecutiveCorrect });
    const combine = (a, b) => { const seen = new Set(); return [...a, ...b].map(pair).filter((item) => item.word && !seen.has(lower(item.word)) && seen.add(lower(item.word))); };
    const explanation = right.explanation.length > left.explanation.length ? right.explanation : left.explanation;
    return normalize({ ...left, banglaMeaning: right.banglaMeaning || left.banglaMeaning, partsOfSpeech: right.partsOfSpeech || left.partsOfSpeech, pronunciation: { bengali: right.pronunciation.bengali || left.pronunciation.bengali, english: right.pronunciation.english || left.pronunciation.english }, synonyms: combine(left.synonyms, right.synonyms), antonyms: combine(left.antonyms, right.antonyms), explanation, categoryId: right.categoryId || left.categoryId, category: right.category || left.category });
  }
  function duplicate(word) { return allRecords().map(normalize).find((record) => lower(record.word) === lower(word)); }

  function openDialog(html) { if (typeof openModal === 'function') openModal(html); else { const root = document.getElementById('modalRoot'); if (root) root.innerHTML = `<div class="modal-bg"><div class="modal">${html}</div></div>`; } }
  function closeDialog() { if (typeof closeModal === 'function') closeModal(); else { const root = document.getElementById('modalRoot'); if (root) root.innerHTML = ''; } }
  function notify(message) { if (typeof toast === 'function') toast(message); }
  function shell(content, title = 'Vocabulary Master') { renderShell(`<div class="vu2-page">${content}</div>`, { title, back: "navigate('dashboard')" }); const back = document.querySelector('#app .backbtn'); if (back && title !== 'Vocabulary Master') { back.onclick = () => navigate('vocabulary'); } }

  function statusLabel(status) { return String(status).toUpperCase(); }
  function progress(record) { return Math.max(0, Math.min(100, Math.round(record.accuracy || 0))); }
  function updateStatus(record, correct) {
    const item = normalize(record); item.attempts += 1; item.lastReviewed = timestamp();
    if (correct) { item.correctAttempts += 1; item.consecutiveCorrect += 1; item.repetitions += 1; item.interval = Math.max(1, Math.round((item.interval || 1) * item.easeFactor)); item.accuracy = Math.round(item.correctAttempts / item.attempts * 100); if (item.consecutiveCorrect >= 10) item.status = 'mastered'; else if (item.consecutiveCorrect >= 5) item.status = 'familiar'; else if (item.consecutiveCorrect >= 3) item.status = 'practicing'; else item.status = 'learning'; }
    else { item.mistakes += 1; item.wrongAttempts = item.mistakes; item.consecutiveCorrect = 0; item.repetitions = 0; item.interval = 0; item.easeFactor = Math.max(1.3, item.easeFactor - 0.2); item.accuracy = Math.round(item.correctAttempts / item.attempts * 100); item.status = item.status === 'mastered' ? 'familiar' : item.attempts ? 'learning' : 'new'; item.mistake = true; }
    return item;
  }

  function chipList(items, kind) { return items.length ? `<div class="vu2-chips ${kind}">${items.map((item) => `<span><b>${esc(item.word)}</b>${item.meaning ? `<small>${esc(item.meaning)}</small>` : ''}</span>`).join('')}</div>` : '<span class="vu2-empty-inline">None added</span>'; }
  function card(record, compact = false) {
    const v = normalize(record); const category = getCategory(v.categoryId); const expanded = viewState.expanded.has(v.id); return `<article class="vu2-card ${expanded ? 'is-expanded' : ''}" data-id="${esc(v.id)}"><header><span class="vu2-category ${category.color}">${esc(category.name)}</span><div class="vu2-actions"><button aria-label="Toggle bookmark" onclick="event.stopPropagation();VocabularyUpgrade.toggleBookmark('${v.id}')">${v.bookmarked ? '★' : '☆'}</button><button aria-label="Edit word" onclick="event.stopPropagation();VocabularyUpgrade.edit('${v.id}')">✎</button><button aria-label="Delete word" onclick="event.stopPropagation();VocabularyUpgrade.confirmDelete('${v.id}')">⌫</button></div></header><div class="vu2-word-row" onclick="VocabularyUpgrade.toggleExpanded('${v.id}')"><div><h3>${esc(v.word)}</h3><div class="vu2-pron">${esc(v.pronunciation.bengali || '—')} <span>·</span> ${esc(v.pronunciation.english || '—')}</div></div><span class="vu2-chevron">${expanded ? '⌃' : '⌄'}</span></div><div class="vu2-meta"><span>${esc(v.partsOfSpeech || '—')}</span><strong>${esc(v.banglaMeaning || 'অর্থ যোগ করা হয়নি')}</strong></div><section><label>Synonyms</label>${chipList(v.synonyms, 'positive')}</section><section><label>Antonyms</label>${chipList(v.antonyms, 'negative')}</section><div class="vu2-explanation">${esc(v.explanation || 'No explanation added.')}</div><footer><span class="vu2-status ${v.status}">${statusLabel(v.status)}</span><span>${progress(v)}% accuracy · ${v.attempts} attempts</span><div class="vu2-progress"><i style="width:${progress(v)}%"></i></div></footer>${expanded ? `<div class="vu2-detail"><p><b>Category:</b> ${esc(category.name)}</p><p><b>Correct attempts:</b> ${v.correctAttempts} &nbsp; <b>Mistakes:</b> ${v.mistakes}</p><p><b>Review interval:</b> ${v.interval || 0} day(s) &nbsp; <b>Ease:</b> ${v.easeFactor.toFixed(1)}</p></div>` : ''}</article>`;
  }

  function filteredRecords() { let list = allRecords().map(normalize); const query = lower(viewState.search); if (query) list = list.filter((v) => [v.word, v.banglaMeaning, v.partsOfSpeech, v.explanation, v.category, ...v.synonyms.map((x) => x.word), ...v.antonyms.map((x) => x.word)].join(' ').toLocaleLowerCase().includes(query)); if (viewState.category !== 'all') list = list.filter((v) => v.categoryId === viewState.category || v.categoryIds.includes(viewState.category)); if (viewState.status !== 'all') list = list.filter((v) => v.status === viewState.status); if (viewState.bookmarked) list = list.filter((v) => v.bookmarked); return list.sort((a, b) => a.word.localeCompare(b.word)); }

  function dashboard() { const list = allRecords().map(normalize); const avg = list.length ? Math.round(list.reduce((sum, v) => sum + progress(v), 0) / list.length) : 0; shell(`<section class="vu2-hero"><div><small>ADMISSION HUB · PHASE 1</small><h1>Vocabulary Master</h1><p>Build admission-ready word power with a real, persistent learning library.</p><div class="vu2-hero-buttons"><button onclick="navigate('vocabulary/library')">Open library</button><button class="secondary" onclick="navigate('vocabulary/parser')">Import vocabulary</button></div></div><div class="vu2-hero-score"><b>${avg}%</b><span>average accuracy</span></div></section><section class="vu2-stats"><div><b>${list.length}</b><span>Total words</span></div>${statusOrder.map((status) => `<div><b>${list.filter((v) => v.status === status).length}</b><span>${statusLabel(status)}</span></div>`).join('')}</section><section class="vu2-section-head"><div><small>ORGANIZE YOUR LIBRARY</small><h2>Categories</h2></div><button class="link" onclick="navigate('vocabulary/categories')">Manage categories →</button></section><div class="vu2-category-grid">${categoryList().map((category) => { const count = list.filter((v) => v.categoryId === category.id || v.categoryIds.includes(category.id)).length; return `<button class="vu2-category-tile ${category.color}" onclick="VocabularyUpgrade.selectCategory('${category.id}')"><b>${esc(category.name)}</b><span>${count} words</span></button>`; }).join('')}</div><div class="vu2-main-actions"><button onclick="navigate('vocabulary/library')">Browse all words</button><button onclick="VocabularyUpgrade.toggleBookmarkedView()">Bookmarked words</button><button onclick="VocabularyUpgrade.showStatus('new')">New words</button><button onclick="navigate('vocabulary/parser')">Parser and batch import</button></div></section>`); }

  function library() { const list = filteredRecords(); shell(`<section class="vu2-subhero"><small>VOCABULARY DATABASE</small><h1>Library</h1><p>One source of truth for every word, its meaning, and its learning progress.</p></section><section class="vu2-toolbar"><input aria-label="Search vocabulary" value="${esc(viewState.search)}" placeholder="Search word, meaning, synonym…" oninput="VocabularyUpgrade.setSearch(this.value)"><select aria-label="Filter category" onchange="VocabularyUpgrade.setCategory(this.value)"><option value="all">All categories</option>${categoryList().map((c) => `<option value="${c.id}" ${viewState.category === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select><select aria-label="Filter status" onchange="VocabularyUpgrade.setStatus(this.value)"><option value="all">All statuses</option>${statusOrder.map((s) => `<option value="${s}" ${viewState.status === s ? 'selected' : ''}>${statusLabel(s)}</option>`).join('')}</select><button class="vu2-filter-button ${viewState.bookmarked ? 'active' : ''}" onclick="VocabularyUpgrade.toggleBookmarkedView()">★</button></section><div class="vu2-list-head"><b>${list.length} word${list.length === 1 ? '' : 's'}</b><button class="link" onclick="navigate('vocabulary/parser')">+ Import</button></div><div class="vu2-card-grid">${list.length ? list.map((v) => card(v)).join('') : `<div class="vu2-empty"><h3>No vocabulary found</h3><p>Adjust the filters or import a batch of words using the supported markers.</p><button onclick="navigate('vocabulary/parser')">Open parser</button></div>`}</div>`, 'Vocabulary Library'); }

  function categoriesPage() { const list = allRecords().map(normalize); shell(`<section class="vu2-subhero"><small>ORGANIZE YOUR WORDS</small><h1>Categories</h1><p>Choose a predefined collection or create a custom category. Categories are stored as vocabulary metadata.</p></section><div class="vu2-category-grid large">${categoryList().map((c) => `<button class="vu2-category-panel ${c.color}" onclick="VocabularyUpgrade.selectCategory('${c.id}')"><b>${esc(c.name)}</b><span>${list.filter((v) => v.categoryId === c.id || v.categoryIds.includes(c.id)).length} words</span><small>${esc(c.description || '')}</small></button>`).join('')}</div><button class="vu2-wide secondary" onclick="VocabularyUpgrade.addCategory()">+ Add custom category</button>`,'Vocabulary Categories'); }

  function parserPage() { const valid = parserState.preview.filter((x) => x.valid); shell(`<section class="vu2-subhero"><small>PART 2 · BATCH PARSER</small><h1>Vocabulary Parser</h1><p>Paste one or more records. Separate records with a line containing <code>---</code>.</p></section><section class="vu2-parser-box"><textarea id="vu2-parser-input" rows="16" placeholder="Word: ABATE\n\nBangla Meaning: কমানো / প্রশমিত হওয়া\n\nParts of Speech: Verb\n\nউচ্চারণ:\nবাংলা: অ্যাবেট\nEnglish: /əˈbeɪt/\n\nSynonym:\n1. Diminish — কমানো\n\nAntonym:\n1. Intensify — তীব্র করা\n\nExplain: ...\n\n---">${esc(parserState.input)}</textarea><div class="vu2-parser-actions"><button onclick="VocabularyUpgrade.parse()">Parse batch</button><button class="secondary" onclick="VocabularyUpgrade.clearParser()">Clear</button></div>${parserState.errors.length ? `<div class="vu2-errors">${parserState.errors.map((e) => `<p>${esc(e)}</p>`).join('')}</div>` : ''}</section>${valid.length ? previewPage() : ''}`,'Vocabulary Parser'); }
  function previewPage() { const items = parserState.preview; return `<section class="vu2-preview"><div class="vu2-section-head"><div><small>PART 3 · PREVIEW</small><h2>${items.length} parsed item${items.length === 1 ? '' : 's'}</h2></div><label><input type="checkbox" ${items.filter((x) => x.valid).every((x) => parserState.selected.has(x._sourceIndex)) ? 'checked' : ''} onchange="VocabularyUpgrade.selectAll(this.checked)"> Select all valid</label></div><div class="vu2-bulk"><button onclick="VocabularyUpgrade.selectAll(true)">Select All</button><button onclick="VocabularyUpgrade.importSelected()">Import Selected</button><button onclick="VocabularyUpgrade.importAll()">Import All</button></div>${items.map((item) => `<article class="vu2-preview-card ${item.valid ? 'valid' : 'invalid'}"><label><input type="checkbox" ${parserState.selected.has(item._sourceIndex) ? 'checked' : ''} ${item.valid ? '' : 'disabled'} onchange="VocabularyUpgrade.togglePreview(${item._sourceIndex},this.checked)"><strong>${esc(item.word || 'Untitled item')}</strong></label><span class="vu2-preview-status">${item.valid ? 'Ready to import' : item.errors.join(' ')}</span><button class="link" onclick="VocabularyUpgrade.editPreview(${item._sourceIndex})">Edit</button><button class="link danger-link" onclick="VocabularyUpgrade.deletePreview(${item._sourceIndex})">Delete</button><details><summary>View full details</summary><p><b>Bangla meaning:</b> ${esc(item.banglaMeaning)}</p><p><b>Parts of speech:</b> ${esc(item.partsOfSpeech)}</p><p><b>Pronunciation:</b> ${esc(item.pronunciation.bengali)} · ${esc(item.pronunciation.english)}</p><p><b>Synonyms:</b> ${esc(item.synonyms.map((x) => `${x.word}${x.meaning ? ` — ${x.meaning}` : ''}`).join(', '))}</p><p><b>Antonyms:</b> ${esc(item.antonyms.map((x) => `${x.word}${x.meaning ? ` — ${x.meaning}` : ''}`).join(', '))}</p><p><b>Explain:</b> ${esc(item.explanation)}</p></details></article>`).join('')}</section>`; }

  function editPreview(index) { const item = parserState.preview.find((x) => x._sourceIndex === index); if (!item) return; openEditor(item, true); }
  function deletePreview(index) { parserState.preview = parserState.preview.filter((x) => x._sourceIndex !== index); parserState.selected.delete(index); parserPage(); }
  function selectAll(checked) { parserState.selected = new Set(parserState.preview.filter((x) => x.valid && checked).map((x) => x._sourceIndex)); parserPage(); }
  function togglePreview(index, checked) { checked ? parserState.selected.add(index) : parserState.selected.delete(index); parserPage(); }

  async function importItems(items) { const selected = items.filter((x) => x.valid); if (!selected.length) return notify('No valid vocabulary selected.'); for (const item of selected) { const incoming = baseRecord(item, parserState.category); const existing = duplicate(incoming.word); if (!existing) await put(incoming); else await resolveDuplicate(existing, incoming); } parserState.preview = []; parserState.selected.clear(); notify('Vocabulary imported successfully.'); navigate('vocabulary/library'); }
  function resolveDuplicate(existing, incoming) { return new Promise((resolve) => { const e = normalize(existing), i = normalize(incoming); openDialog(`<h3>Duplicate word detected: ${esc(e.word)}</h3><p class="muted">This word already has ${e.attempts} attempt(s) and ${e.accuracy}% accuracy. Choose how to import the new data.</p><div class="vu2-duplicate-preview"><div><b>Existing</b><span>${esc(e.banglaMeaning)}</span></div><div><b>Incoming</b><span>${esc(i.banglaMeaning)}</span></div></div><div class="vu2-modal-actions"><button class="secondary" id="vu2-skip">Skip</button><button class="secondary" id="vu2-replace">Replace</button><button id="vu2-merge">Merge</button></div>`); document.getElementById('vu2-skip').onclick = () => { closeDialog(); resolve(); }; document.getElementById('vu2-replace').onclick = async () => { await put(mergeRecords(e, i, 'replace')); closeDialog(); resolve(); }; document.getElementById('vu2-merge').onclick = async () => { await put(mergeRecords(e, i, 'merge')); closeDialog(); resolve(); }; }); }
  function importSelected() { importItems(parserState.preview.filter((x) => parserState.selected.has(x._sourceIndex))); }
  function importAll() { importItems(parserState.preview); }

  function field(label, id, value, textarea = false) { return `<label class="vu2-field"><span>${label}</span>${textarea ? `<textarea id="${id}" rows="4">${esc(value)}</textarea>` : `<input id="${id}" value="${esc(value)}">`}</label>`; }
  function openEditor(record, isPreview = false) { const v = normalize(record); openDialog(`<h3>${isPreview ? 'Edit parsed vocabulary' : `Edit ${esc(v.word)}`}</h3><div class="vu2-editor">${field('Word','vu2-word',v.word)}${field('Bangla Meaning','vu2-meaning',v.banglaMeaning)}${field('Parts of Speech','vu2-pos',v.partsOfSpeech)}${field('Bengali pronunciation','vu2-pron-bn',v.pronunciation.bengali)}${field('English pronunciation / IPA','vu2-pron-en',v.pronunciation.english)}${field('Synonyms (one per line; use Word — বাংলা অর্থ)','vu2-synonyms',v.synonyms.map((x) => `${x.word}${x.meaning ? ` — ${x.meaning}` : ''}`).join('\n'),true)}${field('Antonyms (one per line; use Word — বাংলা অর্থ)','vu2-antonyms',v.antonyms.map((x) => `${x.word}${x.meaning ? ` — ${x.meaning}` : ''}`).join('\n'),true)}${field('Explanation','vu2-explanation',v.explanation,true)}<label class="vu2-field"><span>Category</span><select id="vu2-category">${categoryList().map((c) => `<option value="${c.id}" ${c.id === v.categoryId ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label></div><div class="vu2-modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button onclick="VocabularyUpgrade.saveEditor('${esc(v.id)}',${isPreview})">Save changes</button></div>`); }
  function valuesFromEditor() { const read = (id) => document.getElementById(id)?.value || ''; return { word: read('vu2-word'), banglaMeaning: read('vu2-meaning'), partsOfSpeech: read('vu2-pos'), pronunciation: { bengali: read('vu2-pron-bn'), english: read('vu2-pron-en') }, synonyms: asArray(read('vu2-synonyms')).map(pair), antonyms: asArray(read('vu2-antonyms')).map(pair), explanation: read('vu2-explanation'), categoryId: read('vu2-category') }; }
  async function saveEditor(id, isPreview) { const data = valuesFromEditor(); if (!data.word || !data.banglaMeaning || !data.partsOfSpeech || !data.explanation) return notify('Please complete the required fields.'); if (isPreview) { const item = parserState.preview.find((x) => x._sourceIndex === Number(id)); if (item) { Object.assign(item, data); const validation = parser.validate(item); item.errors = validation.errors; item.valid = validation.valid; if (item.valid) parserState.selected.add(item._sourceIndex); else parserState.selected.delete(item._sourceIndex); } closeDialog(); parserPage(); return; } const existing = allRecords().find((x) => x.id === id); if (existing) await put({ ...existing, ...data, category: getCategory(data.categoryId).name }); closeDialog(); library(); }

  function edit(id) { const item = allRecords().find((x) => x.id === id); if (item) openEditor(item, false); }
  function toggleExpanded(id) { viewState.expanded.has(id) ? viewState.expanded.delete(id) : viewState.expanded.add(id); library(); }
  async function toggleBookmark(id) { const item = allRecords().find((x) => x.id === id); if (!item) return; await put({ ...item, bookmarked: !normalize(item).bookmarked }); library(); }
  function confirmDelete(id) { const item = normalize(allRecords().find((x) => x.id === id)); if (!item) return; openDialog(`<h3>Delete ${esc(item.word)}?</h3><p class="muted">This removes the word and its stored progress: ${item.attempts} attempts, ${item.correctAttempts} correct answers, and ${item.accuracy}% accuracy. This cannot be undone.</p><div class="vu2-modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button class="danger-button" onclick="VocabularyUpgrade.deleteWord('${id}')">Delete word</button></div>`); }
  async function deleteWord(id) { await remove(id); closeDialog(); notify('Vocabulary deleted.'); library(); }

  function parseInput() { const value = document.getElementById('vu2-parser-input')?.value || ''; parserState.input = value; parserState.preview = parser.parseBatch(value); parserState.errors = value.trim() ? [] : ['Paste at least one vocabulary record.']; parserState.selected = new Set(parserState.preview.filter((x) => x.valid).map((x) => x._sourceIndex)); parserPage(); }
  function clearParser() { parserState.input = ''; parserState.preview = []; parserState.selected.clear(); parserState.errors = []; parserPage(); }
  function selectCategory(id) { viewState.category = id; viewState.status = 'all'; viewState.bookmarked = false; navigate('vocabulary/library'); }
  function toggleBookmarkedView() { viewState.bookmarked = !viewState.bookmarked; navigate('vocabulary/library'); }
  function showStatus(status) { viewState.status = status; viewState.bookmarked = false; navigate('vocabulary/library'); }
  function addCategory() { openDialog(`<h3>Add custom category</h3>${field('Category name','vu2-new-category','')}${field('Description','vu2-new-category-description','',true)}<div class="vu2-modal-actions"><button class="secondary" onclick="closeModal()">Cancel</button><button onclick="VocabularyUpgrade.saveCategory()">Create category</button></div>`); }
  function saveCategory() { const name = text(document.getElementById('vu2-new-category')?.value); const description = text(document.getElementById('vu2-new-category-description')?.value); if (!name) return notify('Category name is required.'); const list = categoryList(); const id = `custom-${lower(name).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}-${Date.now()}`; list.push({ id, name, description, color: 'custom' }); saveCategories(list); closeDialog(); categoriesPage(); }
  function setSearch(value) { viewState.search = value; library(); }
  function setCategory(value) { viewState.category = value; library(); }
  function setStatus(value) { viewState.status = value; library(); }

  function init() { const original = window.render; if (!original || original.__vocabUpgradeV2) return; const wrapped = function () { const path = String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard'); if (path === 'vocabulary' || path === 'vocabulary/dashboard') return dashboard(); if (path === 'vocabulary/library') return library(); if (path === 'vocabulary/parser') return parserPage(); if (path === 'vocabulary/categories' || path === 'vocabulary/categories/manage' || path === 'vocabulary/manage') return categoriesPage(); if (path.startsWith('vocabulary/category/')) { viewState.category = path.split('/').pop(); return library(); } if (path === 'vocabulary/bookmarked') { viewState.bookmarked = true; return library(); } if (path.startsWith('vocabulary/')) return library(); return original.apply(this, arguments); }; wrapped.__vocabUpgradeV2 = true; window.render = wrapped; window.addEventListener('load', () => refresh().catch(() => {})); }

  Object.assign(V, { parser, parse: parseInput, clearParser, editPreview, deletePreview, selectAll, togglePreview, importSelected, importAll, edit, saveEditor, toggleExpanded, toggleBookmark, bookmark: toggleBookmark, confirmDelete, deleteWord, selectCategory, toggleBookmarkedView, showStatus, addCategory, saveCategory, setSearch, setCategory, setStatus, updateStatus });
  window.VocabularyMaster = window.VocabularyMaster || {};
  window.VocabularyMaster.toggleBookmark = toggleBookmark;
  window.VocabularyMaster.detail = (id) => { viewState.expanded.add(id); navigate('vocabulary/library'); };
  window.VocabularyMaster.markLearned = async (id) => { const item = allRecords().find((x) => x.id === id); if (item) await put(updateStatus(item, true)); library(); };
  window.VocabularyMaster.markMistake = async (id) => { const item = allRecords().find((x) => x.id === id); if (item) await put(updateStatus(item, false)); library(); };
  function routeFromHash() { const path = String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard'); if (path === 'vocabulary' || path === 'vocabulary/dashboard') return dashboard(); if (path === 'vocabulary/library') return library(); if (path === 'vocabulary/parser') return parserPage(); if (path === 'vocabulary/categories' || path === 'vocabulary/categories/manage' || path === 'vocabulary/manage') return categoriesPage(); if (path.startsWith('vocabulary/category/')) { viewState.category = path.split('/').pop(); return library(); } if (path === 'vocabulary/bookmarked') { viewState.bookmarked = true; return library(); } if (path.startsWith('vocabulary/')) return library(); return null; }
  window.addEventListener('hashchange', () => { if (location.hash.replace(/^#\/?/, '').startsWith('vocabulary')) setTimeout(routeFromHash, 0); });
  init();
  setTimeout(async () => { init(); try { await refresh(); await migrate(); } catch (_) {} if (location.hash.replace(/^#\/?/, '').startsWith('vocabulary')) routeFromHash(); }, 30);
})();
