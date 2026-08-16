/* ============================================================
   ADMISSION HUB · API-FREE MINDPAL MISTAKE HELPER
   Builds a safe Bengali prompt for the existing MindPal chatbot.
   Telegram sending uses only a user-configured relay URL; no bot token is used here.
   ============================================================ */
(function installManualMindPalHelper(){
  'use strict';
  if (window.__manualMindPalHelperInstalled) return;
  window.__manualMindPalHelperInstalled = true;

  function getCache(){ try { if (typeof CACHE !== 'undefined' && CACHE) return CACHE; } catch (_) {} return window.CACHE || { questions: [], mistakes: [], subjects: [], topics: [] }; }
  function clean(value, max=5000){ return String(value ?? '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g,'').trim().slice(0,max); }
  function esc(value){
    if (typeof window.esc === 'function') return window.esc(String(value ?? ''));
    return String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function getActiveExam(){ try { return typeof ActiveExam !== 'undefined' ? ActiveExam : window.ActiveExam; } catch (_) { return window.ActiveExam; } }
  function getCorrectIndex(q){ const n = Number(q?.answerIndex ?? q?.answer ?? q?.correctAnswerIndex ?? 0); return Number.isFinite(n) ? n : 0; }
  function findName(items, id){ return clean((items || []).find(x => x.id === id)?.name || ''); }
  function getTelegramSettings(){ try { return JSON.parse(localStorage.getItem('admission_telegram_settings_v1') || '{}'); } catch (_) { return {}; } }
  function getRelayNotifyUrl(raw){
    const value=clean(raw,1000); if(!value) return '';
    try {
      const url=new URL(value, location.href);
      const localHttp=url.protocol==="http:" && (url.hostname==="localhost" || url.hostname==="127.0.0.1");
      if(url.protocol!=="https:" && !localHttp) return "";
      const pathParts=url.pathname.split("/").filter(Boolean);
      if((pathParts[pathParts.length-1] || "").toLowerCase()!=="notify") url.pathname="/"+pathParts.join("/")+"/notify";
      return url.toString();
    } catch (_) { return ''; }
  }
  function setTelegramStatus(text, tone){ const el=document.getElementById('manualMindPalCopyStatus'); if(el){ el.textContent=text; if(tone) el.style.color=tone; } }
  function openTelegramShare(prompt){
    const shareUrl='https://t.me/share/url?url='+encodeURIComponent(location.href)+'&text='+encodeURIComponent(prompt);
    const opened=window.open(shareUrl,'_blank','noopener,noreferrer');
    if(!opened) location.href=shareUrl;
  }
  function findPrevious(q){ return (getCache().mistakes || []).find(m => m.questionId === q?.id) || null; }
  function relatedQuestions(q){
    const all=(getCache().questions||[]).filter(item=>item && item.id!==q?.id);
    const sameTopic=all.filter(item=>item.topicId && item.topicId===q?.topicId);
    const sameSubject=all.filter(item=>item.subjectId && item.subjectId===q?.subjectId && item.topicId!==q?.topicId);
    return [...sameTopic,...sameSubject].filter((item,index,arr)=>arr.findIndex(x=>x.id===item.id)===index).slice(0,3);
  }
  function currentSource(){
    const path = String(window.Router?.path || location.hash.slice(1) || '').split('?')[0];
    if (path.startsWith('question-bank/topic/')) return 'Question Bank';
    const exam = getActiveExam();
    return path === 'exam/running' && exam?.mode === 'flash' ? 'Flash Test' : 'Admission Hub';
  }
  function buildPrompt({q, selectedIndex, source}){
    const c = getCache();
    const options = Array.isArray(q?.options) ? q.options.map((x,i) => `${String.fromCharCode(65+i)}. ${clean(x,1200)}`).join('\n') : '';
    const correctIndex = getCorrectIndex(q);
    const previous = findPrevious(q);
    const subject = findName(c.subjects, q?.subjectId);
    const topic = findName(c.topics, q?.topicId);
    const selected = Array.isArray(q?.options) ? q.options[selectedIndex] || '' : '';
    const correct = Array.isArray(q?.options) ? q.options[correctIndex] || '' : '';
    const related = relatedQuestions(q).map((item,index)=>`${index+1}. ${clean(item.question,500)}`).join('\n') || 'প্রাসঙ্গিক related question পাওয়া যায়নি।';
    return `তুমি Admission Hub-এর বাংলা Mistake Analysis Teacher। অপ্রয়োজনীয় কথা বলবে না; সংক্ষেপে কিন্তু গভীরভাবে উত্তর দেবে।\n\nSource: ${source}\nSubject: ${subject}\nTopic: ${topic}\n\nপ্রশ্ন:\n${clean(q?.question,5000)}\n\nOptions:\n${options}\n\nStudent-এর ভুল উত্তর: ${clean(selected,1200)}\nসঠিক উত্তর: ${clean(correct,1200)}\nআগের ভুলের সংখ্যা: ${Number(previous?.wrongCount || 0)}\nExisting explanation:\n${clean(q?.explanation,3000)}\n\nশুধু এই ৬টি ছোট section দাও: কেন ভুল, সঠিক নিয়ম, Exam Trap, মনে রাখার কৌশল, ১টি ছোট উদাহরণ, Final takeaway।\n\nশেষে এই ৩টি related question শুধু question হিসেবে দাও; উত্তর বা দীর্ঘ ব্যাখ্যা দেবে না:\n${related}\n\nCorrect answer পরিবর্তন করবে না।`;
  }
  function copyText(value, after){
    const done = () => { const el=document.getElementById('manualMindPalCopyStatus'); if(el) el.textContent='Prompt copied ✓ এখন MindPal chatbot-এ paste করো'; if(typeof after==='function') after(); };
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done)); }
    else fallbackCopy(value, done);
  }
  function fallbackCopy(value, done){
    const area=document.createElement('textarea'); area.value=value; area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select(); try { document.execCommand('copy'); } catch (_) {} area.remove(); done(); }
  function addInlineNoteButton({q, selectedIndex, source}){
    const cards=[...document.querySelectorAll('.q-card-v2,[data-qnav-card],.p3-qb-question-card,.question-card,.flash-q-card')];
    const host=cards.find(card=>(card.textContent||'').includes(String(q?.question||'').slice(0,80)));
    if(!host || host.querySelector('[data-manual-note-button]')) return;
    const button=document.createElement('button');
    button.type='button'; button.dataset.manualNoteButton='1'; button.className='mmp-inline-note'; button.textContent='📝 ছোট নোট করুন';
    button.onclick=()=>window.openManualMindPalNote();
    const actionHost=host.querySelector('.q-card-actions,.q-actions,.flash-feedback,.flash-nav') || host;
    actionHost.appendChild(button);
  }
  function showPrompt({q, selectedIndex, source}){
    const prompt = buildPrompt({q, selectedIndex, source});
    const related = relatedQuestions(q);
    const context = { question: clean(q?.question,500), options: Array.isArray(q?.options)?q.options.map((x,i)=>`${String.fromCharCode(65+i)}. ${clean(x,300)}`).join(' | '):'', 'your-answer': clean(q?.options?.[selectedIndex],300), 'correct-answer': clean(q?.options?.[getCorrectIndex(q)],300), explanation: clean(q?.explanation,500), 'related-questions': related.map((item,index)=>`${index+1}. ${clean(item.question,450)}`).join(' | ') };
    window.__manualMindPalLastPrompt = prompt;
    window.__manualMindPalLastContext = context;
    window.questionAnalysisChatbot?.prepareContext?.(context);
    setTimeout(()=>addInlineNoteButton({q,selectedIndex,source}),80);
    let root=document.getElementById('manualMindPalRoot');
    if(!root){ root=document.createElement('div'); root.id='manualMindPalRoot'; document.body.appendChild(root); }
    root.style.cssText='position:fixed;inset:0;z-index:10060;display:flex;align-items:center;justify-content:center;padding:12px;box-sizing:border-box;background:rgba(8,28,22,.62);overflow:auto;';
    root.innerHTML=`<div class="mmp-backdrop" role="dialog" aria-modal="true" aria-label="MindPal mistake helper"><div class="mmp-modal"><button class="mmp-close" type="button" aria-label="Close" onclick="window.closeManualMindPal()">×</button><div class="mmp-kicker">MINDPAL · ${esc(source)}</div><h2>ভুল প্রশ্নটি বুঝে নাও</h2><p class="mmp-help">Prompt তৈরি হয়েছে। <b>Prompt কপি</b> করে MindPal chatbot-এ নিজে paste করে <b>Send</b> চাপবে। চাইলে আলাদা button দিয়ে MindPal খুলতে বা relay-এর মাধ্যমে Telegram-এ পাঠাতে পারবে।</p><div class="mmp-question"><b>প্রশ্ন</b><p>${esc(q?.question)}</p><span>তোমার উত্তর: <strong>${esc(q?.options?.[selectedIndex] || '')}</strong></span><span>সঠিক উত্তর: <strong>${esc(q?.options?.[getCorrectIndex(q)] || '')}</strong></span></div><textarea class="mmp-prompt" id="manualMindPalPrompt" readonly aria-label="MindPal prompt">${esc(prompt)}</textarea><div class="mmp-related"><b>Related 3 questions</b><ol>${related.map(item=>`<li>${esc(item.question)}</li>`).join('') || '<li>পাওয়া যায়নি</li>'}</ol></div><div id="manualMindPalCopyStatus" class="mmp-status">Prompt প্রস্তুত আছে। Copy চাপো।</div><div class="mmp-actions"><button class="mmp-copy" type="button" onclick="window.copyManualMindPalPrompt()">📋 Prompt কপি করুন</button><button class="mmp-mindpal" type="button" onclick="window.openManualMindPal()">🤖 MindPal খুলো</button><button class="mmp-telegram" type="button" onclick="window.shareManualMindPalToTelegram()">✈️ Telegram-এ পাঠান</button><button class="mmp-close-btn" type="button" onclick="window.openManualMindPalNote()">📝 ছোট নোট করুন</button></div></div></div>`;
    // Keep critical layout styles inline because the host app may remove head styles during route reconciliation.
    const compact = window.innerWidth <= 480;
    const backdrop = root.querySelector('.mmp-backdrop');
    const modal = root.querySelector('.mmp-modal');
    const close = root.querySelector('.mmp-close');
    const promptArea = root.querySelector('.mmp-prompt');
    const questionBox = root.querySelector('.mmp-question');
    const relatedBox = root.querySelector('.mmp-related');
    const actions = root.querySelector('.mmp-actions');
    if (backdrop) Object.assign(backdrop.style,{position:'fixed',inset:'0',zIndex:'10061',display:'flex',alignItems:compact?'flex-end':'center',justifyContent:'center',padding:compact?'7px':'12px',boxSizing:'border-box',background:'rgba(8,28,22,.62)',overflow:'auto'});
    if (modal) Object.assign(modal.style,{position:'relative',zIndex:'10062',width:'min(640px,100%)',maxHeight:compact?'88vh':'90vh',overflow:'auto',boxSizing:'border-box',background:'#fff',borderRadius:compact?'22px 22px 0 0':'23px',padding:compact?'19px 13px 13px':'21px 16px 16px',boxShadow:'0 24px 80px rgba(0,0,0,.3)',color:'#153c2d',fontFamily:'inherit',lineHeight:'1.45',overflowWrap:'anywhere'});
    if (close) Object.assign(close.style,{position:'absolute',right:'12px',top:'10px',width:'33px',height:'33px',border:'0',borderRadius:'50%',fontSize:'23px',background:'#edf7f1',color:'#24664e'});
    if (questionBox) Object.assign(questionBox.style,{padding:'11px',borderRadius:'13px',background:'#f0f8f3',fontSize:'12px',lineHeight:'1.5',overflowWrap:'anywhere'});
    if (promptArea) Object.assign(promptArea.style,{display:'block',width:'100%',height:compact?'145px':'180px',marginTop:'10px',boxSizing:'border-box',border:'1px solid #cfe5d8',borderRadius:'12px',padding:'10px',resize:'vertical',font:'12px/1.55 inherit',color:'#254d3e',background:'#fbfefc'});
    if (relatedBox) Object.assign(relatedBox.style,{marginTop:'10px',padding:'10px',borderRadius:'11px',background:'#f7fbf8',color:'#355c4b',fontSize:'11px',lineHeight:'1.5',overflowWrap:'anywhere'});
    if (actions) Object.assign(actions.style,{display:'flex',flexWrap:'wrap',gap:'8px',marginTop:'12px'});
    root.querySelectorAll('.mmp-copy,.mmp-mindpal,.mmp-telegram,.mmp-close-btn').forEach(button=>Object.assign(button.style,{flex:'1 1 180px',minHeight:'42px',border:'0',borderRadius:'12px',padding:'11px',fontWeight:'900',fontSize:'12px',lineHeight:'1.3',whiteSpace:'normal'}));
    const copyButton=root.querySelector('.mmp-copy'); if(copyButton) Object.assign(copyButton.style,{background:'#0f6b4f',color:'#fff'});
    const mindpalButton=root.querySelector('.mmp-mindpal'); if(mindpalButton) Object.assign(mindpalButton.style,{background:'#e8f1ff',color:'#174a8b'});
    const telegramButton=root.querySelector('.mmp-telegram'); if(telegramButton) Object.assign(telegramButton.style,{background:'#e8f7ff',color:'#087ea4'});
    const noteButton=root.querySelector('.mmp-close-btn'); if(noteButton) Object.assign(noteButton.style,{background:'#edf7f1',color:'#0f6b4f'});
    window.__manualMindPalQuestion=q; window.__manualMindPalSelectedIndex=selectedIndex; window.__manualMindPalSource=source;
    document.body.classList.add('mmp-open');
  }
  window.copyManualMindPalPrompt = function(){ if(window.__manualMindPalLastPrompt) copyText(window.__manualMindPalLastPrompt); };
  window.shareManualMindPalToTelegram = async function(){
    const prompt=window.__manualMindPalLastPrompt || '';
    if(!prompt) return;
    copyText(prompt);
    const settings=getTelegramSettings();
    const relayUrl=getRelayNotifyUrl(settings.relayUrl);
    const chatId=clean(settings.chatId,200);
    if(!relayUrl || !chatId){
      setTelegramStatus('Relay URL বা Chat ID সেট করা নেই—সরাসরি Telegram share খুলছি।','#087ea4');
      openTelegramShare(prompt);
      return;
    }
    const button=document.querySelector('.mmp-telegram');
    if(button){ button.disabled=true; button.textContent='পাঠানো হচ্ছে…'; }
    try {
      const question=window.__manualMindPalQuestion || {};
      const title='Admission Hub · ভুল প্রশ্নের ব্যাখ্যা';
      const body=`Source: ${clean(window.__manualMindPalSource || 'Admission Hub',100)}\\n\\n${prompt}`;
      const headers={'content-type':'application/json'};
      if(clean(settings.relayKey,500)) headers['X-Relay-Key']=clean(settings.relayKey,500);
      const response=await fetch(relayUrl,{method:'POST',headers,body:JSON.stringify({chatId,category:'mistake-analysis',title,body,dedupeKey:`${clean(question.id || 'question',120)}-${Number(window.__manualMindPalSelectedIndex) || 0}-${clean(window.__manualMindPalSource || 'hub',40)}`})});
      let result={}; try { result=await response.json(); } catch (_) {}
      if(!response.ok || !result.ok) throw new Error(result.error || `Relay error (${response.status})`);
      setTelegramStatus(result.duplicate ? 'এই প্রশ্নটি গত ২৪ ঘণ্টায় Telegram-এ পাঠানো হয়েছে।' : 'Telegram-এ পাঠানো হয়েছে ✓','#087ea4');
    } catch (error) {
      setTelegramStatus('Relay কাজ করেনি—সরাসরি Telegram share খুলছি।','#b45309');
      openTelegramShare(prompt);
    } finally {
      if(button){ button.disabled=false; button.textContent='✈️ Telegram-এ পাঠান'; }
    }
  };
  window.openManualMindPal = function(){
    const root=document.getElementById('manualMindPalRoot');
    if(root) root.innerHTML='';
    document.body.classList.remove('mmp-open');
    const openChat=()=>{
      const button=document.querySelector('[aria-label="Open chat"]');
      if(button) button.click();
    };
    if(document.querySelector('[aria-label="Close chat"]')) return;
    openChat();
    setTimeout(()=>{
      if(!document.querySelector('[aria-label="Close chat"]')) openChat();
    },500);
  };
  window.closeManualMindPal = function(){ const root=document.getElementById('manualMindPalRoot'); if(root){ root.innerHTML=''; root.style.cssText='display:none'; } document.body.classList.remove('mmp-open'); };
  window.openManualMindPalNote = function(){ const args={q:window.__manualMindPalQuestion,selectedIndex:window.__manualMindPalSelectedIndex,source:window.__manualMindPalSource}; window.closeManualMindPal(); setTimeout(()=>window.openQuestionNoteEditor?.(args),0); };
  function wrapTopic(){
    if(typeof window.selectTopicAnswer !== 'function' || window.selectTopicAnswer.__manualMindPalWrapped) return;
    const original=window.selectTopicAnswer;
    const wrapped=async function(qid, idx){
      const q=getCache().questions?.find(x => x.id === qid);
      const result=await original.apply(this, arguments);
      if(q && Number(idx)!==getCorrectIndex(q)) showPrompt({q, selectedIndex:Number(idx), source:'Question Bank'});
      return result;
    };
    wrapped.__manualMindPalWrapped=true; window.selectTopicAnswer=wrapped; try { selectTopicAnswer=wrapped; } catch (_) {}
  }
  function wrapFlash(){
    if(typeof window.selectFlashAnswer !== 'function' || window.selectFlashAnswer.__manualMindPalWrapped) return;
    const original=window.selectFlashAnswer;
    const wrapped=async function(qid, idx){
      const exam=getActiveExam(); const q=exam?.questions?.find(x => x.id === qid);
      const result=await original.apply(this, arguments);
      if(q && exam?.mode === 'flash' && Number(idx)!==getCorrectIndex(q)) showPrompt({q, selectedIndex:Number(idx), source:'Flash Test'});
      return result;
    };
    wrapped.__manualMindPalWrapped=true; window.selectFlashAnswer=wrapped; try { selectFlashAnswer=wrapped; } catch (_) {}
  }
  function installHooks(){ wrapTopic(); wrapFlash(); }
  installHooks(); setTimeout(installHooks,800); setTimeout(installHooks,1800);

  const style=document.createElement('style'); style.id='manual-mindpal-helper-styles'; style.textContent=`.mmp-open{overflow:hidden}.mmp-backdrop{position:fixed;inset:0;z-index:10060;background:rgba(8,28,22,.62);display:flex;align-items:center;justify-content:center;padding:12px}.mmp-modal{position:relative;width:min(640px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:23px;padding:21px 16px 16px;box-shadow:0 24px 80px rgba(0,0,0,.3);color:#153c2d}.mmp-close{position:absolute;right:12px;top:10px;width:33px;height:33px;border:0;border-radius:50%;font-size:23px;background:#edf7f1;color:#24664e}.mmp-kicker{font-size:10px;letter-spacing:.12em;font-weight:900;color:#0f6b4f}.mmp-modal h2{margin:4px 0 7px;font-size:23px}.mmp-help{font-size:13px;line-height:1.55;color:#567267}.mmp-question{padding:11px;border-radius:13px;background:#f0f8f3;font-size:12px;line-height:1.5}.mmp-question p{font-size:14px;font-weight:800;margin:5px 0 8px}.mmp-question span{display:block}.mmp-prompt{width:100%;height:180px;margin-top:10px;border:1px solid #cfe5d8;border-radius:12px;padding:10px;resize:vertical;font:12px/1.55 inherit;color:#254d3e;background:#fbfefc}.mmp-inline-note{display:block;width:100%;margin-top:9px;border:1px solid #b9ddc8;background:#f1fbf4;color:#0f6b4f;border-radius:10px;padding:9px 10px;font-size:11px;font-weight:900;cursor:pointer}.mmp-status{font-size:11px;color:#6f847a;margin-top:6px}.mmp-related{margin-top:10px;padding:10px;border-radius:11px;background:#f7fbf8;color:#355c4b;font-size:11px;line-height:1.5}.mmp-related ol{margin:5px 0 0;padding-left:18px}.mmp-related li{margin:3px 0}.mmp-actions{display:flex;gap:8px;margin-top:12px}.mmp-copy,.mmp-mindpal,.mmp-telegram,.mmp-close-btn{flex:1 1 180px;border:0;border-radius:12px;padding:11px;font-weight:900;cursor:pointer;line-height:1.3}.mmp-copy{background:#0f6b4f;color:white}.mmp-mindpal{background:#e8f1ff;color:#174a8b}.mmp-telegram{background:#e8f7ff;color:#087ea4}.mmp-close-btn{background:#edf7f1;color:#0f6b4f}@media(max-width:480px){.mmp-backdrop{align-items:flex-end;padding:7px}.mmp-modal{border-radius:22px 22px 0 0;max-height:91vh;padding:19px 13px 13px}.mmp-prompt{height:145px}}`; document.head.appendChild(style);
})();
