(function(){
  'use strict';
  const THEME_KEY='admission_theme_v1';
  const themes={
    'emerald-glass':{label:'Emerald Glass',legacy:'light'},
    'midnight-academic':{label:'Midnight Academic',legacy:'midnight'},
    'ivory-academic':{label:'Ivory Academic',legacy:'focus'}
  };
  const aliases={light:'emerald-glass',dark:'midnight-academic',midnight:'midnight-academic',focus:'ivory-academic',pink:'ivory-academic'};
  const canonical=t=>themes[t]?t:(aliases[t]||'emerald-glass');
  const readTheme=()=>{try{return canonical(localStorage.getItem(THEME_KEY)||window.CACHE?.settings?.theme||'emerald-glass')}catch(_){return 'emerald-glass'}};
  function applyThemeClass(theme){
    const t=canonical(theme); document.documentElement.dataset.theme=t;
    document.documentElement.style.colorScheme=t==='midnight-academic'?'dark':'light';
    document.body?.setAttribute('data-theme',t);
    try{localStorage.setItem(THEME_KEY,t); if(window.CACHE?.settings) window.CACHE.settings.theme=t;}catch(_){ }
    return t;
  }
  window.applyTheme=()=>applyThemeClass(readTheme());
  window.setTheme=async function(theme){
    const t=applyThemeClass(theme);
    try{if(window.CACHE?.settings&&typeof window.dbPut==='function'){window.CACHE.settings.theme=t;await window.dbPut('settings',window.CACHE.settings)}}catch(_){ }
    if(typeof window.render==='function') window.render();
    if(typeof window.toast==='function') window.toast(themes[t].label+' applied');
  };
  const css=document.createElement('style');css.id='phase1-upgrade-styles';css.textContent=`
    :root{--glass-bg:rgba(255,255,255,.72);--glass-strong:rgba(255,255,255,.88);--glass-border:rgba(15,107,79,.16);--glass-shadow:0 14px 40px rgba(15,70,50,.10);--safe-b:env(safe-area-inset-bottom,0px);--safe-t:env(safe-area-inset-top,0px)}
    [data-theme="emerald-glass"]{--bg:#edf7f1;--card:#ffffff;--text:#10251d;--sub:#5d7569;--line:rgba(20,93,68,.16);--mint:#e3f3eb;--emerald:#0f6b4f;--emerald-d:#084b38;--green:#178454;--glass-bg:rgba(255,255,255,.68);--glass-strong:rgba(255,255,255,.90);--glass-border:rgba(15,107,79,.18);--glass-shadow:0 16px 42px rgba(17,77,55,.12)}
    [data-theme="midnight-academic"]{--bg:#081411;--card:#12221d;--text:#e9f7ef;--sub:#9ab8aa;--line:rgba(159,220,190,.18);--mint:#17342a;--emerald:#39c98a;--emerald-d:#8aefbb;--green:#62d69a;--glass-bg:rgba(18,39,32,.76);--glass-strong:rgba(19,47,38,.92);--glass-border:rgba(138,239,187,.18);--glass-shadow:0 16px 42px rgba(0,0,0,.28)}
    [data-theme="ivory-academic"]{--bg:#fbf8f0;--card:#fffdf8;--text:#25352d;--sub:#718078;--line:rgba(55,82,68,.15);--mint:#edf4ee;--emerald:#176c50;--emerald-d:#0b4f3b;--green:#29835d;--glass-bg:rgba(255,253,248,.82);--glass-strong:rgba(255,255,251,.95);--glass-border:rgba(23,108,80,.16);--glass-shadow:0 14px 36px rgba(81,74,45,.10)}
    html,body{background:var(--bg);color:var(--text)}body{padding-top:var(--safe-t);padding-bottom:var(--safe-b);transition:background-color .22s ease,color .22s ease}.page{max-width:760px}.card,.metric-card,.command-tile,.choice,.upgrade-card,.phase-card,.modal-card,.bottomnav,.topbar,.input-card{background:var(--glass-bg);border-color:var(--glass-border);box-shadow:var(--glass-shadow);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px)}input,textarea,select{background:var(--glass-strong)!important;color:var(--text)!important;border-color:var(--glass-border)!important}button,.chip,.btn{transition:transform .16s cubic-bezier(.23,1,.32,1),box-shadow .16s ease,background-color .16s ease}.btn,.chip.active{background:var(--emerald);border-color:var(--emerald);color:#fff}.btn:active,.chip:active,.command-tile:active{transform:scale(.97)}
    .phase1-theme-row{display:flex;gap:8px;flex-wrap:wrap;margin-top:9px}.phase1-theme-row .chip{flex:1 1 145px;min-height:42px;white-space:normal}.phase1-theme-row .chip.active{box-shadow:0 0 0 3px color-mix(in srgb,var(--emerald) 18%,transparent)}
    .command-carousel{position:relative;overflow:hidden;width:100%;touch-action:pan-y;overscroll-behavior-x:contain}.command-track{display:flex;width:200%;transition:transform .28s cubic-bezier(.23,1,.32,1);will-change:transform}.command-slide{width:50%;flex:0 0 50%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;padding:1px}.command-carousel .command-tile{min-width:0}.command-dots{display:flex;justify-content:center;gap:6px;margin:9px 0 1px}.command-dot{width:7px;height:7px;border:0;border-radius:50%;padding:0;background:var(--line);cursor:pointer}.command-dot.active{width:20px;border-radius:9px;background:var(--emerald)}
    .command-avatar-wrap{display:grid;place-items:center;min-height:132px;margin:4px 0 5px;position:relative;overflow:hidden;border-radius:22px;background:radial-gradient(circle at 50% 22%,color-mix(in srgb,var(--emerald) 14%,transparent),transparent 60%)}.command-avatar{width:108px;height:116px;filter:drop-shadow(0 10px 10px color-mix(in srgb,var(--emerald) 18%,transparent));animation:phase1Float 4.5s ease-in-out infinite}.command-avatar .avatar-hand{transform-origin:74px 61px;animation:phase1Wave 3.4s ease-in-out infinite}.command-avatar .avatar-book{animation:phase1Book 3.4s ease-in-out infinite}.avatar-caption{position:absolute;bottom:8px;font-size:10px;font-weight:800;letter-spacing:.04em;color:var(--emerald-d);opacity:.78}.avatar-state{display:none}.command-avatar-wrap[data-state="celebrate"] .command-avatar{animation:phase1Celebrate 1.6s ease-in-out infinite}.command-avatar-wrap[data-state="think"] .command-avatar .avatar-hand{animation:phase1Think 2.4s ease-in-out infinite}@keyframes phase1Float{50%{transform:translateY(-4px)}}@keyframes phase1Wave{0%,100%{transform:rotate(0)}40%{transform:rotate(-8deg)}60%{transform:rotate(5deg)}}@keyframes phase1Book{0%,100%{transform:translateY(0)}50%{transform:translateY(2px) rotate(-2deg)}}@keyframes phase1Celebrate{0%,100%{transform:translateY(0) rotate(0)}50%{transform:translateY(-6px) rotate(2deg)}}@keyframes phase1Think{0%,100%{transform:rotate(0)}50%{transform:rotate(18deg)}}@media(max-width:520px){.command-slide{grid-template-columns:repeat(3,minmax(0,1fr));gap:6px}.command-avatar-wrap{min-height:116px}.command-avatar{width:92px;height:100px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important;scroll-behavior:auto!important}}
  `;document.head.appendChild(css);
  applyThemeClass(readTheme());
  function themeControls(){
    const rows=[...document.querySelectorAll('.filter-row')];
    const row=rows.find(x=>[...x.querySelectorAll('[onclick]')].some(b=>String(b.getAttribute('onclick')).includes('setTheme')));
    if(!row||row.dataset.phase1Themes==='1')return;
    row.dataset.phase1Themes='1';row.classList.add('phase1-theme-row');const active=readTheme();
    row.innerHTML=Object.entries(themes).map(([id,v])=>`<button class="chip ${active===id?'active':''}" onclick="setTheme('${id}')"><span aria-hidden="true">${id==='emerald-glass'?'◈':id==='midnight-academic'?'◐':'◇'}</span> ${v.label}</button>`).join('');
  }
  function avatarMarkup(){return `<div class="command-avatar-wrap" data-state="encourage" aria-label="Animated study mentor"><svg class="command-avatar" viewBox="0 0 120 128" role="img" aria-hidden="true"><ellipse cx="60" cy="119" rx="34" ry="5" fill="currentColor" opacity=".12"/><path d="M30 112c2-22 11-36 30-36s28 14 30 36" fill="var(--emerald)" opacity=".95"/><path d="M42 82c5 6 31 6 36 0v28H42z" fill="var(--glass-strong)"/><circle cx="60" cy="43" r="23" fill="#d99a73"/><path d="M38 41c0-22 12-31 25-27 12 4 18 12 18 27-7-8-13-12-21-13-7 8-14 12-22 13z" fill="#24352e"/><circle cx="51" cy="46" r="2" fill="#24352e"/><circle cx="69" cy="46" r="2" fill="#24352e"/><path d="M54 57c4 3 8 3 12 0" fill="none" stroke="#7d4938" stroke-width="2" stroke-linecap="round"/><path class="avatar-hand" d="M79 79c10-8 15-18 12-29" fill="none" stroke="#d99a73" stroke-width="7" stroke-linecap="round"/><path d="M42 80c-8 1-14 8-18 16" fill="none" stroke="#d99a73" stroke-width="7" stroke-linecap="round"/><g class="avatar-book"><path d="M39 102c8-5 14-5 21 0v13c-7-4-13-4-21 0z" fill="#f3c66b"/><path d="M60 102c7-5 13-5 21 0v13c-8-4-14-4-21 0z" fill="#e7ae55"/><path d="M60 102v13" stroke="#a06b2e" stroke-width="1"/></g></svg><span class="avatar-caption">Study mentor · <span class="avatar-state">Ready to guide</span></span></div>`}
  const states=['Read with focus','Write the key idea','Let me explain','Look at this task','You are on track','Excellent progress','Think it through','Keep your schedule','Strong streak','Mission complete'];
  let avatarTimer=null;
  function setupAvatar(root){const wrap=root.querySelector('.command-avatar-wrap');if(!wrap||wrap.dataset.ready)return;wrap.dataset.ready='1';if(avatarTimer)clearInterval(avatarTimer);let i=0;const caption=wrap.querySelector('.avatar-state');const tick=()=>{if(!document.body.contains(wrap)){clearInterval(avatarTimer);avatarTimer=null;return}i=(i+1)%states.length;caption.textContent=states[i];wrap.dataset.state=i===6?'think':i===9?'celebrate':'encourage'};caption.textContent=states[0];avatarTimer=setInterval(tick,5200)}
  function setupCarousel(root){
    const old=root.querySelector('.command-grid');if(!old||old.dataset.phase1Ready)return;
    const tiles=[...old.querySelectorAll('.command-tile')];if(tiles.length!==12)return;old.dataset.phase1Ready='1';
    const carousel=document.createElement('div');carousel.className='command-carousel';carousel.id='commandCarousel';const track=document.createElement('div');track.className='command-track';track.id='commandTrack';
    [tiles.slice(0,6),tiles.slice(6)].forEach(group=>{const slide=document.createElement('div');slide.className='command-slide';group.forEach(t=>slide.appendChild(t));track.appendChild(slide)});carousel.appendChild(track);const dots=document.createElement('div');dots.className='command-dots';dots.innerHTML='<button class="command-dot active" aria-label="Show tools 1 to 6"></button><button class="command-dot" aria-label="Show tools 7 to 12"></button>';carousel.appendChild(dots);old.replaceWith(carousel);
    let page=0,startX=0,startY=0,drag=false;const go=i=>{page=Math.max(0,Math.min(1,i));track.style.transform=`translate3d(${-page*50}%,0,0)`;dots.querySelectorAll('.command-dot').forEach((d,n)=>d.classList.toggle('active',n===page))};dots.querySelectorAll('.command-dot').forEach((d,n)=>d.onclick=()=>go(n));carousel.addEventListener('pointerdown',e=>{drag=true;startX=e.clientX;startY=e.clientY;carousel.setPointerCapture?.(e.pointerId)});carousel.addEventListener('pointerup',e=>{if(!drag)return;drag=false;const dx=e.clientX-startX,dy=e.clientY-startY;if(Math.abs(dx)>42&&Math.abs(dx)>Math.abs(dy))go(page+(dx<0?1:-1))});carousel.addEventListener('pointercancel',()=>drag=false);
  }
  function patchDashboard(){
    const app=document.getElementById('app');if(!app)return;themeControls();
    const h=[...app.querySelectorAll('.h2')].find(x=>/command center/i.test(x.textContent||''));
    if(h&&!app.querySelector('.command-avatar-wrap')&&!app.querySelector('.teacher-avatar')){h.insertAdjacentHTML('afterend',avatarMarkup())}
    setupCarousel(app);setupAvatar(app);
  }
  const oldRender=window.render; if(typeof oldRender==='function'){window.render=function(){const r=oldRender.apply(this,arguments);setTimeout(patchDashboard,0);return r}}
  const app=document.getElementById('app');if(app)new MutationObserver(()=>setTimeout(patchDashboard,0)).observe(app,{childList:true,subtree:true});
  window.addEventListener('load',()=>setTimeout(patchDashboard,30));
})();

