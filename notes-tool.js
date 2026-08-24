/* ============================================================
   ADMISSION HUB · NOTES QUESTION REVIEW
   Design reminder: calm emerald academic cards, four-option review,
   compact filters, and explanation revealed only by deliberate action.
   Uses the existing IndexedDB notes store without changing question data.
   ============================================================ */
(function installNotesTool(){
  'use strict';
  if(window.__notesToolInstalled) return;
  window.__notesToolInstalled=true;

  const NOTE_STORE='notes';
  const state={source:'all',subjectId:'all',topicId:'all',search:'',expandedAi:new Set()};

  function cache(){ try{ if(typeof CACHE!=='undefined'&&CACHE) return CACHE; }catch(_){} return window.CACHE||{notes:[],questions:[],subjects:[],topics:[]}; }
  function escValue(value){
    if(typeof window.esc==='function') return window.esc(String(value??''));
    return String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function text(value,max=5000){ return String(value??'').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,max); }
  function questionAnswerIndex(q){ const n=Number(q?.answerIndex??q?.answer??q?.correctAnswerIndex??0); return Number.isFinite(n)?n:0; }
  function subjectName(id){ return text((cache().subjects||[]).find(row=>row.id===id)?.name||''); }
  function topicName(id){ return text((cache().topics||[]).find(row=>row.id===id)?.name||''); }
  function sourceLabel(source){ return source==='Flash Test'?'Flash Test':'Question Bank'; }
  function noteSubject(note){ return subjectName(note.subjectId)||'সাবজেক্ট নির্ধারিত নয়'; }
  function noteTopic(note){ return topicName(note.topicId)||'টপিক নির্ধারিত নয়'; }
  function noteDomId(note){ return encodeURIComponent(String(note.id||'')); }

  function noteFromQuestion({q,selectedIndex,source,existing}){
    const correctIndex=questionAnswerIndex(q);
    const options=Array.isArray(q?.options)?q.options.map(option=>text(option,1200)):[];
    const current=existing||{};
    const picked=Number(selectedIndex);
    const selectedAnswerIndex=Number.isInteger(picked)&&picked>=0?picked:Number(current.selectedAnswerIndex);
    return {
      id:current.id||`note-${typeof uid==='function'?uid():Date.now()}`,
      type:'mistake-question-note', questionId:q?.id||current.questionId||'', source:sourceLabel(source||current.source),
      question:text(q?.question??current.question,5000), options:options.length?options:(current.options||[]),
      correctAnswerIndex:correctIndex, correctAnswer:options[correctIndex]||current.correctAnswer||'',
      selectedAnswerIndex:Number.isInteger(selectedAnswerIndex)?selectedAnswerIndex:null,
      wrongAnswer:options[selectedAnswerIndex]||current.wrongAnswer||current.selectedAnswer||'',
      selectedAnswer:options[selectedAnswerIndex]||current.selectedAnswer||current.wrongAnswer||'',
      subjectId:q?.subjectId??current.subjectId??'', topicId:q?.topicId??current.topicId??'',
      explanation:text(q?.explanation??current.explanation,4000), aiExplain:text(current.aiExplain,8000),
      createdAt:current.createdAt||Date.now(), updatedAt:Date.now()
    };
  }
  function getNote(id){ return (cache().notes||[]).find(note=>note.id===id)||null; }
  async function saveNote(note){
    await dbPut(NOTE_STORE,note);
    const list=cache().notes||[]; const index=list.findIndex(item=>item.id===note.id);
    if(index>=0) list[index]=note; else list.unshift(note);
    cache().notes=list;
    if(typeof closeModal==='function') closeModal();
    if(typeof toast==='function') toast('নোটে সেভ হয়েছে');
    if((window.Router?.path||'')==='notes') renderNotesTool();
  }
  function selectedIndexOf(note){
    const n=Number(note.selectedAnswerIndex);
    if(Number.isInteger(n)&&n>=0) return n;
    return (note.options||[]).findIndex(option=>String(option)===String(note.selectedAnswer||note.wrongAnswer));
  }
  function optionsMarkup(note,variant='card'){
    const selectedIndex=selectedIndexOf(note), correctIndex=Number(note.correctAnswerIndex);
    return (note.options||[]).map((option,index)=>{
      const isCorrect=index===correctIndex, isSelected=index===selectedIndex;
      const cls=`note-option ${variant==='card'?'note-review-option':''} ${isCorrect?'is-correct':''} ${isSelected&&!isCorrect?'is-wrong':''} ${isSelected?'is-selected':''}`;
      const tag=isCorrect&&isSelected?'তোমার উত্তর · সঠিক':isCorrect?'সঠিক উত্তর':isSelected?'তোমার উত্তর':'';
      return `<div class="${cls}"><b>${String.fromCharCode(65+index)}</b><span>${escValue(option)}</span>${tag?`<em>${tag}</em>`:''}</div>`;
    }).join('');
  }
  function openEditor(note){
    openModal(`<div class="note-editor-head"><div><div class="note-kicker">${escValue(note.source)} · প্রশ্ন নোট</div><h3>নোট ও AI Explain সম্পাদনা</h3></div><button class="iconbtn" onclick="closeModal()">×</button></div><div class="note-card-preview"><div class="note-meta">${escValue(noteSubject(note))}${note.topicId?` · ${escValue(noteTopic(note))}`:''}</div><div class="note-question">${escValue(note.question)}</div><div class="note-options">${optionsMarkup(note,'editor')}</div></div><label class="flabel">AI Explain</label><textarea id="noteAiExplainInput" placeholder="AI explanation এখানে লিখুন বা paste করুন...">${escValue(note.aiExplain)}</textarea><p class="note-save-hint">Save করলে মূল প্রশ্ন, চারটি option ও answer state অপরিবর্তিত থাকবে; শুধু AI Explain আপডেট হবে।</p><button class="btn" style="margin-top:14px" onclick="window.saveCurrentQuestionNote()">💾 Save Note</button>`);
    window.__editingQuestionNote=note;
  }
  window.openQuestionNoteEditor=function(payload){ if(payload?.q) openEditor(noteFromQuestion(payload)); };
  window.saveCurrentQuestionNote=async function(){
    const note=window.__editingQuestionNote; if(!note) return;
    note.aiExplain=text(document.getElementById('noteAiExplainInput')?.value,8000); note.updatedAt=Date.now();
    await saveNote(note); window.__editingQuestionNote=null;
  };
  window.editSavedNote=function(id){ const note=getNote(id); if(note) openEditor(note); };
  window.deleteSavedNote=async function(id){
    const note=getNote(id); if(!note) return;
    if(typeof confirmModal==='function') confirmModal('নোট মুছে ফেলবেন?', 'এই নোটটি Notes থেকে মুছে যাবে; মূল question ও Mistake Book বদলাবে না।', async()=>{ await dbDel(NOTE_STORE,id); cache().notes=(cache().notes||[]).filter(item=>item.id!==id); state.expandedAi.delete(id); renderNotesTool(); toast('নোট মুছে গেছে'); }, 'Delete', true);
  };
  window.setNotesSource=function(value){ state.source=value||'all'; state.subjectId='all'; state.topicId='all'; renderNotesTool(); };
  window.setNotesSubject=function(value){ state.subjectId=value||'all'; state.topicId='all'; renderNotesTool(); };
  window.setNotesTopic=function(value){ state.topicId=value||'all'; renderNotesTool(); };
  window.resetNotesFilters=function(){ state.source='all'; state.subjectId='all'; state.topicId='all'; state.search=''; renderNotesTool(); };
  window.searchSavedNotes=function(value){ state.search=String(value||''); renderNotesTool(); setTimeout(()=>{const el=document.getElementById('notesSearch');if(el){el.focus();el.selectionStart=el.value.length;}},0); };
  window.toggleNoteAiExplain=function(id){
    const note=getNote(id); if(!note) return;
    const explanation=text(note.aiExplain||note.explanation,8000);
    if(!explanation){ openEditor(note); return; }
    state.expandedAi.has(id)?state.expandedAi.delete(id):state.expandedAi.add(id);
    renderNotesTool();
    requestAnimationFrame(()=>document.getElementById(`note-ai-${noteDomId(note)}`)?.scrollIntoView({block:'nearest',behavior:'smooth'}));
  };

  function noteMatches(note){
    const sourceOk=state.source==='all'||note.source===state.source;
    const subjectOk=state.subjectId==='all'||note.subjectId===state.subjectId;
    const topicOk=state.topicId==='all'||note.topicId===state.topicId;
    const hay=[note.question,note.wrongAnswer,note.correctAnswer,note.aiExplain,note.explanation,noteSubject(note),noteTopic(note)].join(' ').toLocaleLowerCase('en-US');
    return sourceOk&&subjectOk&&topicOk&&(!state.search||hay.includes(state.search.toLocaleLowerCase('en-US')));
  }
  function uniqueFilterRows(notes,key,label){
    const ids=[...new Set(notes.map(note=>note[key]).filter(Boolean))];
    return ids.map(id=>({id,label:label(id),count:notes.filter(note=>note[key]===id).length})).sort((a,b)=>a.label.localeCompare(b.label));
  }
  function noteCard(note){
    const aiText=text(note.aiExplain||note.explanation,8000), expanded=state.expandedAi.has(note.id), domId=noteDomId(note);
    const selected=note.selectedAnswer||note.wrongAnswer||'—', correct=note.correctAnswer||'—';
    return `<article class="saved-note-card"><header class="saved-note-top"><div><span class="note-source-pill">${escValue(note.source||'Question Bank')}</span><span class="note-date">${new Date(note.updatedAt||note.createdAt||Date.now()).toLocaleDateString('bn-BD')}</span></div><button class="note-more" aria-label="Edit note" onclick="editSavedNote('${escValue(note.id)}')">⋯</button></header><div class="saved-note-meta"><span>${escValue(noteSubject(note))}</span><i>•</i><span>${escValue(noteTopic(note))}</span></div><h3>${escValue(note.question||'প্রশ্নের তথ্য পাওয়া যায়নি')}</h3><div class="saved-note-options">${optionsMarkup(note)}</div><div class="note-answer-strip"><div class="note-answer-chip wrong"><small>তোমার উত্তর</small><b>${escValue(selected)}</b></div><div class="note-answer-chip correct"><small>সঠিক উত্তর</small><b>${escValue(correct)}</b></div></div><div class="saved-note-actions"><button class="note-action ai" onclick="toggleNoteAiExplain('${escValue(note.id)}')">${expanded?'⌃ AI Explain লুকান':'🤖 AI Explain দেখুন'}</button><button class="note-action subtle" onclick="editSavedNote('${escValue(note.id)}')">Edit</button><button class="note-action subtle danger" onclick="deleteSavedNote('${escValue(note.id)}')">Delete</button></div>${expanded?`<section id="note-ai-${domId}" class="saved-ai-explain"><div class="saved-ai-head"><b>🤖 AI Explain</b><button onclick="toggleNoteAiExplain('${escValue(note.id)}')">লুকান</button></div><p>${escValue(aiText)}</p></section>`:''}${!aiText?'<p class="saved-ai-hint">AI Explain যোগ করতে AI Explain দেখুন চাপুন।</p>':''}</article>`;
  }
  window.renderNotesTool=function(){
    const allNotes=cache().notes||[];
    const sourceOptions=[...new Set(allNotes.map(note=>note.source).filter(Boolean))].sort();
    const sourceNotes=state.source==='all'?allNotes:allNotes.filter(note=>note.source===state.source);
    const subjects=uniqueFilterRows(sourceNotes,'subjectId',subjectName);
    const subjectNotes=state.subjectId==='all'?sourceNotes:sourceNotes.filter(note=>note.subjectId===state.subjectId);
    const topics=uniqueFilterRows(subjectNotes,'topicId',topicName);
    const list=allNotes.filter(noteMatches).sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
    const qbank=allNotes.filter(note=>note.source==='Question Bank').length, flash=allNotes.filter(note=>note.source==='Flash Test').length;
    const cards=list.map(noteCard).join('');
    const html=`<main class="notes-page"><section class="notes-header"><div><div class="notes-kicker">PERSONAL QUESTION REVIEW</div><h1>নোট</h1><p>ভুল প্রশ্ন, চারটি option ও সঠিক উত্তর এক জায়গায় দেখে revision করুন।</p></div><div class="notes-header-stat"><b>${allNotes.length}</b><span>Saved notes</span></div></section><section class="notes-filter-card"><div class="notes-filter-head"><div><span>FILTER & REVIEW</span><h2>প্রশ্ন বাছাই করুন</h2></div><div class="notes-filter-count"><b>${list.length}</b><span>টি দেখা যাচ্ছে</span></div></div><div class="notes-search"><span>⌕</span><input id="notesSearch" type="search" placeholder="প্রশ্ন, উত্তর বা নোট খুঁজুন..." value="${escValue(state.search)}" oninput="searchSavedNotes(this.value)"></div><div class="notes-filter-grid"><label><span>Source</span><select onchange="setNotesSource(this.value)"><option value="all">সব Source</option>${sourceOptions.map(source=>`<option value="${escValue(source)}" ${state.source===source?'selected':''}>${escValue(source)}</option>`).join('')}</select></label><label><span>Subject</span><select onchange="setNotesSubject(this.value)"><option value="all">সব Subject</option>${subjects.map(row=>`<option value="${escValue(row.id)}" ${state.subjectId===row.id?'selected':''}>${escValue(row.label||'নির্ধারিত নয়')} (${row.count})</option>`).join('')}</select></label><label><span>Topic</span><select onchange="setNotesTopic(this.value)"><option value="all">সব Topic</option>${topics.map(row=>`<option value="${escValue(row.id)}" ${state.topicId===row.id?'selected':''}>${escValue(row.label||'নির্ধারিত নয়')} (${row.count})</option>`).join('')}</select></label></div><div class="notes-filter-foot"><span>Question Bank ${qbank} · Flash Test ${flash}</span><button onclick="resetNotesFilters()">Reset</button></div></section>${cards?`<section class="saved-notes-list">${cards}</section>`:`<section class="notes-empty"><div>📝</div><h3>${allNotes.length?'কোনো matching note পাওয়া যায়নি':'এখনো কোনো নোট নেই'}</h3><p>${allNotes.length?'Filter বা search বদলে আবার দেখুন।':'Question Bank বা Flash Test-এ ভুল হলে “ছোট নোট করুন” চাপলে প্রশ্নটি এখানে আসবে।'}</p>${allNotes.length?'<button class="btn secondary" onclick="resetNotesFilters()">সব নোট দেখুন</button>':''}</section>`}</main>`;
    renderShell(html,{title:'নোট',back:"navigate('dashboard')"});
  };

  const previousRender=window.render;
  if(typeof previousRender==='function') window.render=function notesRouteRender(){ if(Router.path==='notes') return window.renderNotesTool(); return previousRender.apply(this,arguments); };
  function addDashboardCard(){
    if(Router.path!=='dashboard') return;
    const candidates=[...document.querySelectorAll('.p3-special-section-v3, .dashboard-section')].filter(el=>el.textContent.includes('Study Tools')&&el.textContent.includes('Review & analysis'));
    const section=candidates.find(el=>{const box=el.getBoundingClientRect();return box.width>0&&box.height>0})||candidates[0]; if(!section) return;
    const host=section.querySelector('[data-unified-study-tools-list]')||section;
    document.querySelectorAll('[data-notes-tool-card]').forEach(existing=>{if(existing.parentElement!==host) existing.remove();});
    if(host.querySelector('[data-notes-tool-card]')) return;
    const card=document.createElement('button'); card.type='button'; card.dataset.notesToolCard=''; card.className='special-tool-card'; card.innerHTML='<span class="special-tool-icon">📝</span><span><strong>নোট</strong><small>ভুল প্রশ্ন ও AI Explain সংরক্ষণ</small></span><span class="tool-arrow">↗</span>'; card.onclick=()=>navigate('notes'); host.appendChild(card);
  }
  const app=document.getElementById('app'); if(app) new MutationObserver(()=>setTimeout(addDashboardCard,0)).observe(app,{childList:true,subtree:true});
  setTimeout(addDashboardCard,80); setTimeout(addDashboardCard,500);

  const style=document.createElement('style'); style.id='notes-tool-styles'; style.textContent=`
  /* Notes question review visual language: compact academic workspace, distinct answer evidence, deliberate AI reveal. */
  .notes-page{max-width:760px;margin:0 auto;padding-bottom:30px}.notes-header{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:20px 18px;border:1px solid #cde6dc;border-radius:22px;background:linear-gradient(135deg,#f6fcf9,#e7f5ee);box-shadow:0 10px 26px rgba(15,107,79,.08)}.notes-kicker{color:var(--emerald-d);font-size:10px;font-weight:900;letter-spacing:.14em}.notes-header h1{margin:6px 0 4px;color:#163c31;font-size:30px;letter-spacing:-.04em}.notes-header p{margin:0;color:#55766c;font-size:13px;line-height:1.55}.notes-header-stat{min-width:76px;padding:11px 10px;border-radius:15px;background:var(--emerald);color:#fff;text-align:center;box-shadow:0 7px 14px rgba(15,107,79,.15)}.notes-header-stat b,.notes-header-stat span{display:block}.notes-header-stat b{font-size:24px;line-height:1}.notes-header-stat span{margin-top:4px;font-size:9px;font-weight:800;opacity:.86}.notes-filter-card{margin:15px 0 17px;padding:15px;border:1px solid var(--line);border-radius:18px;background:var(--card);box-shadow:var(--shadow)}.notes-filter-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.notes-filter-head>div:first-child>span{color:var(--emerald-d);font-size:10px;font-weight:900;letter-spacing:.11em}.notes-filter-head h2{margin:4px 0 0;color:var(--text);font-size:18px}.notes-filter-count{padding:7px 9px;border-radius:10px;background:var(--mint);color:var(--emerald-d);text-align:right}.notes-filter-count b,.notes-filter-count span{display:block}.notes-filter-count b{font-size:16px;line-height:1}.notes-filter-count span{margin-top:3px;font-size:9px;font-weight:800}.notes-search{display:flex;align-items:center;gap:8px;margin-top:13px;padding:0 12px;border:1px solid var(--line);border-radius:12px;background:#fbfefc}.notes-search span{color:var(--emerald-d);font-size:21px;line-height:1}.notes-search input{min-width:0;width:100%;min-height:46px;padding:0;border:0;background:transparent;font:inherit;font-size:13px}.notes-filter-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:11px}.notes-filter-grid label{display:grid;gap:5px;min-width:0}.notes-filter-grid label>span{padding-left:2px;color:var(--sub);font-size:10px;font-weight:900;letter-spacing:.04em}.notes-filter-grid select{min-width:0;height:43px;padding:0 9px;border-radius:11px;background:#fbfefc;color:var(--text);font:inherit;font-size:12px}.notes-filter-foot{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-top:11px;color:var(--sub);font-size:11px}.notes-filter-foot button{border:0;background:transparent;color:var(--emerald-d);font:inherit;font-size:11px;font-weight:900;text-decoration:underline;cursor:pointer}.saved-notes-list{display:grid;gap:15px}.saved-note-card{position:relative;overflow:hidden;padding:17px;border:1px solid #d9ebe4;border-left:5px solid var(--emerald);border-radius:20px;background:linear-gradient(145deg,#fff,#fbfefc);box-shadow:0 11px 27px rgba(20,58,42,.07)}.saved-note-card:before{position:absolute;top:0;right:0;width:76px;height:76px;border-radius:0 20px 0 76px;background:#e8f5ef;content:'';pointer-events:none}.saved-note-top{position:relative;z-index:1;display:flex;align-items:center;justify-content:space-between;gap:9px}.saved-note-top>div{display:flex;align-items:center;gap:8px}.note-source-pill{padding:5px 8px;border-radius:999px;background:var(--mint);color:var(--emerald-d);font-size:10px;font-weight:900;letter-spacing:.06em}.note-date{color:var(--sub);font-size:10px}.note-more{position:relative;z-index:2;width:31px;height:31px;border:1px solid var(--line);border-radius:10px;background:#fff;color:var(--emerald-d);font:700 20px/1 serif;cursor:pointer}.saved-note-meta{display:flex;gap:6px;align-items:center;margin-top:12px;color:#638279;font-size:11px}.saved-note-meta i{font-style:normal;color:#a0b9b0}.saved-note-card h3{margin:9px 0 13px;color:#17392f;font-size:18px;line-height:1.58;letter-spacing:-.02em}.saved-note-options{display:grid;gap:7px}.note-option{display:flex;align-items:flex-start;gap:9px;padding:10px 11px;border:1px solid #e1ece7;border-radius:12px;background:#fff;color:#38544b;font-size:13px;line-height:1.5}.note-option b{display:grid;place-items:center;flex:0 0 23px;width:23px;height:23px;border-radius:7px;background:#f0f6f3;color:#54746a;font-size:11px}.note-option span{flex:1;min-width:0}.note-option em{align-self:center;color:inherit;font-size:9px;font-style:normal;font-weight:900;white-space:nowrap}.note-option.is-correct{border-color:#9ed9b5;background:#effbf3;color:#197241}.note-option.is-correct b{background:#2ca45b;color:#fff}.note-option.is-wrong{border-color:#efb9b9;background:#fff5f5;color:#ae3636}.note-option.is-wrong b{background:#d95a5a;color:#fff}.note-answer-strip{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:11px}.note-answer-chip{min-width:0;padding:9px 10px;border-radius:11px}.note-answer-chip small,.note-answer-chip b{display:block}.note-answer-chip small{font-size:9px;font-weight:900}.note-answer-chip b{margin-top:3px;overflow-wrap:anywhere;font-size:12px;line-height:1.4}.note-answer-chip.wrong{background:#fff2f2;color:#aa3333}.note-answer-chip.correct{background:#effaf2;color:#1c7142}.saved-note-actions{display:grid;grid-template-columns:minmax(0,1fr) auto auto;gap:7px;margin-top:13px}.note-action{min-height:39px;padding:8px 10px;border:1px solid var(--line);border-radius:11px;background:#fff;color:var(--text);font:700 11px/1.2 inherit;cursor:pointer}.note-action.ai{border-color:var(--emerald);background:var(--emerald);color:#fff}.note-action.subtle{color:var(--emerald-d)}.note-action.danger{color:#ad3838}.saved-ai-explain{margin-top:11px;padding:13px;border:1px solid #eedfab;border-radius:13px;background:#fff9e9;color:#695324;font-size:12px;line-height:1.7}.saved-ai-head{display:flex;align-items:center;justify-content:space-between;gap:10px}.saved-ai-head b{font-size:12px}.saved-ai-head button{border:0;background:transparent;color:#7e641d;font:800 10px inherit;text-decoration:underline;cursor:pointer}.saved-ai-explain p{margin:7px 0 0;white-space:pre-wrap}.saved-ai-hint{margin:10px 1px 0;color:var(--sub);font-size:10px}.notes-empty{padding:55px 18px;text-align:center;border:1px dashed #c9e0d7;border-radius:20px;background:#fbfefc;color:var(--sub)}.notes-empty>div{font-size:40px}.notes-empty h3{margin:9px 0 5px;color:var(--text);font-size:18px}.notes-empty p{margin:0 auto;max-width:320px;font-size:12px;line-height:1.6}.notes-empty .btn{margin-top:14px}.note-editor-head{display:flex;align-items:flex-start;justify-content:space-between;gap:10px}.note-editor-head h3{margin:4px 0 0}.note-kicker{font-size:10px;font-weight:900;letter-spacing:.08em;color:var(--emerald-d)}.note-card-preview{margin-top:10px;padding:13px;border-radius:15px;background:var(--mint)}.note-meta{color:var(--sub);font-size:10px}.note-question{margin:7px 0 11px;color:var(--text);font-size:16px;font-weight:850;line-height:1.55}.note-options{display:grid;gap:6px}.note-card-preview .note-option{padding:8px;font-size:11px}.note-save-hint{margin:8px 0;color:var(--sub);font-size:11px;line-height:1.5}@media(max-width:520px){.notes-header{align-items:flex-start;padding:18px 15px}.notes-header h1{font-size:27px}.notes-header p{font-size:12px}.notes-header-stat{min-width:66px}.notes-filter-grid{grid-template-columns:1fr}.notes-filter-card{padding:13px}.saved-note-card{padding:15px}.saved-note-card h3{font-size:17px}.note-option{font-size:12px;padding:9px}.note-answer-strip{grid-template-columns:1fr}.saved-note-actions{grid-template-columns:minmax(0,1fr) auto auto}.note-action{padding:8px;font-size:10px}.note-action.ai{font-size:11px}}@media(prefers-reduced-motion:no-preference){.saved-note-card,.note-action{transition:transform .16s cubic-bezier(.23,1,.32,1),box-shadow .16s ease}.saved-note-card:hover{transform:translateY(-1px);box-shadow:0 14px 30px rgba(20,58,42,.1)}.note-action:active{transform:scale(.97)}}[data-notes-tool-card]{background:linear-gradient(135deg,#0f6b4f,#0b4f3b)!important;border-color:#0b4f3b!important;color:#fff;box-shadow:0 14px 28px rgba(15,107,79,.2)!important;min-height:92px!important}[data-notes-tool-card] strong,[data-notes-tool-card] small,[data-notes-tool-card] .tool-arrow{color:#fff!important}[data-notes-tool-card] small{opacity:.78}`;
  document.head.appendChild(style);
})();
