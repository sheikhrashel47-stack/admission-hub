(() => {
  'use strict';

  const bengaliDate = () => {
    try {
      return new Intl.DateTimeFormat('bn-BD', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      }).format(new Date());
    } catch (_) {
      return new Date().toLocaleDateString('bn-BD');
    }
  };

  const safeTodayStats = () => {
    const row = (CACHE.dailyStats || []).find((item) => item.id === todayKey());
    return row || { questions: 0, correct: 0, wrong: 0, timeMs: 0 };
  };

  const dashboardTools = [
    ['📚', 'Bank', 'প্রশ্নভাণ্ডার', 'question-bank'],
    ['📝', 'Mock', 'মক টেস্ট', 'exam/setup'],
    ['⚡', 'Quick', 'দ্রুত অনুশীলন', 'exam/setup'],
    ['❌', 'Mistakes', 'ভুলের খাতা', 'mistakes'],
    ['📊', 'Progress', 'অগ্রগতি দেখুন', 'progress'],
    ['🎯', 'Goals', 'দৈনিক লক্ষ্য', 'progress/plan'],
    ['🔄', 'Revision', 'স্মার্ট রিভিশন', 'mistakes'],
    ['📖', 'Vocab', 'ভোকাবুলারি', 'vocabulary'],
    ['🕘', 'History', 'পরীক্ষার ইতিহাস', 'history'],
    ['🔍', 'Search', 'প্রশ্ন খুঁজুন', 'question-bank'],
    ['⚙️', 'Settings', 'অ্যাপ সেটিংস', 'settings'],
    ['⋯', 'More', 'আরও ফিচার', 'settings']
  ];

  const specialTools = [
    ['🧠', 'Daily GK', 'আজকের গুরুত্বপূর্ণ সাধারণ জ্ঞান', 'daily-gk'],
    ['🌐', 'Web Chat', 'দ্রুত তথ্য খুঁজুন', 'web-chat'],
    ['📖', 'Dictionary', 'শব্দের অর্থ ও Vocabulary', 'dictionary'],
    ['🧩', 'Memorizing', 'Smart memorization tools', 'memorizing']
  ];

  // The primary five-tab navigation is intentionally the only shared navigation.
  window.bottomNavHtml = function phase12BottomNav(active) {
    return `<nav class="bottomnav" aria-label="প্রধান নেভিগেশন">
      ${NAV_TABS.map((tab) => `<button class="navbtn ${active === tab.key ? 'active' : ''}" onclick="navigate('${tab.key}')" aria-label="${tab.label}">
        <span class="ic" aria-hidden="true">${tab.icon}</span><span>${tab.label}</span>
      </button>`).join('')}
    </nav>`;
  };

  window.renderDashboard = function phase12Dashboard() {
    const stats = computeLifetimeStats();
    const today = safeTodayStats();
    const target = CACHE.settings.dailyTarget || 100;
    const todayCount = todayActivityCount();
    const pct = Math.min(100, Math.round((todayCount / target) * 100));
    const studyTime = getStudyTimeToday();
    const unfinished = CACHE.exams.find((exam) => exam.status === 'running');
    const smartFocus = getSmartFocusTopics();
    const greeting = new Date().getHours() < 12 ? 'সুপ্রভাত' : new Date().getHours() < 18 ? 'শুভ অপরাহ্ণ' : 'শুভ সন্ধ্যা';

    const commandCards = dashboardTools.map(([icon, title, subtitle, route]) => `
      <button class="command-card" onclick="navigate('${route}')">
        <span class="command-icon" aria-hidden="true">${icon}</span>
        <span class="command-title">${title}</span>
        <span class="command-subtitle">${subtitle}</span>
      </button>`).join('');
    const commandPages = [0,1].map(page => dashboardTools.slice(page*6,page*6+6).map(([icon,title,subtitle,route]) => `
      <button class="command-card" onclick="navigate('${route}')">
        <span class="command-icon" aria-hidden="true">${icon}</span>
        <span class="command-title">${title}</span>
        <span class="command-subtitle">${subtitle}</span>
      </button>`).join(''));

    const specialCards = specialTools.map(([icon, title, subtitle, route]) => `
      <button class="special-tool-card" onclick="navigate('${route}')">
        <span class="special-tool-icon" aria-hidden="true">${icon}</span>
        <span><strong>${title}</strong><small>${subtitle}</small></span>
        <span class="tool-arrow" aria-hidden="true">↗</span>
      </button>`).join('');

    const focusMarkup = smartFocus.length
      ? smartFocus.map((item) => `<div class="focus-row"><span><strong>${esc(item.name)}</strong><small>${item.mCount} mistakes · ${round2(item.acc)}% accuracy</small></span><em class="focus-tag ${item.cls}">${item.label}</em></div>`).join('')
      : '<p class="muted">অনুশীলন শুরু করলে আপনার দুর্বল topic এখানে দেখা যাবে।</p>';

    const html = `<main class="dashboard-v2">
      <header class="dashboard-header">
        <div><div class="brand-kicker">EMERALD ACADEMIC</div><h1>${greeting}, Scholar</h1><p>${bengaliDate()}</p></div>
        <button class="settings-trigger" onclick="navigate('settings')" aria-label="Settings">⚙️<span>Settings</span></button>
      </header>

      <section class="command-hero" aria-labelledby="today-command-title">
        <div class="hero-topline"><span class="hero-kicker">TODAY COMMAND CENTER</span><button class="hero-settings" onclick="openTargetModal()" aria-label="দৈনিক লক্ষ্য পরিবর্তন">⚙️</button></div>
        <div class="hero-goal-row"><div><h2 id="today-command-title">${target} MCQ Goal</h2><strong>${todayCount} <small>/ ${target}</small></strong></div><b>${pct}%</b></div>
        <div class="hero-progress"><span style="width:${pct}%"></span></div><div class="teacher-avatar" aria-label="Academic mentor"><div class="avatar-hair"></div><div class="avatar-face"><i class="avatar-eye left"></i><i class="avatar-eye right"></i><span class="avatar-smile"></span></div><div class="avatar-body"><span></span></div></div>
        <div class="hero-stats">
          <span><strong>${today.correct || 0}</strong><small>Correct</small></span>
          <span><strong>${today.wrong || 0}</strong><small>Wrong</small></span>
          <span><strong>${today.correct + today.wrong ? Math.round((today.correct / (today.correct + today.wrong)) * 100) : 0}%</strong><small>Accuracy</small></span>
          <span><strong>${fmtTime(studyTime)}</strong><small>Study Time</small></span>
        </div>
      </section>

      <section class="dashboard-section"><div class="section-heading"><h2>Your Command Center</h2><span>Swipe to explore · 12 tools</span></div><div class="command-carousel" aria-label="Command Center tools"><div class="command-track" id="commandTrack">${commandPages.map((page,index)=>`<div class="command-slide" data-command-page="${index}">${page}</div>`).join('')}</div></div><div class="command-dots" role="tablist" aria-label="Command Center pages">${commandPages.map((_,index)=>`<button class="command-dot ${index===0?'active':''}" type="button" role="tab" aria-label="Page ${index+1}" aria-selected="${index===0?'true':'false'}" onclick="goCommandPage(${index})"></button>`).join('')}</div></section>
      <section class="dashboard-section"><div class="section-heading"><h2>Special Study Tools</h2><span>Dashboard only</span></div><div class="special-tools-grid">${specialCards}</div></section>

      ${unfinished ? `<section class="resume-card"><div><strong>${unfinished.mode === 'mock' ? '📝 Mock Exam' : '⚡ Flash Practice'}</strong><p>${unfinished.currentIndex + 1} / ${unfinished.questions.length} Questions</p></div><button class="btn sm" onclick="navigate('exam/running')">Continue</button></section>` : `<section class="start-card"><div><strong>আজকের প্রস্তুতি শুরু করুন</strong><p>আপনার admission journey-তে আরেকটি focused session যোগ করুন।</p></div><button class="btn sm" onclick="navigate('exam/setup')">Start Practice</button></section>`}

      <section class="dashboard-section"><div class="section-heading"><h2>Today's Smart Focus</h2><span>${stats.totalQuestions} questions</span></div><div class="focus-card">${focusMarkup}<button class="btn secondary" onclick="navigate('mistakes')">Start Smart Revision</button></div></section>
    </main>`;
    renderShell(html, { topbar: false });
  };
})();

