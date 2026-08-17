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

  const metricNumber = (value) => {
    if (Array.isArray(value)) return value.length;
    if (value && typeof value === 'object') {
      for (const key of ['count', 'value', 'total', 'amount', 'timeMs', 'minutes']) {
        const n = Number(value[key]);
        if (Number.isFinite(n)) return n;
      }
      return 0;
    }
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const safeTodayStats = () => {
    const row = (CACHE.dailyStats || []).find((item) => item.id === todayKey()) || {};
    return {
      questions: metricNumber(row.questions),
      correct: metricNumber(row.correct),
      wrong: metricNumber(row.wrong),
      timeMs: metricNumber(row.timeMs)
    };
  };

  const dashboardTools = [
    ['📚', 'Bank', 'প্রশ্নভাণ্ডার', 'question-bank'],
    ['📋', 'Mock', 'মক টেস্ট', 'exam/setup'],
    ['⚡', 'Quick', 'দ্রুত অনুশীলন', 'exam/setup'],
    ['❌', 'Mistakes', 'ভুলের খাতা', 'mistakes'],
    ['📊', 'Progress', 'অগ্রগতি দেখুন', 'progress'],
    ['📅', '90 Days', '৯০ দিনের রুটিন', 'progress/plan'],
    ['🔄', 'Revision', 'স্মার্ট রিভিশন', 'mistakes'],
    ['📖', 'Vocab', 'ভোকাবুলারি', 'vocabulary'],
    ['🕐', 'History', 'পরীক্ষার ইতিহাস', 'history'],
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
    const focus = smartFocus[0] || null;
    const focusQuestion = focus ? CACHE.questions.find((q) => q.topicId === focus.topicId) : null;
    const fallbackTopic = focusQuestion ? topicName(focusQuestion.topicId) : 'Vocabulary (1-100)';
    const focusName = focus?.name || fallbackTopic;
    const mistakeCount = CACHE.mistakes.length;
    const inboxCount = Math.max(0, mistakeCount + (unfinished ? 1 : 0));
    const focusDescription = focus
      ? `${focus.mCount || 0}টি stored mistake আছে। আগে এই topic revise করুন।`
      : mistakeCount
        ? `${mistakeCount}টি stored mistake আছে। আগে এই topic revise করুন।`
        : 'অনুশীলন শুরু করলে আপনার পরবর্তী revision লক্ষ্য এখানে দেখা যাবে।';
    const focusAccuracy = focus ? `${round2(focus.acc)}%` : `${stats.accuracy || 0}%`;
    const focusLabel = esc(focusName);
    const greeting = new Date().getHours() < 12 ? 'সুপ্রভাত' : new Date().getHours() < 18 ? 'শুভ অপরাহ্ণ' : 'শুভ সন্ধ্যা';
    const todayAccuracy = today.correct + today.wrong ? Math.round((today.correct / (today.correct + today.wrong)) * 100) : stats.accuracy || 0;
    const ringStyle = `background:conic-gradient(#10b981 ${pct * 3.6}deg,#d9f7e8 0deg)`;

    const html = `<main class="dashboard-reference">
      <button class="reference-study-banner" type="button" onclick="navigate('study-tools')" aria-label="Open Study Hub">
        <span class="reference-banner-top"><span class="reference-banner-icon">✦</span><small>6 TOOLS</small></span>
        <strong>STUDY HUB</strong>
        <span class="reference-banner-subtitle">Your essential admission toolkit</span>
        <span class="reference-banner-tools">Mistake Book · Revision · Bookmarks · Quick Notes · Focus · Countdown</span>
        <span class="reference-banner-divider"></span>
        <span class="reference-banner-action">Open Study Hub <b>→</b></span>
      </button>

      <header class="reference-greeting">
        <span class="reference-crown" aria-hidden="true">♔</span>
        <div class="reference-greeting-copy"><div class="reference-brand">EMERALD ACADEMIC</div><h1>${greeting}, Scholar</h1><p>"আজকের পরিশ্রমই তোমার আগামীকালের সাফল্য!"</p></div>
        <button class="reference-inbox" type="button" onclick="navigate('history')" aria-label="Inbox">Inbox<span>${inboxCount}</span></button>
      </header>

      <section class="reference-command-card" aria-labelledby="reference-command-title">
        <div class="reference-kicker">TODAY COMMAND CENTER</div>
        <div class="reference-command-row"><div><h2 id="reference-command-title">${target} MCQ Goal</h2><strong>${todayCount}<small> / ${target}</small></strong></div><div class="reference-ring-wrap"><span class="reference-ring" style="${ringStyle}"><i>${pct}%</i></span><b>${pct}%</b></div></div>
        <div class="reference-progress"><span style="width:${pct}%"></span></div>
        <div class="reference-stat-grid">
          <div class="reference-stat"><span class="reference-stat-icon correct">✓</span><span><b>${today.correct || 0}</b><small>CORRECT</small></span></div>
          <div class="reference-stat"><span class="reference-stat-icon wrong">×</span><span><b>${today.wrong || 0}</b><small>WRONG</small></span></div>
          <div class="reference-stat"><span class="reference-stat-icon accuracy">↗</span><span><b>${todayAccuracy}%</b><small>ACCURACY</small></span></div>
          <div class="reference-stat"><span class="reference-stat-icon time">◷</span><span><b>${fmtTime(studyTime)}</b><small>STUDY TIME</small></span></div>
        </div>
      </section>

      <section class="reference-action-card" aria-labelledby="reference-action-title">
        <div class="reference-action-head"><h2 id="reference-action-title">★ Recommended Next Action</h2><button type="button" onclick="navigate('mistakes')">Open <b>›</b></button></div>
        <p>${focusLabel} 📖-এ ${focusDescription}</p>
        <div class="reference-action-line"><span>◎</span><span>Weak area: <b>${focusLabel} 📖</b></span></div>
        <div class="reference-action-line"><span>▣</span><span>Revision priority: <b>${focusLabel} 📖</b></span></div>
        <div class="reference-action-meta">Current accuracy: <b>${focusAccuracy}</b></div>
      </section>
    </main>`;
    renderShell(html, { topbar: false });
  };
})();