(function(){
  const splash=document.createElement('div');splash.id='phase1-splash';splash.innerHTML='<div class="phase1-splash-mark">✦</div><strong>Admission Hub</strong><span>Preparing your study space…</span>';document.documentElement.appendChild(splash);
  const s=document.createElement('style');s.textContent='#phase1-splash{position:fixed;inset:0;z-index:9999;display:grid;place-content:center;justify-items:center;gap:8px;background:var(--bg,#faf9f6);color:var(--text,#17221d);transition:opacity .24s ease,visibility .24s ease;padding:var(--safe-t) 24px var(--safe-b)}#phase1-splash.hide{opacity:0;visibility:hidden;pointer-events:none}.phase1-splash-mark{display:grid;place-items:center;width:58px;height:58px;border-radius:18px;background:var(--emerald,#0f6b4f);color:#fff;font-size:30px;box-shadow:0 12px 30px color-mix(in srgb,var(--emerald,#0f6b4f) 28%,transparent)}#phase1-splash span{font-size:12px;color:var(--sub,#627168)}';document.head.appendChild(s);
  const finish=()=>setTimeout(()=>splash.classList.add('hide'),Math.min(900,Math.max(260,performance.now()+1)));if(document.readyState==='complete')finish();else window.addEventListener('load',finish,{once:true});
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content',readTheme()==='midnight-academic'?'#081411':'#0f6b4f');
})();
