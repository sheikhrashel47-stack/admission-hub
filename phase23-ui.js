/* Phase 2+3 final UI/UX layer. Keeps legacy data, router, exam, and question logic intact. */
(function(){
  'use strict';

  const style=document.createElement('style');
  style.id='phase23-style';
  style.textContent=`
    :root{--glass:rgba(255,255,255,.78);--glass-strong:rgba(255,255,255,.92);--glass-border:rgba(15,107,79,.12);--glass-shadow:0 14px 34px rgba(23,58,43,.075)}
    .phase23-page{max-width:600px;margin:0 auto}
    .phase23-head{padding:4px 2px 20px}.phase23-back{display:inline-flex;align-items:center;gap:6px;border:0;background:none;color:var(--emerald-d);font:700 13px inherit;padding:5px 0;cursor:pointer}.phase23-title{font-size:27px;line-height:1.2;letter-spacing:-.035em;margin:12px 0 7px;color:var(--text)}.phase23-subtitle{font-size:14px;line-height:1.65;color:var(--sub);margin:0;max-width:540px}
    .web-search-card{background:linear-gradient(145deg,rgba(236,248,241,.92),rgba(255,255,255,.84));border:1px solid rgba(15,107,79,.15);border-radius:26px;padding:12px;box-shadow:var(--glass-shadow);backdrop-filter:blur(18px);margin:8px 0 18px}.web-search-card textarea{display:block;border:0;background:rgba(255,255,255,.7);min-height:112px;border-radius:18px;padding:16px;font-size:17px;line-height:1.55;box-shadow:inset 0 0 0 1px rgba(15,107,79,.08);resize:none}.web-search-card textarea:focus{outline:3px solid rgba(15,107,79,.18);outline-offset:0}.web-search-card .btn{margin-top:10px;min-height:52px;border-radius:17px;font-size:16px;background:#168258;box-shadow:0 8px 18px rgba(15,107,79,.18)}.web-search-card .btn:disabled{opacity:.65;cursor:wait}
    .web-chat-log{display:flex;flex-direction:column;gap:14px}.web-welcome{padding:20px 4px 10px;text-align:center;color:var(--sub)}.web-welcome-icon{font-size:38px;margin-bottom:8px}.web-welcome h2{font-size:18px;color:var(--text);margin:0 0 7px}.web-welcome p{font-size:13px;line-height:1.6;margin:0}.web-suggestion-row{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0 2px}.web-suggestion{border:1px solid rgba(15,107,79,.16);background:var(--glass);color:var(--emerald-d);border-radius:999px;padding:9px 12px;font:600 12px inherit;cursor:pointer;transition:transform .16s ease,background .16s ease}.web-suggestion:active{transform:scale(.97)}.web-suggestion:hover{background:#fff}.web-message{max-width:94%;border-radius:20px;padding:14px 16px;line-height:1.65;font-size:14px}.web-message.user{margin-left:auto;background:var(--emerald);color:#fff;border-bottom-right-radius:7px}.web-message.assistant{background:var(--glass-strong);border:1px solid var(--glass-border);box-shadow:var(--glass-shadow);color:var(--text);border-bottom-left-radius:7px}.web-answer{font-size:16px;line-height:1.85;color:#24332b}.web-answer strong{font-weight:800;color:#123e2f}.web-answer p{margin:0 0 10px}.web-answer p:last-child{margin-bottom:0}.web-meta{font-size:11px;color:var(--sub);margin-bottom:7px;font-weight:700}.web-status{display:flex;align-items:center;gap:8px;color:var(--sub);font-size:13px}.web-dot{width:8px;height:8px;border-radius:50%;background:var(--emerald);box-shadow:0 0 0 5px rgba(15,107,79,.1);animation:webPulse 1s infinite}@keyframes webPulse{50%{opacity:.35;transform:scale(.8)}}.web-sources{border-top:1px solid rgba(15,107,79,.1);margin-top:13px;padding-top:10px}.web-sources-title{font-size:11px;font-weight:800;color:var(--sub);margin-bottom:5px}.web-source{display:block;color:var(--emerald-d);font-size:12px;text-decoration:none;padding:3px 0;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.web-source:hover{text-decoration:underline}.web-error{background:#fff8f5!important;border-color:rgba(192,57,43,.16)!important;color:#7b382f!important}
    .dictionary-v2 .tool-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin:16px 0}.dictionary-v2 .tool-stat{background:var(--glass);border:1px solid var(--glass-border);border-radius:19px;padding:16px;box-shadow:var(--glass-shadow)}.dictionary-v2 .tool-stat strong{display:block;font-size:16px}.dictionary-v2 .tool-stat span{display:block;color:var(--sub);font-size:12px;margin-top:3px}.dictionary-v2 .dict-search-card{display:flex;gap:8px;align-items:center;background:var(--glass);border:1px solid var(--glass-border);border-radius:20px;padding:9px;box-shadow:var(--glass-shadow)}.dictionary-v2 .dict-search-card input{border:0;background:transparent;min-width:0;padding:12px;font-size:16px}.dictionary-v2 .dict-search-card input:focus{outline:0}.dictionary-v2 .dict-search-card .btn{width:auto;white-space:nowrap;padding:12px 18px}.dictionary-v2 .dict-result{background:var(--glass-strong);border:1px solid var(--glass-border);border-radius:22px;padding:18px;box-shadow:var(--glass-shadow);margin-top:16px}.dictionary-v2 .dict-result h2{font-size:25px;margin:8px 0 2px}.dictionary-v2 .dict-result p{line-height:1.65}.dictionary-v2 .dict-result-grid{display:grid;grid-template-columns:1fr 1fr;gap:11px;margin-top:14px}.dictionary-v2 .dict-result-grid>div{background:rgba(232,244,238,.62);border-radius:13px;padding:11px}.dictionary-v2 .dict-result-grid b{font-size:11px;color:var(--sub)}.dictionary-v2 .dict-result-grid p{font-size:13px;margin:4px 0 0}.dictionary-v2 .dict-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.dictionary-v2 .dict-actions .btn{flex:1;min-width:145px}
    .exam-center .card,.exam-setup .card,.question-bank-page .card,.explorer-card{box-shadow:var(--glass-shadow);border-color:var(--glass-border)}
    .phase-nav{display:none!important}.page>.phase-nav{display:none!important}
    @media(max-width:430px){.phase23-title{font-size:24px}.web-answer{font-size:15px}.dictionary-v2 .dict-result-grid{grid-template-columns:1fr}.dictionary-v2 .dict-search-card .btn{padding:12px 14px}}
  `;
  document.head.appendChild(style);

  const esc23=s=>{const d=document.createElement('div');d.textContent=String(s??'');return d.innerHTML};
  const wait=ms=>new Promise(r=>setTimeout(r,ms));
  const WebState={messages:[],loading:false};
  window.WebSearchState=WebState;

  function sourceLink(name,url){return `<a class="web-source" href="${esc23(url)}" target="_blank" rel="noopener noreferrer">${esc23(name)} ↗</a>`}
  function statusHtml(text){return `<div class="web-message assistant"><div class="web-status"><span class="web-dot"></span>${esc23(text)}</div></div>`}
  function makeAnswer(query,items){
    const usable=items.filter(x=>x&&x.text);
    if(!usable.length) throw new Error('no-results');
    const primary=usable[0];
    const sourceCount=usable.length;
    const clean=String(primary.text).replace(/\s+/g,' ').trim();
    const clipped=clean.length>900?clean.slice(0,897)+'…':clean;
    const intro=sourceCount>1?`আপনার প্রশ্নের জন্য ${sourceCount}টি প্রকাশ্য উৎস মিলিয়ে সংক্ষিপ্ত উত্তরটি দেওয়া হলো।`:'প্রকাশ্য নির্ভরযোগ্য উৎস থেকে পাওয়া তথ্যের সংক্ষিপ্ত উত্তর:';
    return {html:`<div class="web-meta">বাংলা-প্রথম AI-style summary</div><div class="web-answer"><p>${intro}</p><p><strong>${esc23(query)}</strong> সম্পর্কে: ${esc23(clipped)}</p><p>তথ্যটি ব্যবহার করার আগে আপনার ভর্তি পরীক্ষার সর্বশেষ syllabus বা official notice-এর সঙ্গে মিলিয়ে নিন।</p></div><div class="web-sources"><div class="web-sources-title">Source / Reference</div>${usable.map(x=>sourceLink(x.name,x.url)).join('')}</div>`,count:sourceCount};
  }
  async function fetchSources(q){
    const wikiUrl='https://en.wikipedia.org/api/rest_v1/page/summary/'+encodeURIComponent(q.trim().replace(/\s+/g,'_'));
    const ddgUrl='https://api.duckduckgo.com/?q='+encodeURIComponent(q)+'&format=json&no_html=1&skip_disambig=1';
    const fetchFast=(url)=>{const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),5000);return fetch(url,{headers:{Accept:'application/json'},signal:controller.signal}).finally(()=>clearTimeout(timer))};
    const [w,d]=await Promise.allSettled([fetchFast(wikiUrl),fetchFast(ddgUrl)]);
    const rows=[];
    if(w.status==='fulfilled'&&w.value.ok){const x=await w.value.json();if(x.extract)rows.push({name:'Wikipedia',text:x.extract,url:x.content_urls?.desktop?.page||wikiUrl})}
    if(d.status==='fulfilled'&&d.value.ok){const x=await d.value.json();if(x.AbstractText)rows.push({name:'DuckDuckGo Instant Answer',text:x.AbstractText,url:x.AbstractURL||ddgUrl});(x.RelatedTopics||[]).slice(0,2).forEach(t=>{if(t.Text&&t.FirstURL)rows.push({name:'Related web result',text:t.Text,url:t.FirstURL})})}
    return rows;
  }

  function renderWebChatV2(){
    const log=WebState.messages.length?WebState.messages.map(m=>m.role==='user'?`<div class="web-message user">${esc23(m.text)}</div>`:`<div class="web-message assistant ${m.error?'web-error':''}">${m.html}</div>`).join(''):`<div class="web-welcome"><div class="web-welcome-icon">🌐</div><h2>Web AI / Google Information Chat</h2><p>ভর্তি, সাধারণ জ্ঞান বা যেকোনো বিষয় সম্পর্কে প্রশ্ন করুন। প্রকাশ্য ওয়েব উৎস মিলিয়ে সহজ বাংলায় উত্তর পাওয়ার চেষ্টা করবে।</p><div class="web-suggestion-row"><button class="web-suggestion" onclick="webQuickAsk('বাংলাদেশের সংবিধানের রাষ্ট্রভাষা কী?')">বাংলাদেশের রাষ্ট্রভাষা কী?</button><button class="web-suggestion" onclick="webQuickAsk('What is the admission process for public universities in Bangladesh?')">Admission process</button></div></div>`;
    const loading=WebState.loading?statusHtml(WebState.loading):'';
    const html=`<div class="phase23-page web-chat-v2"><div class="phase23-head"><button class="phase23-back" onclick="navigate('dashboard')">← <span>Web AI / Google Information Chat</span></button><h1 class="phase23-title">Web AI / Google Information Chat</h1><p class="phase23-subtitle">প্রশ্ন করুন। ওয়েব থেকে তথ্য খুঁজে দ্রুত, পরিষ্কার ও বাংলায় উত্তর পান।</p></div><div id="webChatLog" class="web-chat-log">${log}${loading}</div><form class="web-search-card" onsubmit="askWebChat(event)"><textarea id="webChatInput" placeholder="বাংলা বা English-এ প্রশ্ন লিখুন…" required></textarea><button id="webSearchButton" class="btn" type="submit" ${WebState.loading?'disabled':''}>${WebState.loading?'Searching…':'Search'}</button></form></div>`;
    renderShell(html,{topbar:false});
  }
  window.renderWebChatV2=renderWebChatV2;
  window.renderWebChat=renderWebChatV2;
  window.webQuickAsk=function(q){const i=document.getElementById('webChatInput');if(i){i.value=q;i.focus()}else{WebState.messages.push({role:'user',text:q});window.askWebChat({preventDefault(){}})}};
  window.askWebChat=async function(e){if(e&&e.preventDefault)e.preventDefault();const input=document.getElementById('webChatInput'),q=(input?.value||'').trim();if(!q||WebState.loading)return;WebState.messages.push({role:'user',text:q});WebState.loading='Searching…';renderWebChatV2();await wait(180);WebState.loading='Sources found…';renderWebChatV2();try{const rows=await fetchSources(q);WebState.loading='Answer generating…';renderWebChatV2();await wait(180);const answer=makeAnswer(q,rows);WebState.messages.push({role:'assistant',html:answer.html});}catch(err){WebState.messages.push({role:'assistant',error:true,html:'<div class="web-answer"><strong>এই মুহূর্তে ওয়েব তথ্য পাওয়া যাচ্ছে না। আবার চেষ্টা করুন।</strong><p>আপনার নেটওয়ার্ক সংযোগ বা প্রশ্নের শব্দ পরিবর্তন করে পুনরায় Search চাপুন।</p></div>'});}finally{WebState.loading=false;renderWebChatV2();setTimeout(()=>document.getElementById('webChatInput')?.focus(),0)}};

  function renderDictionaryV2(){
    const q=Router.params?.q||'', r=q&&typeof dictLookup==='function'?dictLookup(q):null;
    let phaseData={};try{phaseData=JSON.parse(localStorage.getItem('admission_phase345_v1')||'{}')}catch(_){phaseData={}} const saved=phaseData.savedWords||[]; const vocab=phaseData.vocab||[];
    const result=r?`<article class="dict-result"><span class="pill">${esc23(r.pos||'Word')}</span><h2>${esc23(r.word)}</h2><div class="muted">/${esc23(r.pron||'—')}/</div><div class="dict-result-grid"><div><b>বাংলা অর্থ / English meaning</b><p>${esc23(r.bn||r.en||'—')}</p></div><div><b>Synonyms / সমার্থক</b><p>${esc23(r.syn||'—')}</p></div><div><b>Antonyms / বিপরীতার্থক</b><p>${esc23(r.ant||'—')}</p></div><div><b>Example sentence</b><p>${esc23(r.ex||'—')}</p></div><div><b>Word forms</b><p>${esc23(r.forms||'—')}</p></div><div><b>Related words</b><p>${esc23(r.related||'—')}</p></div></div><div class="dict-actions"><button class="btn secondary" onclick="addPhaseWord('savedWords','${esc23(r.word)}')">⭐ Save word</button><button class="btn ghost" onclick="addPhaseWord('vocab','${esc23(r.word)}')">📚 Add vocabulary</button></div></article>`:(q?`<div class="card empty">এই শব্দটি local dictionary-তে পাওয়া যায়নি। Web Chat-এ শব্দটির অর্থ জিজ্ঞাসা করতে পারেন।</div>`:'');
    const html=`<div class="phase23-page dictionary-v2"><div class="phase23-head"><button class="phase23-back" onclick="navigate('dashboard')">← <span>Dictionary</span></button><h1 class="phase23-title">Ultimate Dictionary</h1><p class="phase23-subtitle">English বা বাংলা শব্দ খুঁজুন। Dictionary, Vocabulary এবং Weak Words একসাথে।</p></div><form class="dict-search-card" onsubmit="searchDict(event)"><input id="dictQ" value="${esc23(q)}" placeholder="যেমন: resilient / অমর" required><button class="btn" type="submit">Search</button></form><div class="tool-stat-grid"><div class="tool-stat"><strong>⭐ Saved</strong><span>${saved.length} words</span></div><div class="tool-stat"><strong>📚 Vocabulary</strong><span>${vocab.length} words</span></div></div>${result}</div>`;
    renderShell(html,{topbar:false});
  }
  window.renderDictionaryV2=renderDictionaryV2;
  window.renderDictionary=renderDictionaryV2;
  window.searchDict=e=>{e.preventDefault();const q=document.getElementById('dictQ')?.value.trim()||'';Router.params={q};navigate('dictionary')};

  // Keep special tools isolated to their own routes and remove any legacy secondary toolbar if a patch adds one.
  const oldRender=window.render;
  window.render=function phase23RouteAudit(){
    if(Router.path==='web-chat') return renderWebChatV2();
    if(Router.path==='dictionary') return renderDictionaryV2();
    if(['daily-gk','memorizing','navigator'].some(x=>Router.path===x||Router.path.startsWith(x+'/'))) document.querySelectorAll('.phase-nav').forEach(n=>n.remove());
    return oldRender();
  };
  const oldShell=window.renderShell;
  window.renderShell=function phase23Shell(inner,opts){oldShell(inner,opts);document.querySelectorAll('.phase-nav').forEach(n=>n.remove())};
  const oldNavigate=window.navigate;
  window.navigate=function phase23Navigate(path){
    if(path==='web-chat'||path==='dictionary'){
      Router.path=path; location.hash=path;
      if(path==='web-chat') renderWebChatV2(); else renderDictionaryV2();
      setTimeout(()=>{if(Router.path===path){if(path==='web-chat')renderWebChatV2();else renderDictionaryV2()}},0);
      window.scrollTo(0,0); return;
    }
    return oldNavigate(path);
  };
})();