/* Keep the primary navigation pinned to the visual viewport on iOS Safari/PWA. */
(() => {
  const isStandalonePwa = () => {
    try {
      return window.navigator.standalone === true || window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: fullscreen)').matches;
    } catch (_) {
      return window.navigator.standalone === true;
    }
  };
  const syncViewportNav = () => {
    const nav = document.getElementById('navRoot');
    if (!nav) return;
    const vv = window.visualViewport;
    const viewportHeight = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
    const standaloneScreenHeight = isStandalonePwa() && window.screen && Number.isFinite(window.screen.height) ? window.screen.height : 0;
    const layoutHeight = Math.round(isStandalonePwa() && standaloneScreenHeight ? standaloneScreenHeight : viewportHeight);
    const visualHeight = Math.round((vv && vv.height) || layoutHeight);
    document.documentElement.style.setProperty('--visual-viewport-height', `${visualHeight}px`);
    if (isStandalonePwa()) {
      // iOS Add to Home Screen can report a shorter visualViewport while the
      // standalone layout viewport remains full height. Anchor to the layout
      // viewport explicitly; using visualViewport/bottom:0 can stop too high.
      const navHeight = nav.offsetHeight || 74;
      nav.style.setProperty('top', `${Math.max(0, layoutHeight - navHeight)}px`, 'important');
      nav.style.setProperty('bottom', 'auto', 'important');
      nav.style.setProperty('left', '0px', 'important');
      nav.style.setProperty('right', '0px', 'important');
      nav.style.setProperty('transform', 'none', 'important');
      return;
    }
    const offsetTop = Math.max(0, Math.round((vv && vv.offsetTop) || 0));
    nav.style.setProperty('top', `${offsetTop + visualHeight - nav.offsetHeight}px`, 'important');
    nav.style.setProperty('bottom', 'auto', 'important');
  };
  window.syncViewportNav = syncViewportNav;
  window.addEventListener('resize', syncViewportNav, { passive: true });
  window.addEventListener('orientationchange', () => setTimeout(syncViewportNav, 120), { passive: true });
  if (window.visualViewport) {
    window.visualViewport.addEventListener('resize', syncViewportNav, { passive: true });
    window.visualViewport.addEventListener('scroll', syncViewportNav, { passive: true });
  }
  document.addEventListener('DOMContentLoaded', syncViewportNav, { once: true });
  setTimeout(syncViewportNav, 0);
})();