/* Phase 1+2 visual system: restrained warm-white canvas, soft glass cards, readable Bengali type. */
const phase12Style = document.createElement('style');
phase12Style.textContent = `
  :root{--bg:#fbfaf7;--card:rgba(255,255,255,.88);--text:#17211c;--sub:#65716b;--line:rgba(24,55,42,.11);--mint:#e8f4ee;--emerald:#0f6b4f;--emerald-d:#0b4f3b;--radius:18px;--shadow:0 8px 24px rgba(23,58,43,.06)}
  html,body{font-family:'Noto Sans Bengali',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  body{background:var(--bg)} #app{max-width:600px;padding-bottom:calc(82px + var(--safe-b))}.page{padding:18px 16px 30px}.topbar{background:rgba(251,250,247,.84);border-bottom:1px solid var(--line);box-shadow:none}.card{background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:18px}.premium-card{background:var(--mint);color:var(--text);border:1px solid rgba(15,107,79,.12)}
  .dashboard-v2{padding-bottom:8px}.dashboard-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:8px 2px 24px}.brand-kicker,.hero-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:var(--emerald);text-transform:uppercase}.dashboard-header h1{font-size:30px;line-height:1.18;letter-spacing:-.04em;margin:7px 0 5px}.dashboard-header p{color:var(--sub);font-size:14px;margin:0}.settings-trigger{background:transparent;border:1px solid var(--line);border-radius:14px;color:var(--emerald-d);padding:10px 11px;font-size:18px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}.settings-trigger span{font-size:10px;font-weight:700}.command-hero{background:linear-gradient(145deg,#edf8f2,#e2f1e9);border:1px solid rgba(15,107,79,.14);border-radius:24px;padding:22px 20px;box-shadow:0 14px 32px rgba(15,107,79,.08)}.hero-topline,.hero-goal-row{display:flex;justify-content:space-between;align-items:center;gap:12px}.hero-settings{border:0;background:transparent;color:var(--emerald-d);font-size:18px;cursor:pointer}.command-hero h2{font-size:17px;margin:10px 0 5px}.hero-goal-row strong{font-size:38px;line-height:1;color:var(--emerald-d);letter-spacing:-.05em}.hero-goal-row strong small{font-size:16px;font-weight:600;color:var(--sub);letter-spacing:0}.hero-goal-row>b{font-size:20px;color:var(--emerald-d)}.hero-progress{height:10px;border-radius:999px;background:rgba(15,107,79,.13);overflow:hidden;margin:20px 0}.hero-progress span{display:block;height:100%;border-radius:inherit;background:var(--emerald);transition:width .25s ease}.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-top:1px solid rgba(15,107,79,.12);padding-top:16px}.hero-stats span{display:flex;flex-direction:column;gap:3px;min-width:0}.hero-stats strong{font-size:16px;color:var(--emerald-d);white-space:nowrap}.hero-stats small{font-size:11px;color:var(--sub)}.dashboard-section{margin-top:28px}.section-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}.section-heading h2{font-size:20px;letter-spacing:-.025em;margin:0}.section-heading span{font-size:11px;color:var(--sub)}  .command-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.command-carousel{overflow:hidden;border-radius:20px;touch-action:pan-y;position:relative}.command-track{display:flex;will-change:transform;transition:transform .28s cubic-bezier(.23,1,.32,1)}.command-slide{flex:0 0 100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}.command-dots{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:12px}.command-dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(15,107,79,.2);cursor:pointer;transition:transform .18s ease,background .18s ease}.command-dot.active{background:var(--emerald);transform:scale(1.35)}.command-card,.special-tool-card{font:inherit;text-align:left;cursor:pointer;border:1px solid var(--line);background:rgba(255,255,255,.74);border-radius:15px;padding:12px;min-height:96px;display:flex;flex-direction:column;align-items:flex-start;gap:5px;box-shadow:var(--shadow);transition:transform .16s ease,border-color .16s ease,background .16s ease}.command-card:active,.special-tool-card:active{transform:scale(.97)}.command-card:hover,.special-tool-card:hover{border-color:rgba(15,107,79,.3);background:#fff}.command-icon,.special-tool-icon{font-size:23px;line-height:1.1;margin-bottom:3px}.command-title{font-size:13px;font-weight:800;color:var(--text)}.command-subtitle{font-size:10px;color:var(--sub)}.teacher-avatar{position:absolute;right:18px;top:62px;width:64px;height:82px;animation:avatarBreath 3.2s ease-in-out infinite}.command-hero{position:relative}.avatar-face{position:absolute;left:12px;top:10px;width:40px;height:38px;border-radius:48% 48% 44% 44%;background:#f2c6a0;border:2px solid rgba(15,107,79,.18)}.avatar-hair{position:absolute;left:9px;top:4px;width:46px;height:22px;border-radius:55% 55% 35% 35%;background:#253a35;z-index:2}.avatar-eye{position:absolute;top:16px;width:4px;height:4px;background:#19352c;border-radius:50%;animation:avatarBlink 4.8s ease-in-out infinite}.avatar-eye.left{left:10px}.avatar-eye.right{right:10px}.avatar-smile{position:absolute;left:15px;top:25px;width:10px;height:5px;border-bottom:2px solid #9b4e4e;border-radius:0 0 12px 12px}.avatar-body{position:absolute;left:4px;bottom:0;width:56px;height:39px;border-radius:18px 18px 8px 8px;background:#0f6b4f}.avatar-body span{position:absolute;left:24px;top:0;width:8px;height:31px;background:#dceee5;clip-path:polygon(50% 0,100% 25%,68% 100%,32% 100%,0 25%)}@keyframes avatarBlink{0%,44%,48%,100%{transform:scaleY(1)}46%{transform:scaleY(.15)}}@keyframes avatarBreath{0%,100%{transform:translateY(0)}50%{transform:translateY(-2px)}}.special-tools-grid{display:grid;gap:10px}.special-tool-card{min-height:78px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:13px;padding:14px 16px}.special-tool-icon{font-size:28px;margin:0}.special-tool-card strong,.special-tool-card small{display:block}.special-tool-card strong{font-size:15px}.special-tool-card small{font-size:12px;color:var(--sub);margin-top:2px}.tool-arrow{font-size:20px;color:var(--emerald)}.resume-card,.start-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:28px;padding:16px 17px;border-radius:18px;border:1px solid rgba(201,138,44,.24);background:#fffaf1}.resume-card p,.start-card p{margin:5px 0 0;color:var(--sub);font-size:12px}.focus-card{background:rgba(255,255,255,.72);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow)}.focus-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}.focus-row:last-of-type{border-bottom:0}.focus-row strong,.focus-row small{display:block}.focus-row small{font-size:12px;color:var(--sub);margin-top:3px}.focus-card .btn{margin-top:14px}.bottomnav{background:rgba(255,255,255,.9);backdrop-filter:blur(16px);border-top:1px solid var(--line);box-shadow:0 -6px 22px rgba(23,58,43,.05);padding-top:6px}.navbtn{font-size:11px;padding:8px 0 9px;gap:4px}.navbtn .ic{font-size:23px}.navbtn.active{color:var(--emerald);font-weight:800}.btn{border-radius:12px;min-height:42px;box-shadow:none}.muted{font-size:13px}.h2{font-size:19px}
  @media(max-width:430px){.dashboard-header h1{font-size:26px}.command-hero{padding:19px 16px}.hero-goal-row strong{font-size:33px}.hero-stats{gap:7px}.hero-stats strong{font-size:14px}.hero-stats small{font-size:10px}.command-card{min-height:120px;padding:15px}.command-icon{font-size:27px}}
  @media(max-width:430px){.command-slide{gap:7px}.command-slide .command-card{min-height:88px;padding:9px}.command-slide .command-icon{font-size:20px}.command-slide .command-title{font-size:11px}.command-slide .command-subtitle{font-size:9px}.section-heading span{font-size:10px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
document.head.appendChild(phase12Style);

// Keep the existing router and every non-dashboard feature intact, while making Home deterministic.
const phase12PreviousRender = window.render;
window.render = function phase12RouteGuard() {
  if (Router.path === 'dashboard' || Router.path === 'home' || Router.path === '') return window.renderDashboard();
  return phase12PreviousRender();
};

const phase12PreviousShell = window.renderShell;
window.renderShell = function phase12Shell(inner, opts) {
  phase12PreviousShell(inner, opts);
  if (Router.path !== 'dashboard') return;
  const page = document.querySelector('#app .page');
  if (!page) return;
  page.querySelectorAll('[data-phase5-quicklinks],[data-phase5-dashboard],[data-phase34-dashboard],[data-dashboard-comparison]').forEach((node) => node.remove());
  Array.from(page.children).filter((node) => {
    const text = node.textContent || '';
    return text.includes('✦ XP Reward Shop') || text.includes('Today vs Yesterday') || text.includes('90-Day Admission Plan') || text.includes('Daily Admission Intelligence');
  }).forEach((node) => node.remove());
};

// Explicit global bindings are used because the legacy app is composed of classic scripts.
renderShell = function phase12ShellBinding(inner, opts) {
  phase12PreviousShell(inner, opts);
  if (Router.path !== 'dashboard') return;
  const page = document.querySelector('#app .page');
  if (!page) return;
  page.querySelectorAll('[data-phase5-quicklinks],[data-phase5-dashboard],[data-phase34-dashboard],[data-dashboard-comparison]').forEach((node) => node.remove());
  Array.from(page.children).filter((node) => {
    const text = node.textContent || '';
    return text.includes('✦ XP Reward Shop') || text.includes('Today vs Yesterday') || text.includes('90-Day Admission Plan') || text.includes('Daily Admission Intelligence');
  }).forEach((node) => node.remove());
};
render = function phase12RouteBinding() {
  if (Router.path === 'dashboard' || Router.path === 'home' || Router.path === '') return renderDashboard();
  return phase12PreviousRender();
};

const phase12CleanLegacy = () => {
  if (Router.path !== 'dashboard') return;
  const page = document.querySelector('#app .page');
  if (!page) return;
  page.querySelectorAll('[data-phase5-quicklinks],[data-phase5-dashboard],[data-phase34-dashboard],[data-dashboard-comparison]').forEach((node) => node.remove());
  Array.from(page.children).filter((node) => {
    const text = node.textContent || '';
    return text.includes('✦ XP Reward Shop') || text.includes('Today vs Yesterday') || text.includes('90-Day Admission Plan') || text.includes('Daily Admission Intelligence');
  }).forEach((node) => node.remove());
};
render = function phase12FinalRouteBinding() {
  if (Router.path === 'dashboard' || Router.path === 'home' || Router.path === '') {
    const result = renderDashboard();
    setTimeout(phase12CleanLegacy, 0);
    setTimeout(phase12CleanLegacy, 60);
    return result;
  }
  return phase12PreviousRender();
};
