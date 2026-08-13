/* ================= PHASE 3: INTELLIGENCE LAYER =================
   Additive only: reads existing CACHE/IndexedDB records and preserves Mock Test behavior.
*/
(function(){
  'use strict';
  const LS={tasks:'admission_phase3_tasks', notifications:'admission_phase3_notifications', notificationSettings:'admission_phase3_notification_settings', motivation:'admission_phase3_motivation_state'};
  const CATEGORIES=['Study','Revision','Exam','Result','Streak','Progress','Achievement','System'];
  const MOTIVATIONS=[
    ['আজকের ফলাফল তোমার অগ্রগতি দেখাচ্ছে।','এই ধারাবাহিকতাই তোমার শক্তি।','আরও এক ধাপ এগিয়ে যাও।'],
    ['তোমার accuracy ভালো পথে আছে।','যে বিষয়গুলো শক্তিশালী সেগুলো ধরে রাখো।','এবার দুর্বল অংশে মন দাও।'],
    ['ভুলগুলো তোমার শেখার মানচিত্র।','প্রতিটি ভুল আলাদা করে বুঝে নাও।','পরের চেষ্টায় এগুলোই শক্তি হবে।'],
    ['আজ কম হয়েছে, তবু থেমে যেও না।','ছোট একটি practice set শুরু করো।','ধারাবাহিকতাই বড় ফল আনে।'],
    ['তোমার সাম্প্রতিক performance উন্নত হয়েছে।','এই momentum নষ্ট হতে দিও না।','একটি focused revision করো।'],
    ['সাম্প্রতিক ফলাফলে একটু চাপ দেখা যাচ্ছে।','দুর্বল topic-এ ফিরে যাও।','বোঝার পর আবার timed practice করো।'],
    ['একই ভুল বারবার হচ্ছে।','ভুলের কারণ লিখে পুনরায় solve করো।','আজকের revision হবে লক্ষ্যভিত্তিক।'],
    ['তোমার streak তৈরি হচ্ছে।','প্রতিদিনের ছোট পদক্ষেপ জমা হচ্ছে।','আজও একটি session সম্পূর্ণ করো।'],
    ['দীর্ঘদিন mock test হয়নি।','একটি বাস্তবসম্মত mock-এর সময় ঠিক করো।','ফলাফল দিয়ে পরের plan বদলাও।'],
    ['তুমি নিয়মিত mock দিচ্ছো।','এখন ভুলের trend কমানোই লক্ষ্য।','accuracy-কে score-এর সঙ্গে এগিয়ে নাও।'],
    ['তোমার প্রশ্ন সমাধানের গতি বাড়ছে।','সঠিকতার সঙ্গে গতি মিলিয়ে নাও।','অযথা তাড়াহুড়ো এড়িয়ে চলো।'],
    ['Skipped প্রশ্নগুলোও গুরুত্বপূর্ণ সংকেত।','যেগুলো বাদ গেছে সেগুলোর কারণ খুঁজে দেখো।','পরের mock-এ attempt strategy ঠিক করো।'],
    ['তোমার overall progress স্থিরভাবে এগোচ্ছে।','আজ একটি weak topic বেছে নাও।','লক্ষ্য পূরণ হলে নিজেকে credit দাও।'],
    ['আজকের কাজের তালিকা তোমার হাতে।','প্রথমে সবচেয়ে জরুরি task-টি শেষ করো।','তারপর revision-এ যাও।'],
    ['একটি subject তোমার বেশি practice চাইছে।','ভয় না পেয়ে ছোট অংশে ভাগ করো।','আজ শুধু প্রথম অংশটি জয় করো।'],
    ['তোমার recent accuracy তথ্য দিচ্ছে।','শুধু score নয়, pattern-ও দেখো।','এই insight-কে কাজে লাগাও।'],
    ['প্রস্তুতি কখনও একদিনে শেষ হয় না।','আজকের session-টি সম্পূর্ণ করাই সাফল্য।','ধীরে, কিন্তু থেমো না।'],
    ['তুমি যত solve করছো, তত পরিষ্কার হচ্ছে।','প্রশ্নের মানও খেয়াল রাখো।','বোঝার practice-ই দীর্ঘস্থায়ী হয়।'],
    ['Revision priority স্পষ্ট হয়ে গেছে।','সবকিছু একসঙ্গে নয়, আগে দুর্বল topic।','ফোকাসড কাজ দ্রুত ফল দেয়।'],
    ['তোমার best score একটি প্রমাণ।','তুমি আরও ভালো করতে পারো।','পরের লক্ষ্যটি বাস্তব ও নির্দিষ্ট রাখো।'],
    ['আজকের performance বিশ্লেষণ করো।','যা ঠিক হয়েছে তা ধরে রাখো।','যা আটকে দিয়েছে তা ভেঙে অনুশীলন করো।'],
    ['তোমার consistency-ই বড় advantage।','একটি missed day তোমার গল্প বদলায় না।','আজ আবার শুরু করাই যথেষ্ট।'],
    ['প্রতিটি practice তোমাকে exam-ready করছে।','দুর্বলতার সামনে দাঁড়াও।','সেখানেই তোমার পরের উন্নতি।'],
    ['আজ progress কম হলেও data নষ্ট হয়নি।','এটি পরের সিদ্ধান্তের ভিত্তি।','একটি ছোট action এখনই নাও.']
  ];
  const read=(key,fallback)=>{try{const v=JSON.parse(localStorage.getItem(key)||'null');return v==null?fallback:v}catch(_){return fallback}};
  const write=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch(_){} };
  const esc3=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pct=(n,d)=>d?Math.round(n/d*100):0;
  const keyOf=d=>typeof todayKey==='function'?todayKey(new Date(d)):new Date(d).toISOString().slice(0,10);
  const dateMs=k=>new Date(k+'T00:00:00').getTime();
  function results(){return typeof CACHE!=='undefined'&&Array.isArray(CACHE.examResults)?CACHE.examResults.filter(Boolean):[]}
  function snaps(){return results().flatMap(r=>(r.snapshot||[]).map(s=>({...s,examDate:r.date||r.createdAt||Date.now(),examId:r.id})))}
  function subjectLabel(id){try{return typeof subjectName==='function'?subjectName(id):id||'Unknown subject'}catch(_){return id||'Unknown subject'}}
  function topicLabel(id){try{return typeof topicName==='function'?topicName(id):id||'Unknown topic'}catch(_){return id||'Unknown topic'}}
  function aggregate(items,name){const m={};items.forEach(x=>{const id=x[name]||'unknown';m[id]??={id,name:name==='subjectId'?subjectLabel(id):topicLabel(id),attempts:0,correct:0,wrong:0,skipped:0,lastAt:0};m[id].attempts++;m[id][x.status]=(m[id][x.status]||0)+1;m[id].lastAt=Math.max(m[id].lastAt,Number(x.examDate)||0)});return Object.values(m).map(x=>({...x,accuracy:pct(x.correct,x.correct+x.wrong),answered:x.correct+x.wrong}))}
  function summary(){const s=snaps(),answered=s.filter(x=>x.status!=='skipped'),correct=s.filter(x=>x.status==='correct'),wrong=s.filter(x=>x.status==='wrong'),skipped=s.filter(x=>x.status==='skipped'),rs=results();const days=new Set(s.map(x=>keyOf(x.examDate)));const ordered=[...days].sort();let streak=0,run=0,last='';ordered.forEach(k=>{if(last&&dateMs(k)-dateMs(last)===86400000)run++;else run=1;streak=Math.max(streak,run);last=k});const today=keyOf(Date.now()),todayItems=s.filter(x=>keyOf(x.examDate)===today),recent=rs.slice(-5),scores=rs.map(r=>Number(r.score)||0);return {s,answered,correct,wrong,skipped,rs,days,streak,todayItems,recent,scores,accuracy:pct(correct.length,answered.length),todayAnswered:todayItems.filter(x=>x.status!=='skipped').length,todayCorrect:todayItems.filter(x=>x.status==='correct').length}};
  function tasks(){const v=read(LS.tasks,[]);return Array.isArray(v)?v:[]}
  function saveTasks(v){write(LS.tasks,v)}
  function settings(){const s=read(LS.notificationSettings,{});return Object.fromEntries(CATEGORIES.map(c=>[c,s[c]!==false]))}
  function saveSettings(v){write(LS.notificationSettings,v)}
  function notifications(){const v=read(LS.notifications,[]);return Array.isArray(v)?v:[]}
  function addNotification(category,title,body,dedupe){if(!settings()[category])return;let ns=notifications();if(ns.some(n=>n.dedupeKey===dedupe))return;const item={id:'n-'+Date.now()+'-'+Math.random().toString(36).slice(2,7),category,title,body,dedupeKey:dedupe,read:false,createdAt:Date.now()};ns=[item,...ns].slice(0,100);write(LS.notifications,ns);try{window.dispatchEvent(new CustomEvent('admission:notify',{detail:{category,title,body,dedupeKey:dedupe}}))}catch(_){} }
  function derive(){const z=summary(),bySubject=aggregate(z.s,'subjectId'),byTopic=aggregate(z.s,'topicId');const weakTopics=byTopic.filter(x=>x.answered>0).sort((a,b)=>a.accuracy-b.accuracy||b.wrong-a.wrong);const weakSubjects=bySubject.filter(x=>x.answered>0).sort((a,b)=>a.accuracy-b.accuracy);const mistakeMap={};(CACHE.mistakes||[]).forEach(m=>{const id=m.topicId||m.questionId;mistakeMap[id]=(mistakeMap[id]||0)+Number(m.wrongCount||1)});const repeated=Object.entries(mistakeMap).sort((a,b)=>b[1]-a[1]).slice(0,5).map(([id,count])=>({name:topicLabel(id),count,id}));const target=Number(CACHE.settings?.dailyTarget||read('dailyTarget',20))||20;const done=z.todayAnswered;const pending=Math.max(0,target-done);const recent=z.recent.map(r=>({date:keyOf(r.date||r.createdAt),score:Number(r.score)||0,accuracy:Number(r.accuracy)||0}));const todayActivity=z.todayItems.reduce((acc,item)=>{const sub=subjectLabel(item.subjectId);if(!acc[sub])acc[sub]={correct:0,total:0};if(item.status==='correct')acc[sub].correct++;if(item.status!=='skipped')acc[sub].total++;return acc},{});const activityText=Object.entries(todayActivity).map(([name,stats])=>`${name}: ${stats.correct}/${stats.total}`).join(', ')||'No activity yet';const last=recent.at(-1),prev=recent.at(-2);let recommendation='প্রথমে একটি ছোট practice set সম্পূর্ণ করুন।',action="navigate('exam/setup')";if(repeated[0]){recommendation=`${repeated[0].name}-এ ${repeated[0].count}টি stored mistake আছে। আগে এই topic revise করুন।`;action=`startPhase3Topic('${String(repeated[0].id).replace(/'/g,"\\'")}')`}else if(weakTopics[0]){recommendation=`${weakTopics[0].name}-এর accuracy ${weakTopics[0].accuracy}%। focused revision দিয়ে শুরু করুন।`;action=`startPhase3Topic('${String(weakTopics[0].id).replace(/'/g,"\\'")}')`}else if(pending>0){recommendation=`আজকের target পূরণে আরও ${pending}টি প্রশ্ন বাকি।`;action="navigate('exam/setup')"}else if(last&&prev&&last.score>prev.score){recommendation='সাম্প্রতিক score বেড়েছে। এই momentum ধরে একটি revision করুন।';action="navigate('progress')"}return {z,bySubject,byTopic,weakTopics,weakSubjects,repeated,target,done,pending,recent,recommendation,action,activityText}};
  function streak(){return summary().streak}
  function motivation(){const d=derive(),z=d.z;let idx=0;if(z.s.length===0)idx=16;else if(z.scores.at(-1)>=80)idx=0;else if(z.accuracy<60)idx=5;else if(d.repeated[0])idx=6;else if(z.recent.length<2)idx=3;else if(z.recent.at(-1).score>z.recent.at(-2).score)idx=4;else if(streak()>=3)idx=7;else if(d.weakTopics[0])idx=18;const state=read(LS.motivation,{last:-1});if(idx===state.last)idx=(idx+1)%MOTIVATIONS.length;write(LS.motivation,{last:idx,updatedAt:Date.now()});return MOTIVATIONS[idx]}
  function fmtTime(ms){const n=Math.round(Number(ms||0)/60000);return n?`${n} min`:'0 min'}
  function bars(items,label){if(!items.length)return '<div class="p3-empty">এই সময়সীমায় কোনো stored data নেই।</div>';return items.map(x=>`<div class="p3-bar-row"><div class="p3-bar-label"><span>${esc3(x.name)}</span><b>${x.accuracy}%</b></div><div class="p3-bar"><i style="width:${Math.min(100,Math.max(0,x.accuracy))}%"></i></div><small>${x.answered||0} answered · ${x.wrong||0} wrong</small></div>`).join('')}
  const ICONS = {
    crown: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7z"></path></svg>`,
    inbox: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>`,
    target: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><circle cx="12" cy="12" r="6"></circle><circle cx="12" cy="12" r="2"></circle></svg>`,
    tasks: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path><rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect><path d="M9 14l2 2 4-4"></path></svg>`,
    accuracy: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>`,
    streak: `<svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.5 3.5 6 1.5 1.5 2 2.75 2 4.25a6.5 6.5 0 1 1-9 1.25z"></path></svg>`,
    star: `<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>`,
    check: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`,
    x: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    question: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
    lightbulb: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18h6"></path><path d="M10 22h4"></path><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"></path></svg>`,
    clock: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>`,
    trophy: `<svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path><path d="M4 22h16"></path><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"></path><path d="M18 4H6v7a6 6 0 0 0 12 0V4z"></path></svg>`,
    arrow: `<svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>`,
    trend: `<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>`
  };

  function widgetHTML(){
    const d=derive(),z=d.z,st=streak(),t=tasks(),done=t.filter(x=>x.completed).length,pending=t.length-done,study=(CACHE.dailyStats||[]).reduce((a,x)=>a+Number(x.timeMs||0),0);
    const mock=z.rs.length,xp=Number(localStorage.getItem('xp')||CACHE.settings?.xp||0);
    const targetPct = Math.min(100, Math.round(d.done/Math.max(1,d.target)*100));
    const tasksPct = Math.min(100, Math.round(done/Math.max(1,t.length||1)*100));
    const unread = notifications().filter(n=>!n.read).length;
    
    // Original data points
    const unfinished = typeof CACHE !== 'undefined' && Array.isArray(CACHE.exams) ? CACHE.exams.find((exam) => exam.status === 'running') : null;
    const smartFocus = typeof getSmartFocusTopics === 'function' ? getSmartFocusTopics() : [];
    const stats = typeof computeLifetimeStats === 'function' ? computeLifetimeStats() : {totalQuestions: 0};

    const commandTools = [
      ['📚', 'Bank', 'প্রশ্নভাণ্ডার', 'question-bank'],
      ['📋', 'Mock', 'মক টেস্ট', 'exam/setup'],
      ['⚡', 'Quick', 'দ্রুত অনুশীলন', 'exam/setup'],
      ['❌', 'Mistakes', 'ভুলের খাতা', 'mistakes'],
      ['📊', 'Progress', 'অগ্রগতি দেখুন', 'progress'],
      ['🎯', 'Goals', 'দৈনিক লক্ষ্য', 'progress/plan'],
      ['🔄', 'Revision', 'স্মার্ট রিভিশন', 'mistakes'],
      ['📖', 'Vocab', 'ভোকাবুলারি', 'vocabulary'],
      ['🕐', 'History', 'পরীক্ষার ইতিহাস', 'history'],
      ['🔍', 'Search', 'প্রশ্ন খুঁজুন', 'question-bank'],
      ['⚙️', 'Settings', 'অ্যাপ সেটিংস', 'settings'],
      ['⋯', 'More', 'আরও ফিচার', 'settings']
    ];

    const commandPages = [[0,6],[6,12]].map(([start,end]) => commandTools.slice(start,end).map(([icon,title,subtitle,route]) => `
      <button class="p3-command-card-v3" onclick="navigate('${route}')" type="button">
        <span class="p3-command-icon-v3">${icon}</span>
        <span class="p3-command-title-v3">${title}</span>
        <span class="p3-command-subtitle-v3">${subtitle}</span>
      </button>`).join(''));

    const specialTools = [
      ['🧠', 'Daily GK', 'আজকের গুরুত্বপূর্ণ সাধারণ জ্ঞান', 'daily-gk'],
      ['🌐', 'Web Chat', 'দ্রুত তথ্য খুঁজুন', 'web-chat'],
      ['📖', 'Dictionary', 'শব্দের অর্থ ও Vocabulary', 'dictionary'],
      ['🧩', 'Memorizing', 'Smart memorization tools', 'memorizing']
    ];

    const focusMarkup = smartFocus.length
      ? smartFocus.map((item) => `
          <div class="p3-focus-row-v3">
            <div class="p3-focus-info-v3">
              <strong>${esc3(item.name)}</strong>
              <small>${item.mCount} mistakes · ${typeof round2 === 'function' ? round2(item.acc) : item.acc}% accuracy</small>
            </div>
            <em class="p3-focus-tag-v3 ${item.cls}">${item.label}</em>
          </div>`).join('')
      : '<p class="p3-muted-v3">অনুশীলন শুরু করলে আপনার দুর্বল topic এখানে দেখা যাবে।</p>';

    return `
    <section class="p3-dashboard-v3" data-p3-command>
      <header class="p3-header-v3">
        <div class="p3-header-left">
          <div class="p3-crown-circle">${ICONS.crown}</div>
          <div class="p3-header-text">
            <div class="p3-kicker-v3">SMART STUDY COMMAND CENTER</div>
            <h2>আজকের পড়াশোনার ছবি</h2>
            <p>তোমার stored activity থেকেই এই summary তৈরি হয়েছে।</p>
          </div>
        </div>
        <div class="p3-header-right">
          <button class="p3-inbox-btn" onclick="navigate('notifications')">
            <span>Inbox</span>
            ${unread ? `<i class="p3-badge">${unread}</i>` : ''}
          </button>
          <span class="p3-live-badge">REAL DATA</span>
        </div>
      </header>

      <div class="p3-grid-v3">
        <article class="p3-card-v3 p3-card-target">
          <div class="p3-card-icon-row">
            <div class="p3-icon-box target">${ICONS.target}</div>
            <div class="p3-card-label">Today's Target</div>
          </div>
          <div class="p3-card-value"><strong>${d.done} / ${d.target}</strong></div>
          <div class="p3-card-sub">${d.pending?d.pending+' remaining':'Target complete'}</div>
          <div class="p3-card-progress"><i style="width:${targetPct}%"></i></div>
        </article>

        <article class="p3-card-v3 p3-card-tasks">
          <div class="p3-card-icon-row">
            <div class="p3-icon-box tasks">${ICONS.tasks}</div>
            <div class="p3-card-label">Tasks</div>
          </div>
          <div class="p3-card-value"><strong>${done} / ${t.length}</strong></div>
          <div class="p3-card-sub">${pending} pending</div>
          <div class="p3-card-progress"><i style="width:${tasksPct}%"></i></div>
        </article>

        <article class="p3-card-v3 p3-card-accuracy">
          <div class="p3-card-icon-row">
            <div class="p3-icon-box accuracy">${ICONS.accuracy}</div>
            <div class="p3-card-label">Accuracy</div>
          </div>
          <div class="p3-card-value"><strong>${z.accuracy||0}%</strong></div>
          <div class="p3-card-sub p3-activity-text">${esc3(d.activityText||'No activity yet')}</div>
          <div class="p3-card-progress"><i style="width:${z.accuracy||0}%"></i></div>
        </article>

        <article class="p3-card-v3 p3-card-streak">
          <div class="p3-card-icon-row">
            <div class="p3-icon-box streak">${ICONS.streak}</div>
            <div class="p3-card-label">Streak</div>
          </div>
          <div class="p3-card-value"><strong>${st} day${st===1?'':'s'}</strong></div>
          <div class="p3-card-sub">stored active days</div>
          <div class="p3-card-progress"><i style="width:${Math.min(100, st * 10)}%"></i></div>
        </article>
      </div>

      <section class="p3-card-v3 p3-command-section-v3">
        <div class="p3-section-head-v3">
          <b>Your Command Center</b>
          <span class="p3-swipe-hint-v3">Swipe to explore · 12 tools</span>
        </div>
        <div class="command-carousel" aria-label="Quick access study tools">
          <div class="command-track" id="commandTrack">
            ${commandPages.map((page,index)=>`<div class="command-slide" data-command-page="${index}">${page}</div>`).join('')}
          </div>
        </div>
        <div class="command-dots" role="tablist" aria-label="Command Center pages">
          <button class="command-dot active" type="button" role="tab" aria-label="Page 1" aria-selected="true" onclick="goCommandPage(0)"></button>
          <button class="command-dot" type="button" role="tab" aria-label="Page 2" aria-selected="false" onclick="goCommandPage(1)"></button>
        </div>
      </section>

      <section class="p3-card-v3 p3-recommend-v3">
        <div class="p3-recommend-content">
          <div class="p3-recommend-header">
            <div class="p3-recommend-title">
              <span class="p3-star-icon">${ICONS.star}</span>
              Recommended Next Action
            </div>
            <button class="p3-open-btn" onclick="${d.action}">Open ${ICONS.arrow}</button>
          </div>
          <p class="p3-recommend-text">${esc3(d.recommendation)}</p>
          <div class="p3-recommend-list">
            <div class="p3-rec-item">
              <span class="p3-rec-icon target">${ICONS.target}</span>
              Weak area: <b>${esc3(d.weakTopics[0]?.name||'Not enough data')}</b>
            </div>
            <div class="p3-rec-item">
              <span class="p3-rec-icon book">${ICONS.tasks}</span>
              Revision priority: <b>${esc3(d.repeated[0]?.name||d.weakTopics[0]?.name||'No priority yet')}</b>
            </div>
            <div class="p3-rec-item">
              <span class="p3-rec-icon trend">${ICONS.trend}</span>
              Recent performance: <b>${z.recent.length?`${z.recent.at(-1).score||0} score`:'No mock result yet'}</b>
            </div>
          </div>
        </div>
        <div class="p3-recommend-illustration">
          <div class="p3-3d-placeholder">
            <div class="p3-3d-clipboard">
              <div class="p3-3d-lines"></div>
            </div>
            <div class="p3-3d-books">
              <div class="p3-book-1"></div>
              <div class="p3-book-2"></div>
              <div class="p3-book-3"></div>
            </div>
          </div>
        </div>
      </section>

      <section class="p3-card-v3 p3-tasks-v3">
        <div class="p3-section-head-v3">
          <b>Today's Tasks</b>
          <button class="p3-add-task-btn" onclick="phase3AddTask()">+ Add Task</button>
        </div>
        <div class="p3-task-list-v3">
          ${t.length ? t.slice(-4).map(x=>`
            <label class="p3-task-item-v3">
              <input type="checkbox" ${x.completed?'checked':''} onchange="phase3CompleteTask('${x.id}')">
              <span class="${x.completed?'done':''}">${esc3(x.title)}</span>
            </label>
          `).join('') : '<div class="p3-empty-tasks">No tasks added yet.</div>'}
        </div>
      </section>

      <div class="p3-two-col-v3">
        <section class="p3-card-v3 p3-progress-v3">
          <div class="p3-section-head-v3">
            <div class="p3-title-with-icon">${ICONS.trend} Current Study Progress</div>
          </div>
          <div class="p3-progress-body-v3">
            <div class="p3-circle-container">
              <svg viewBox="0 0 36 36" class="p3-circular-chart">
                <path class="p3-circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <path class="p3-circle" stroke-dasharray="${targetPct}, 100" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                <text x="18" y="20.35" class="p3-percentage">${targetPct}%</text>
              </svg>
            </div>
            <div class="p3-progress-stats-v3">
              <div class="p3-prog-stat">
                <div class="p3-prog-icon-box">${ICONS.question}</div>
                <div>
                  <small>Questions solved</small>
                  <b>${z.answered.length||0}</b>
                </div>
              </div>
              <div class="p3-prog-stat">
                <div class="p3-prog-icon-box">${ICONS.clock}</div>
                <div>
                  <small>Study time</small>
                  <b>${fmtTime(study)}</b>
                </div>
              </div>
              <div class="p3-prog-stat">
                <div class="p3-prog-icon-box">${ICONS.trend}</div>
                <div>
                  <small>Recent trend</small>
                  <b class="p3-trend-text">Improving</b>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section class="p3-card-v3 p3-quick-stats-v3">
          <div class="p3-section-head-v3">
            <b>Quick Stats</b>
            <button class="p3-more-btn">⋮</button>
          </div>
          <div class="p3-quick-grid-v3">
            <div class="p3-quick-box">
              <div class="p3-quick-icon q1">${ICONS.question}</div>
              <div class="p3-quick-data">
                <b>${z.answered.length||0}</b>
                <small>Questions Solved</small>
              </div>
            </div>
            <div class="p3-quick-box">
              <div class="p3-quick-icon q2">${ICONS.check}</div>
              <div class="p3-quick-data">
                <b>${z.correct.length||0}</b>
                <small>Correct</small>
              </div>
            </div>
            <div class="p3-quick-box">
              <div class="p3-quick-icon q3">${ICONS.x}</div>
              <div class="p3-quick-data">
                <b>${z.wrong.length||0}</b>
                <small>Wrong</small>
              </div>
            </div>
            <div class="p3-quick-box">
              <div class="p3-quick-icon q4">${ICONS.target}</div>
              <div class="p3-quick-data">
                <b>${z.accuracy||0}%</b>
                <small>Accuracy</small>
              </div>
            </div>
          </div>
        </section>
      </div>

      <div class="p3-bottom-row-v3">
        <div class="p3-card-v3 p3-bottom-card">
          <div class="p3-bottom-icon-row">
            <div class="p3-bottom-icon b1">${ICONS.lightbulb}</div>
            <div class="p3-bottom-arrow">${ICONS.arrow}</div>
          </div>
          <div class="p3-bottom-label">Today's Focus</div>
          <div class="p3-bottom-value">${esc3(d.weakTopics[0]?.name||'Revision')}</div>
          <div class="p3-bottom-sub">Revision & Practice</div>
        </div>
        <div class="p3-card-v3 p3-bottom-card">
          <div class="p3-bottom-icon-row">
            <div class="p3-bottom-icon b2">${ICONS.clock}</div>
            <div class="p3-bottom-arrow">${ICONS.arrow}</div>
          </div>
          <div class="p3-bottom-label">Study Time</div>
          <div class="p3-bottom-value">${fmtTime(study)}</div>
          <div class="p3-bottom-sub">Keep it up!</div>
        </div>
        <div class="p3-card-v3 p3-bottom-card">
          <div class="p3-bottom-icon-row">
            <div class="p3-bottom-icon b3">${ICONS.trophy}</div>
            <div class="p3-bottom-arrow">${ICONS.arrow}</div>
          </div>
          <div class="p3-bottom-label">Motivation</div>
          <div class="p3-bottom-value">আজকের ছোট প্রচেষ্টা, আগামীর বড় সাফল্য। 💚</div>
        </div>
      </div>

      <section class="p3-special-section-v3">
        <div class="p3-section-head-v3">
          <b>Special Study Tools</b>
          <span class="p3-dashboard-only-v3">Dashboard only</span>
        </div>
        <div class="p3-special-grid-v3">
          ${specialTools.map(([icon, title, subtitle, route]) => `
            <button class="p3-special-card-v3" onclick="navigate('${route}')">
              <span class="p3-special-icon-v3">${icon}</span>
              <div class="p3-special-info-v3">
                <strong>${title}</strong>
                <small>${subtitle}</small>
              </div>
              <span class="p3-special-arrow-v3">${ICONS.arrow}</span>
            </button>
          `).join('')}
        </div>
      </section>

      ${unfinished ? `
        <section class="p3-card-v3 p3-resume-card-v3">
          <div class="p3-resume-info-v3">
            <strong>${unfinished.mode === 'mock' ? '📝 Mock Exam' : '⚡ Flash Practice'}</strong>
            <p>${unfinished.currentIndex + 1} / ${unfinished.questions.length} Questions</p>
          </div>
          <button class="p3-resume-btn-v3" onclick="navigate('exam/running')">Continue</button>
        </section>
      ` : `
        <section class="p3-card-v3 p3-start-card-v3">
          <div class="p3-start-info-v3">
            <strong>আজকের প্রস্তুতি শুরু করুন</strong>
            <p>আপনার admission journey-তে আরেকটি focused session যোগ করুন।</p>
          </div>
          <button class="p3-resume-btn-v3" onclick="navigate('exam/setup')">Start Practice</button>
        </section>
      `}

      <section class="p3-card-v3 p3-focus-section-v3">
        <div class="p3-section-head-v3">
          <b>Today's Smart Focus</b>
          <span class="p3-focus-count-v3">${stats.totalQuestions} questions</span>
        </div>
        <div class="p3-focus-list-v3">
          ${focusMarkup}
          <button class="p3-btn-v3 p3-btn-secondary-v3" onclick="navigate('mistakes')">Start Smart Revision</button>
        </div>
      </section>
    </section>`;
  }

  function injectDashboard(){
    if(Router.path!=='dashboard')return;
    const page=document.querySelector('#app .page');
    if(!page||page.querySelector('[data-p3-command]'))return;
    page.innerHTML = widgetHTML();
  }
  let analyticsRange=7;window.phase3SetAnalyticsRange=function(n){analyticsRange=Number(n)||7;render()};function analyticsHTML(){const d=derive(),z=d.z,bySubject=d.bySubject,byTopic=d.byTopic;const daily=Array.from({length:analyticsRange},(_,i)=>{const dt=new Date();dt.setDate(dt.getDate()-(analyticsRange-1-i));const k=keyOf(dt);const s=z.s.filter(x=>keyOf(x.examDate)===k);return {name:k.slice(5),accuracy:pct(s.filter(x=>x.status==='correct').length,s.filter(x=>x.status!=='skipped').length),answered:s.filter(x=>x.status!=='skipped').length}});const weekly=(CACHE.dailyStats||[]).slice(-7).reduce((a,x)=>a+Number(x.timeMs||0),0);const monthly=(CACHE.dailyStats||[]).slice(-30).reduce((a,x)=>a+Number(x.timeMs||0),0);const best=z.scores.length?Math.max(...z.scores):0,low=z.scores.length?Math.min(...z.scores):0;return `<div class="explorer-head"><div class="explorer-kicker">Stored Learning Intelligence</div><div class="explorer-title">Advanced Analytics</div><div class="explorer-subtitle">শুধু তোমার IndexedDB ও localStorage-এর বাস্তব record থেকে গণনা করা হয়েছে।</div></div><div class="p3-analytics-tabs"><button class="chip ${analyticsRange===7?'active':''}" onclick="phase3SetAnalyticsRange(7)">Last 7 days</button><button class="chip ${analyticsRange===30?'active':''}" onclick="phase3SetAnalyticsRange(30)">Last 30 days</button><button class="chip ${analyticsRange===90?'active':''}" onclick="phase3SetAnalyticsRange(90)">Last 90 days</button></div><div class="phase5-grid three"><div class="phase5-kpi"><b>${z.rs.length}</b><span>Mock tests</span></div><div class="phase5-kpi"><b>${z.accuracy}%</b><span>Average accuracy</span></div><div class="phase5-kpi"><b>${best||0}</b><span>Best score</span></div><div class="phase5-kpi"><b>${low||0}</b><span>Lowest score</span></div><div class="phase5-kpi"><b>${z.correct.length}</b><span>Correct</span></div><div class="phase5-kpi"><b>${z.wrong.length}</b><span>Wrong · ${z.skipped.length} skipped</span></div></div><div class="p3-analytics-grid"><section class="card"><div class="p3-section-head"><b>Accuracy trend</b><span>${z.s.length?'Last 7 stored days':'Zero state'}</span></div>${bars(daily,'accuracy')}</section><section class="card"><div class="p3-section-head"><b>Time analysis</b><span>${fmtTime(weekly)} / ${fmtTime(monthly)}</span></div><div class="p3-time-cards"><span><b>${fmtTime(weekly)}</b>Last 7 days</span><span><b>${fmtTime(monthly)}</b>Last 30 days</span><span><b>${z.days.size}</b>Active days</span><span><b>${z.rs.length?Math.round(z.rs.reduce((a,r)=>a+Number(r.duration||0),0)/z.rs.length/60000):0} min</b>Avg session</span></div></section><section class="card"><div class="p3-section-head"><b>Subject performance</b><span>${bySubject.length} subjects</span></div>${bars(bySubject,'accuracy')}</section><section class="card"><div class="p3-section-head"><b>Topic performance & mistakes</b><span>${byTopic.length} topics</span></div>${bars(byTopic.slice(0,10),'accuracy')}${!byTopic.length?'<div class="p3-empty">Practice data জমা হলে topic insight দেখা যাবে।</div>':''}</section></div><div class="card"><div class="p3-section-head"><b>Recent performance</b><span>${z.recent.length} stored results</span></div>${z.recent.length?`<div class="p3-result-list">${z.recent.slice().reverse().map(r=>`<span><b>${r.score}</b><small>${r.date} · ${r.accuracy||0}% accuracy</small></span>`).join('')}</div>`:'<div class="p3-empty">কোনো mock result নেই। প্রথম real result submit হলে এখানে trend তৈরি হবে।</div>'}</div><button class="btn secondary" onclick="exportAnalytics()">Export analytics CSV</button>`}
  function notificationsHTML(){const ns=notifications(),unread=ns.filter(n=>!n.read).length,s=settings();return `<div class="explorer-head"><div class="explorer-kicker">Unified Inbox</div><div class="explorer-title">Notification Center</div><div class="explorer-subtitle">Study, revision, exam, result, streak, progress, achievement ও system alerts এক জায়গায়।</div></div><div class="p3-notify-toolbar"><span>${unread} unread · ${ns.length} history</span><button class="btn secondary sm" onclick="phase3MarkAllRead()">Mark all as read</button></div><section class="card p3-settings-card"><div class="p3-section-head"><b>Category settings</b><span>Persisted</span></div><div class="p3-category-grid">${CATEGORIES.map(c=>`<label><span>${c}</span><input type="checkbox" ${s[c]?'checked':''} onchange="phase3ToggleCategory('${c}',this.checked)"></label>`).join('')}</div></section>${ns.length?`<div class="p3-notification-list">${ns.map(n=>`<article class="card ${n.read?'':'is-unread'}"><div class="row between"><span class="pill ${n.category==='Revision'?'orange':n.category==='Achievement'?'green':''}">${esc3(n.category)}</span><small>${new Date(n.createdAt).toLocaleString()}</small></div><b>${esc3(n.title)}</b><p>${esc3(n.body)}</p><button class="linkbtn" onclick="phase3MarkRead('${n.id}')">${n.read?'Read':'Mark read'}</button></article>`).join('')}</div>`:'<div class="card p3-empty">এখনও কোনো notification তৈরি হয়নি। নতুন stored activity হলে এখানে history তৈরি হবে।</div>'}`}
  function motivationHTML(){const m=motivation();return `<section class="card p3-motivation"><div class="p3-kicker">আজকের অনুপ্রেরণা</div>${m.map(x=>`<div>${esc3(x)}</div>`).join('')}</section>`}
  function hookRender(){const old=window.render;if(window.__phase3RenderHook)return;window.__phase3RenderHook=true;window.render=function(){const p=Router.path;if(p==='analytics')return renderShell(analyticsHTML(),{title:'Analytics',back:"navigate('dashboard')"});if(p==='notifications')return renderShell(notificationsHTML(),{title:'Notifications',back:"navigate('dashboard')"});const r=old.apply(this,arguments);setTimeout(()=>{if(p==='dashboard')injectDashboard();if(p==='progress'){const page=document.querySelector('#app .page');if(page&&!page.querySelector('[data-p3-progress]'))page.insertAdjacentHTML('afterbegin',motivationHTML()+`<section class="card" data-p3-progress><div class="p3-section-head"><b>Learning intelligence</b><button class="btn secondary sm" onclick="navigate('analytics')">Open analytics</button></div><p>${esc3(derive().recommendation)}</p></section>`) }},0);return r};}
  window.startPhase3Topic=function(id){const pool=(CACHE.questions||[]).filter(q=>q.topicId===id);if(pool.length&&typeof beginExamFromPool==='function')return beginExamFromPool(pool.slice(0,20),'flash');toast('এই topic-এ practice question নেই');};
  window.phase3MarkRead=function(id){write(LS.notifications,notifications().map(n=>n.id===id?{...n,read:true}:n));render()};
  window.phase3MarkAllRead=function(){write(LS.notifications,notifications().map(n=>({...n,read:true})));render()};
  window.phase3ToggleCategory=function(c,v){const s=settings();s[c]=!!v;saveSettings(s);render()};
  window.phase3AddTask=function(){const title=prompt('আজকের task লিখুন');if(!title?.trim())return;saveTasks([...tasks(),{id:'t-'+Date.now(),title:title.trim(),completed:false,createdAt:Date.now()}]);render()};
  window.phase3CompleteTask=function(id){saveTasks(tasks().map(t=>t.id===id?{...t,completed:!t.completed,completedAt:Date.now()}:t));render()};
  function observeResult(){if(window.__phase3Observed)return;window.__phase3Observed=true;const old=window.navigate;window.navigate=function(path){const before=Router.path;const r=old.apply(this,arguments);if(before==='exam/result'||path==='exam/result')setTimeout(()=>{const d=derive(),z=d.z;if(z.rs.length){addNotification('Result','নতুন result সংরক্ষিত হয়েছে',`Score ${z.rs.at(-1).score||0}; accuracy ${z.rs.at(-1).accuracy||0}%`,'result-'+z.rs.at(-1).id);if(d.repeated[0])addNotification('Revision','Revision priority শনাক্ত হয়েছে',`${d.repeated[0].name}-এ repeated mistake বেশি।`,'revision-'+d.repeated[0].id+'-'+keyOf(Date.now()))}},200);return r};}
  function init(){hookRender();observeResult();try{const d=derive();if(d.z.s.length){if(d.z.todayAnswered>0)addNotification('Progress','আজকের progress update',`${d.z.todayAnswered}টি প্রশ্নের stored activity পাওয়া গেছে।`,'progress-'+keyOf(Date.now()));if(d.repeated[0])addNotification('Revision','Weak area ready for revision',`${d.repeated[0].name} আগে revise করা ভালো।`,'weak-'+d.repeated[0].id+'-'+keyOf(Date.now()))}}catch(e){console.warn('Phase 3 intelligence init failed',e)}}
  const style=document.createElement('style');style.textContent=`
    .p3-dashboard-v3{padding:10px 0;color:#1e293b}
    .p3-header-v3{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:20px;padding:0 5px}
    .p3-header-left{display:flex;gap:15px;align-items:center}
    .p3-crown-circle{width:45px;height:45px;background:#10b981;color:#fff;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(16,185,129,0.3)}
    .p3-header-text h2{margin:2px 0;font-size:22px;font-weight:800;color:#0f172a}
    .p3-header-text p{margin:0;font-size:12px;color:#64748b}
    .p3-kicker-v3{font-size:10px;font-weight:800;letter-spacing:0.1em;color:#10b981}
    .p3-header-right{display:flex;gap:8px;align-items:center}
    .p3-inbox-btn{background:#f1f5f9;border:0;padding:8px 15px;border-radius:20px;font-weight:700;font-size:13px;display:flex;align-items:center;gap:6px;position:relative;cursor:pointer}
    .p3-badge{position:absolute;top:-5px;right:-5px;background:#10b981;color:#fff;font-size:9px;width:16px;height:16px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-style:normal;border:2px solid #fff}
    .p3-live-badge{font-size:9px;font-weight:800;padding:5px 10px;border:1.5px solid #cbd5e1;border-radius:20px;color:#64748b}

    .p3-card-v3{background:#fff;border-radius:20px;padding:16px;box-shadow:0 4px 20px rgba(0,0,0,0.04);border:1px solid #f1f5f9;margin-bottom:12px}
    .p3-grid-v3{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    .p3-card-icon-row{display:flex;align-items:center;gap:10px;margin-bottom:12px}
    .p3-icon-box{width:36px;height:36px;border-radius:10px;display:flex;align-items:center;justify-content:center}
    .p3-icon-box.target{background:#ecfdf5;color:#10b981}
    .p3-icon-box.tasks{background:#fffbeb;color:#f59e0b}
    .p3-icon-box.accuracy{background:#eff6ff;color:#3b82f6}
    .p3-icon-box.streak{background:#f5f3ff;color:#8b5cf6}
    .p3-card-label{font-size:12px;font-weight:700;color:#64748b}
    .p3-card-value{font-size:24px;font-weight:800;color:#0f172a;margin:4px 0}
    .p3-card-sub{font-size:11px;color:#94a3b8}
    .p3-card-progress{height:6px;background:#f1f5f9;border-radius:10px;margin-top:12px;overflow:hidden}
    .p3-card-progress i{display:block;height:100%;border-radius:inherit}
    .p3-card-target .p3-card-progress i{background:#10b981}
    .p3-card-tasks .p3-card-progress i{background:#f59e0b}
    .p3-card-accuracy .p3-card-progress i{background:#3b82f6}
    .p3-card-streak .p3-card-progress i{background:#8b5cf6}

    .p3-recommend-v3{display:flex;gap:20px;position:relative;overflow:hidden}
    .p3-recommend-content{flex:1}
    .p3-recommend-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .p3-recommend-title{display:flex;align-items:center;gap:8px;font-weight:800;color:#10b981;font-size:15px}
    .p3-star-icon{color:#10b981}
    .p3-open-btn{background:#f8fafc;border:1px solid #e2e8f0;padding:6px 12px;border-radius:10px;font-size:12px;font-weight:700;display:flex;align-items:center;gap:5px;cursor:pointer}
    .p3-recommend-text{font-size:14px;line-height:1.5;margin-bottom:15px;color:#334155;font-weight:500}
    .p3-recommend-list{display:grid;gap:8px}
    .p3-rec-item{display:flex;align-items:center;gap:10px;font-size:12px;color:#64748b}
    .p3-rec-icon{width:24px;height:24px;border-radius:6px;display:flex;align-items:center;justify-content:center}
    .p3-rec-icon.target{background:#ecfdf5;color:#10b981}
    .p3-rec-icon.book{background:#fff7ed;color:#ea580c}
    .p3-rec-icon.trend{background:#f0fdf4;color:#22c55e}
    .p3-recommend-illustration{width:100px;display:flex;align-items:center;justify-content:center}
    .p3-3d-placeholder{position:relative;width:80px;height:80px}
    .p3-3d-clipboard{width:60px;height:70px;background:#e2e8f0;border-radius:5px;position:relative;box-shadow:4px 4px 0 #cbd5e1}
    .p3-3d-lines{position:absolute;top:20px;left:10px;right:10px;height:2px;background:#cbd5e1;box-shadow:0 8px 0 #cbd5e1, 0 16px 0 #cbd5e1, 0 24px 0 #cbd5e1}
    .p3-3d-books{position:absolute;bottom:-10px;right:-20px}
    .p3-book-1{width:40px;height:8px;background:#ef4444;border-radius:2px;margin-bottom:2px}
    .p3-book-2{width:40px;height:8px;background:#3b82f6;border-radius:2px;margin-bottom:2px}
    .p3-book-3{width:40px;height:8px;background:#10b981;border-radius:2px}

    .p3-section-head-v3{display:flex;justify-content:space-between;align-items:center;margin-bottom:12px}
    .p3-section-head-v3 b{font-size:15px;font-weight:800;color:#0f172a;display:flex;align-items:center;gap:8px}
    .p3-swipe-hint-v3{font-size:11px;color:#94a3b8;font-weight:500}
    .p3-add-task-btn{color:#10b981;background:none;border:0;font-weight:800;font-size:13px;cursor:pointer}

    .p3-command-section-v3{padding:16px 0}
    .p3-command-section-v3 .p3-section-head-v3{padding:0 16px}
    .p3-command-card-v3{background:#fff;border:1px solid #f1f5f9;border-radius:15px;padding:12px;display:flex;flex-direction:column;align-items:flex-start;gap:5px;box-shadow:0 2px 10px rgba(0,0,0,0.02);cursor:pointer;text-align:left;transition:transform 0.1s ease}
    .p3-command-card-v3:active{transform:scale(0.96)}
    .p3-command-icon-v3{font-size:24px;margin-bottom:4px}
    .p3-command-title-v3{font-weight:800;font-size:13px;color:#0f172a}
    .p3-command-subtitle-v3{font-size:10px;color:#64748b}

    .p3-special-section-v3{margin-top:20px}
    .p3-special-grid-v3{display:grid;gap:10px}
    .p3-special-card-v3{background:#fff;border:1px solid #f1f5f9;border-radius:18px;padding:14px 16px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:15px;box-shadow:0 4px 15px rgba(0,0,0,0.03);cursor:pointer;text-align:left;transition:transform 0.1s ease}
    .p3-special-card-v3:active{transform:scale(0.98)}
    .p3-special-icon-v3{font-size:28px}
    .p3-special-info-v3 strong{display:block;font-size:15px;color:#0f172a;font-weight:800}
    .p3-special-info-v3 small{display:block;font-size:12px;color:#64748b;margin-top:2px}
    .p3-special-arrow-v3{color:#10b981}
    .p3-dashboard-only-v3{font-size:11px;color:#94a3b8}

    .p3-resume-card-v3, .p3-start-card-v3{display:flex;align-items:center;justify-content:space-between;gap:12px;background:#fffaf1;border:1px solid rgba(201,138,44,0.2)}
    .p3-resume-info-v3 strong, .p3-start-info-v3 strong{display:block;font-size:15px;color:#0f172a}
    .p3-resume-info-v3 p, .p3-start-info-v3 p{margin:4px 0 0;font-size:12px;color:#64748b}
    .p3-resume-btn-v3{background:#10b981;color:#fff;border:0;padding:8px 16px;border-radius:10px;font-weight:700;font-size:13px;cursor:pointer}

    .p3-focus-section-v3{margin-top:20px}
    .p3-focus-count-v3{font-size:11px;color:#94a3b8}
    .p3-focus-list-v3{margin-top:10px}
    .p3-focus-row-v3{display:flex;align-items:center;justify-content:space-between;padding:12px 0;border-bottom:1px solid #f1f5f9}
    .p3-focus-row-v3:last-of-type{border-bottom:0}
    .p3-focus-info-v3 strong{display:block;font-size:14px;color:#0f172a}
    .p3-focus-info-v3 small{display:block;font-size:12px;color:#64748b;margin-top:2px}
    .p3-focus-tag-v3{font-size:10px;font-weight:800;text-transform:uppercase;padding:4px 8px;border-radius:6px;font-style:normal}
    .p3-focus-tag-v3.revision{background:#fee2e2;color:#ef4444}
    .p3-focus-tag-v3.improving{background:#fef3c7;color:#d97706}
    .p3-focus-tag-v3.strong{background:#dcfce7;color:#16a34a}
    .p3-btn-v3{width:100%;padding:12px;border-radius:12px;font-weight:700;font-size:14px;cursor:pointer;border:0;margin-top:15px}
    .p3-btn-secondary-v3{background:#f1f5f9;color:#0f172a}
    .p3-muted-v3{font-size:13px;color:#94a3b8;text-align:center;padding:20px 0}
    .p3-task-list-v3{display:grid;gap:8px}
    .p3-task-item-v3{display:flex;gap:10px;align-items:center;padding:10px;background:#f8fafc;border-radius:12px;font-size:13px}
    .p3-task-item-v3 input{accent-color:#10b981}
    .p3-task-item-v3 .done{text-decoration:line-through;color:#94a3b8}
    .p3-empty-tasks{padding:10px;text-align:center;color:#94a3b8;font-size:12px}

    .p3-two-col-v3{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px}
    .p3-progress-body-v3{display:flex;align-items:center;gap:15px}
    .p3-circle-container{width:70px;height:70px}
    .p3-circular-chart{display:block;margin:0 auto;max-width:100%;max-height:100%}
    .p3-circle-bg{fill:none;stroke:#f1f5f9;stroke-width:3.8}
    .p3-circle{fill:none;stroke:#10b981;stroke-width:2.8;stroke-linecap:round;transition:stroke-dasharray 0.3s ease}
    .p3-percentage{fill:#0f172a;font-size:8px;font-weight:800;text-anchor:middle}
    .p3-progress-stats-v3{flex:1;display:grid;gap:10px}
    .p3-prog-stat{display:flex;align-items:center;gap:10px}
    .p3-prog-icon-box{width:28px;height:28px;background:#f8fafc;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#64748b}
    .p3-prog-stat small{display:block;font-size:10px;color:#94a3b8}
    .p3-prog-stat b{font-size:13px;color:#1e293b}
    .p3-trend-text{color:#10b981 !important}

    .p3-more-btn{background:none;border:0;color:#94a3b8;font-size:18px;cursor:pointer}
    .p3-quick-grid-v3{display:grid;grid-template-columns:1fr 1fr;gap:10px}
    .p3-quick-box{background:#f8fafc;padding:12px;border-radius:15px;display:flex;flex-direction:column;gap:8px}
    .p3-quick-icon{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#fff}
    .p3-quick-icon.q1{background:#3b82f6}
    .p3-quick-icon.q2{background:#10b981}
    .p3-quick-icon.q3{background:#ef4444}
    .p3-quick-icon.q4{background:#f59e0b}
    .p3-quick-data b{font-size:18px;display:block;color:#0f172a}
    .p3-quick-data small{font-size:9px;color:#64748b;font-weight:700;text-transform:uppercase}

    .p3-bottom-row-v3{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
    .p3-bottom-card{padding:12px;display:flex;flex-direction:column;gap:5px}
    .p3-bottom-icon-row{display:flex;justify-content:space-between;align-items:center;margin-bottom:5px}
    .p3-bottom-icon{width:32px;height:32px;border-radius:10px;display:flex;align-items:center;justify-content:center}
    .p3-bottom-icon.b1{background:#fef9c3;color:#ca8a04}
    .p3-bottom-icon.b2{background:#f5f3ff;color:#8b5cf6}
    .p3-bottom-icon.b3{background:#ecfdf5;color:#10b981}
    .p3-bottom-arrow{color:#cbd5e1}
    .p3-bottom-label{font-size:10px;font-weight:800;color:#94a3b8;text-transform:uppercase}
    .p3-bottom-value{font-size:13px;font-weight:800;color:#1e293b}
    .p3-bottom-sub{font-size:10px;color:#94a3b8}

    @media(max-width:620px){
      .p3-grid-v3, .p3-two-col-v3, .p3-bottom-row-v3{grid-template-columns:1fr 1fr}
      .p3-bottom-row-v3{grid-template-columns:1fr}
      .p3-recommend-illustration{display:none}
    }
    @media(max-width:380px){
      .p3-grid-v3{grid-template-columns:1fr}
    }
  `;
  document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else setTimeout(init,0);
})();
/* ================= END PHASE 3 ================= */

(function(){
  const oldRenderAnalytics=window.exportAnalytics;
  if(typeof oldRenderAnalytics==='function') window.exportAnalytics=oldRenderAnalytics;
})();