/* Phase 1+2 visual system: restrained warm-white canvas, soft glass cards, readable Bengali type. */
const phase12Style = document.createElement('style');
phase12Style.textContent = `
  :root{--bg:#fbfaf7;--card:rgba(255,255,255,.88);--text:#17211c;--sub:#65716b;--line:rgba(24,55,42,.11);--mint:#e8f4ee;--emerald:#0f6b4f;--emerald-d:#0b4f3b;--radius:18px;--shadow:0 8px 24px rgba(23,58,43,.06)}
  html,body{font-family:'Noto Sans Bengali',-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif}
  body{background:var(--bg)} #app{max-width:600px;padding-bottom:calc(82px + var(--safe-b))}.page{padding:18px 16px 30px}.topbar{background:rgba(251,250,247,.84);border-bottom:1px solid var(--line);box-shadow:none}.card{background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:18px}.premium-card{background:var(--mint);color:var(--text);border:1px solid rgba(15,107,79,.12)}
  .dashboard-v2{padding-bottom:8px}.dashboard-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding:8px 2px 24px}.brand-kicker,.hero-kicker{font-size:11px;letter-spacing:.16em;font-weight:800;color:var(--emerald);text-transform:uppercase}.dashboard-header h1{font-size:30px;line-height:1.18;letter-spacing:-.04em;margin:7px 0 5px}.dashboard-header p{color:var(--sub);font-size:14px;margin:0}.settings-trigger{background:transparent;border:1px solid var(--line);border-radius:14px;color:var(--emerald-d);padding:10px 11px;font-size:18px;display:flex;flex-direction:column;align-items:center;gap:2px;cursor:pointer}.settings-trigger span{font-size:10px;font-weight:700}.command-hero{background:linear-gradient(145deg,#edf8f2,#e2f1e9);border:1px solid rgba(15,107,79,.14);border-radius:24px;padding:22px 20px;box-shadow:0 14px 32px rgba(15,107,79,.08)}.hero-topline,.hero-goal-row{display:flex;justify-content:space-between;align-items:center;gap:12px}.hero-settings{border:0;background:transparent;color:var(--emerald-d);font-size:18px;cursor:pointer}.command-hero h2{font-size:17px;margin:10px 0 5px}.hero-goal-row strong{font-size:38px;line-height:1;color:var(--emerald-d);letter-spacing:-.05em}.hero-goal-row strong small{font-size:16px;font-weight:600;color:var(--sub);letter-spacing:0}.hero-goal-row>b{font-size:20px;color:var(--emerald-d)}.hero-progress{height:10px;border-radius:999px;background:rgba(15,107,79,.13);overflow:hidden;margin:20px 0}.hero-progress span{display:block;height:100%;border-radius:inherit;background:var(--emerald);transition:width .25s ease}.hero-stats{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;border-top:1px solid rgba(15,107,79,.12);padding-top:16px}.hero-stats span{display:flex;flex-direction:column;gap:3px;min-width:0}.hero-stats strong{font-size:16px;color:var(--emerald-d);white-space:nowrap}.hero-stats small{font-size:11px;color:var(--sub)}.dashboard-section{margin-top:28px}.section-heading{display:flex;justify-content:space-between;align-items:baseline;gap:12px;margin-bottom:12px}.section-heading h2{font-size:20px;letter-spacing:-.025em;margin:0}.section-heading span{font-size:11px;color:var(--sub)}  .command-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.command-carousel{overflow:hidden;border-radius:20px;touch-action:pan-y;position:relative}.command-track{display:flex;will-change:transform;transition:transform .28s cubic-bezier(.23,1,.32,1)}.command-slide{flex:0 0 100%;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));grid-template-rows:repeat(2,minmax(0,1fr));gap:10px}.command-dots{display:flex;justify-content:center;align-items:center;gap:7px;margin-top:12px}.command-dot{width:8px;height:8px;padding:0;border:0;border-radius:50%;background:rgba(15,107,79,.2);cursor:pointer;transition:transform .18s ease,background .18s ease}.command-dot.active{background:var(--emerald);transform:scale(1.35)}.command-card,.special-tool-card{font:inherit;text-align:left;cursor:pointer;border:1px solid var(--line);background:rgba(255,255,255,.74);border-radius:15px;padding:12px;min-height:96px;display:flex;flex-direction:column;align-items:flex-start;gap:5px;box-shadow:var(--shadow);transition:transform .16s ease,border-color .16s ease,background .16s ease}.command-card:active,.special-tool-card:active{transform:scale(.97)}.command-card:hover,.special-tool-card:hover{border-color:rgba(15,107,79,.3);background:#fff}.command-icon,.special-tool-icon{font-size:23px;line-height:1.1;margin-bottom:3px}.command-title{font-size:13px;font-weight:800;color:var(--text)}.command-subtitle{font-size:10px;color:var(--sub)}.command-hero{position:relative}.special-tools-grid{display:grid;gap:10px}.special-tool-card{min-height:78px;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:13px;padding:14px 16px}.special-tool-icon{font-size:28px;margin:0}.special-tool-card strong,.special-tool-card small{display:block}.special-tool-card strong{font-size:15px}.special-tool-card small{font-size:12px;color:var(--sub);margin-top:2px}.tool-arrow{font-size:20px;color:var(--emerald)}.resume-card,.start-card{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:28px;padding:16px 17px;border-radius:18px;border:1px solid rgba(201,138,44,.24);background:#fffaf1}.resume-card p,.start-card p{margin:5px 0 0;color:var(--sub);font-size:12px}.focus-card{background:rgba(255,255,255,.72);border:1px solid var(--line);border-radius:18px;padding:16px;box-shadow:var(--shadow)}.focus-row{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:10px 0;border-bottom:1px solid var(--line)}.focus-row:last-of-type{border-bottom:0}.focus-row strong,.focus-row small{display:block}.focus-row small{font-size:12px;color:var(--sub);margin-top:3px}.focus-card .btn{margin-top:14px}.bottomnav{background:rgba(255,255,255,.9);backdrop-filter:blur(16px);border-top:1px solid var(--line);box-shadow:0 -6px 22px rgba(23,58,43,.05);padding-top:6px}.navbtn{font-size:11px;padding:8px 0 9px;gap:4px}.navbtn .ic{font-size:23px}.navbtn.active{color:var(--emerald);font-weight:800}.btn{border-radius:12px;min-height:42px;box-shadow:none}.muted{font-size:13px}.h2{font-size:19px}
  @media(max-width:430px){.dashboard-header h1{font-size:26px}.command-hero{padding:19px 16px}.hero-goal-row strong{font-size:33px}.hero-stats{gap:7px}.hero-stats strong{font-size:14px}.hero-stats small{font-size:10px}.command-card{min-height:120px;padding:15px}.command-icon{font-size:27px}}
  @media(max-width:430px){.command-slide{gap:7px}.command-slide .command-card{min-height:88px;padding:9px}.command-slide .command-icon{font-size:20px}.command-slide .command-title{font-size:11px}.command-slide .command-subtitle{font-size:9px}.section-heading span{font-size:10px}}@media(prefers-reduced-motion:reduce){*,*:before,*:after{animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
document.head.appendChild(phase12Style);
const dashboardReferenceStyle = document.createElement('style');
dashboardReferenceStyle.textContent = `
  .dashboard-reference{padding:0 0 14px;background:linear-gradient(180deg,#eef9f5 0%,#f9fcfb 72%);min-height:calc(100dvh - 78px);color:#132030}
  .reference-study-banner{display:block;width:100%;border:0;border-radius:28px;padding:29px 28px 22px;margin:0 0 31px;text-align:left;color:#fff;background:radial-gradient(circle at 88% 10%,rgba(116,154,255,.30),transparent 38%),linear-gradient(135deg,#1d42b5 0%,#2053d2 58%,#1760d7 100%);box-shadow:0 16px 28px rgba(29,74,184,.26);cursor:pointer}
  .reference-banner-top{display:flex;align-items:center;justify-content:space-between;margin-bottom:22px}.reference-banner-icon{display:grid;place-items:center;width:48px;height:48px;border-radius:15px;background:rgba(255,255,255,.15);font-size:23px}.reference-banner-top small{font-size:12px;letter-spacing:.16em;font-weight:800;opacity:.78}.reference-study-banner>strong{display:block;font-size:26px;letter-spacing:.07em;margin-bottom:11px}.reference-banner-subtitle{display:block;font-size:16px;opacity:.78}.reference-banner-tools{display:block;margin-top:19px;font-size:11px;opacity:.72;white-space:nowrap}.reference-banner-divider{display:block;height:1px;background:rgba(255,255,255,.25);margin:22px 0 20px}.reference-banner-action{display:flex;justify-content:space-between;align-items:center;font-size:17px;font-weight:800}.reference-banner-action b{font-size:34px;line-height:.7;font-weight:500}
  .reference-greeting{display:flex;align-items:center;gap:16px;padding:0 10px 27px}.reference-crown{display:grid;place-items:center;flex:0 0 66px;width:66px;height:66px;border-radius:50%;background:#11b77e;color:#fff;font-size:38px;box-shadow:0 8px 18px rgba(16,185,129,.2)}.reference-greeting-copy{min-width:0;flex:1}.reference-brand{font-size:11px;letter-spacing:.18em;font-weight:900;color:#0b9f72}.reference-greeting h1{font-size:29px;line-height:1.1;margin:6px 0;color:#0c1926;white-space:nowrap}.reference-greeting p{margin:0;color:#536270;font-size:14px;white-space:nowrap}.reference-inbox{position:relative;align-self:flex-start;border:0;background:transparent;color:#1479d6;font-size:18px;font-weight:800;padding:8px 3px 0;cursor:pointer}.reference-inbox span{position:absolute;right:-10px;top:-4px;display:grid;place-items:center;min-width:21px;height:21px;padding:0 4px;border-radius:50%;background:#0ba879;color:#fff;font-size:11px}
  .reference-command-card{border-radius:25px;padding:24px 23px 22px;background:rgba(255,255,255,.95);box-shadow:0 9px 23px rgba(38,73,63,.11);border:1px solid rgba(35,77,65,.06)}.reference-kicker{font-size:11px;letter-spacing:.18em;font-weight:900;color:#0a9f70}.reference-command-row{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:13px}.reference-command-row h2{font-size:24px;margin:0 0 8px;color:#0b1521}.reference-command-row strong{font-size:43px;line-height:1;color:#08a976;letter-spacing:-.05em}.reference-command-row strong small{font-size:22px;color:#74808c;letter-spacing:0}.reference-ring-wrap{display:flex;flex-direction:column;align-items:center;gap:3px}.reference-ring{display:grid;place-items:center;width:78px;height:78px;border-radius:50%;position:relative}.reference-ring:after{content:'';position:absolute;inset:10px;border-radius:50%;background:#e9fff3}.reference-ring i{position:relative;z-index:1;font-style:normal;font-weight:900;color:#079b70;font-size:13px}.reference-ring-wrap>b{font-size:16px;color:#08a976}.reference-progress{height:14px;margin:27px 0 18px;border-radius:99px;background:#eef2f5;overflow:hidden}.reference-progress span{display:block;height:100%;border-radius:inherit;background:#eef2f5}.reference-stat-grid{display:grid;grid-template-columns:1fr 1fr;gap:13px 28px}.reference-stat{display:flex;align-items:center;gap:12px;min-width:0}.reference-stat-icon{display:grid;place-items:center;flex:0 0 45px;width:45px;height:45px;border-radius:13px;font-size:30px;font-weight:700}.reference-stat-icon.correct{background:#d9f8e7;color:#0ab57a}.reference-stat-icon.wrong{background:#ffe1e4;color:#e34d56}.reference-stat-icon.accuracy{background:#e8f0ff;color:#4488db;font-size:27px}.reference-stat-icon.time{background:#f0e6ff;color:#934edf;font-size:27px}.reference-stat b,.reference-stat small{display:block}.reference-stat b{font-size:19px;line-height:1.05;color:#101c2a}.reference-stat small{margin-top:4px;color:#7b8791;font-size:11px;font-weight:800;letter-spacing:.04em}
  .reference-action-card{margin-top:27px;border-radius:25px;padding:24px 24px 22px;background:rgba(255,255,255,.96);box-shadow:0 9px 23px rgba(38,73,63,.09);border:1px solid rgba(35,77,65,.06)}.reference-action-head{display:flex;align-items:center;justify-content:space-between;gap:9px}.reference-action-head h2{margin:0;color:#0b9f72;font-size:19px}.reference-action-head button{border:1px solid #dce2e7;background:#fff;border-radius:12px;padding:8px 14px;color:#087bc9;font-size:15px;font-weight:800;cursor:pointer}.reference-action-head button b{font-size:24px;line-height:0;margin-left:5px}.reference-action-card>p{font-size:17px;line-height:1.55;margin:25px 0;color:#17202b}.reference-action-line{display:flex;align-items:center;gap:13px;margin-top:15px;color:#6b7780;font-size:15px}.reference-action-line>span:first-child{display:grid;place-items:center;width:29px;height:29px;color:#0ab57a;font-size:26px}.reference-action-line b{color:#4f5b68}.reference-action-meta{margin-top:18px;padding-top:14px;border-top:1px solid #edf0f1;color:#78838d;font-size:12px}.reference-action-meta b{color:#0a9f70}
  @media(max-width:430px){.reference-study-banner{padding:25px 25px 20px;border-radius:25px;margin-bottom:26px}.reference-study-banner>strong{font-size:23px}.reference-banner-subtitle{font-size:15px}.reference-banner-tools{font-size:10px;overflow:hidden;text-overflow:ellipsis}.reference-greeting{gap:11px;padding-left:6px;padding-right:6px}.reference-crown{flex-basis:58px;width:58px;height:58px;font-size:32px}.reference-greeting h1{font-size:25px}.reference-greeting p{font-size:12px}.reference-inbox{font-size:16px}.reference-command-card,.reference-action-card{padding:21px 18px}.reference-command-row h2{font-size:20px}.reference-command-row strong{font-size:39px}.reference-ring{width:70px;height:70px}.reference-stat-grid{gap:12px 15px}.reference-stat{gap:8px}.reference-stat-icon{flex-basis:40px;width:40px;height:40px}.reference-stat b{font-size:17px}.reference-action-head h2{font-size:17px}.reference-action-card>p{font-size:15px}}
`;
document.head.appendChild(dashboardReferenceStyle);

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
