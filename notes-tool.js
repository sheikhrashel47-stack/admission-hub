/* ============================================================
   ADMISSION HUB · NOTES TOOL
   Additive local notes for wrong questions. Uses the existing
   IndexedDB layer and never changes question/answer records.
   ============================================================ */
(function installNotesTool(){
  'use strict';
  if (window.__notesToolInstalled) return;
  window.__notesToolInstalled = true;

  const NOTE_STORE = 'notes';
  const state = { filter: 'all', search: '' };

  function cache(){ try { if(typeof CACHE!=='undefined' && CACHE) return CACHE; } catch(_){} return window.CACHE || { notes: [], questions: [], subjects: [], topics: [] }; }
  function escValue(value){
    if(typeof window.esc === 'function') return window.esc(String(value ?? ''));
    return String(value ?? '').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function text(value, max=5000){ return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,max); }
  function questionAnswerIndex(q){
    const n=Number(q?.answerIndex ?? q?.answer ?? q?.correctAnswerIndex ?? 0);
    return Number.isFinite(n) ? n : 0;
  }
  function subjectName(id){ return text((cache().subjects||[]).find(x=>x.id===id)?.name || ''); }
  function topicName(id){ return text((cache().topics||[]).find(x=>x.id===id)?.name || ''); }
  function sourceLabel(source){ return source==='Flash Test' ? 'Flash Test' : 'Question Bank'; }
  function noteFromQuestion({q, selectedIndex, source, existing}){
    const correctIndex=questionAnswerIndex(q);
    const options=Array.isArray(q?.options)?q.options.map(x=>text(x,1200)):[];
    const current=existing||{};
    return {
      id:current.id || `note-${typeof uid==='function'?uid():Date.now()}`,
      type:'mistake-question-note',
      questionId:q?.id||current.questionId||'',
      source:sourceLabel(source||current.source),
      question:text(q?.question ?? current.question,5000),
      options:options.length?options:(current.options||[]),
      correctAnswerIndex:correctIndex,
      correctAnswer:options[correctIndex] || current.correctAnswer || '',
      wrongAnswer:options[Number(selectedIndex)] || current.wrongAnswer || current.selectedAnswer || '',
      selectedAnswer:options[Number(selectedIndex)] || current.selectedAnswer || current.wrongAnswer || '',
      subjectId:q?.subjectId ?? current.subjectId ?? '',
      topicId:q?.topicId ?? current.topicId ?? '',
      explanation:text(q?.explanation ?? current.explanation,4000),
      aiExplain:text(current.aiExplain,8000),
      createdAt:current.createdAt||Date.now(),
      updatedAt:Date.now()
    };
  }
  function getNote(id){ return (cache().notes||[]).find(n=>n.id===id) || null; }
  async function saveNote(note){
    await dbPut(NOTE_STORE,note);
    const list=cache().notes||[];
    const index=list.findIndex(item=>item.id===note.id);
    if(index>=0) list[index]=note; else list.unshift(note);
    cache().notes=list;
    if(typeof closeModal==='function') closeModal();
    if(typeof toast==='function') toast('নোটে সেভ হয়েছে');
    if((window.Router?.path||'')==='notes') renderNotesTool();
  }
  function optionsMarkup(note){
    return (note.options||[]).map((option,index)=>{
      const isCorrect=index===Number(note.correctAnswerIndex);
      const isWrong=index===Number(note.correctAnswerIndex) ? false : String(option)===String(note.wrongAnswer);
      return `<div class="note-option ${isCorrect?'is-correct':''} ${isWrong?'is-wrong':''}"><b>${String.fromCharCode(65+index)}</b><span>${escValue(option)}</span>${isCorrect?'<em>সঠিক</em>':''}${isWrong?'<em>তোমার উত্তর</em>':''}</div>`;
    }).join('');
  }
  function openEditor(note){
    openModal(`<div class="note-editor-head"><div><div class="note-kicker">${escValue(note.source)} · ছোট নোট</div><h3>এই প্রশ্নটি নোট করুন</h3></div><button class="iconbtn" onclick="closeModal()">×</button></div><div class="note-card-preview"><div class="note-meta">${escValue(subjectName(note.subjectId))}${note.topicId?` · ${escValue(topicName(note.topicId))}`:''}</div><div class="note-question">${escValue(note.question)}</div><div class="note-options">${optionsMarkup(note)}</div><div class="note-answer-grid"><div class="wrong-box"><small>তোমার উত্তর</small><b>${escValue(note.wrongAnswer||'—')}</b></div><div class="correct-box"><small>সঠিক উত্তর</small><b>${escValue(note.correctAnswer||'—')}</b></div></div>${note.explanation?`<div class="note-existing"><b>Existing explanation</b><p>${escValue(note.explanation)}</p></div>`:''}</div><label class="flabel">AI Explain</label><textarea id="noteAiExplainInput" placeholder="Gemini-এর explanation এখানে paste করো...">${escValue(note.aiExplain)}</textarea><p class="note-save-hint">Save চাপলে পুরো question card, answer, explanation ও AI Explain এই নোটে রাখা হবে।</p><button class="btn" style="margin-top:14px" onclick="window.saveCurrentQuestionNote()">💾 Save Note</button>`);
    window.__editingQuestionNote=note;
  }
  window.openQuestionNoteEditor=function(payload){
    if(!payload?.q) return;
    openEditor(noteFromQuestion(payload));
  };
  window.saveCurrentQuestionNote=async function(){
    const note=window.__editingQuestionNote;
    if(!note) return;
    note.aiExplain=text(document.getElementById('noteAiExplainInput')?.value,8000);
    note.updatedAt=Date.now();
    await saveNote(note);
    window.__editingQuestionNote=null;
  };
  window.editSavedNote=function(id){ const note=getNote(id); if(note) openEditor(note); };
  window.deleteSavedNote=async function(id){
    const note=getNote(id); if(!note) return;
    if(typeof confirmModal==='function'){
      confirmModal('নোট মুছে ফেলবেন?', 'এই নোটটি Notes থেকে মুছে যাবে; মূল question ও Mistake Book বদলাবে না।', async()=>{ await dbDel(NOTE_STORE,id); cache().notes=(cache().notes||[]).filter(item=>item.id!==id); renderNotesTool(); toast('নোট মুছে গেছে'); }, 'Delete', true);
    }
  };
  window.setNotesFilter=function(filter){ state.filter=filter; renderNotesTool(); };
  window.searchSavedNotes=function(value){ state.search=String(value||''); renderNotesTool(); setTimeout(()=>{const el=document.getElementById('notesSearch');if(el){el.focus();el.selectionStart=el.value.length;}},0); };
  function noteMatches(note){
    const filter=state.filter==='all'||note.source===state.filter;
    const hay=[note.question,note.wrongAnswer,note.correctAnswer,note.aiExplain,subjectName(note.subjectId),topicName(note.topicId)].join(' ').toLowerCase();
    return filter && (!state.search || hay.includes(state.search.toLowerCase()));
  }
  window.renderNotesTool=function(){
    const list=(cache().notes||[]).filter(noteMatches).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    const total=(cache().notes||[]).length;
    const qbank=(cache().notes||[]).filter(n=>n.source==='Question Bank').length;
    const flash=(cache().notes||[]).filter(n=>n.source==='Flash Test').length;
    const cards=list.map(note=>`<article class="saved-note-card"><div class="saved-note-top"><span class="note-kicker">${escValue(note.source)}</span><span class="note-date">${new Date(note.updatedAt||note.createdAt||Date.now()).toLocaleDateString('bn-BD')}</span></div><div class="saved-note-subject">${escValue(subjectName(note.subjectId))}${note.topicId?` · ${escValue(topicName(note.topicId))}`:''}</div><h3>${escValue(note.question)}</h3><div class="saved-note-answer"><span class="wrong-label">ভুল: ${escValue(note.wrongAnswer||'—')}</span><span class="correct-label">সঠিক: ${escValue(note.correctAnswer||'—')}</span></div>${note.aiExplain?`<div class="saved-ai-explain"><b>AI Explain</b><p>${escValue(note.aiExplain)}</p></div>`:`<div class="saved-ai-empty">AI Explain এখনো যোগ করা হয়নি</div>`}<div class="saved-note-actions"><button class="note-action primary" onclick="editSavedNote('${escValue(note.id)}')">Edit / AI Explain</button><button class="note-action" onclick="deleteSavedNote('${escValue(note.id)}')">Delete</button></div></article>`).join('');
    const html=`<main class="notes-page"><div class="notes-hero"><div class="notes-kicker">PERSONAL LEARNING NOTES</div><h1>নোট</h1><p>ভুল প্রশ্ন, সঠিক উত্তর ও AI explanation এক জায়গায় রাখো।</p><div class="notes-stat-grid"><div><b>${total}</b><span>All Notes</span></div><div><b>${qbank}</b><span>Question Bank</span></div><div><b>${flash}</b><span>Flash Test</span></div></div></div><div class="notes-toolbar"><input id="notesSearch" type="search" placeholder="নোট খুঁজুন..." value="${escValue(state.search)}" oninput="searchSavedNotes(this.value)"><div class="notes-tabs"><button class="note-tab ${state.filter==='all'?'active':''}" onclick="setNotesFilter('all')">সব</button><button class="note-tab ${state.filter==='Question Bank'?'active':''}" onclick="setNotesFilter('Question Bank')">Question Bank</button><button class="note-tab ${state.filter==='Flash Test'?'active':''}" onclick="setNotesFilter('Flash Test')">Flash Test</button></div></div>${cards?`<section class="saved-notes-list">${cards}</section>`:`<div class="notes-empty"><div>📝</div><h3>এখনো কোনো নোট নেই</h3><p>Question Bank বা Flash Test-এ ভুল হলে “ছোট নোট করুন” চাপলে এখানে দেখা যাবে।</p></div>`}</main>`;
    renderShell(html,{title:'নোট',back:"navigate('dashboard')"});
  };
  const previousRender=window.render;
  if(typeof previousRender==='function'){
    window.render=function notesRouteRender(){ if(Router.path==='notes') return window.renderNotesTool(); return previousRender.apply(this,arguments); };
  }
  function addDashboardCard(){
    if(Router.path!=='dashboard') return;
    const candidates=[...document.querySelectorAll('.p3-special-section-v3, .dashboard-section')].filter(el=>el.textContent.includes('Study Tools') && el.textContent.includes('Review & analysis'));
    const section=candidates.find(el=>{const r=el.getBoundingClientRect();return r.width>0&&r.height>0}) || candidates[0];
    if(!section) return;
    document.querySelectorAll('[data-notes-tool-card]').forEach(existing=>{if(existing.parentElement!==section) existing.remove();});
    if(section.querySelector('[data-notes-tool-card]')) return;
    const card=document.createElement('button'); card.type='button'; card.dataset.notesToolCard=''; card.className='special-tool-card'; card.innerHTML='<span class="special-tool-icon">📝</span><span><strong>নোট</strong><small>ভুল প্রশ্ন ও AI Explain সংরক্ষণ</small></span><span class="tool-arrow">↗</span>'; card.onclick=()=>navigate('notes');
    const grid=section.querySelector('.p3-special-tools-grid, .special-tools-grid'); if(grid) grid.appendChild(card); else section.appendChild(card);
  }
  const app=document.getElementById('app');
  if(app) new MutationObserver(()=>setTimeout(addDashboardCard,0)).observe(app,{childList:true,subtree:true});
  setTimeout(addDashboardCard,80); setTimeout(addDashboardCard,500);
  const style=document.createElement('style'); style.id='notes-tool-styles'; style.textContent=`.notes-page{padding-bottom:20px}.notes-hero{background:linear-gradient(135deg,#0f6b4f,#0b4f3b);color:#fff;border-radius:24px;padding:20px 17px;box-shadow:0 14px 30px rgba(15,107,79,.2)}.notes-kicker{font-size:10px;letter-spacing:.12em;font-weight:900;color:var(--emerald)}.notes-hero .notes-kicker{color:rgba(255,255,255,.72)}.notes-hero h1{font-size:29px;margin:6px 0}.notes-hero p{font-size:13px;line-height:1.5;opacity:.85;margin:0}.notes-stat-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:7px;margin-top:17px}.notes-stat-grid>div{background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.18);border-radius:13px;padding:10px 6px;text-align:center}.notes-stat-grid b,.notes-stat-grid span{display:block}.notes-stat-grid b{font-size:21px}.notes-stat-grid span{font-size:10px;opacity:.78;margin-top:2px}.notes-toolbar{margin:15px 0 12px}.notes-toolbar input{background:var(--card);margin-bottom:9px}.notes-tabs{display:flex;gap:7px;overflow-x:auto}.note-tab{border:1px solid var(--line);background:var(--card);color:var(--sub);border-radius:18px;padding:8px 12px;font-size:11px;font-weight:800;white-space:nowrap}.note-tab.active{background:var(--emerald);border-color:var(--emerald);color:#fff}.saved-notes-list{display:flex;flex-direction:column;gap:12px}.saved-note-card{background:var(--card);border:1px solid var(--line);border-left:5px solid var(--emerald);border-radius:18px;padding:14px;box-shadow:var(--shadow)}.saved-note-top{display:flex;justify-content:space-between;align-items:center}.saved-note-card .note-kicker{color:var(--emerald-d)}.note-date{font-size:10px;color:var(--sub)}.saved-note-subject{font-size:11px;color:var(--sub);margin-top:7px}.saved-note-card h3{font-size:15px;line-height:1.5;margin:8px 0}.saved-note-answer{display:grid;grid-template-columns:1fr 1fr;gap:7px}.saved-note-answer span{font-size:11px;padding:8px;border-radius:10px;line-height:1.4}.wrong-label{background:#fff1f1;color:#ad2d2d}.correct-label{background:#edfaf1;color:#187844}.saved-ai-explain{margin-top:9px;padding:10px;border-radius:11px;background:#fff8e7;color:#684f1b;font-size:11px;line-height:1.55}.saved-ai-explain p{margin:4px 0 0;white-space:pre-wrap}.saved-ai-empty{margin-top:9px;padding:9px;border-radius:10px;background:var(--mint);color:var(--sub);font-size:11px}.saved-note-related{font-size:11px;color:var(--sub);margin-top:9px}.saved-note-actions{display:flex;gap:7px;margin-top:11px}.note-action{flex:1;border:1px solid var(--line);background:var(--card);color:var(--text);border-radius:10px;padding:9px 7px;font-size:11px;font-weight:800}.note-action.primary{background:var(--emerald);border-color:var(--emerald);color:#fff}.notes-empty{text-align:center;padding:45px 18px;color:var(--sub)}.notes-empty>div{font-size:40px}.notes-empty h3{color:var(--text);margin:8px 0}.notes-empty p{font-size:12px;line-height:1.5}.note-editor-head{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}.note-editor-head h3{margin:3px 0 0}.note-kicker{font-size:10px;letter-spacing:.08em;font-weight:900;color:var(--emerald-d)}.note-card-preview{margin-top:7px;padding:12px;border-radius:14px;background:var(--mint)}.note-meta{font-size:10px;color:var(--sub)}.note-question{font-size:15px;font-weight:850;line-height:1.5;margin:6px 0 10px}.note-options{display:flex;flex-direction:column;gap:5px}.note-option{display:flex;align-items:flex-start;gap:7px;padding:7px 8px;border-radius:9px;background:rgba(255,255,255,.66);font-size:11px;line-height:1.4}.note-option b{min-width:17px}.note-option span{flex:1}.note-option em{font-style:normal;font-size:9px;font-weight:900;color:var(--sub);white-space:nowrap}.note-option.is-correct{background:#e4f8e9;color:#176f3c}.note-option.is-correct em{color:#176f3c}.note-option.is-wrong{background:#ffe9e9;color:#a82b2b}.note-option.is-wrong em{color:#a82b2b}.note-answer-grid{display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-top:9px}.wrong-box,.correct-box{padding:8px;border-radius:10px}.wrong-box{background:#fff1f1;color:#a82b2b}.correct-box{background:#e4f8e9;color:#176f3c}.wrong-box small,.correct-box small{display:block;font-size:9px}.wrong-box b,.correct-box b{display:block;font-size:11px;margin-top:3px;line-height:1.4}.note-existing{margin-top:9px;padding:9px;border-radius:10px;background:#fff8e7;color:#684f1b;font-size:11px;line-height:1.5}.note-existing p{margin:4px 0 0}.note-save-hint{font-size:11px;color:var(--sub);line-height:1.45;margin:7px 0}.note-related{margin-top:13px}.note-section-title{font-weight:900;color:var(--text);font-size:12px;margin-bottom:6px}.note-related-item{display:flex;gap:8px;padding:7px 0;border-bottom:1px solid var(--line);font-size:11px;line-height:1.4}.note-related-item>span{width:20px;height:20px;display:flex;align-items:center;justify-content:center;border-radius:50%;background:var(--mint);color:var(--emerald-d);font-weight:900;flex:0 0 20px}.note-related-item small{display:block;color:var(--sub);font-size:9px;margin-top:2px}@media(max-width:430px){.saved-note-answer{grid-template-columns:1fr}.notes-hero{border-radius:20px}.note-editor-head h3{font-size:16px}}.notes-page{padding-bottom:28px}.notes-hero{padding:25px 22px;border-radius:26px;box-shadow:0 18px 38px rgba(15,107,79,.22)}.notes-hero h1{font-size:34px;letter-spacing:-.04em}.notes-hero p{font-size:14px;line-height:1.7}.notes-stat-grid{gap:10px;margin-top:22px}.notes-stat-grid>div{padding:13px 7px;border-radius:16px}.notes-stat-grid b{font-size:25px}.notes-stat-grid span{font-size:11px}.notes-toolbar{margin:20px 0 16px}.notes-toolbar input{min-height:50px;border-radius:15px;padding:12px 15px;font-size:15px}.notes-tabs{gap:9px}.note-tab{padding:10px 15px;border-radius:999px;font-size:12px}.saved-notes-list{gap:17px}.saved-note-card{position:relative;background:linear-gradient(145deg,#fff 0%,#f7fcf9 100%);border:1px solid rgba(15,107,79,.16);border-left:6px solid var(--emerald);border-radius:22px;padding:19px 18px;box-shadow:0 12px 30px rgba(23,58,43,.09)}.saved-note-card:before{content:'';position:absolute;top:0;right:0;width:86px;height:86px;border-radius:0 22px 0 86px;background:rgba(15,107,79,.05);pointer-events:none}.saved-note-top{position:relative;z-index:1}.saved-note-card .note-kicker{font-size:11px;letter-spacing:.1em}.note-date{font-size:11px}.saved-note-subject{font-size:13px;margin-top:11px}.saved-note-card h3{font-size:19px;line-height:1.65;margin:10px 0 14px;color:var(--text)}.saved-note-answer{gap:9px}.saved-note-answer span{font-size:13px;padding:11px 12px;border-radius:13px;line-height:1.55}.saved-ai-explain{margin-top:13px;padding:14px 14px;border-radius:15px;font-size:13px;line-height:1.75;box-shadow:inset 0 0 0 1px rgba(201,138,44,.12)}.saved-ai-explain b{font-size:13px}.saved-ai-explain p{margin:6px 0 0}.saved-ai-empty{margin-top:13px;padding:12px 13px;border-radius:13px;font-size:12px}.saved-note-actions{gap:10px;margin-top:15px}.note-action{min-height:44px;border-radius:13px;padding:10px 8px;font-size:13px}.notes-empty{padding:65px 20px}.notes-empty>div{font-size:48px}.notes-empty h3{font-size:19px}.notes-empty p{font-size:13px;line-height:1.7}.note-editor-head{padding-bottom:4px}.note-editor-head h3{font-size:20px;line-height:1.4}.note-kicker{font-size:11px}.note-card-preview{margin-top:10px;padding:16px 15px;border-radius:18px;background:linear-gradient(145deg,#eaf7f0,#e1f2e9);box-shadow:inset 0 0 0 1px rgba(15,107,79,.08)}.note-meta{font-size:11px}.note-question{font-size:19px;line-height:1.7;margin:8px 0 13px}.note-options{gap:7px}.note-option{gap:9px;padding:10px 11px;border-radius:12px;font-size:13px;line-height:1.6}.note-option b{min-width:20px;font-size:13px}.note-option em{font-size:10px}.note-answer-grid{gap:9px;margin-top:12px}.wrong-box,.correct-box{padding:11px 12px;border-radius:13px}.wrong-box small,.correct-box small{font-size:10px}.wrong-box b,.correct-box b{font-size:13px;margin-top:4px;line-height:1.55}.note-existing{margin-top:12px;padding:12px 13px;border-radius:13px;font-size:12.5px;line-height:1.7}.note-existing p{margin:5px 0 0}.note-save-hint{font-size:12.5px;line-height:1.65;margin:9px 0}.note-editor-head .iconbtn{font-size:25px}.notes-page .special-tool-card{min-height:88px}@media(max-width:430px){.notes-hero{padding:22px 18px}.notes-hero h1{font-size:31px}.saved-note-card{padding:17px 15px}.saved-note-card h3{font-size:18px}.note-question{font-size:18px}.note-option{font-size:12.5px}.note-existing{font-size:12px}}[data-notes-tool-card]{background:linear-gradient(135deg,#0f6b4f,#0b4f3b)!important;border-color:#0b4f3b!important;color:#fff;box-shadow:0 14px 28px rgba(15,107,79,.2)!important;min-height:92px!important}[data-notes-tool-card] strong,[data-notes-tool-card] small,[data-notes-tool-card] .tool-arrow{color:#fff!important}[data-notes-tool-card] small{opacity:.78}@media(max-width:430px){[data-notes-tool-card]{min-height:88px!important}}`; document.head.appendChild(style);
})();
