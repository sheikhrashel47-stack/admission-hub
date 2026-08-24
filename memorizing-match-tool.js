/*
 * Memorizing Match — native Admission Hub learning engine.
 * Design reminder: premium light academic emerald, quick two-tap pairing, no fake progress, no rewards or separate history.
 */
(() => {
  'use strict';

  const ROUTE = 'memorizing-match';
  const VOCAB_STORE = 'vocabularyMaster';
  const MAX_GRID_PAIRS = 5;
  const state = {
    loaded: false,
    vocabulary: [],
    questions: [],
    subjects: [],
    topics: [],
    selectedType: '',
    count: 10,
    seconds: 0,
    game: null,
  };

  const typeConfig = [
    { id:'word-meaning', group:'English Vocabulary', label:'Word Meaning', bn:'শব্দার্থ', icon:'Aa', source:'vocabulary' },
    { id:'synonym', group:'English Vocabulary', label:'Synonyms', bn:'সমার্থক শব্দ', icon:'≈', source:'vocabulary' },
    { id:'antonym', group:'English Vocabulary', label:'Antonyms', bn:'বিপরীত শব্দ', icon:'↔', source:'vocabulary' },
    { id:'bagdhara', group:'বাংলা বিরচন', label:'বাগধারা', bn:'বাগধারা', icon:'ব', source:'memorizing', keywords:['বাগধারা'] },
    { id:'bangla-synonym', group:'বাংলা বিরচন', label:'সমার্থক শব্দ', bn:'সমার্থক শব্দ', icon:'≈', source:'memorizing', keywords:['সমার্থক'] },
    { id:'bangla-antonym', group:'বাংলা বিরচন', label:'বিপরীত শব্দ', bn:'বিপরীত শব্দ', icon:'↔', source:'memorizing', keywords:['বিপরীত'] },
    { id:'one-word', group:'বাংলা বিরচন', label:'এক কথায় প্রকাশ', bn:'এক কথায় প্রকাশ', icon:'১', source:'memorizing', keywords:['এক কথায়','এক কথায়','এককথায়','এককথায়'] },
    { id:'technical-term', group:'বাংলা বিরচন', label:'পারিভাষিক শব্দ', bn:'পারিভাষিক শব্দ', icon:'প', source:'memorizing', keywords:['পারিভাষিক'] },
  ];

  const css = `
  /* Memorizing Match visual language: light emerald academic focus, video-like rapid matching without dark-game styling. */
  .mm-page{max-width:650px;margin:0 auto;padding-bottom:10px}.mm-kicker{margin:2px 0 4px;color:var(--emerald-d);font-size:10px;font-weight:900;letter-spacing:.14em}.mm-title{margin:0;color:#173b30;font-size:27px;line-height:1.16;letter-spacing:-.7px}.mm-sub{margin:8px 0 0;color:var(--sub);font-size:13px;line-height:1.55}.mm-hero{padding:19px;border:1px solid #cfe7dc;border-radius:22px;background:linear-gradient(135deg,#f8fcfa,#e6f5ed);box-shadow:0 12px 26px rgba(13,91,67,.08)}.mm-hero b{display:block;font-size:17px}.mm-hero p{margin:6px 0 0;color:#55776b;font-size:12px;line-height:1.55}.mm-group{margin-top:19px}.mm-group-head{display:flex;align-items:end;justify-content:space-between;gap:12px;margin:0 0 10px}.mm-group-head h3{margin:0;font-size:18px}.mm-group-head span{color:var(--sub);font-size:11px}.mm-type-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.mm-type{position:relative;display:flex;min-height:124px;flex-direction:column;align-items:flex-start;overflow:hidden;padding:15px;border:1px solid var(--line);border-radius:18px;background:var(--card);color:var(--text);font:inherit;text-align:left;box-shadow:0 8px 19px rgba(13,76,57,.06);cursor:pointer}.mm-type:not(:disabled):active,.mm-pair-card:active,.mm-continue:active{transform:scale(.975)}.mm-type:disabled{opacity:.58;cursor:not-allowed}.mm-type:before{position:absolute;right:-26px;bottom:-29px;width:108px;height:108px;border-radius:50%;background:#e5f4ec;content:''}.mm-type-mark{position:relative;z-index:1;display:grid;place-items:center;width:37px;height:37px;border-radius:12px;background:var(--emerald);color:#fff;font-size:17px;font-weight:900}.mm-type strong{position:relative;z-index:1;margin-top:13px;font-size:16px;line-height:1.25}.mm-type small{position:relative;z-index:1;margin-top:4px;color:var(--sub);font-size:11px;line-height:1.35}.mm-type b{position:relative;z-index:1;margin-top:auto;padding-top:10px;color:var(--emerald-d);font-size:11px}.mm-setup{display:grid;gap:13px;margin-top:18px}.mm-setup-card{padding:17px;border:1px solid var(--line);border-radius:19px;background:var(--card);box-shadow:var(--shadow)}.mm-step{display:flex;align-items:center;gap:8px;color:var(--emerald-d);font-size:10px;font-weight:900;letter-spacing:.12em}.mm-step i{display:grid;place-items:center;width:23px;height:23px;border-radius:8px;background:var(--mint);font-style:normal}.mm-setup-card h3{margin:9px 0 4px;font-size:20px}.mm-setup-card p{margin:0;color:var(--sub);font-size:12px;line-height:1.5}.mm-preset-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:13px}.mm-preset{min-height:62px;padding:8px;border:1px solid var(--line);border-radius:13px;background:#fbfefc;color:var(--text);font:inherit;text-align:left;cursor:pointer}.mm-preset.active{border-color:var(--emerald);background:var(--mint);color:var(--emerald-d)}.mm-preset b,.mm-preset small{display:block}.mm-preset b{font-size:13px}.mm-preset small{margin-top:4px;color:var(--sub);font-size:10px;line-height:1.25}.mm-summary{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:13px;padding:13px;border-radius:14px;background:#eef8f3}.mm-summary span,.mm-summary b{display:block}.mm-summary span{color:#56766b;font-size:10px}.mm-summary b{margin-top:4px;color:#174838;font-size:12px;line-height:1.35;overflow-wrap:anywhere}.mm-start{min-height:54px;margin-top:14px;font-size:15px!important}.mm-empty{margin-top:18px;padding:32px 17px;border:1px dashed var(--line);border-radius:19px;background:var(--card);color:var(--sub);text-align:center}.mm-empty b{display:block;color:var(--text);font-size:16px}.mm-empty p{margin:7px auto 0;max-width:390px;font-size:12px;line-height:1.55}.mm-game{min-height:calc(100dvh - 144px);padding-bottom:16px}.mm-game-head{display:flex;align-items:center;gap:9px}.mm-close{display:grid;place-items:center;flex:0 0 38px;width:38px;height:38px;border:1px solid var(--line);border-radius:12px;background:var(--card);color:var(--emerald-d);font-size:23px;cursor:pointer}.mm-progress-wrap{flex:1;min-width:0}.mm-progress-meta{display:flex;justify-content:space-between;gap:8px;margin-bottom:6px;color:#59776c;font-size:10px;font-weight:800}.mm-progress{height:9px;overflow:hidden;border-radius:999px;background:#e0eee7}.mm-progress i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#159367,#54bd83);transition:width .25s cubic-bezier(.23,1,.32,1)}.mm-timer{display:grid;place-items:center;flex:0 0 auto;min-width:48px;height:38px;padding:0 7px;border-radius:12px;background:#fff5e9;color:#985b23;font-size:12px;font-weight:900}.mm-combo{display:inline-flex;align-items:center;gap:5px;margin-top:15px;padding:7px 10px;border-radius:10px;background:#f4ebff;color:#7650a3;font-size:11px;font-weight:900}.mm-instruction{margin:13px 0 0;color:var(--sub);font-size:12px;line-height:1.5}.mm-pair-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px;margin-top:17px}.mm-pair-card{display:flex;min-height:76px;align-items:center;justify-content:center;padding:11px;border:1px solid #d7e9e2;border-radius:16px;background:linear-gradient(145deg,#fff,#f9fdfb);color:#23483c;font:700 15px/1.42 inherit;text-align:center;overflow-wrap:anywhere;box-shadow:0 6px 15px rgba(13,76,57,.05);cursor:pointer;transition:transform .14s cubic-bezier(.23,1,.32,1),background .15s ease,border-color .15s ease,color .15s ease}.mm-pair-card.selected{border-color:#3a8bd7;background:#edf7ff;color:#17629f;box-shadow:0 0 0 3px rgba(58,139,215,.12)}.mm-pair-card.correct{border-color:#5ab77d;background:#edfbf1;color:#15703b}.mm-pair-card.wrong{border-color:#e18d8d;background:#fff0f0;color:#ae3939;animation:mm-shake .22s linear}.mm-milestone{display:grid;place-items:center;min-height:calc(100dvh - 206px);padding:25px;text-align:center}.mm-milestone-card{max-width:420px;padding:27px 20px;border:1px solid #cde5d9;border-radius:25px;background:linear-gradient(145deg,#f8fdf9,#e6f5eb);box-shadow:0 16px 32px rgba(13,91,67,.1)}.mm-milestone-icon{display:grid;place-items:center;width:66px;height:66px;margin:0 auto 13px;border-radius:23px;background:var(--emerald);color:#fff;font-size:32px}.mm-milestone-card h2{margin:0;color:#174636;font-size:26px}.mm-milestone-card p{margin:9px 0 0;color:#53746a;font-size:13px;line-height:1.55}.mm-continue{width:100%;min-height:52px;margin-top:18px;border:0;border-radius:14px;background:var(--emerald);color:#fff;font:800 14px inherit;cursor:pointer}.mm-result{padding:20px;border:1px solid #cde5d9;border-radius:22px;background:linear-gradient(145deg,#f9fdfb,#edf8f1);box-shadow:var(--shadow)}.mm-result-title{margin:0;color:#174636;font-size:25px}.mm-result-sub{margin:7px 0 0;color:#5a786e;font-size:13px;line-height:1.5}.mm-score-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:9px;margin-top:18px}.mm-score{padding:13px 8px;border-radius:14px;background:#fff;text-align:center}.mm-score b,.mm-score span{display:block}.mm-score b{color:var(--emerald-d);font-size:21px}.mm-score span{margin-top:4px;color:var(--sub);font-size:10px}.mm-result-actions{display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-top:18px}.mm-dashboard-entry{display:flex;align-items:center;gap:12px;width:100%;margin-top:10px;padding:14px;border:1px solid var(--line);border-radius:var(--radius);background:var(--card);color:var(--text);text-align:left;box-shadow:var(--shadow);font:inherit;cursor:pointer}.mm-dashboard-entry:active{transform:scale(.985)}.mm-dashboard-entry i{display:grid;place-items:center;width:38px;height:38px;border-radius:12px;background:#eaf6ef;font-style:normal;font-size:19px}.mm-dashboard-entry span{display:grid;gap:3px;min-width:0}.mm-dashboard-entry b{font-size:14px}.mm-dashboard-entry small{color:var(--sub);font-size:11px;line-height:1.35}.mm-dashboard-entry em{margin-left:auto;color:var(--sub);font-size:19px;font-style:normal}@keyframes mm-shake{0%,100%{transform:translateX(0)}35%{transform:translateX(-4px)}70%{transform:translateX(4px)}}@media(max-width:360px){.mm-type-grid{grid-template-columns:1fr}.mm-preset-grid{grid-template-columns:1fr}.mm-summary{grid-template-columns:1fr}.mm-pair-grid{gap:8px}.mm-pair-card{min-height:69px;padding:9px;font-size:13px}.mm-result-actions{grid-template-columns:1fr}}
  `;
  if (!document.querySelector('[data-memorizing-match-style]')) {
    const style = document.createElement('style');
    style.dataset.memorizingMatchStyle = 'true';
    style.textContent = css;
    document.head.appendChild(style);
  }

  const text = value => String(value ?? '').trim();
  const esc = value => text(value).replace(/[&<>'"]/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', "'":'&#39;', '"':'&quot;' })[char]);
  const key = value => text(value).toLocaleLowerCase('bn-BD');
  const shuffle = values => typeof shuffleArr === 'function' ? shuffleArr(values) : [...values].sort(() => Math.random() - .5);
  const route = suffix => `${ROUTE}${suffix ? `/${suffix}` : ''}`;
  const uid = prefix => `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2,8)}`;
  const config = id => typeConfig.find(item => item.id === id);
  const prettyTime = seconds => seconds ? `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}` : 'No timer';

  function relationItems(raw) {
    return Array.isArray(raw) ? raw.map(item => typeof item === 'string' ? { word:text(item), meaning:'' } : { word:text(item?.word), meaning:text(item?.meaning) }).filter(item => item.word) : [];
  }
  function normalizeVocab(raw) {
    return { id:text(raw?.id), word:text(raw?.word), meaning:text(raw?.meaning), synonyms:relationItems(raw?.synonyms), antonyms:relationItems(raw?.antonyms), tool:text(raw?.tool) };
  }
  function subjectName(id) { return text(state.subjects.find(row => text(row.id) === text(id))?.name); }
  function topicName(id) { return text(state.topics.find(row => text(row.id) === text(id))?.name); }
  function isMemorizingSubject(id) { return /memor|মেমোর|মুখস্থ/.test(key(subjectName(id))); }
  function answerOf(question) {
    const options = Array.isArray(question?.options) ? question.options.map(text) : [];
    const rawIndex = question?.answerIndex ?? question?.correctAnswerIndex ?? question?.answer;
    const index = Number(rawIndex);
    if (Number.isInteger(index) && options[index]) return options[index];
    if (typeof rawIndex === 'string' && rawIndex && !/^\d+$/.test(rawIndex)) return text(rawIndex);
    return text(question?.correctAnswer || question?.answerText || '');
  }
  function questionOf(question) { return text(question?.question || question?.text || question?.prompt || question?.title); }
  function dedupePairs(pairs) {
    const seen = new Set();
    return pairs.filter(pair => {
      const marker = `${key(pair.left)}|${key(pair.right)}`;
      if (!pair.left || !pair.right || key(pair.left) === key(pair.right) || seen.has(marker)) return false;
      seen.add(marker); return true;
    });
  }
  function vocabularyPairs(type) {
    const pairs = state.vocabulary.flatMap(record => {
      if (!record.word) return [];
      if (type === 'word-meaning') return record.meaning ? [{ id:`vm-${record.id}-meaning`, left:record.word, right:record.meaning }] : [];
      const relation = shuffle(type === 'synonym' ? record.synonyms : record.antonyms)[0];
      return relation?.word ? [{ id:`vm-${record.id}-${type}`, left:record.word, right:relation.meaning ? `${relation.word} — ${relation.meaning}` : relation.word }] : [];
    });
    return dedupePairs(pairs);
  }
  function birchonPairs(type) {
    const item = config(type);
    const keywords = item?.keywords || [];
    const pairs = state.questions.filter(question => {
      const topic = key(topicName(question.topicId));
      return isMemorizingSubject(question.subjectId) && keywords.some(word => topic.includes(key(word)));
    }).map(question => ({ id:`q-${text(question.id)}`, left:questionOf(question), right:answerOf(question) }));
    return dedupePairs(pairs);
  }
  function pairsFor(type) {
    const item = config(type);
    if (!item) return [];
    return item.source === 'vocabulary' ? vocabularyPairs(type) : birchonPairs(type);
  }
  function groupItems(group) { return typeConfig.filter(item => item.group === group); }
  function typeCount(item) { return pairsFor(item.id).length; }
  async function loadData() {
    const getAll = typeof dbGetAll === 'function' ? dbGetAll : async () => [];
    const [vocabulary, questions, subjects, topics] = await Promise.all([getAll(VOCAB_STORE), getAll('questions'), getAll('subjects'), getAll('topics')]);
    state.vocabulary = (vocabulary || []).filter(row => row && row.tool === 'vocabulary-master').map(normalizeVocab);
    state.questions = (questions || []).filter(Boolean);
    state.subjects = subjects || [];
    state.topics = topics || [];
    state.loaded = true;
  }
  function heading(kicker, title, sub) { return `<div class="explorer-head"><div class="mm-kicker">${esc(kicker)}</div><h2 class="mm-title">${esc(title)}</h2>${sub ? `<p class="mm-sub">${esc(sub)}</p>` : ''}</div>`; }
  function back(target) { return `<button class="backbtn" onclick="navigate('${target}')" aria-label="Back">←</button>`; }
  function typeCard(item) {
    const count = typeCount(item);
    return `<button class="mm-type" ${count ? '' : 'disabled'} onclick="MemorizingMatch.openSetup('${item.id}')"><span class="mm-type-mark">${esc(item.icon)}</span><strong>${esc(item.label)}</strong><small>${esc(item.bn)} জোড়া মিলান</small><b>${count ? `${count.toLocaleString()}টি pair` : 'Data নেই'}</b></button>`;
  }
  function renderHome() {
    const vocab = groupItems('English Vocabulary'); const bangla = groupItems('বাংলা বিরচন');
    const body = `<main class="mm-page">${heading('MEMORIZING EXAM ENGINE', 'জোড়া মিলিয়ে মুখস্থ করুন', 'শব্দ/প্রশ্নে tap করুন, তারপর তার সঠিক অর্থ বা উত্তরটি মিলান। শুধুই English Vocabulary ও Memorizing subject-এর বিরচন topic।')}<section class="mm-hero"><b>দ্রুত দুই-tap matching</b><p>সঠিক জোড়া মিললে নতুন pair আসবে। ভুল হলে কোনো mark কাটা হবে না—শুধু আবার চেষ্টা করুন। এই session আলাদা history বা reward তৈরি করে না।</p></section><section class="mm-group"><div class="mm-group-head"><h3>English Vocabulary</h3><span>${vocab.reduce((sum,item) => sum + typeCount(item), 0)}টি pair</span></div><div class="mm-type-grid">${vocab.map(typeCard).join('')}</div></section><section class="mm-group"><div class="mm-group-head"><h3>বাংলা বিরচন</h3><span>${bangla.reduce((sum,item) => sum + typeCount(item), 0)}টি pair</span></div><div class="mm-type-grid">${bangla.map(typeCard).join('')}</div></section>${!state.vocabulary.length && !state.questions.length ? `<div class="mm-empty"><b>এখনো matching data নেই</b><p>Vocabulary Parser-এ শব্দ যোগ করুন, অথবা Memorizing subject-এর বাগধারা/সমার্থক/বিপরীত/এক কথায় প্রকাশ/পারিভাষিক topic-এ question যোগ করুন।</p></div>` : ''}</main>`;
    renderShell(body, { title:'মুখস্থ জোড়া মিলান', back:"navigate('dashboard')" });
  }
  function renderSetup() {
    const item = config(state.selectedType); const available = pairsFor(state.selectedType);
    if (!item) { navigate(ROUTE); return; }
    const count = Math.min(state.count, available.length);
    const body = `<main class="mm-page">${heading(item.group, item.label, `${item.bn} থেকে real local data ব্যবহার করে জোড়া মিলান।`)}<section class="mm-setup"><article class="mm-setup-card"><div class="mm-step"><i>1</i> PAIR COUNT</div><h3>কতটি জোড়া?</h3><p>এক session-এ unique pair repeat হবে না।</p><div class="mm-preset-grid">${[5,10,25].map(value => `<button class="mm-preset ${state.count === value ? 'active' : ''}" onclick="MemorizingMatch.setCount(${value})"><b>${value}টি</b><small>${value <= available.length ? 'Ready' : `Max ${available.length}`}</small></button>`).join('')}</div>${state.count > available.length ? `<p style="margin:12px 0 0;color:#9a5a20;font-size:12px">এই type-এ ${available.length}টি valid pair আছে, তাই ${available.length}টি pair দিয়ে শুরু হবে।</p>` : ''}</article><article class="mm-setup-card"><div class="mm-step"><i>2</i> TIMER</div><h3>সময় দিন কি?</h3><p>Timer শুধু pace রাখার জন্য। শেষ হলে result দেখাবে, কোনো negative mark নেই।</p><div class="mm-preset-grid">${[[0,'No timer'],[60,'1 minute'],[180,'3 minutes']].map(([value,label]) => `<button class="mm-preset ${state.seconds === value ? 'active' : ''}" onclick="MemorizingMatch.setTime(${value})"><b>${esc(label)}</b><small>${value ? 'Fast round' : 'Learn freely'}</small></button>`).join('')}</div></article><article class="mm-setup-card"><div class="mm-step"><i>3</i> READY</div><h3>Session summary</h3><div class="mm-summary"><div><span>Type</span><b>${esc(item.label)}</b></div><div><span>Pairs</span><b>${count}</b></div><div><span>Time</span><b>${prettyTime(state.seconds)}</b></div></div><button class="btn mm-start" ${count < 2 ? 'disabled' : ''} onclick="MemorizingMatch.start()">START MATCHING →</button>${count < 2 ? '<p style="margin:10px 0 0;color:var(--sub);font-size:12px">Matching শুরু করতে কমপক্ষে ২টি valid pair দরকার।</p>' : ''}</article></section></main>`;
    renderShell(body, { title:item.label, back:`navigate('${ROUTE}')` });
  }
  function buildGrid(game) {
    while (game.grid.length < MAX_GRID_PAIRS * 2 && game.next < game.pairs.length) {
      const pair = game.pairs[game.next++];
      game.grid.push({ id:uid('left'), pairId:pair.id, side:'left', label:pair.left, status:'' }, { id:uid('right'), pairId:pair.id, side:'right', label:pair.right, status:'' });
    }
    game.grid = shuffle(game.grid);
  }
  function stopTimer(game = state.game) { if (game?.timer) { clearInterval(game.timer); game.timer = null; } }
  function startTimer(game) {
    if (!game || !game.secondsLeft || game.timer) return;
    game.timer = setInterval(() => {
      if (state.game !== game) return stopTimer(game);
      game.secondsLeft--;
      if (game.secondsLeft <= 0) { game.timedOut = true; stopTimer(game); game.complete = true; renderResult(); return; }
      renderGame();
    }, 1000);
  }
  function renderGame() {
    const game = state.game;
    if (!game) { navigate(ROUTE); return; }
    if (game.pause === 'milestone') { renderMilestone(); return; }
    const total = game.pairs.length; const progress = Math.round((game.matched / total) * 100);
    const cards = game.grid.map(card => `<button class="mm-pair-card ${card.status} ${game.selectedId === card.id ? 'selected' : ''}" onclick="MemorizingMatch.pick('${card.id}')">${esc(card.label)}</button>`).join('');
    const body = `<main class="mm-page mm-game"><div class="mm-game-head"><button class="mm-close" onclick="MemorizingMatch.cancel()" aria-label="Exit matching">×</button><div class="mm-progress-wrap"><div class="mm-progress-meta"><span>${game.matched}/${total} matched</span><span>${progress}%</span></div><div class="mm-progress"><i style="width:${progress}%"></i></div></div>${game.secondsLeft ? `<div class="mm-timer">${prettyTime(game.secondsLeft)}</div>` : ''}</div><div class="mm-combo">✦ Combo ×${game.combo}</div><p class="mm-instruction">একটি card বেছে নিন, তারপর তার সঠিক জোড়াটি tap করুন। সঠিক হলে নতুন জোড়া আসবে।</p><section class="mm-pair-grid">${cards}</section></main>`;
    renderShell(body, { title:'জোড়া মিলান', back:'MemorizingMatch.cancel()' });
  }
  function renderMilestone() {
    const game = state.game; const next = Math.min(game.pairs.length, game.matched + 5);
    const body = `<main class="mm-page mm-game"><section class="mm-milestone"><div class="mm-milestone-card"><div class="mm-milestone-icon">✓</div><h2>চমৎকার!</h2><p>আপনি ${game.matched}টি জোড়া ঠিক মিলিয়েছেন। এবার ${next}টি পর্যন্ত চালিয়ে যান।</p><button class="mm-continue" onclick="MemorizingMatch.continue()">চালিয়ে যান →</button></div></section></main>`;
    renderShell(body, { title:'জোড়া মিলান', back:'MemorizingMatch.cancel()' });
  }
  function renderResult() {
    const game = state.game;
    if (!game) { navigate(ROUTE); return; }
    const attempts = game.correct + game.wrong; const accuracy = attempts ? Math.round((game.correct / attempts) * 100) : 0;
    const item = config(game.type);
    const body = `<main class="mm-page">${heading('MATCHING COMPLETE', game.timedOut ? "Time's Up" : 'Round complete', game.timedOut ? 'সময় শেষ হয়েছে। আপনার matched pair-এর summary নিচে আছে।' : 'আপনি selected round শেষ করেছেন।')}<section class="mm-result"><h3 class="mm-result-title">${esc(item?.label || 'Memorizing')}</h3><p class="mm-result-sub">এই learning session থেকে কোনো আলাদা exam history, XP বা reward তৈরি হয়নি।</p><div class="mm-score-grid"><div class="mm-score"><b>${game.matched}</b><span>Matched</span></div><div class="mm-score"><b>${accuracy}%</b><span>Accuracy</span></div><div class="mm-score"><b>×${game.maxCombo}</b><span>Best combo</span></div></div><div class="mm-result-actions"><button class="btn" onclick="MemorizingMatch.playAgain()">আবার খেলুন</button><button class="btn secondary" onclick="MemorizingMatch.finish()">সব category</button></div></section></main>`;
    renderShell(body, { title:'Matching result', back:'MemorizingMatch.finish()' });
  }
  const api = {
    async render() {
      if (!state.loaded) await loadData();
      const path = text(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0]);
      if (path.endsWith('/game')) return renderGame();
      if (path.endsWith('/result')) return renderResult();
      if (path.includes('/setup')) return renderSetup();
      return renderHome();
    },
    openSetup(type) { state.selectedType = type; state.count = 10; state.seconds = 0; navigate(route('setup')); },
    setCount(value) { state.count = Number(value) || 5; renderSetup(); },
    setTime(value) { state.seconds = Number(value) || 0; renderSetup(); },
    start() {
      const pairs = shuffle(pairsFor(state.selectedType)).slice(0, Math.min(state.count, pairsFor(state.selectedType).length));
      if (pairs.length < 2) return toast('Matching শুরু করতে কমপক্ষে ২টি valid pair দরকার');
      const game = { type:state.selectedType, pairs, next:0, grid:[], selectedId:'', locked:false, matched:0, correct:0, wrong:0, combo:0, maxCombo:0, secondsLeft:state.seconds, initialSeconds:state.seconds, timer:null, pause:'', seenMilestones:[], complete:false, timedOut:false };
      state.game = game; buildGrid(game); startTimer(game); navigate(route('game'));
    },
    pick(id) {
      const game = state.game; if (!game || game.locked || game.pause || game.complete) return;
      const card = game.grid.find(item => item.id === id); if (!card) return;
      if (!game.selectedId) { game.selectedId = id; return renderGame(); }
      if (game.selectedId === id) { game.selectedId = ''; return renderGame(); }
      const first = game.grid.find(item => item.id === game.selectedId); if (!first) { game.selectedId = ''; return renderGame(); }
      game.locked = true;
      if (first.pairId === card.pairId && first.side !== card.side) {
        first.status = 'correct'; card.status = 'correct'; game.correct++; game.combo++; game.maxCombo = Math.max(game.maxCombo, game.combo); renderGame();
        setTimeout(() => {
          if (state.game !== game) return;
          game.grid = game.grid.filter(item => item.pairId !== first.pairId); game.matched++; game.selectedId = ''; game.locked = false; buildGrid(game);
          const milestones = [5,10,25];
          if (game.matched >= game.pairs.length) { stopTimer(game); game.complete = true; return renderResult(); }
          if (milestones.includes(game.matched) && !game.seenMilestones.includes(game.matched)) { game.seenMilestones.push(game.matched); game.pause = 'milestone'; stopTimer(game); return renderMilestone(); }
          renderGame();
        }, 360);
      } else {
        first.status = 'wrong'; card.status = 'wrong'; game.wrong++; game.combo = 0; renderGame();
        setTimeout(() => { if (state.game !== game) return; first.status = ''; card.status = ''; game.selectedId = ''; game.locked = false; renderGame(); }, 430);
      }
    },
    continue() { const game = state.game; if (!game) return; game.pause = ''; startTimer(game); renderGame(); },
    cancel() { stopTimer(); state.game = null; navigate(state.selectedType ? route('setup') : ROUTE); },
    playAgain() { stopTimer(); state.game = null; api.start(); },
    finish() { stopTimer(); state.game = null; state.selectedType = ''; navigate(ROUTE); },
  };

  window.MemorizingMatch = api;
  const previousRouteRenderer = window.__admissionRenderRoute;
  window.__admissionRenderRoute = function memorizingMatchRouteRenderer() {
    const path = text(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
    if (path === ROUTE || path.startsWith(`${ROUTE}/`)) return api.render();
    return typeof previousRouteRenderer === 'function' ? previousRouteRenderer.apply(this, arguments) : window.render?.();
  };
  function injectDashboardEntry() {
    const page = document.querySelector('#app .page');
    if (!page || page.querySelector('[data-memorizing-match-entry]')) return;
    const tools = page.querySelector('[data-unified-study-tools-list]');
    if (!tools) return;
    const entry = document.createElement('button');
    entry.type = 'button'; entry.className = 'mm-dashboard-entry'; entry.dataset.memorizingMatchEntry = 'true';
    entry.innerHTML = '<i aria-hidden="true">🧩</i><span><b>মুখস্থ জোড়া মিলান</b><small>Vocabulary ও বিরচন দ্রুত matching practice</small></span><em aria-hidden="true">›</em>';
    entry.onclick = () => navigate(ROUTE);
    tools.appendChild(entry);
  }
  const previousDashboard = window.renderDashboard;
  if (typeof previousDashboard === 'function') {
    window.renderDashboard = function memorizingMatchDashboard() { const result = previousDashboard.apply(this, arguments); injectDashboardEntry(); return result; };
  }
  const app = document.getElementById('app');
  if (app) new MutationObserver(() => setTimeout(injectDashboardEntry, 0)).observe(app, { childList:true, subtree:true });
  setTimeout(injectDashboardEntry, 80);
})();
