(() => {
  const qEsc=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const qStats=q=>q.stats||{attempts:0,correct:0,wrong:0};
  const sourceQuestions=()=>{const tid=ExplorerState.topicId, sid=ExplorerState.subjectId; if(tid)return CACHE.questions.filter(q=>q.topicId===tid); if(sid)return CACHE.questions.filter(q=>q.subjectId===sid); return CACHE.questions.slice()};
  const qSourceLabel=()=>{const t=CACHE.topics.find(x=>x.id===ExplorerState.topicId),s=CACHE.subjects.find(x=>x.id===ExplorerState.subjectId);return t?`${s?.name||'Subject'} • ${t.name}`:s?.name||'All subjects'};
  const qTopicFilter=(q)=>{const st=qStats(q), filter=ExplorerState.status||'all';if(filter==='unattempted'&&st.attempts)return false;if(filter==='wrong'&&!((st.wrong||0)>0||CACHE.mistakes.some(m=>m.questionId===q.id)))return false;if(filter==='bookmarked'&&!q.bookmarked)return false;if(filter==='recent'&&!(q.updatedAt||q.createdAt||0> Date.now()-30*86400000))return false;return true};
  function qSubjectLabel(s){const n=(s.name||'').toLowerCase();const map=[['bangla 1','Bangla 1st'],['english','English 2nd'],['gk','GK'],['general','GK'],['bangla 2','Bangla 2nd'],['iq','IQ'],['memor','Memorizing'],['বিরচন','বিরচন'],['ইতিহাস','ইতিহাস'],['বিজ্ঞান','বিজ্ঞান']];const hit=map.find(([k])=>n.includes(k));return hit?hit[1]:s.name}
  function subjectRow(s){const qs=CACHE.questions.filter(q=>q.subjectId===s.id),topics=CACHE.topics.filter(t=>t.subjectId===s.id),attempted=qs.filter(q=>(qStats(q).attempts||0)>0).length,pct=qs.length?Math.round(attempted/qs.length*100):0;return `<button class="q-subject-row card" onclick="openRedesignedSubject('${s.id}')"><span class="q-subject-icon">${qEsc(s.icon||'📘')}</span><span class="q-subject-main"><b>${qEsc(qSubjectLabel(s))}</b><span>${qEsc(s.description||'Admission practice and revision')}</span><small>${qs.length} questions · ${topics.length} topics</small><span class="q-progress"><i style="width:${pct}%"></i></span></span><strong>›</strong></button>`}
  window.openRedesignedSubject=id=>{
    ExplorerState.subjectId=id;
    ExplorerState.topicId='';
    ExplorerState.status='all';
    ExplorerState.query='';
    Router.path='question-bank/subject/'+id;
    render();
  };
  window.openRedesignedTopic=id=>{
    const t=CACHE.topics.find(x=>x.id===id);
    ExplorerState.subjectId=t?.subjectId||'';
    ExplorerState.topicId=id;
    ExplorerState.status='all';
    ExplorerState.query='';
    Router.path='question-bank/topic/'+id;
    // Reset temporary states when entering a topic
    window.BankAnswers = window.BankAnswers || {};
    render();
  };
  window.setRedesignedFilter=f=>{ExplorerState.status=f;renderQuestionBank()};
  window.showQuestionMenu=id=>openModal(`<h3>Question actions</h3><p class="muted">Use the existing actions without changing the source question.</p><div class="row"><button class="btn secondary" onclick="closeModal();startQuestionPractice(['${id}'])">Practice</button><button class="btn ghost" onclick="closeModal()">Close</button></div>`);
  function renderSubjectList(){
    const subs=[...CACHE.subjects].sort((a,b)=>(a.order||0)-(b.order||0));
    const search=(ExplorerState.query||'').toLowerCase();
    const shown=subs.filter(s=>!search||qSubjectLabel(s).toLowerCase().includes(search)||String(s.name).toLowerCase().includes(search));
    const html=`<div class="qbank-head"><div class="explorer-kicker">Question Bank</div><h1>Question Bank</h1><p>Browse subjects and start practicing</p></div><div class="qbank-toolbar"><div class="searchbar"><span>⌕</span><input class="q-input" value="${qEsc(ExplorerState.query||'')}" placeholder="Search subjects" oninput="ExplorerState.query=this.value;renderQuestionBank()"></div><button class="iconbtn" onclick="toast('List view active')">▦</button></div><div class="q-subject-list">${shown.map(subjectRow).join('')||`<div class="empty">No matching subjects.</div>`}</div>`;
    renderShell(html,{title:'Question Bank',back:"navigate('dashboard')"});
  }
  function renderTopicList(){
    const sel=CACHE.subjects.find(s=>s.id===ExplorerState.subjectId);
    if(!sel){ navigate('question-bank'); return; }
    const topics=CACHE.topics.filter(t=>t.subjectId===ExplorerState.subjectId).sort((a,b)=>(a.order||0)-(b.order||0));
    const html=`<div class="qbank-head"><div class="explorer-kicker">Topics</div><h1>${qEsc(qSubjectLabel(sel))}</h1><p>Select a topic to Master</p></div><div class="q-topic-list">${topics.map(t=>`<button class="q-subject-row card" onclick="openRedesignedTopic('${t.id}')"><span class="q-subject-icon">📂</span><span class="q-subject-main"><b>${qEsc(t.name)}</b><small>${CACHE.questions.filter(q=>q.topicId===t.id).length} questions</small></span><strong>›</strong></button>`).join('')||`<div class="empty">No topics found.</div>`}</div>`;
    renderShell(html,{title:'Topics',back:"navigate('question-bank')"});
  }
  window.leaveQuestionTopic=()=>{
    // Reset correct/wrong state when leaving topic
    const qs = sourceQuestions();
    qs.forEach(q => { if(window.BankAnswers) delete window.BankAnswers[q.id]; });
    ExplorerState.topicId='';
    render();
  };
  function qCard(q,i){const st=qStats(q),state=BankAnswers[q.id],correct=Number(q.answerIndex??q.answer??0),answerText=(q.options||[])[correct]||'';const opts=(q.options||[]).map((o,j)=>{let cls='';if(state){if(j===correct)cls='correct';else if(j===state.selected)cls='wrong'}return '<button type="button" class="q-option '+cls+'" '+(state?'disabled':'')+' onclick="event.stopPropagation();selectBankAnswer(\''+q.id+'\','+j+')"><span>'+String.fromCharCode(65+j)+'</span><strong>'+qEsc(o)+'</strong></button>'}).join('');let result='';if(state){result='<div class="q-result '+(state.correct?'q-correct':'q-wrong')+'"><b>'+(state.correct?'Correct Answer':'Wrong Answer')+'</b>'+(state.correct?'<div>Your Answer: '+qEsc(answerText)+'</div>':'<div>Your Answer: '+qEsc((q.options||[])[state.selected]||'—')+'</div><div>Correct Answer: '+qEsc(answerText)+'</div>')+(q.explanation?'<div class="q-explain">Explanation: '+qEsc(q.explanation)+'</div>':'')+'</div>'}return '<article class="q-premium-card" id="bank-q-'+qEsc(q.id)+'" onclick="event.stopPropagation()"><div class="q-card-top"><div><span class="q-badge">Q '+String(i+1).padStart(2,'0')+'</span><span class="q-source">'+qEsc(qSourceLabel())+'</span><span class="q-status '+(state?'answered':'unattempted')+'">'+(state?'Answered':'Unattempted')+'</span></div><div><button class="q-icon" onclick="event.stopPropagation();toggleQuestionBookmark(\''+q.id+'\');renderQuestionBank()">'+(q.bookmarked?'★':'☆')+'</button><button class="q-icon" onclick="showQuestionMenu(\''+q.id+'\')">⋮</button></div></div><div class="q-large-text">'+qEsc(q.question)+'</div><div class="qfeed-options">'+opts+'</div>'+result+'<div class="q-footer"><span>Accuracy '+(st.attempts?Math.round((st.correct||0)/st.attempts*100):0)+'% · Mistakes '+(st.wrong||0)+'</span><button class="btn ghost sm" onclick="toggleQuestionBookmark(\''+q.id+'\');renderQuestionBank()">'+(q.bookmarked?'★ Bookmarked':'☆ Bookmark')+'</button><button class="btn secondary sm" onclick="openQuestionDetail(\''+q.id+'\')">Show Answer</button></div></article>'}
  window.openQuestionDetail=id=>{const q=CACHE.questions.find(x=>x.id===id);if(!q)return;const ans=qEsc((q.options||[])[Number(q.answerIndex??q.answer??0)]||'—');const exp=q.explanation?`<p class="muted">${qEsc(q.explanation)}</p>`:'';openModal('<h3>Answer</h3><p>'+ans+'</p>'+exp+'<button class="btn" onclick="closeModal()">Close</button>') };
  function renderFeed(){let qs=sourceQuestions().filter(qTopicFilter);const term=(ExplorerState.query||'').toLowerCase();if(term)qs=qs.filter(q=>[q.question,...(q.options||[]),q.explanation].join(' ').toLowerCase().includes(term));const topic=CACHE.topics.find(x=>x.id===ExplorerState.topicId),subject=CACHE.subjects.find(x=>x.id===ExplorerState.subjectId);const tabs=[['all','All'],['unattempted','Unattempted'],['wrong','Mistakes'],['bookmarked','Bookmarked'],['recent','Recent']];const html=`<div class="qbank-head"><div class="explorer-kicker">Question Bank</div><h1>Question Bank</h1><p>Practice directly in a calm, continuous feed</p></div><div class="row between qfeed-source"><div><b>${qEsc(subject?.name||'Subject')} ${topic?'• '+qEsc(topic.name):''}</b><div class="muted">${qs.length} questions from this exact source</div></div><button class="btn ghost sm" onclick="leaveQuestionTopic()">← Subjects</button></div><div class="q-filter-tabs">${tabs.map(([k,l])=>`<button class="${ExplorerState.status===k?'active':''}" onclick="setRedesignedFilter('${k}')">${l}${k==='all'?` (${sourceQuestions().length})`:''}</button>`).join('')}</div><div class="q-feed">${qs.length?qs.map(qCard).join(''):`<div class="empty card">No questions in this exact source/filter.</div>`}</div>`;renderShell(html,{title:'Question Bank',back:"leaveQuestionTopic()"})}
  window.renderQuestionBankV2=()=>{
    const p=Router.path;
    if(p.startsWith('question-bank/topic/')){
      ExplorerState.topicId=p.split('/')[2];
      ExplorerState.subjectId=CACHE.topics.find(t=>t.id===ExplorerState.topicId)?.subjectId||'';
      return renderFeed();
    }else if(p.startsWith('question-bank/subject/')){
      ExplorerState.subjectId=p.split('/')[2];
      ExplorerState.topicId='';
      return renderTopicList();
    }
    ExplorerState.subjectId='';
    ExplorerState.topicId='';
    return renderSubjectList();
  };
  window.renderQuestionBank=window.renderQuestionBankV2;
  const prior=render;render=function(){if(Router.path==='question-bank'||Router.path.startsWith('question-bank/subject/'))return window.renderQuestionBankV2();if(Router.path.startsWith('question-bank/topic/'))return window.renderQuestionBankV2();return prior()};
  const css=document.createElement('style');css.textContent=`.qbank-head{padding:18px 0 10px}.qbank-head h1{font-size:28px;margin:4px 0}.qbank-head p{color:var(--muted);margin:0}.qbank-toolbar{display:flex;gap:8px;align-items:center;margin:14px 0}.qbank-toolbar .searchbar{flex:1;min-height:58px;padding:10px 14px;border-radius:18px;box-shadow:0 10px 24px rgba(15,107,79,.10);border:1px solid rgba(15,107,79,.20);background:rgba(255,255,255,.88)}.qbank-toolbar .searchbar span{font-size:22px;color:var(--emerald)}.q-input{width:100%;border:0;outline:0;background:transparent;padding:12px 8px;font-size:17px;line-height:1.4;min-height:36px}.q-subject-list{display:flex;flex-direction:column;gap:10px}.q-subject-row{width:100%;display:flex;align-items:center;gap:13px;text-align:left;padding:15px;border:1px solid var(--border);box-shadow:0 4px 15px rgba(20,40,30,.05);cursor:pointer}.q-subject-icon{font-size:28px}.q-subject-main{display:flex;flex-direction:column;gap:3px;flex:1}.q-subject-main b{font-size:16px}.q-subject-main span{font-size:12px;color:var(--muted)}.q-subject-main small{color:var(--muted)}.q-progress{height:6px;background:var(--line);border-radius:8px;overflow:hidden;margin-top:6px}.q-progress i{display:block;height:100%;background:var(--green);border-radius:8px}.q-selected{margin:10px 0}.topic-chip-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.topic-chip{border:1px solid var(--border);border-radius:999px;padding:8px 11px;background:var(--bg);cursor:pointer}.topic-chip span{color:var(--muted);font-size:11px}.qfeed-source{margin:10px 0 12px}.q-filter-tabs{display:flex;gap:6px;overflow:auto;margin:8px 0 14px}.q-filter-tabs button{border:0;border-bottom:2px solid transparent;background:transparent;padding:9px 10px;white-space:nowrap;color:var(--muted)}.q-filter-tabs button.active{color:var(--primary);border-color:var(--primary);font-weight:700}.q-feed{display:flex;flex-direction:column;gap:14px}.q-premium-card{background:var(--card);border:1px solid var(--border);border-radius:17px;padding:16px;box-shadow:0 7px 22px rgba(20,40,30,.08)}.q-card-top{display:flex;justify-content:space-between;gap:8px;align-items:center}.q-badge{background:var(--green);color:white;border-radius:7px;padding:5px 8px;font-size:12px;font-weight:800}.q-source{font-size:12px;color:var(--muted);margin-left:8px}.q-status{font-size:11px;border-radius:99px;padding:4px 7px;margin-left:7px}.q-status.unattempted{background:#fff3cd;color:#8a6500}.q-status.answered{background:#dff5e9;color:#197044}.q-icon{border:0;background:transparent;font-size:22px;cursor:pointer;color:var(--muted)}.q-large-text{font-size:21px;line-height:1.55;font-weight:800;margin:17px 0}.qfeed-options{display:flex;flex-direction:column;gap:9px}.q-option{display:flex;align-items:flex-start;gap:11px;text-align:left;width:100%;padding:13px;border:1px solid var(--border);border-radius:12px;background:var(--bg);cursor:pointer;font-size:16px;line-height:1.45}.q-option span{min-width:27px;height:27px;border-radius:50%;display:grid;place-items:center;background:var(--line);font-size:13px;font-weight:800}.q-option.correct{border-color:#36a269;background:#e8f7ee}.q-option.wrong{border-color:#d95c5c;background:#fff0f0}.q-result{margin-top:12px;padding:12px;border-radius:11px;line-height:1.55}.q-correct{background:#e8f7ee;color:#17633c}.q-wrong{background:#fff0f0;color:#942f2f}.q-explain{border:0;background:transparent;text-decoration:underline;color:inherit;padding:6px 0;cursor:pointer}.q-footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:14px;padding-top:12px;border-top:1px solid var(--border);font-size:12px;color:var(--muted)}.q-footer span{flex:1;min-width:150px}@media(max-width:620px){.q-large-text{font-size:20px}.q-footer{align-items:stretch}.q-footer .btn{flex:1}}.q-topic-list{display:flex;flex-direction:column;gap:10px}}`;document.head.appendChild(css);render();
})();
