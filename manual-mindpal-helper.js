/* ============================================================
   ADMISSION HUB · API-FREE MINDPAL MISTAKE HELPER
   Builds a safe Bengali prompt for the existing MindPal chatbot.
   No API key, backend, or automatic external request is used.
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
  function findPrevious(q){ return (getCache().mistakes || []).find(m => m.questionId === q?.id) || null; }
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
    return `তুমি Admission Hub-এর বাংলা Mistake Analysis Teacher।\n\nSource: ${source}\nSubject: ${subject}\nTopic: ${topic}\nQuestion ID: ${clean(q?.id,180)}\n\nপ্রশ্ন:\n${clean(q?.question,5000)}\n\nOptions:\n${options}\n\nStudent-এর নির্বাচিত ভুল উত্তর: ${clean(selected,1200)}\nসঠিক উত্তর: ${clean(correct,1200)}\nআগে এই প্রশ্নে ভুলের সংখ্যা: ${Number(previous?.wrongCount || 0)}\n\nExisting explanation থাকলে বিবেচনা করো:\n${clean(q?.explanation,3000)}\n\nসহজ, স্বাভাবিক বাংলাদেশের বাংলায় নিচের ৭টি অংশে উত্তর দাও:\n1. মজার ব্যাখ্যা\n2. সহজ নিয়ম\n3. পরীক্ষার ফাঁদ\n4. নতুন উদাহরণ\n5. মনে রাখার কৌশল\n6. আবার যেন ভুল না হয়\n7. Final takeaway\n\nশুধু correct answer বলবে না; কেন student ভুল করেছে সেটি বুঝিয়ে দেবে। Correct answer পরিবর্তন করবে না। আগের ভুলের সংখ্যা বেশি হলে অতিরিক্ত reinforcement দেবে।`;
  }
  function copyText(value){
    const done = () => { const el=document.getElementById('manualMindPalCopyStatus'); if(el) el.textContent='Prompt copied ✓ এখন MindPal chatbot-এ paste করো'; };
    if (navigator.clipboard?.writeText) { navigator.clipboard.writeText(value).then(done).catch(() => fallbackCopy(value, done)); }
    else fallbackCopy(value, done);
  }
  function fallbackCopy(value, done){
    const area=document.createElement('textarea'); area.value=value; area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select(); try { document.execCommand('copy'); } catch (_) {} area.remove(); done(); }
  function showPrompt({q, selectedIndex, source}){
    const prompt = buildPrompt({q, selectedIndex, source});
    window.__manualMindPalLastPrompt = prompt;
    let root=document.getElementById('manualMindPalRoot');
    if(!root){ root=document.createElement('div'); root.id='manualMindPalRoot'; document.body.appendChild(root); }
    root.innerHTML=`<div class="mmp-backdrop" role="dialog" aria-modal="true" aria-label="MindPal mistake helper"><div class="mmp-modal"><button class="mmp-close" type="button" aria-label="Close" onclick="window.closeManualMindPal()">×</button><div class="mmp-kicker">MINDPAL · ${esc(source)}</div><h2>ভুল প্রশ্নটি বুঝে নাও</h2><p class="mmp-help">প্রথমে Prompt copy করো। তারপর screen-এর MindPal chatbot খুলে prompt paste করে Send করো।</p><div class="mmp-question"><b>প্রশ্ন</b><p>${esc(q?.question)}</p><span>তোমার উত্তর: <strong>${esc(q?.options?.[selectedIndex] || '')}</strong></span><span>সঠিক উত্তর: <strong>${esc(q?.options?.[getCorrectIndex(q)] || '')}</strong></span></div><textarea class="mmp-prompt" readonly aria-label="MindPal prompt">${esc(prompt)}</textarea><div id="manualMindPalCopyStatus" class="mmp-status">Copy না হওয়া পর্যন্ত prompt এখানেই থাকবে</div><div class="mmp-actions"><button class="mmp-copy" type="button" onclick="window.copyManualMindPalPrompt()">📋 Copy Prompt</button><button class="mmp-close-btn" type="button" onclick="window.closeManualMindPal()">পরে করব</button></div></div></div>`;
    document.body.classList.add('mmp-open');
  }
  window.copyManualMindPalPrompt = function(){ if(window.__manualMindPalLastPrompt) copyText(window.__manualMindPalLastPrompt); };
  window.closeManualMindPal = function(){ const root=document.getElementById('manualMindPalRoot'); if(root) root.innerHTML=''; document.body.classList.remove('mmp-open'); };
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

  const style=document.createElement('style'); style.id='manual-mindpal-helper-styles'; style.textContent=`.mmp-open{overflow:hidden}.mmp-backdrop{position:fixed;inset:0;z-index:10060;background:rgba(8,28,22,.62);display:flex;align-items:center;justify-content:center;padding:12px}.mmp-modal{position:relative;width:min(640px,100%);max-height:90vh;overflow:auto;background:#fff;border-radius:23px;padding:21px 16px 16px;box-shadow:0 24px 80px rgba(0,0,0,.3);color:#153c2d}.mmp-close{position:absolute;right:12px;top:10px;width:33px;height:33px;border:0;border-radius:50%;font-size:23px;background:#edf7f1;color:#24664e}.mmp-kicker{font-size:10px;letter-spacing:.12em;font-weight:900;color:#0f6b4f}.mmp-modal h2{margin:4px 0 7px;font-size:23px}.mmp-help{font-size:13px;line-height:1.55;color:#567267}.mmp-question{padding:11px;border-radius:13px;background:#f0f8f3;font-size:12px;line-height:1.5}.mmp-question p{font-size:14px;font-weight:800;margin:5px 0 8px}.mmp-question span{display:block}.mmp-prompt{width:100%;height:180px;margin-top:10px;border:1px solid #cfe5d8;border-radius:12px;padding:10px;resize:vertical;font:12px/1.55 inherit;color:#254d3e;background:#fbfefc}.mmp-status{font-size:11px;color:#6f847a;margin-top:6px}.mmp-actions{display:flex;gap:8px;margin-top:12px}.mmp-copy,.mmp-close-btn{flex:1;border:0;border-radius:12px;padding:11px;font-weight:900}.mmp-copy{background:#0f6b4f;color:white}.mmp-close-btn{background:#edf7f1;color:#0f6b4f}@media(max-width:480px){.mmp-backdrop{align-items:flex-end;padding:7px}.mmp-modal{border-radius:22px 22px 0 0;max-height:91vh;padding:19px 13px 13px}.mmp-prompt{height:145px}}`; document.head.appendChild(style);
})();
