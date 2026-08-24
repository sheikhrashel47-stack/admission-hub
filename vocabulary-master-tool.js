/*
 * Vocabulary Master — native Admission Hub tool.
 * Design reminder: keep this an intentionally calm, mobile-first academic tool.
 * It owns structured vocabulary only; it delegates tests, history, progress and rewards to Admission Hub.
 */
(() => {
  'use strict';

  const ROUTE = 'vocabulary-master';
  const STORE = 'vocabularyMaster';
  const EXAM_SUBJECT_NAME = 'Vocabulary Master';
  const EXAM_TOPIC_NAME = 'Vocabulary Test Bank';
  const state = {
    records: [],
    category: '',
    query: '',
    visible: 36,
    parser: { text: '', records: [], stage: 'input' },
    practice: null,
    test: { category: '', selectedIds: [], count: 10, duration: 10, negative: 0 },
  };

  const css = `
/* Vocabulary Master visual language: Admission Hub emerald academic, content-led, no decorative dashboard noise. */
.vm-page{max-width:560px;margin:0 auto;padding-bottom:4px}.vm-kicker{margin:2px 0 4px;color:var(--emerald);font-size:11px;font-weight:800;letter-spacing:.1em}.vm-title{margin:0;font-size:26px;line-height:1.18;letter-spacing:-.6px}.vm-sub{margin:7px 0 0;color:var(--sub);font-size:13px;line-height:1.5}.vm-actions{display:grid;gap:9px;margin-top:22px}.vm-action{display:flex;align-items:center;gap:13px;width:100%;padding:15px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--text);text-align:left;box-shadow:var(--shadow);cursor:pointer}.vm-action:active{transform:scale(.985)}.vm-action-mark{display:grid;place-items:center;width:39px;height:39px;border-radius:12px;background:var(--mint);font-size:20px;flex:0 0 39px}.vm-action b{display:block;font-size:15px}.vm-action small{display:block;margin-top:3px;color:var(--sub);font-size:11px;line-height:1.4}.vm-action-arrow{margin-left:auto;color:var(--sub);font-size:22px}.vm-section-head{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;margin:0 0 13px}.vm-section-head h2{margin:0;font-size:21px;letter-spacing:-.35px}.vm-count{color:var(--sub);font-size:12px;white-space:nowrap}.vm-az-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px}.vm-letter{min-height:82px;padding:11px 7px;border:1px solid var(--line);border-radius:13px;background:var(--card);color:var(--text);box-shadow:var(--shadow);font:inherit;cursor:pointer}.vm-letter:active{transform:scale(.97)}.vm-letter b{display:block;color:var(--emerald-d);font-size:25px;line-height:1}.vm-letter small{display:block;margin-top:8px;color:var(--sub);font-size:11px}.vm-tool-row{display:flex;gap:8px;align-items:center;margin:14px 0}.vm-tool-row .searchbar{flex:1;margin:0}.vm-filter{width:auto!important;max-width:125px;padding:10px!important;font-size:12px!important}.vm-category-intro{padding:14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);margin-bottom:12px}.vm-category-intro b{font-size:18px}.vm-category-intro span{display:block;margin-top:3px;color:var(--sub);font-size:12px}.vm-vocab-list{display:grid;gap:16px}.vm-word-card{width:100%;padding:0;overflow:hidden;text-align:left;border:1px solid var(--line);border-radius:24px;background:var(--card);color:var(--text);box-shadow:0 9px 26px rgba(10,74,54,.075);font:inherit;cursor:pointer}.vm-word-card:active{transform:scale(.992)}.vm-card-top{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:25px 25px 20px}.vm-card-word{display:flex;align-items:baseline;gap:7px;min-width:0}.vm-card-word h3{margin:0;color:#17372d;font-family:Georgia,'Noto Serif Bengali',serif;font-size:31px;line-height:1.14;letter-spacing:-1px;overflow-wrap:anywhere}.vm-card-ordinal{color:var(--emerald);font:700 19px/1 Georgia,'Noto Serif Bengali',serif}.vm-card-arrow{display:grid;place-items:center;flex:0 0 36px;width:36px;height:36px;border-radius:50%;background:var(--mint);color:var(--emerald-d);font-size:29px;line-height:1}.vm-meaning{margin:8px 25px 20px;color:#274e41;font-family:'Noto Serif Bengali',Georgia,serif;font-size:23px;font-weight:700;line-height:1.38}.vm-card-section{padding:22px 25px;border-top:1px solid var(--line)}.vm-card-section-title{margin:0 0 13px;color:var(--emerald-d);font-size:12px;font-weight:900;letter-spacing:.16em}.vm-relation-items{display:grid;gap:9px}.vm-relation-item{display:grid;grid-template-columns:34px minmax(0,1fr);gap:11px;align-items:center;padding:12px;border:1px solid #dcece6;border-radius:14px;background:#f8fcfa}.vm-relation-number{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#dff2eb;color:var(--emerald-d);font-size:13px;font-weight:900}.vm-relation-copy{display:grid;gap:3px;min-width:0}.vm-relation-copy strong{font-size:19px;line-height:1.14;overflow-wrap:anywhere}.vm-relation-copy span{color:#4a6258;font-family:'Noto Serif Bengali',Georgia,serif;font-size:17px;line-height:1.35}.vm-tip{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;margin:0;padding:19px 21px;border-left:4px solid var(--emerald);background:#eaf7f1;color:var(--text);font-size:17px;line-height:1.57}.vm-tip-icon{font-size:21px;line-height:1.2}.vm-tip b{display:block;margin-bottom:5px;color:var(--emerald-d);font-size:13px;letter-spacing:.13em}.vm-detail-actions{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:18px}.vm-detail-actions .btn{min-height:46px;padding:9px 6px;font-size:12px}.vm-parser-area{min-height:280px;line-height:1.55}.vm-parser-preview{display:grid;gap:10px;margin-top:16px}.vm-preview-card{padding:14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card)}.vm-preview-card.invalid{border-color:var(--red)}.vm-preview-card.duplicate{border-color:var(--orange)}.vm-preview-meta{display:flex;gap:7px;flex-wrap:wrap;margin-top:9px}.vm-preview-meta span{padding:4px 7px;border-radius:7px;background:var(--mint);color:var(--emerald-d);font-size:10px;font-weight:700}.vm-preview-card.invalid .vm-preview-meta span{background:#fff0ef;color:var(--red)}.vm-parser-footer{display:grid;gap:9px;margin-top:16px}.vm-mode-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:9px;margin-top:16px}.vm-mode{min-height:112px;padding:14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--text);font:inherit;text-align:left;cursor:pointer}.vm-mode:active{transform:scale(.98)}.vm-mode b{display:block;margin-top:11px;font-size:14px}.vm-mode small{display:block;margin-top:4px;color:var(--sub);font-size:11px;line-height:1.35}.vm-practice-card{padding:16px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);box-shadow:var(--shadow)}.vm-practice-prompt{font-size:20px;font-weight:800;line-height:1.45}.vm-practice-options{display:grid;gap:8px;margin-top:16px}.vm-practice-option{padding:13px;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--text);font:inherit;text-align:left;cursor:pointer}.vm-practice-option.correct{border-color:var(--green);background:color-mix(in srgb,var(--green) 12%,var(--card))}.vm-practice-option.wrong{border-color:var(--red);background:color-mix(in srgb,var(--red) 12%,var(--card))}.vm-match-columns{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:15px}.vm-match-choice{min-height:52px;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--card);color:var(--text);font:inherit;font-size:12px;text-align:left;cursor:pointer}.vm-match-choice.selected{border-color:var(--emerald);background:var(--mint)}.vm-match-choice.done{opacity:.48;text-decoration:line-through;pointer-events:none}.vm-test-card{margin-top:16px;padding:16px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card)}.vm-test-card label{display:block;margin:14px 0 5px;color:var(--sub);font-size:12px;font-weight:700}.vm-empty{padding:38px 18px;text-align:center;border:1px dashed var(--line);border-radius:var(--radius);color:var(--sub)}.vm-dashboard-entry{display:flex;align-items:center;gap:12px;width:100%;margin-top:10px;padding:14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--text);text-align:left;box-shadow:var(--shadow);font:inherit;cursor:pointer}.vm-dashboard-entry:active{transform:scale(.985)}.vm-dashboard-entry i{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:var(--mint);font-style:normal;font-size:19px}.vm-dashboard-entry span{display:grid;gap:3px;min-width:0}.vm-dashboard-entry b{font-size:14px}.vm-dashboard-entry small{color:var(--sub);font-size:11px;line-height:1.35}.vm-dashboard-entry em{margin-left:auto;color:var(--sub);font-size:19px;font-style:normal}@media(max-width:360px){.vm-card-top{padding:21px 19px 17px}.vm-card-word h3{font-size:27px}.vm-meaning{margin:7px 19px 17px;font-size:21px}.vm-card-section{padding:19px}.vm-detail-actions{grid-template-columns:1fr}.vm-mode-grid{grid-template-columns:1fr}.vm-tool-row{align-items:stretch;flex-direction:column}.vm-filter{max-width:none;width:100%!important}.vm-match-columns{grid-template-columns:1fr}.vm-letter{min-height:72px}}
`;

  const style = document.createElement('style');
  style.setAttribute('data-vocabulary-master-style', 'true');
  style.textContent = css;
  document.head.appendChild(style);

  const escape = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const safeJson = value => escape(JSON.stringify(value));
  const lower = value => String(value ?? '').trim().toLocaleLowerCase('en-US');
  const unique = values => [...new Set(values.filter(Boolean).map(value => String(value).trim()).filter(Boolean))];
  const shuffle = values => typeof shuffleArr === 'function' ? shuffleArr(values) : [...values].sort(() => Math.random() - .5);
  const route = path => `${ROUTE}${path ? `/${path}` : ''}`;
  const now = () => Date.now();
  const categoryOf = word => (String(word || '').trim().match(/[A-Za-z]/)?.[0] || '#').toUpperCase();

  function relationItems(raw) {
    if (!Array.isArray(raw)) return [];
    return raw.map(item => typeof item === 'string' ? { word:item, meaning:'' } : { word:String(item?.word || '').trim(), meaning:String(item?.meaning || '').trim() }).filter(item => item.word);
  }
  function relations(record, key) { return relationItems(record?.[key]); }
  function normalizeRecord(raw) {
    const word = String(raw?.word || '').trim();
    const meaning = String(raw?.meaning || '').trim();
    return {
      id: raw?.id || (typeof uid === 'function' ? uid() : `vm-${now()}-${Math.random().toString(36).slice(2,8)}`),
      tool: 'vocabulary-master',
      word,
      meaning,
      synonyms: relationItems(raw?.synonyms),
      antonyms: relationItems(raw?.antonyms),
      tips: String(raw?.tips || '').trim(),
      category: categoryOf(word),
      normalized: lower(word),
      createdAt: Number(raw?.createdAt || now()),
      updatedAt: now(),
    };
  }
  async function loadRecords() {
    const rows = typeof dbGetAll === 'function' ? await dbGetAll(STORE) : [];
    state.records = (rows || []).filter(row => row && row.tool === 'vocabulary-master').map(normalizeRecord).sort((a,b) => a.word.localeCompare(b.word));
    return state.records;
  }
  function recordsFor(query = state.query, category = state.category) {
    const q = lower(query);
    return state.records.filter(record => {
      if (category && record.category !== category) return false;
      if (!q) return true;
      const haystack = [record.word, record.meaning, record.tips, ...record.synonyms.flatMap(item => [item.word, item.meaning]), ...record.antonyms.flatMap(item => [item.word, item.meaning])].join(' ').toLocaleLowerCase('en-US');
      return haystack.includes(q);
    });
  }
  function backButton(target = ROUTE) { return `<button class="backbtn" onclick="navigate('${target}')" aria-label="Back">←</button>`; }
  function emptyBank() { return `<div class="vm-empty"><div style="font-size:30px">📚</div><b style="display:block;margin-top:7px;color:var(--text)">Vocabulary Bank is empty.</b><p style="margin:7px 0 14px;font-size:12px;line-height:1.5">Vocabulary Parser ব্যবহার করে আপনার প্রথম শব্দভাণ্ডার যোগ করুন।</p><button class="btn sm" onclick="navigate('${route('parser')}')">Open Parser</button></div>`; }
  function heading(kicker, title, sub) { return `<div class="explorer-head"><div class="vm-kicker">${escape(kicker)}</div><h2 class="vm-title">${escape(title)}</h2>${sub ? `<p class="vm-sub">${escape(sub)}</p>` : ''}</div>`; }

  function renderLanding() {
    const body = `<main class="vm-page">${heading('VOCABULARY MASTER', 'Vocabulary Master', 'Synonyms • Antonyms • Bengali Meaning')}<div class="vm-actions"><button class="vm-action" onclick="navigate('${route('bank')}')"><span class="vm-action-mark">📚</span><span><b>Vocabulary Bank</b><small>Browse vocabulary A–Z</small></span><i class="vm-action-arrow">›</i></button><button class="vm-action" onclick="navigate('${route('parser')}')"><span class="vm-action-mark">⚙️</span><span><b>Vocabulary Parser</b><small>Paste, validate and save structured words</small></span><i class="vm-action-arrow">›</i></button><button class="vm-action" onclick="navigate('${route('practice')}')"><span class="vm-action-mark">🧠</span><span><b>Practice</b><small>Short learning activities with instant feedback</small></span><i class="vm-action-arrow">›</i></button><button class="vm-action" onclick="navigate('${route('test')}')"><span class="vm-action-mark">📝</span><span><b>Test</b><small>Use the existing Mock Test and Flash Test engines</small></span><i class="vm-action-arrow">›</i></button></div></main>`;
    renderShell(body, { title:'Vocabulary Master', back:"navigate('dashboard')" });
  }

  function renderBank() {
    const counts = Object.fromEntries('ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => [letter, 0]));
    state.records.forEach(record => { if (Object.prototype.hasOwnProperty.call(counts, record.category)) counts[record.category]++; });
    const grid = `<div class="vm-az-grid">${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `<button class="vm-letter" onclick="VocabularyMaster.openCategory('${letter}')"><b>${letter}</b><small>${counts[letter].toLocaleString()} words</small></button>`).join('')}</div>`;
    const empty = !state.records.length ? `<div class="vm-empty" style="margin-top:15px"><b style="display:block;color:var(--text)">Vocabulary Bank is empty.</b><p style="margin:7px 0 0;font-size:12px;line-height:1.5">A–Z থেকে category খুলে দেখতে পারেন, অথবা Parser ব্যবহার করে আপনার প্রথম vocabulary set যোগ করুন।</p></div>` : '';
    const body = `<main class="vm-page">${heading('VOCABULARY BANK', 'Browse A–Z', state.records.length ? 'একটি অক্ষর নির্বাচন করে সেই category-এর শব্দ দেখুন।' : 'A–Z category থেকে আপনার vocabulary library শুরু করুন।')}<div class="vm-section-head"><h2>Categories</h2><span class="vm-count">${state.records.length.toLocaleString()} words</span></div>${grid}${empty}<div style="margin-top:16px"><button class="btn secondary" onclick="navigate('${route('parser')}')">⚙️ Vocabulary Parser</button></div></main>`;
    renderShell(body, { title:'Vocabulary Bank', back:`navigate('${ROUTE}')` });
  }

  function relationSection(title, items) {
    if (!items.length) return '';
    return `<section class="vm-card-section"><h4 class="vm-card-section-title">${escape(title)}</h4><div class="vm-relation-items">${items.map((item, index) => `<div class="vm-relation-item"><span class="vm-relation-number">${index + 1}</span><span class="vm-relation-copy"><strong>${escape(item.word)}</strong>${item.meaning ? `<span>${escape(item.meaning)}</span>` : ''}</span></div>`).join('')}</div></section>`;
  }
  function card(record, number) {
    const synonyms = relations(record, 'synonyms'); const antonyms = relations(record, 'antonyms');
    return `<button class="vm-word-card" onclick="navigate('${route(`word/${encodeURIComponent(record.id)}`)}')"><div class="vm-card-top"><div class="vm-card-word"><span class="vm-card-ordinal">${number}</span><h3>${escape(record.word)}</h3></div><span class="vm-card-arrow">›</span></div><div class="vm-meaning">${escape(record.meaning)}</div>${relationSection('SYNONYMS', synonyms)}${relationSection('ANTONYMS', antonyms)}${record.tips ? `<div class="vm-card-section"><div class="vm-tip"><span class="vm-tip-icon">✦</span><span><b>TIPS & EXPLANATION</b>${escape(record.tips)}</span></div></div>` : ''}</button>`;
  }
  function renderCategory() {
    const all = recordsFor(state.query, state.category);
    const shown = all.slice(0, state.visible);
    const body = `<main class="vm-page">${heading(`${state.category || 'ALL'} VOCABULARY`, `${state.category || 'Vocabulary'} Vocabulary`, `${all.length.toLocaleString()} words found`)}<div class="vm-category-intro"><b>${state.category || 'Vocabulary'} category</b><span>Search word, বাংলা অর্থ, synonym বা antonym থেকে খুঁজুন।</span></div><div class="vm-tool-row"><div class="searchbar"><span>🔍</span><input id="vmBankSearch" value="${escape(state.query)}" placeholder="Search vocabulary" autocomplete="off" oninput="VocabularyMaster.searchCategory(this.value)"></div><select class="vm-filter" onchange="VocabularyMaster.openCategory(this.value)"><option value="">All A–Z</option>${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `<option value="${letter}" ${state.category === letter ? 'selected' : ''}>${letter}</option>`).join('')}</select></div>${shown.length ? `<div class="vm-vocab-list">${shown.map((record, index) => card(record, index + 1)).join('')}</div>${shown.length < all.length ? `<button class="btn secondary" style="margin-top:12px" onclick="VocabularyMaster.loadMore()">Load more words</button>` : ''}` : `<div class="vm-empty"><b style="color:var(--text)">No vocabulary found${state.category ? ` in ${state.category}` : ''}.</b><p style="margin:7px 0 14px;font-size:12px">Search পরিবর্তন করুন অথবা নতুন vocabulary যোগ করুন।</p><button class="btn sm" onclick="navigate('${route('parser')}')">Add Vocabulary</button></div>`}</main>`;
    renderShell(body, { title:`${state.category || 'Vocabulary'} Vocabulary`, back:`navigate('${route('bank')}')` });
  }
  function renderWord(id) {
    const record = state.records.find(row => row.id === id);
    if (!record) { navigate(route('bank')); return; }
    const rel = (title, items) => items.length ? `<section class="vm-relation"><b>${title}</b><span>${items.map(item => `${escape(item.word)}${item.meaning ? ` — ${escape(item.meaning)}` : ''}`).join('<br>')}</span></section>` : '';
    const body = `<main class="vm-page">${heading('VOCABULARY DETAIL', record.word, record.meaning)}<article class="vm-vocab-list"><div class="vm-word-card" style="cursor:default"><h3>${escape(record.word)}</h3><div class="vm-meaning">${escape(record.meaning)}</div><div class="vm-relations">${rel('Synonyms', relations(record, 'synonyms'))}${rel('Antonyms', relations(record, 'antonyms'))}</div>${record.tips ? `<div class="vm-tip"><b>Tips & Explanation</b><br>${escape(record.tips)}</div>` : ''}</div></article><div class="vm-detail-actions"><button class="btn secondary" onclick="VocabularyMaster.practiceRecord('${escape(record.id)}')">Practice</button><button class="btn" onclick="VocabularyMaster.testRecord('${escape(record.id)}','mock')">Mock Test</button><button class="btn ghost" onclick="VocabularyMaster.testRecord('${escape(record.id)}','flash')">Flash Test</button></div></main>`;
    renderShell(body, { title:record.word, back:`navigate('${route(`category/${record.category}`)}')` });
  }

  function sectionFromBlock(block, label, next) {
    const start = new RegExp(`(?:^|\\n)\\s*(?:\\*\\s*)?${label}\\s*:\\s*`, 'i').exec(block);
    if (!start) return '';
    const after = block.slice(start.index + start[0].length);
    const stop = next ? new RegExp(`(?:^|\\n)\\s*(?:\\*\\s*)?${next}\\s*:`, 'i').exec(after) : null;
    return (stop ? after.slice(0, stop.index) : after).trim();
  }
  function parsePairs(section) {
    return section.split('\n').map(line => line.replace(/^\s*[-*•]\s*/, '').trim()).filter(Boolean).map(line => {
      const parts = line.split(/\s*:\s*/, 2);
      return { word:String(parts[0] || '').trim(), meaning:String(parts[1] || '').trim() };
    }).filter(item => item.word && !/^synonyms?|antonyms?|tips?/i.test(item.word));
  }
  function parserSection(line) {
    const cleaned = String(line || '').replace(/^\s*(?:[-*•]|\d+[.)])?\s*/, '').trim();
    const match = cleaned.match(/^(.+?)\s*[:ঃ]\s*(.*)$/);
    if (!match) return null;
    const label = lower(match[1]).replace(/[\s._-]/g, '');
    const value = match[2].trim();
    if (/^(synonym|synonyms|similarword|similarwords|সমার্থক|সমার্থকশব্দ)$/.test(label)) return { kind:'synonyms', value };
    if (/^(antonym|antonyms|opposite|opposites|বিপরীত|বিপরীতশব্দ)$/.test(label)) return { kind:'antonyms', value };
    if (/^(tip|tips|explanation|tips&explanation|tipsandexplanation|ব্যাখ্যা|টিপস)$/.test(label)) return { kind:'tips', value };
    return null;
  }
  function parserRelation(line) {
    const cleaned = String(line || '').replace(/^\s*(?:(?:[-*•])|(?:\d+[.)]))\s*/, '').trim();
    const match = cleaned.match(/^(.+?)\s*[:ঃ]\s*(.+)$/);
    return match ? { word:match[1].trim(), meaning:match[2].trim() } : null;
  }
  function splitParserRecords(text) {
    const lines = String(text || '').split('\n');
    const serialStart = /^\s*\d+\s*[/.):\-।]\s*[A-Za-z][A-Za-z\s'’-]{0,80}?\s*[:ঃ]/;
    const starts = lines.reduce((all, line, index) => serialStart.test(line) ? [...all, index] : all, []);
    if (!starts.length) return [lines];
    return starts.map((start, index) => lines.slice(start, starts[index + 1] ?? lines.length));
  }
  function parseVocabulary(text) {
    const normalizedText = String(text || '').replace(/\r/g, '').replace(/[০-৯]/g, digit => String('০১২৩৪৫৬৭৮৯'.indexOf(digit)));
    const records = splitParserRecords(normalizedText);
    return records.map((lines, index) => {
      const first = lines.find(line => line.trim());
      const head = first?.match(/^\s*(?:\d+\s*[/.):\-।]\s*)?([A-Za-z][A-Za-z\s'’-]{0,80}?)\s*[:ঃ]\s*(.+?)\s*$/);
      if (!head) return { raw:lines.join('\n'), valid:false, error:'Word এবং Bengali meaning পাওয়া যায়নি।' };
      const word = head[1].trim();
      const meaning = head[2].trim();
      const synonyms = [], antonyms = [], tips = [];
      let section = '';
      let started = false;
      lines.forEach(line => {
        if (!started && line === first) { started = true; return; }
        const sectionHeader = parserSection(line);
        if (sectionHeader) {
          section = sectionHeader.kind;
          if (sectionHeader.value) {
            if (section === 'tips') tips.push(sectionHeader.value);
            else { const item = parserRelation(sectionHeader.value); if (item) (section === 'synonyms' ? synonyms : antonyms).push(item); }
          }
          return;
        }
        if (!line.trim()) return;
        if (section === 'tips') { tips.push(line.trim().replace(/^\s*[-*•]\s*/, '')); return; }
        if (section === 'synonyms' || section === 'antonyms') {
          const item = parserRelation(line);
          if (item) (section === 'synonyms' ? synonyms : antonyms).push(item);
        }
      });
      const record = normalizeRecord({ word, meaning, synonyms, antonyms, tips:tips.join(' ').trim() });
      return { ...record, raw:lines.join('\n'), valid:!!(word && meaning), sourceIndex:index, error:word && meaning ? '' : 'Incomplete record' };
    });
  }
  function parserPreviewCard(record, index) {
    const duplicate = state.records.some(existing => existing.normalized === record.normalized);
    const status = !record.valid ? 'invalid' : duplicate ? 'duplicate' : '';
    return `<article class="vm-preview-card ${status}"><div class="row between"><div><b>${escape(record.word || 'Incomplete record')}</b><div class="muted" style="margin-top:3px">${escape(record.meaning || record.error || 'Missing Bengali meaning')}</div></div><button class="btn ghost sm" onclick="VocabularyMaster.editParsed(${index})">Edit</button></div><div class="vm-preview-meta"><span>${record.valid ? '✓ Valid' : '⚠ Incomplete'}</span><span>Synonyms: ${relations(record, 'synonyms').length}</span><span>Antonyms: ${relations(record, 'antonyms').length}</span><span>${record.tips ? 'Explanation: Available' : 'Explanation: —'}</span>${duplicate ? '<span>Duplicate Found</span>' : ''}</div>${!record.valid ? `<button class="btn ghost sm" style="margin-top:11px" onclick="VocabularyMaster.skipParsed(${index})">Skip</button>` : ''}</article>`;
  }
  function renderParser() {
    const preview = state.parser.stage === 'preview';
    const body = `<main class="vm-page">${heading('VOCABULARY PARSER', preview ? 'Review parsed vocabulary' : 'Paste vocabulary text', preview ? 'Save করার আগে প্রতিটি record যাচাই বা edit করুন।' : 'বাংলা বা English serial, word, Bengali meaning, synonyms, antonyms এবং tips detect করা হবে।')} ${preview ? `<section class="vm-parser-preview">${state.parser.records.length ? state.parser.records.map(parserPreviewCard).join('') : '<div class="vm-empty">No parsable vocabulary found.</div>'}</section><div class="vm-parser-footer"><label class="flabel">Duplicate handling</label><select id="vmDuplicateChoice"><option value="skip">Skip duplicates (recommended)</option><option value="replace">Replace existing record</option><option value="keep">Keep both records</option></select><button class="btn" onclick="VocabularyMaster.saveParsed()">Save All</button><button class="btn secondary" onclick="VocabularyMaster.backToPaste()">Edit Paste</button></div>` : `<textarea id="vmParserInput" class="vm-parser-area" placeholder="১/ Conjecture : অনুমান করা\n* Synonyms:\n    * Guess : অনুমান\n* Antonyms:\n    * Fact : সত্য / তথ্য\n* Tips & Explanation: মূল শব্দটির সাথে …">${escape(state.parser.text)}</textarea><button class="btn" style="margin-top:14px" onclick="VocabularyMaster.parseInput()">Parse Vocabulary</button><p class="muted" style="margin:10px 2px 0;line-height:1.5">Nothing is saved until you review the parsed records and choose Save All.</p>`}</main>`;
    renderShell(body, { title:'Vocabulary Parser', back:`navigate('${ROUTE}')` });
  }

  function practiceModeCard(icon, title, detail, mode) { return `<button class="vm-mode" onclick="VocabularyMaster.startPractice('${mode}')"><span style="font-size:21px">${icon}</span><b>${escape(title)}</b><small>${escape(detail)}</small></button>`; }
  function accuracy(session) { const total = session.correct + session.wrong; return total ? Math.round(session.correct / total * 100) : 0; }
  function renderPracticeHome() {
    const body = `<main class="vm-page">${heading('PRACTICE', 'Learn actively', 'Practice results are temporary. Existing Admission Hub Test results remain the permanent record.')} ${state.records.length ? `<div class="vm-mode-grid">${practiceModeCard('🔗','Matching','Match words with Bengali meanings.','match')}${practiceModeCard('✍️','Fill in the Blank','Choose the right word from its meaning.','fill')}${practiceModeCard('↔️','Synonym Practice','Find the matching synonym.','synonym')}${practiceModeCard('⇄','Antonym Practice','Find the opposite word.','antonym')}${practiceModeCard('অ','Bengali Meaning','Choose the correct Bengali meaning.','meaning')}</div>` : emptyBank()}</main>`;
    renderShell(body, { title:'Vocabulary Practice', back:`navigate('${ROUTE}')` });
  }
  function practiceCandidates(mode) {
    if (mode === 'synonym') return state.records.filter(record => relations(record, 'synonyms').length);
    if (mode === 'antonym') return state.records.filter(record => relations(record, 'antonyms').length);
    return state.records;
  }
  function optionSet(correct, pool) {
    const values = unique([correct, ...shuffle(pool)]);
    return shuffle(values.slice(0, 4));
  }
  function buildQuestion(mode, record) {
    const allMeanings = state.records.map(row => row.meaning);
    const allWords = state.records.map(row => row.word);
    if (mode === 'synonym') { const relation = shuffle(relations(record, 'synonyms'))[0]; return { prompt:`${record.word}-এর synonym কোনটি?`, correct:relation.word, options:optionSet(relation.word, state.records.flatMap(row => relations(row, 'synonyms').map(item => item.word)).concat(allWords)), explanation:`${relation.word}${relation.meaning ? ` — ${relation.meaning}` : ''}` }; }
    if (mode === 'antonym') { const relation = shuffle(relations(record, 'antonyms'))[0]; return { prompt:`${record.word}-এর antonym কোনটি?`, correct:relation.word, options:optionSet(relation.word, state.records.flatMap(row => relations(row, 'antonyms').map(item => item.word)).concat(allWords)), explanation:`${relation.word}${relation.meaning ? ` — ${relation.meaning}` : ''}` }; }
    if (mode === 'fill') return { prompt:`“${record.meaning}” অর্থ প্রকাশ করে এমন শব্দটি হলো ____।`, correct:record.word, options:optionSet(record.word, allWords), explanation:`${record.word} — ${record.meaning}` };
    return { prompt:`${record.word}-এর বাংলা অর্থ কী?`, correct:record.meaning, options:optionSet(record.meaning, allMeanings), explanation:`${record.word} — ${record.meaning}` };
  }
  function renderPracticeQuiz() {
    const session = state.practice;
    const question = session.questions[session.index];
    if (!question) return renderPracticeSummary();
    const selected = session.selected;
    const answerShown = selected !== null;
    const body = `<main class="vm-page">${heading('PRACTICE', `${session.index + 1} of ${session.questions.length}`, `${session.correct} correct · ${session.wrong} wrong`)}<section class="vm-practice-card"><div class="vm-practice-prompt">${escape(question.prompt)}</div><div class="vm-practice-options">${question.options.map(option => { const cls = answerShown ? (option === question.correct ? 'correct' : option === selected ? 'wrong' : '') : ''; return `<button class="vm-practice-option ${cls}" ${answerShown ? 'disabled' : ''} onclick="VocabularyMaster.answerPractice(${safeJson(option)})">${escape(option)}</button>`; }).join('')}</div>${answerShown ? `<div class="vm-tip">${escape(question.explanation)}</div><button class="btn" style="margin-top:14px" onclick="VocabularyMaster.nextPractice()">${session.index === session.questions.length - 1 ? 'See Result' : 'Next Question →'}</button>` : ''}</section></main>`;
    renderShell(body, { title:'Vocabulary Practice', back:`navigate('${route('practice')}')` });
  }
  function renderMatching() {
    const session = state.practice;
    const done = session.pairs.filter(pair => session.done.includes(pair.id)).length;
    const body = `<main class="vm-page">${heading('MATCHING PRACTICE', `${done} of ${session.pairs.length} matched`, `${session.correct} correct · ${session.wrong} wrong`)}<section class="vm-practice-card"><p class="muted" style="margin-top:0">প্রথমে একটি word, তারপর তার Bengali meaning নির্বাচন করুন।</p><div class="vm-match-columns"><div>${session.pairs.map(pair => `<button class="vm-match-choice ${session.wordId === pair.id ? 'selected' : ''} ${session.done.includes(pair.id) ? 'done' : ''}" onclick="VocabularyMaster.pickMatchWord('${escape(pair.id)}')">${escape(pair.word)}</button>`).join('')}</div><div>${session.meanings.map(pair => `<button class="vm-match-choice ${session.done.includes(pair.id) ? 'done' : ''}" onclick="VocabularyMaster.pickMatchMeaning('${escape(pair.id)}')">${escape(pair.meaning)}</button>`).join('')}</div></div>${done === session.pairs.length ? `<div class="vm-tip">Matching complete. Accuracy: ${accuracy(session)}%</div><button class="btn" style="margin-top:14px" onclick="VocabularyMaster.finishPractice()">Back to Practice</button>` : ''}</section></main>`;
    renderShell(body, { title:'Matching Practice', back:`navigate('${route('practice')}')` });
  }
  function renderPracticeSummary() {
    const session = state.practice;
    const body = `<main class="vm-page">${heading('PRACTICE COMPLETE', 'Session finished', 'This short practice session is not stored as a separate Vocabulary progress system.')}<section class="vm-practice-card"><div class="grid3"><div><b style="font-size:23px;color:var(--green)">${session.correct}</b><div class="muted">Correct</div></div><div><b style="font-size:23px;color:var(--red)">${session.wrong}</b><div class="muted">Wrong</div></div><div><b style="font-size:23px;color:var(--emerald)">${accuracy(session)}%</b><div class="muted">Accuracy</div></div></div><button class="btn" style="margin-top:18px" onclick="VocabularyMaster.finishPractice()">Back to Practice</button></section></main>`;
    renderShell(body, { title:'Practice Result', back:`navigate('${route('practice')}')` });
  }

  function testScopeRecords() { const ids = state.test.selectedIds; if (ids.length) return state.records.filter(record => ids.includes(record.id)); return recordsFor('', state.test.category); }
  function renderTest() {
    const scoped = testScopeRecords();
    const body = `<main class="vm-page">${heading('TEST', 'Use the existing exam engine', 'Vocabulary Master prepares questions; Admission Hub runs the real Mock Test or Flash Test, result and history.')}<section class="vm-test-card"><label>Vocabulary source</label><select onchange="VocabularyMaster.setTestCategory(this.value)"><option value="">All vocabulary (${state.records.length})</option>${'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => `<option value="${letter}" ${state.test.category === letter ? 'selected' : ''}>${letter} Vocabulary (${state.records.filter(record => record.category === letter).length})</option>`).join('')}</select><label>Question count</label><select onchange="VocabularyMaster.setTestCount(this.value)">${[5,10,20,30,50].map(count => `<option value="${count}" ${state.test.count === count ? 'selected' : ''}>${count}</option>`).join('')}</select><label>Mock duration</label><select onchange="VocabularyMaster.setTestDuration(this.value)">${[5,10,20,30,60].map(minutes => `<option value="${minutes}" ${state.test.duration === minutes ? 'selected' : ''}>${minutes} minutes</option>`).join('')}</select><label>Negative marking (Mock only)</label><select onchange="VocabularyMaster.setTestNegative(this.value)">${[0,.25,.5,1].map(value => `<option value="${value}" ${state.test.negative === value ? 'selected' : ''}>${value ? `-${value}` : 'None'}</option>`).join('')}</select><p class="muted" style="margin:14px 0 0;line-height:1.5">${scoped.length ? `${scoped.length} vocabulary record selected. Compatible question set তৈরি করে existing engine-এ পাঠানো হবে।` : 'Test শুরু করতে vocabulary যোগ করুন।'}</p><button class="btn" style="margin-top:14px" ${scoped.length ? '' : 'disabled'} onclick="VocabularyMaster.beginTest('mock')">📝 Start Mock Test</button><button class="btn secondary" style="margin-top:9px" ${scoped.length ? '' : 'disabled'} onclick="VocabularyMaster.beginTest('flash')">⚡ Start Flash Test</button></section></main>`;
    renderShell(body, { title:'Vocabulary Test', back:`navigate('${ROUTE}')` });
  }

  async function ensureExamScope() {
    let subject = (CACHE.subjects || []).find(row => row.name === EXAM_SUBJECT_NAME);
    if (!subject) { subject = { id:uid(), name:EXAM_SUBJECT_NAME, icon:'📚', color:'#0f6b4f', order:(CACHE.subjects || []).length, createdAt:now(), source:'vocabulary-master' }; await dbPut('subjects', subject); }
    let topic = (CACHE.topics || []).find(row => row.subjectId === subject.id && row.name === EXAM_TOPIC_NAME);
    if (!topic) { topic = { id:uid(), subjectId:subject.id, name:EXAM_TOPIC_NAME, order:(CACHE.topics || []).filter(row => row.subjectId === subject.id).length, createdAt:now(), source:'vocabulary-master' }; await dbPut('topics', topic); }
    return { subject, topic };
  }
  function existingQuestion(id) { return (CACHE.questions || []).find(question => question.id === id); }
  function generatedOptions(correct, candidates) { const options = unique([correct, ...shuffle(candidates)]).slice(0, 4); return options.length === 4 ? shuffle(options) : null; }
  function generatedQuestion(record, scope, all) {
    let kind = 'meaning'; let correct = record.meaning; let prompt = `${record.word}-এর বাংলা অর্থ কী?`; let pool = all.map(row => row.meaning); let explanation = `${record.word} — ${record.meaning}`;
    if (relations(record, 'synonyms').length) { const item = relations(record, 'synonyms')[0]; kind = 'synonym'; correct = item.word; prompt = `${record.word}-এর synonym কোনটি?`; pool = all.flatMap(row => relations(row, 'synonyms').map(relation => relation.word)).concat(all.map(row => row.word)); explanation = `${item.word}${item.meaning ? ` — ${item.meaning}` : ''}`; }
    else if (relations(record, 'antonyms').length) { const item = relations(record, 'antonyms')[0]; kind = 'antonym'; correct = item.word; prompt = `${record.word}-এর antonym কোনটি?`; pool = all.flatMap(row => relations(row, 'antonyms').map(relation => relation.word)).concat(all.map(row => row.word)); explanation = `${item.word}${item.meaning ? ` — ${item.meaning}` : ''}`; }
    const options = generatedOptions(correct, pool);
    if (!options) return null;
    return { id:`vmq-${record.id}-${kind}`, subjectId:scope.subject.id, topicId:scope.topic.id, source:'vocabulary-master', vocabularyRecordId:record.id, question:prompt, options, answer:options.indexOf(correct), explanation, createdAt:now(), updatedAt:now(), stats:{ attempts:0, correct:0, wrong:0 } };
  }
  async function createExamQuestions(records) {
    const scope = await ensureExamScope();
    const generated = records.map(record => generatedQuestion(record, scope, state.records)).filter(Boolean);
    for (const question of generated) {
      const current = existingQuestion(question.id);
      await dbPut('questions', current ? { ...question, stats:current.stats || question.stats, createdAt:current.createdAt || question.createdAt } : question);
    }
    await loadCache();
    return generated.map(question => question.id);
  }

  const api = {
    async render() {
      await loadRecords();
      const current = String(Router?.path || '');
      const parts = current.split('/');
      if (current === ROUTE) return renderLanding();
      if (current === route('bank')) return renderBank();
      if (parts[1] === 'category') { state.category = String(parts[2] || '').toUpperCase(); state.query = ''; state.visible = 36; return renderCategory(); }
      if (parts[1] === 'word') return renderWord(decodeURIComponent(parts.slice(2).join('/')));
      if (current === route('parser')) return renderParser();
      if (current === route('practice')) { if (!state.practice) return renderPracticeHome(); if (state.practice.type === 'match') return renderMatching(); if (state.practice.complete) return renderPracticeSummary(); return renderPracticeQuiz(); }
      if (current === route('test')) return renderTest();
      return renderLanding();
    },
    openCategory(letter) { state.category = String(letter || '').toUpperCase(); state.query = ''; state.visible = 36; navigate(route(`category/${state.category}`)); },
    searchCategory(query) { const next = String(query || ''); clearTimeout(state.searchTimer); state.searchTimer = window.setTimeout(() => { state.query = next; state.visible = 36; const old = window.scrollY; renderCategory(); requestAnimationFrame(() => { window.scrollTo({ top:old, behavior:'auto' }); const input = document.getElementById('vmBankSearch'); if (input) { input.focus(); input.setSelectionRange(input.value.length, input.value.length); } }); }, 120); },
    loadMore() { state.visible += 36; const old = window.scrollY; renderCategory(); requestAnimationFrame(() => window.scrollTo({ top:old, behavior:'auto' })); },
    parseInput() { state.parser.text = document.getElementById('vmParserInput')?.value || ''; state.parser.records = parseVocabulary(state.parser.text); state.parser.stage = 'preview'; renderParser(); },
    backToPaste() { state.parser.stage = 'input'; renderParser(); },
    skipParsed(index) { state.parser.records.splice(index, 1); renderParser(); },
    editParsed(index) {
      const record = state.parser.records[index]; if (!record) return;
      openModal(`<h3>Edit vocabulary</h3><label class="flabel">Word</label><input id="vmEditWord" value="${escape(record.word)}"><label class="flabel">Bengali Meaning</label><input id="vmEditMeaning" value="${escape(record.meaning)}"><label class="flabel">Synonyms (one per line: word : meaning)</label><textarea id="vmEditSyn">${escape(record.synonyms.map(item => `${item.word} : ${item.meaning}`).join('\n'))}</textarea><label class="flabel">Antonyms (one per line: word : meaning)</label><textarea id="vmEditAnt">${escape(record.antonyms.map(item => `${item.word} : ${item.meaning}`).join('\n'))}</textarea><label class="flabel">Tips & Explanation</label><textarea id="vmEditTips">${escape(record.tips)}</textarea><button class="btn" style="margin-top:14px" onclick="VocabularyMaster.saveParsedEdit(${index})">Save changes</button>`);
    },
    saveParsedEdit(index) { const current = state.parser.records[index]; if (!current) return; const parseLines = id => parsePairs(document.getElementById(id)?.value || ''); const updated = normalizeRecord({ ...current, word:document.getElementById('vmEditWord')?.value || '', meaning:document.getElementById('vmEditMeaning')?.value || '', synonyms:parseLines('vmEditSyn'), antonyms:parseLines('vmEditAnt'), tips:document.getElementById('vmEditTips')?.value || '' }); state.parser.records[index] = { ...updated, raw:current.raw, valid:!!(updated.word && updated.meaning), error:updated.word && updated.meaning ? '' : 'Incomplete record' }; closeModal(); renderParser(); },
    async saveParsed() { const strategy = document.getElementById('vmDuplicateChoice')?.value || 'skip'; const valid = state.parser.records.filter(record => record.valid); if (!valid.length) return toast('No valid vocabulary to save'); const byNormalized = new Map(state.records.map(record => [record.normalized, record])); let saved = 0, skipped = 0; for (const source of valid) { const record = normalizeRecord(source); const duplicate = byNormalized.get(record.normalized); if (duplicate && strategy === 'skip') { skipped++; continue; } if (duplicate && strategy === 'replace') { record.id = duplicate.id; record.createdAt = duplicate.createdAt; } await dbPut(STORE, record); byNormalized.set(record.normalized, record); saved++; } await loadRecords(); state.parser = { text:'', records:[], stage:'input' }; toast(`${saved} vocabulary saved${skipped ? ` · ${skipped} duplicate skipped` : ''}`); navigate(route('bank')); },
    startPractice(mode) { const candidates = practiceCandidates(mode); if (mode === 'match') { if (state.records.length < 2) return toast('Matching-এর জন্য অন্তত 2টি vocabulary দরকার'); const pairs = shuffle(state.records).slice(0, Math.min(4, state.records.length)).map(record => ({ id:record.id, word:record.word, meaning:record.meaning })); state.practice = { type:'match', pairs, meanings:shuffle(pairs), wordId:null, done:[], correct:0, wrong:0 }; return renderMatching(); } if (!candidates.length) return toast(`${mode === 'synonym' ? 'Synonym' : mode === 'antonym' ? 'Antonym' : 'Vocabulary'} data পাওয়া যায়নি`); const questions = shuffle(candidates).slice(0, Math.min(10, candidates.length)).map(record => buildQuestion(mode, record)).filter(question => question.options.length === 4); if (!questions.length) return toast('এই practice-এর জন্য পর্যাপ্ত distinct vocabulary data নেই'); state.practice = { type:'quiz', mode, questions, index:0, selected:null, correct:0, wrong:0, complete:false }; renderPracticeQuiz(); },
    practiceRecord(id) { state.test.selectedIds = [id]; navigate(route('practice')); },
    answerPractice(value) { const session = state.practice; if (!session || session.selected !== null) return; session.selected = String(value); if (session.selected === session.questions[session.index].correct) session.correct++; else session.wrong++; renderPracticeQuiz(); },
    nextPractice() { const session = state.practice; if (!session) return; session.index++; session.selected = null; if (session.index >= session.questions.length) session.complete = true; api.render(); },
    pickMatchWord(id) { const session = state.practice; if (!session || session.done.includes(id)) return; session.wordId = id; renderMatching(); },
    pickMatchMeaning(id) { const session = state.practice; if (!session || !session.wordId || session.done.includes(id)) return; if (session.wordId === id) { session.done.push(id); session.correct++; toast('Correct'); } else { session.wrong++; toast('Try again'); } session.wordId = null; renderMatching(); },
    finishPractice() { state.practice = null; state.test.selectedIds = []; navigate(route('practice')); },
    testRecord(id) { state.test.selectedIds = [id]; state.test.category = ''; navigate(route('test')); },
    setTestCategory(value) { state.test.category = String(value || ''); state.test.selectedIds = []; renderTest(); },
    setTestCount(value) { state.test.count = Number(value) || 10; renderTest(); },
    setTestDuration(value) { state.test.duration = Number(value) || 10; renderTest(); },
    setTestNegative(value) { state.test.negative = Number(value) || 0; renderTest(); },
    async beginTest(mode) { const records = testScopeRecords(); if (!records.length) return toast('Vocabulary selection empty'); const ids = await createExamQuestions(records); if (!ids.length) return toast('4টি distinct option তৈরির জন্য আরো vocabulary data দরকার'); ExamSetup = freshSetup(); ExamSetup.mode = mode; ExamSetup.onlyQuestionIds = ids; ExamSetup.totalCount = Math.min(state.test.count, ids.length); ExamSetup.duration = state.test.duration; ExamSetup.negative = state.test.negative; ExamSetup.randomizeQ = true; ExamSetup.randomizeOpt = true; ExamSetup.selectionMode = 'random'; ExamSetup.revisionKind = ''; await beginExam(); },
  };

  window.VocabularyMaster = api;
  const previousRouteRenderer = window.__admissionRenderRoute;
  window.__admissionRenderRoute = function vocabularyMasterRouteRenderer() {
    const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
    if (path === ROUTE || path.startsWith(`${ROUTE}/`)) return api.render();
    return typeof previousRouteRenderer === 'function' ? previousRouteRenderer.apply(this, arguments) : window.render?.();
  };
  function injectDashboardEntry() {
    const page = document.querySelector('#app .page');
    if (!page || page.querySelector('[data-vocabulary-master-entry]')) return;
    const entry = document.createElement('button');
    entry.type = 'button'; entry.className = 'vm-dashboard-entry'; entry.dataset.vocabularyMasterEntry = 'true';
    entry.innerHTML = '<i aria-hidden="true">📚</i><span><b>Vocabulary Master</b><small>Synonym · Antonym · Bengali Meaning</small></span><em aria-hidden="true">›</em>';
    entry.onclick = () => navigate(ROUTE);
    const tools = page.querySelector('[data-unified-study-tools-list]');
    if (!tools) return;
    tools.appendChild(entry);
  }
  const previousDashboard = window.renderDashboard;
  if (typeof previousDashboard === 'function') {
    window.renderDashboard = function vocabularyMasterDashboard() {
      const result = previousDashboard.apply(this, arguments);
      injectDashboardEntry();
      window.setTimeout(injectDashboardEntry, 0);
      window.setTimeout(injectDashboardEntry, 140);
      return result;
    };
  }
  window.addEventListener('load', () => {
    window.setTimeout(() => {
      const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
      if (path === 'dashboard' || path === 'home') injectDashboardEntry();
    }, 260);
  }, { once:true });
  const appRoot = document.getElementById('app');
  if (appRoot && window.MutationObserver) {
    new MutationObserver(() => {
      const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
      if (path === 'dashboard' || path === 'home') injectDashboardEntry();
    }).observe(appRoot, { childList:true, subtree:true });
  }
})();
