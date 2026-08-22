/* Juju visual fixes v2: preserves existing features and leaves Dashboard legacy cards intact. */
(() => {
  'use strict';
  const escV = (v) => typeof esc === 'function' ? esc(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const path = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const isExam = () => path() === 'exam/running' || path() === 'exam';

  const style = document.createElement('style');
  style.id = 'juju-visual-fixes-v2';
  style.textContent = `
    /* Reference-inspired navy theme; existing light themes remain available. */
    [data-theme="midnight-academic"]{--bg:#06152d!important;--card:#0d2344!important;--text:#f1f6ff!important;--sub:#a9bdd9!important;--line:rgba(160,196,238,.22)!important;--mint:#122d53!important;--emerald:#2e9bff!important;--emerald-d:#6db8ff!important;--green:#48d69a!important;--red:#ff7777!important;--glass-bg:rgba(13,35,68,.88)!important;--glass-strong:#102b52!important;--glass-border:rgba(112,180,255,.28)!important;--glass-shadow:0 18px 48px rgba(0,0,0,.28)!important}
    [data-theme="midnight-academic"] body,[data-theme="midnight-academic"] #app{background:var(--bg)!important;color:var(--text)!important}
    [data-theme="midnight-academic"] .card,[data-theme="midnight-academic"] .topbar,[data-theme="midnight-academic"] .bottomnav{background:var(--card)!important;color:var(--text)!important;border-color:var(--line)!important}
    [data-theme="midnight-academic"] .btn:not(.secondary),[data-theme="midnight-academic"] .result-filter.active{background:linear-gradient(135deg,#167be1,#2ea1ff)!important;border-color:#2e9bff!important}
    [data-theme="midnight-academic"] .flash-q-card,[data-theme="midnight-academic"] .result-review-card{box-shadow:0 14px 38px rgba(0,0,0,.22)!important}

    /* Keep a stable answer area so selecting an option cannot shift the card. */
    .exam-q-card .options-list{min-height:168px}
    .exam-q-card > .btn.ghost.sm{min-height:30px;margin-top:10px!important}
    .exam-clear-slot{min-height:42px;display:flex;align-items:flex-start}
    .exam-q-card{scroll-margin-top:90px;contain:layout paint}

    /* Flash: stats are intentionally removed and navigation stays above the fold. */
    .flash-stats-bar{display:none!important}
    .flash-container .flash-nav:not(.flash-nav-top){display:none!important}
    .flash-container .flash-nav{position:sticky;top:8px;z-index:20;margin:10px 0 14px;padding:8px;border:1px solid var(--line);border-radius:16px;background:color-mix(in srgb,var(--card) 94%,transparent);backdrop-filter:blur(12px)}
    .flash-container .flash-nav .btn{min-height:44px;font-size:14px;font-weight:800}
    .flash-container{padding-bottom:24px}

    /* Result: compact reference-like question cards with larger options. */
    .result-review-head .result-time,.result-review-card .result-tags,.result-review-card .result-answer-line{display:none!important}
    .result-question{font-size:20px!important;line-height:1.55!important;margin:14px 0!important}
    .result-options{gap:10px!important}
    .result-option{padding:14px 15px!important;border-radius:14px!important;font-size:17px!important;line-height:1.55!important;min-height:52px!important;align-items:center!important}
    .result-option-letter{font-size:16px!important;min-width:26px!important}
    .result-option-note{display:none!important}
    .result-review-card{padding:17px!important;border-radius:20px!important}

    /* Gamified dashboard extension: live values, no leaderboard. */
    .p3-dashboard-v3 > .p3-header-v3,.p3-dashboard-v3 > .p3-today-hero-card{display:none!important}
    .juju-gamified-dashboard{display:grid;gap:14px;margin:0 0 20px}
    .juju-profile-hero{display:grid;grid-template-columns:54px 1fr auto;gap:12px;align-items:center;padding:18px;border-radius:22px;background:linear-gradient(135deg,#081d3d,#123b72 58%,#176cbd);color:#f5f9ff;box-shadow:0 18px 40px rgba(14,86,160,.24);border:1px solid rgba(122,190,255,.3)}
    .juju-profile-avatar{width:54px;height:54px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#2e9bff,#7dc7ff);font-size:28px;border:3px solid rgba(255,255,255,.8)}
    .juju-profile-kicker{font-size:11px;opacity:.75;letter-spacing:.08em;text-transform:uppercase}.juju-profile-name{font-size:25px;font-weight:900;line-height:1.1;margin-top:3px}.juju-profile-sub{font-size:12px;opacity:.78;margin-top:4px}.juju-streak-badge{font-size:20px;font-weight:900;color:#ffbf35;text-align:center}.juju-streak-badge small{display:block;font-size:10px;color:#d9e8ff;font-weight:700}
    .juju-level-card{padding:16px 18px;border-radius:20px;background:linear-gradient(135deg,#102b52,#0e2342);color:#f3f7ff;border:1px solid rgba(110,180,255,.28);box-shadow:0 12px 28px rgba(0,0,0,.14)}
    .juju-level-row{display:flex;justify-content:space-between;gap:12px;align-items:end}.juju-level-label{font-size:12px;color:#b7cce8}.juju-level-value{font-size:28px;font-weight:900}.juju-xp{font-size:12px;color:#b7cce8}.juju-xp-bar{height:9px;border-radius:99px;background:rgba(255,255,255,.15);overflow:hidden;margin-top:12px}.juju-xp-bar i{display:block;height:100%;border-radius:inherit;background:linear-gradient(90deg,#1989ff,#6fc4ff)}
    .juju-dashboard-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:12px}.juju-dash-card{padding:15px;border-radius:19px;background:var(--card);border:1px solid var(--line);box-shadow:var(--shadow);color:var(--text)}.juju-dash-card h3{font-size:16px;margin:0 0 10px}.juju-task{display:flex;align-items:center;gap:10px;padding:10px 0;border-bottom:1px solid var(--line)}.juju-task:last-child{border-bottom:0}.juju-task-icon{width:29px;height:29px;display:grid;place-items:center;border-radius:50%;background:var(--mint);font-size:16px}.juju-task b{font-size:12px}.juju-task small{display:block;color:var(--sub);font-size:10px;margin-top:2px}.juju-streak-days{display:flex;gap:5px;justify-content:space-between;margin-top:14px}.juju-streak-days span{width:23px;height:23px;border-radius:50%;display:grid;place-items:center;font-size:10px;background:var(--mint);color:var(--sub)}.juju-streak-days span.done{background:#ffae22;color:#fff}.juju-continue{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:16px;border-radius:19px;background:linear-gradient(135deg,#0877e8,#1646bb);color:#fff;box-shadow:0 16px 34px rgba(16,97,215,.25)}.juju-continue b{font-size:17px}.juju-continue small{display:block;opacity:.8;margin-top:3px}.juju-continue .btn{background:#fff!important;color:#1458b7!important;border:0!important;border-radius:50%!important;width:48px;height:48px;min-height:48px;padding:0;font-size:22px}
    @media(max-width:430px){.juju-dashboard-grid{grid-template-columns:1fr}.juju-profile-name{font-size:22px}.result-option{font-size:16px!important}.result-question{font-size:18px!important}}
  `;
  document.head.appendChild(style);

  const safeScroll = (y) => requestAnimationFrame(() => requestAnimationFrame(() => window.scrollTo({top:y, left:0, behavior:'auto'})));
  const wrapAnswer = (name) => {
    const original = window[name];
    if (typeof original !== 'function' || original.__jujuStable) return;
    const wrapped = function(...args){
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      const result = original.apply(this,args);
      Promise.resolve(result).finally(() => safeScroll(y));
      return result;
    };
    wrapped.__jujuStable = true;
    wrapped.__jujuOriginal = original;
    window[name] = wrapped;
    try { globalThis[name] = wrapped; } catch (_) {}
  };
  const installAnswerStability = () => { wrapAnswer('selectMockAnswer'); wrapAnswer('selectFlashAnswer'); };

  const liveStats = () => {
    const results = Array.isArray(window.CACHE?.examResults) ? window.CACHE.examResults : [];
    const snaps = results.flatMap(r => Array.isArray(r.snapshot) ? r.snapshot : []);
    const correct = snaps.filter(s => s.status === 'correct').length;
    const answered = snaps.filter(s => s.status !== 'skipped').length;
    const xp = Number(window.CACHE?.settings?.totalXpEarned || window.CACHE?.settings?.xpBalance || localStorage.getItem('xp') || 0) || 0;
    const streak = typeof window.__phase3Streak === 'number' ? window.__phase3Streak : Math.min(30, new Set(results.map(r => new Date(r.date || r.completedAt || 0).toDateString())).size);
    const profile = typeof window.profileState === 'function' ? window.profileState() : {};
    const rawName = String(profile?.name || window.CACHE?.settings?.userName || 'Zayan');
    const name = !rawName || rawName === 'Scholar' ? 'Zayan' : rawName;
    return {name, correct, answered, xp, streak, accuracy:answered ? Math.round(correct / answered * 100) : 0};
  };
  const dashboardMarkup = () => {
    const s = liveStats();
    const level = Math.max(1, Math.floor(s.xp / 500) + 1);
    const currentXp = s.xp % 500;
    const xpPct = Math.min(100, Math.round(currentXp / 500 * 100));
    const tasks = [
      ['✓','Attempt 20 Questions',`${s.answered} / 20 completed`],
      ['◷','Study for 30 Minutes','Live study time from your activity'],
      ['★','Improve Accuracy',`${s.accuracy}% current accuracy`]
    ];
    return `<section class="juju-gamified-dashboard" data-juju-gamified>
      <header class="juju-profile-hero"><div class="juju-profile-avatar">🧑‍🎓</div><div><div class="juju-profile-kicker">Good Morning</div><div class="juju-profile-name">${escV(s.name)} <span aria-hidden="true">✦</span></div><div class="juju-profile-sub">Stay consistent, stay unstoppable!</div></div><div class="juju-streak-badge">🔥 ${s.streak}<small>day streak</small></div></header>
      <article class="juju-level-card"><div class="juju-level-row"><div><div class="juju-level-label">Your Level</div><div class="juju-level-value">Lv. ${level}</div></div><div class="juju-xp">${s.xp} XP total</div></div><div class="juju-xp-bar"><i style="width:${xpPct}%"></i></div><div class="juju-xp" style="margin-top:7px">${currentXp} / 500 XP to next level</div></article>
      <div class="juju-dashboard-grid"><article class="juju-dash-card"><h3>🎯 Daily Quests</h3>${tasks.map(t=>`<div class="juju-task"><span class="juju-task-icon">${t[0]}</span><div><b>${t[1]}</b><small>${escV(t[2])}</small></div></div>`).join('')}</article><article class="juju-dash-card"><h3>🔥 Today’s Streak</h3><div style="font-size:25px;font-weight:900;color:#f0a510">${s.streak} Days</div><small style="color:var(--sub)">Keep it going!</small><div class="juju-streak-days">${['M','T','W','T','F','S','S'].map((d,i)=>`<span class="${i < Math.min(7,s.streak) ? 'done':''}">${d}</span>`).join('')}</div></article></div>
      <button class="juju-continue" type="button" onclick="navigate('exam/setup')"><span><b>Continue Mock Test</b><small>${s.answered} questions completed · ${s.accuracy}% accuracy</small></span><span class="btn" aria-hidden="true">→</span></button>
    </section>`;
  };
  const enhanceDashboard = () => {
    if (path() !== 'dashboard' && path() !== 'home' && path() !== '') return;
    const root = document.querySelector('#app .p3-dashboard-v3');
    if (!root || root.querySelector('[data-juju-gamified]')) return;
    const anchor = root.querySelector('.p3-command-section-v3') || root.firstElementChild;
    if (anchor) anchor.insertAdjacentHTML('beforebegin', dashboardMarkup());
  };
  const cleanResult = () => {
    if (!document.querySelector('.result-page')) return;
    document.querySelectorAll('.result-section-title').forEach(title => {
      if ((title.textContent || '').includes('সময় বিশ্লেষণ')) {
        title.style.display = 'none';
        title.nextElementSibling?.style && (title.nextElementSibling.style.display = 'none');
      }
    });
  };
  const observe = () => {
    const app = document.getElementById('app');
    if (!app || app.__jujuVisualObserver) return;
    app.__jujuVisualObserver = true;
    const run = () => { installAnswerStability(); enhanceDashboard(); cleanResult(); };
    new MutationObserver(run).observe(app,{childList:true,subtree:true});
    run();
  };
  const init = () => { observe(); installAnswerStability(); enhanceDashboard(); cleanResult(); };
  try {
    if (!localStorage.getItem('admission_theme_v2_seen')) {
      localStorage.setItem('admission_theme_v2_seen', '1');
      setTimeout(() => { if (typeof window.setTheme === 'function') window.setTheme('midnight-academic'); }, 180);
    }
  } catch (_) {}
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, {once:true}); else init();
  window.addEventListener('load', () => setTimeout(init, 120));
})();

/* Ensure the user's requested profile fallback is available without erasing stored stats. */
try {
  const s = window.CACHE?.settings;
  if (s && (!s.userName || s.userName === 'Scholar')) s.userName = 'Zayan';
} catch (_) {}