(function(){
  let commandPage=0;
  function updateCommandPage(index){
    const track=document.getElementById('commandTrack');if(!track)return;
    commandPage=Math.max(0,Math.min(2,Number(index)||0));track.style.transform=`translateX(-${commandPage*100}%)`;
    document.querySelectorAll('.command-dot').forEach((dot,i)=>{dot.classList.toggle('active',i===commandPage);dot.setAttribute('aria-selected',i===commandPage?'true':'false')});
  }
  window.goCommandPage=function(index){updateCommandPage(index)};
  function installCommandCarousel(){
    const carousel=document.querySelector('.command-carousel'),track=document.getElementById('commandTrack');
    if(!carousel||!track||track.dataset.bound==='1')return;
    track.dataset.bound='1';let startX=0,startY=0,dragging=false;
    carousel.addEventListener('pointerdown',e=>{startX=e.clientX;startY=e.clientY;dragging=true;carousel.setPointerCapture?.(e.pointerId)});
    carousel.addEventListener('pointerup',e=>{if(!dragging)return;dragging=false;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>45&&Math.abs(dx)>Math.abs(dy)){updateCommandPage(commandPage+(dx<0?1:-1))}});
    carousel.addEventListener('pointercancel',()=>{dragging=false});
    updateCommandPage(commandPage);
  }
  const app=document.getElementById('app');
  if(app){new MutationObserver(installCommandCarousel).observe(app,{childList:true,subtree:true});setTimeout(installCommandCarousel,0)}
})();

(function(){
  const app=document.getElementById('app');
  if(!app)return;
  const audit=()=>{if(Router.path==='question-bank'&&ExplorerState.subjectId&&!ExplorerState.topicId&&!document.querySelector('.q-selected')&&window.renderQuestionBankV2)window.renderQuestionBankV2()};
  new MutationObserver(()=>setTimeout(audit,0)).observe(app,{childList:true,subtree:true});
})();
