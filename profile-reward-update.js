(function(){
  'use strict';
  const n=v=>Number.isFinite(Number(v))?Number(v):0;
  const escP=v=>typeof esc==='function'?esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const settings=()=>CACHE.settings||{};
  const xpLevel=xp=>{let level=1,spent=0;while(xp>=level*500&&level<99){xp-=level*500;spent+=level*500;level++;}return {level,into:xp,next:level*500};};
  const rewardNames={
    'theme-emerald-dawn':'Emerald Dawn Theme','theme-midnight-focus':'Midnight Focus Theme','avatar-scholar':'Scholar Avatar','avatar-lamp':'Study Lamp Avatar','streak-shield':'Streak Shield','hint-token':'Hint Token','xp-saver':'XP Saver','xp-master':'XP Master'
  };
  function profileStats(){
    const s=typeof computeLifetimeStats==='function'?computeLifetimeStats():{attempted:0,correct:0,wrong:0,exams:0,accuracy:0};
    const streak=typeof computeStreak==='function'?computeStreak():0;
    const xp=n(settings().totalXpEarned), li=xpLevel(xp);
    const total=Math.max(1,CACHE.questions?.length||0);
    return {s,streak,xp,li,progress:Math.min(100,Math.round(s.attempted/total*100))};
  }
  function achievements(p){
    return [
      ['1000 Questions','📚',p.s.attempted>=1000,'Solve 1,000 questions'],
      ['30 Day Streak','🔥',p.streak>=30,'Maintain a 30-day activity streak'],
      ['90%+ Master','🏆',p.s.accuracy>=90,'Reach 90% lifetime accuracy'],
      ['50 Exams','🎓',p.s.exams>=50,'Complete 50 exams or tests']
    ];
  }
  function ownedRewards(){
    const s=settings();
    const blueprint=s.rewardBlueprint200||{};
    const inv=blueprint.inventory||{};
    const active=blueprint.active||{};
    const catalog=window.__admissionHubBlueprintRewards||[];
    const byId=Object.fromEntries(catalog.map(item=>[item.id,item]));
    return Object.entries(inv).filter(([,v])=>v&&v.ownedAt).map(([id,v])=>({id,name:byId[id]?.name||rewardNames[id]||id.replace(/[-_]/g,' '),active:!!active[id]?.active,remaining:v.remaining??'∞',expiry:v.expiresAt?new Date(v.expiresAt).toLocaleDateString():'No expiry'}));
  }
  function renderProfile(){
    const p=profileStats(), a=achievements(p), owned=ownedRewards();
    const perf=typeof subjectPerformance==='function'?subjectPerformance():[];
    const name=settings().userName||settings().name||'Scholar';
    const avatar=settings().avatar||'🧑‍🎓';
    const xpPct=Math.min(100,Math.round(p.li.into/p.li.next*100));
    const html=`<div class="profile-page-v3">
      <header class="profile-hero-v3"><button class="profile-back-v3" onclick="navigate('dashboard')">←</button><div class="profile-avatar-v3">${escP(avatar)}</div><h1>${escP(name)}</h1><p>Level ${p.li.level} Scholar · ${p.xp.toLocaleString()} Total XP</p><div class="profile-xp-v3"><div class="row between"><span>Level ${p.li.level} progress</span><b>${xpPct}%</b></div><div class="profile-bar-v3"><i style="width:${xpPct}%"></i></div><small>${p.li.into.toLocaleString()} / ${p.li.next.toLocaleString()} XP to next level</small></div></header>
      <section class="profile-stat-grid-v3"><div><b>🔥 ${p.streak}</b><span>Current Streak</span></div><div><b>🎓 ${p.s.exams}</b><span>Completed Exams</span></div><div><b>📈 ${p.progress}%</b><span>Overall Progress</span></div><div><b>✅ ${p.s.accuracy}%</b><span>Accuracy</span></div></section>
      <section class="profile-section-v3"><div class="profile-section-head-v3"><h2>🏆 Achievements</h2><span>${a.filter(x=>x[2]).length}/${a.length} unlocked</span></div><div class="profile-achievements-v3">${a.map(x=>`<article class="profile-achievement-v3 ${x[2]?'unlocked':'locked'}"><span>${x[1]}</span><div><b>${escP(x[0])}</b><small>${escP(x[3])}</small></div><em>${x[2]?'Unlocked':'Locked'}</em></article>`).join('')}</div></section>
      <section class="profile-section-v3"><div class="profile-section-head-v3"><h2>🎒 My Rewards</h2><button class="profile-link-v3" onclick="navigate('rewards')">Reward Shop →</button></div>${owned.length?`<div class="profile-rewards-v3">${owned.map(r=>`<div class="profile-reward-v3"><div><span>${escP(r.name)}</span><small>${r.active?'Active':'Owned'} · Remaining ${escP(r.remaining)} · ${escP(r.expiry)}</small></div><button type="button" onclick="navigate('rewards');setTimeout(()=>window.rewardShopTutorial?.('${r.id}'),280)">Tutorial</button></div>`).join('')}</div>`:'<div class="profile-empty-v3">No purchased rewards yet. Visit Reward Shop to unlock usable themes, boosters, streak protection, and hint tokens.</div>'}</section>
      <section class="profile-section-v3"><div class="profile-section-head-v3"><h2>📊 Statistics</h2><button class="profile-link-v3" onclick="navigate('progress')">Progress →</button></div><div class="profile-statistics-v3">${perf.length?perf.map(x=>`<div><div class="row between"><b>${escP(x.icon||'📘')} ${escP(x.name)}</b><span>${x.acc}%</span></div><div class="profile-bar-v3"><i style="width:${Math.max(0,Math.min(100,x.acc))}%"></i></div><small>${x.correct} correct · ${x.wrong} wrong</small></div>`).join(''):'<div class="profile-empty-v3">Complete a test to unlock subject-wise performance.</div>'}</div></section>
      <section class="profile-section-v3"><div class="profile-section-head-v3"><h2>⚙️ Settings</h2></div><div class="profile-actions-v3"><button onclick="navigate('settings')">Theme & Preferences</button><button onclick="navigate('settings')">Sound & Notifications</button><button onclick="navigate('settings')">Data & Account</button></div></section>
    </div>`;
    renderShell(html,{topbar:false});
  }
  function applyDashboardProfileEntry(){
    if(Router.path!=='dashboard')return;
    const page=document.querySelector('#app .page');
    if(page&&!page.querySelector('[data-profile-entry]')){
      const section=document.createElement('section'); section.dataset.profileEntry='1'; section.className='profile-entry-v3'; section.innerHTML='<button onclick="navigate(\'profile\')">👤 <b>Open Profile</b><small>Level, XP, streak, achievements and rewards</small></button>'; page.appendChild(section);
    }
  }
  function hintInventory(){return settings().rewardInventory?.['hint-token']||null;}
  window.useExamHint=async function(qid){
    const inv=hintInventory(); const e=typeof ActiveExam!=='undefined'?ActiveExam:null;
    if(!e||!inv?.ownedAt||Number(inv.remaining??0)<=0){toast?.('No Hint Token available. Unlock one in Reward Shop.');return;}
    e.hintsUsed=e.hintsUsed||{}; if(e.hintsUsed[qid])return;
    e.hintsUsed[qid]=true; inv.remaining=Math.max(0,Number(inv.remaining??1)-1);
    const s=settings(); s.rewardInventory={...(s.rewardInventory||{}),'hint-token':inv}; CACHE.settings=s; await dbPut('settings',s); await dbPut('exams',e); render();
  };
  function injectHints(){
    const e=typeof ActiveExam!=='undefined'?ActiveExam:null; if(!e||Router.path!=='exam/running')return;
    e.questions.forEach(q=>{const row=document.querySelector('#q-row-'+q.id)||document.querySelector('.flash-q-card'); if(!row||row.querySelector('[data-hint-button]'))return; const wrap=document.createElement('div');wrap.className='exam-hint-wrap-v3';wrap.innerHTML=e.hintsUsed?.[q.id]?'<span class="exam-hint-used-v3">💡 Hint used: one option has been ruled out.</span>':'<button data-hint-button class="btn ghost sm" type="button">💡 Use Hint</button>'; if(!e.hintsUsed?.[q.id])wrap.querySelector('button').onclick=()=>useExamHint(q.id);row.appendChild(wrap);});
  }
  const oldRender=window.render;
  window.render=function(){if(Router.path==='profile'&&typeof window.__admissionIntegratedProfileRender==='function')return window.__admissionIntegratedProfileRender();if(Router.path==='profile')return renderProfile();const result=oldRender.apply(this,arguments);setTimeout(()=>{applyDashboardProfileEntry();injectHints();},0);return result;};
  window.__admissionProfileV3=renderProfile;
  const style=document.createElement('style');style.textContent=`.profile-page-v3{max-width:760px;margin:auto;padding:18px 16px 110px}.profile-hero-v3{background:linear-gradient(135deg,#0d6b50,#084331);color:#fff;border-radius:26px;padding:22px 18px;text-align:center;box-shadow:0 16px 32px rgba(8,67,49,.2)}.profile-back-v3{float:left;border:0;background:transparent;color:#fff;font-size:24px;cursor:pointer}.profile-avatar-v3{width:70px;height:70px;border-radius:50%;display:grid;place-items:center;background:rgba(255,255,255,.18);font-size:38px;margin:5px auto 10px}.profile-hero-v3 h1{margin:0;font-size:25px}.profile-hero-v3 p{opacity:.82;margin:5px 0 16px}.profile-xp-v3{text-align:left;background:rgba(255,255,255,.12);border-radius:15px;padding:12px}.profile-xp-v3 span,.profile-xp-v3 small{font-size:11px;opacity:.82}.profile-bar-v3{height:8px;background:var(--line);border-radius:99px;overflow:hidden;margin:7px 0}.profile-bar-v3 i{display:block;height:100%;background:linear-gradient(90deg,#45d29b,#c8f7df);border-radius:99px}.profile-stat-grid-v3{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin:14px 0}.profile-stat-grid-v3>div{background:var(--card);border:1px solid var(--line);border-radius:16px;padding:12px 7px;text-align:center;box-shadow:var(--shadow)}.profile-stat-grid-v3 b{display:block;font-size:17px;color:var(--emerald-d)}.profile-stat-grid-v3 span{display:block;color:var(--sub);font-size:10px;margin-top:4px}.profile-section-v3{background:var(--card);border:1px solid var(--line);border-radius:18px;padding:15px;margin:12px 0;box-shadow:var(--shadow)}.profile-section-head-v3{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:12px}.profile-section-head-v3 h2{font-size:17px;margin:0}.profile-section-head-v3 span,.profile-link-v3{font-size:11px;color:var(--sub)}.profile-link-v3{border:0;background:none;color:var(--emerald-d);font-weight:800;cursor:pointer}.profile-achievements-v3,.profile-rewards-v3,.profile-statistics-v3{display:grid;gap:9px}.profile-achievement-v3,.profile-reward-v3{display:flex;align-items:center;gap:10px;padding:10px;border-radius:12px;background:var(--mint)}.profile-achievement-v3.locked{opacity:.55}.profile-achievement-v3>span{font-size:24px}.profile-achievement-v3 div{flex:1;min-width:0}.profile-achievement-v3 b,.profile-achievement-v3 small,.profile-reward-v3 span,.profile-reward-v3 small{display:block}.profile-reward-v3>div{flex:1;min-width:0}.profile-reward-v3 button{border:0;border-radius:9px;padding:7px 9px;background:var(--card);color:var(--emerald-d);font-size:10px;font-weight:800;cursor:pointer}.profile-achievement-v3 small,.profile-reward-v3 small,.profile-achievement-v3 em{font-size:10px;color:var(--sub);font-style:normal}.profile-achievement-v3 em{margin-left:auto}.profile-statistics-v3>div{padding:8px 0;border-bottom:1px solid var(--line)}.profile-statistics-v3>div:last-child{border-bottom:0}.profile-statistics-v3 small{color:var(--sub);font-size:10px}.profile-actions-v3{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.profile-actions-v3 button,.profile-entry-v3 button{border:1px solid var(--line);background:var(--mint);border-radius:12px;padding:11px;color:var(--text);cursor:pointer}.profile-entry-v3{margin:12px 0}.profile-entry-v3 button{width:100%;text-align:left}.profile-entry-v3 b,.profile-entry-v3 small{display:block}.profile-entry-v3 small{font-size:11px;color:var(--sub);margin-top:3px}.profile-empty-v3{color:var(--sub);font-size:12px;line-height:1.6}.exam-hint-wrap-v3{margin-top:12px}.exam-hint-used-v3{display:block;background:#fff8e8;color:#8a6100;border-radius:10px;padding:9px;font-size:11px}@media(max-width:520px){.profile-stat-grid-v3{grid-template-columns:repeat(2,1fr)}.profile-actions-v3{grid-template-columns:1fr}.profile-achievement-v3 em{font-size:9px}}`;
  document.head.appendChild(style);
})();

