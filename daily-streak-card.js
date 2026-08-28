/* Daily Streak card â dashboard-only, live read from existing activity data. */
(() => {
  'use strict';

  const CARD_SELECTOR = '[data-daily-streak-card]';
  const DAY_LABELS = ['à¦°à¦¬à¦¿', 'à¦¸à§à¦®', 'à¦®à¦à§à¦à¦²', 'à¦¬à§à¦§', 'à¦¬à§à¦¹', 'à¦¶à§à¦à§à¦°', 'à¦¶à¦¨à¦¿'];
  const cache = () => typeof CACHE !== 'undefined' ? CACHE : (window.CACHE || {});
  const route = () => String((window.Router && Router.path) || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const keyOf = value => {
    const raw = String(value || '');
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) return raw.slice(0, 10);
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };
  const dateFromKey = key => {
    const [year, month, day] = String(key).split('-').map(Number);
    return new Date(year, month - 1, day, 12);
  };
  const todayKeyLocal = () => keyOf(new Date());
  const isActiveRow = row => Number(row?.questions || 0) + Number(row?.correct || 0) + Number(row?.wrong || 0) + Number(row?.exams || 0) + Number(row?.timeMs || 0) + Number(row?.completedTasks || 0) > 0 || Boolean(row?.activity);

  function activityDays() {
    const days = new Set();
    (cache().dailyStats || []).forEach(row => { if (isActiveRow(row)) { const key = keyOf(row.date || row.id); if (key) days.add(key); } });
    (cache().activityLogs || []).forEach(row => { const key = keyOf(row.day || row.date || row.createdAt || row.ts); if (key) days.add(key); });
    (cache().examResults || []).forEach(row => { const key = keyOf(row.date || row.completedAt || row.createdAt); if (key) days.add(key); });
    return days;
  }

  function consecutiveStreak(days) {
    let streak = 0;
    const cursor = dateFromKey(todayKeyLocal());
    while (days.has(keyOf(cursor))) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    }
    return streak;
  }

  function bestStreak(days) {
    const ordered = [...days].sort();
    let best = 0;
    let run = 0;
    let previous = '';
    ordered.forEach(key => {
      const continuous = previous && (dateFromKey(key) - dateFromKey(previous)) === 86400000;
      run = continuous ? run + 1 : 1;
      best = Math.max(best, run);
      previous = key;
    });
    return best;
  }

  function metrics() {
    const days = activityDays();
    const today = todayKeyLocal();
    const yesterday = keyOf(new Date(Date.now() - 86400000));
    const currentRow = (cache().dailyStats || []).find(row => keyOf(row.date || row.id) === today) || {};
    const resultQuestions = (cache().examResults || []).filter(row => keyOf(row.date || row.completedAt || row.createdAt) === today)
      .reduce((sum, row) => sum + Number(row.correct || 0) + Number(row.wrong || 0) + Number(row.skipped || 0), 0);
    const questions = Math.max(Number(currentRow.questions || 0), resultQuestions);
    const goal = Math.max(1, Math.min(5000, Math.round(Number(cache().settings?.dailyTarget) || 100)));
    const streak = consecutiveStreak(days);
    const week = Array.from({ length: 5 }, (_, index) => {
      const date = new Date();
      date.setHours(12, 0, 0, 0);
      date.setDate(date.getDate() - (4 - index));
      const key = keyOf(date);
      return { key, label: DAY_LABELS[date.getDay()], active: days.has(key), today: key === today };
    });
    const message = streak > 0 ? (streak >= 3 ? 'à¦¦à¦¾à¦°à§à¦£! à¦à¦ à¦§à¦¾à¦°à¦¾à¦¬à¦¾à¦¹à¦¿à¦à¦¤à¦¾ à¦§à¦°à§ à¦°à¦¾à¦à§à¦¨' : 'à¦à¦à¦à§à¦° session à¦à¦¾à¦²à¦¿à§à§ à¦¯à¦¾à¦¨') : (days.has(yesterday) ? 'à¦¶à§à¦· à¦¸à§à¦¯à§à¦! à¦à¦ practice à¦à¦°à§à¦¨' : 'à¦à¦à¦à§à¦° streak à¦¶à§à¦°à§ à¦à¦°à§à¦¨');
    return { days, today, week, streak, best: bestStreak(days), questions, goal, percent: Math.min(100, Math.round(questions / goal * 100)), message };
  }

  const flame = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13.2 2.5c.4 3-1.2 4.2-2.4 5.7-1 1.2-1.3 2.4-.5 3.6.4.6 1 .9 1.8.9-.2-1.2.2-2.2 1.3-3.1 2.2 1.2 3.6 3.4 3.6 6 0 4-2.9 6.9-6.8 6.9S3.4 20 3.4 16.2c0-2.5 1.2-4.7 3.2-6.7-.2 1.9.5 3.1 1.4 3.8-.1-2.7 1.2-4.8 2.7-6.7 1.2-1.5 2.3-2.9 2.5-4.1Z" fill="currentColor"/></svg>';

  function cardHtml(data) {
    const markers = data.week.map(day => `<div class="ah-streak-day ${day.active ? 'is-active' : ''} ${day.today ? 'is-today' : ''}" data-streak-day="${day.key}"><span>${day.label}</span><b>${day.active ? 'â' : ''}</b></div>`).join('');
    return `<section class="ah-streak-card" data-daily-streak-card aria-label="Daily streak">
      <div class="ah-streak-glow ah-streak-glow-one"></div><div class="ah-streak-glow ah-streak-glow-two"></div>
      <div class="ah-streak-content">
        <div class="ah-streak-kicker"><span class="ah-streak-flame">${flame}</span><span>DAILY STREAK</span><i>LIVE</i></div>
        <div class="ah-streak-value"><strong data-streak-value>${data.streak}</strong><span>à¦¦à¦¿à¦¨</span></div>
        <p class="ah-streak-message" data-streak-message>${data.message}</p>
        <div class="ah-streak-days" data-streak-days>${markers}</div>
      </div>
      <div class="ah-streak-art" aria-hidden="true">
        <div class="ah-streak-orbit"></div><div class="ah-streak-orbit ah-streak-orbit-two"></div>
        <div class="ah-streak-mascot"><span class="ah-streak-ear left"></span><span class="ah-streak-ear right"></span><span class="ah-streak-body"></span><span class="ah-streak-eye left"></span><span class="ah-streak-eye right"></span><span class="ah-streak-beak"></span><span class="ah-streak-wing left"></span><span class="ah-streak-wing right"></span><span class="ah-streak-shadow"></span></div>
      </div>
      <div class="ah-streak-foot"><span data-streak-status>${data.questions >= data.goal ? 'à¦à¦à¦à§à¦° à¦²à¦à§à¦·à§à¦¯ à¦ªà§à¦°à§à¦£ â' : `${data.questions}/${data.goal} MCQ à¦à¦`}</span><span data-streak-best>à¦¸à§à¦°à¦¾ ${data.best} à¦¦à¦¿à¦¨</span></div>
    </section>`;
  }

  function paint() {
    if (route() !== 'dashboard') return;
    const host = document.querySelector('[data-p3-command]');
    if (!host) return;
    const data = metrics();
    let card = host.querySelector(CARD_SELECTOR);
    if (!card) {
      const header = host.querySelector('.p3-header-v3');
      if (!header) return;
      header.insertAdjacentHTML('afterend', cardHtml(data));
      card = host.querySelector(CARD_SELECTOR);
    }
    if (!card) return;
    const value = card.querySelector('[data-streak-value]');
    const message = card.querySelector('[data-streak-message]');
    const status = card.querySelector('[data-streak-status]');
    const best = card.querySelector('[data-streak-best]');
    if (value) value.textContent = data.streak;
    if (message) message.textContent = data.message;
    if (status) status.textContent = data.questions >= data.goal ? 'à¦à¦à¦à§à¦° à¦²à¦à§à¦·à§à¦¯ à¦ªà§à¦°à§à¦£ â' : `${data.questions}/${data.goal} MCQ à¦à¦`;
    if (best) best.textContent = `à¦¸à§à¦°à¦¾ ${data.best} à¦¦à¦¿à¦¨`;
    card.querySelectorAll('[data-streak-day]').forEach(node => {
      const day = data.week.find(item => item.key === node.dataset.streakDay);
      node.classList.toggle('is-active', Boolean(day?.active));
      node.classList.toggle('is-today', Boolean(day?.today));
      const mark = node.querySelector('b');
      if (mark) mark.textContent = day?.active ? 'â' : '';
    });
  }

  let refreshTimer = 0;
  const schedule = () => { cancelAnimationFrame(refreshTimer); refreshTimer = requestAnimationFrame(paint); };
  const app = document.getElementById('app');
  if (app) {
    new MutationObserver(mutations => {
      if (mutations.some(mutation => !(mutation.target instanceof Element) || !mutation.target.closest(CARD_SELECTOR))) schedule();
    }).observe(app, { childList: true, subtree: true });
  }
  window.addEventListener('hashchange', schedule, { passive: true });
  window.addEventListener('admission:activity', schedule, { passive: true });
  window.addEventListener('storage', event => { if (!event.key || event.key === 'routine90_data') schedule(); }, { passive: true });
  document.addEventListener('admission:route-rendered', schedule, { passive: true });
  window.setInterval(() => { if (document.visibilityState === 'visible' && route() === 'dashboard') paint(); }, 2500);
  [0, 120, 500, 1100].forEach(delay => window.setTimeout(schedule, delay));

  const style = document.createElement('style');
  style.textContent = `
    .ah-streak-card{position:relative;display:flex;justify-content:space-between;gap:12px;min-height:184px;margin:0 14px 12px;padding:18px 18px 14px;overflow:hidden;isolation:isolate;border:1px solid rgba(255,255,255,.28);border-radius:25px;background:linear-gradient(135deg,#b91f3f 0%,#921b43 44%,#5c1441 100%);box-shadow:0 7px 0 #481139,0 18px 30px rgba(91,18,59,.22),inset 0 1px 0 rgba(255,255,255,.16);color:#fff;transform:translateZ(0)}
    .ah-streak-card:before{content:"";position:absolute;inset:0;z-index:-1;background:linear-gradient(108deg,rgba(255,255,255,.16),transparent 30%,transparent 70%,rgba(255,139,154,.12));pointer-events:none}.ah-streak-glow{position:absolute;z-index:-1;border-radius:50%;pointer-events:none}.ah-streak-glow-one{width:190px;height:190px;right:-92px;top:-100px;border:1px solid rgba(255,255,255,.16);box-shadow:0 0 0 18px rgba(255,255,255,.035),0 0 0 38px rgba(255,255,255,.025)}.ah-streak-glow-two{width:150px;height:150px;left:-90px;bottom:-112px;background:radial-gradient(circle,rgba(255,116,138,.24),transparent 68%)}
    .ah-streak-content{position:relative;z-index:2;min-width:0;padding-bottom:22px}.ah-streak-kicker{display:flex;align-items:center;gap:7px;font-size:10px;font-weight:900;letter-spacing:.14em;color:#ffdbe1}.ah-streak-flame{display:grid;place-items:center;width:25px;height:25px;color:#fff1b8;filter:drop-shadow(0 2px 3px rgba(50,0,20,.22))}.ah-streak-flame svg{width:24px;height:24px}.ah-streak-kicker i{margin-left:5px;padding:3px 7px;border:1px solid rgba(255,255,255,.3);border-radius:99px;color:#ffe9b0;font-size:7px;font-style:normal;letter-spacing:.1em}.ah-streak-value{display:flex;align-items:baseline;gap:7px;margin-top:7px;line-height:.92}.ah-streak-value strong{font-size:54px;font-weight:950;letter-spacing:-.07em;text-shadow:0 5px 0 rgba(66,9,42,.24),0 10px 18px rgba(37,0,20,.17)}.ah-streak-value span{font-size:19px;font-weight:800;color:#ffd9df}.ah-streak-message{margin:8px 0 14px;color:#ffe5e8;font-size:13px;font-weight:750}.ah-streak-days{display:flex;align-items:flex-end;gap:8px}.ah-streak-day{display:grid;justify-items:center;gap:5px;color:#f4bac5;font-size:9px;font-weight:800}.ah-streak-day b{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:rgba(43,5,31,.34);color:transparent;font-size:17px;line-height:1;box-shadow:inset 0 2px 5px rgba(38,0,20,.22)}.ah-streak-day.is-active b{border-color:rgba(255,247,206,.7);background:linear-gradient(145deg,#ffd985,#f6a44d);color:#7c1636;box-shadow:0 4px 0 #d46e45,0 6px 10px rgba(40,0,19,.2),inset 0 1px 0 #fff2be}.ah-streak-day.is-today span{color:#fff6d5}.ah-streak-day.is-today b{outline:2px solid rgba(255,255,255,.4);outline-offset:3px}
    .ah-streak-art{position:relative;z-index:1;width:142px;min-width:142px;align-self:stretch;display:grid;place-items:center;perspective:700px}.ah-streak-orbit{position:absolute;width:138px;height:138px;border:1px solid rgba(255,221,169,.28);border-radius:50%;transform:rotateX(62deg) rotateZ(-20deg);box-shadow:0 0 0 9px rgba(255,255,255,.025)}.ah-streak-orbit-two{width:103px;height:103px;border-color:rgba(255,196,209,.2);transform:rotateX(62deg) rotateZ(35deg)}.ah-streak-mascot{position:relative;width:116px;height:126px;transform-style:preserve-3d;transform:rotateX(10deg) rotateY(-16deg) rotateZ(2deg);filter:drop-shadow(12px 14px 8px rgba(42,0,24,.25));animation:ah-streak-float 4.2s ease-in-out infinite}.ah-streak-body{position:absolute;inset:17px 8px 7px;border-radius:48% 48% 39% 39%;background:radial-gradient(circle at 33% 22%,#fff7a5 0 5%,transparent 6%),linear-gradient(145deg,#ffe363 0%,#ffb238 36%,#e85737 100%);box-shadow:inset 13px 8px 0 rgba(255,255,202,.22),inset -15px -13px 0 rgba(165,35,55,.2),9px 11px 0 rgba(124,20,51,.5);transform:translateZ(12px)}.ah-streak-ear{position:absolute;top:4px;width:36px;height:42px;border-radius:70% 22% 70% 22%;background:linear-gradient(145deg,#fff079,#ed6d34);box-shadow:inset 6px 5px 0 rgba(255,255,220,.25),4px 5px 0 rgba(135,23,55,.5);transform:translateZ(5px)}.ah-streak-ear.left{left:13px;transform:rotate(-25deg) translateZ(5px)}.ah-streak-ear.right{right:13px;transform:scaleX(-1) rotate(-25deg) translateZ(5px)}.ah-streak-eye{position:absolute;top:46px;width:25px;height:30px;border-radius:50%;background:#fff6cc;box-shadow:inset 0 -4px 0 rgba(169,45,47,.18),3px 4px 0 rgba(116,21,54,.4);transform:translateZ(25px)}.ah-streak-eye:after{content:"";position:absolute;left:8px;top:7px;width:9px;height:14px;border-radius:50%;background:#4d1938;box-shadow:2px 2px 0 #fff}.ah-streak-eye.left{left:29px}.ah-streak-eye.right{right:29px}.ah-streak-beak{position:absolute;z-index:3;top:69px;left:47px;width:24px;height:18px;border-radius:45% 45% 60% 60%;background:linear-gradient(145deg,#ffb31f,#ed5c2d);box-shadow:3px 4px 0 rgba(132,27,49,.35);transform:translateZ(31px)}.ah-streak-wing{position:absolute;z-index:4;top:76px;width:39px;height:37px;border-radius:70% 25% 70% 25%;background:linear-gradient(145deg,#ffda4d,#ed7134);box-shadow:inset 6px 5px 0 rgba(255,255,205,.16),4px 5px 0 rgba(130,24,53,.42);transform:translateZ(34px)}.ah-streak-wing.left{left:2px;transform:rotate(21deg) translateZ(34px)}.ah-streak-wing.right{right:2px;transform:scaleX(-1) rotate(21deg) translateZ(34px)}.ah-streak-shadow{position:absolute;left:32px;bottom:7px;width:52px;height:12px;border-radius:50%;background:rgba(93,16,49,.2);transform:translateZ(4px)}.ah-streak-foot{position:absolute;z-index:3;left:18px;right:18px;bottom:12px;display:flex;justify-content:space-between;gap:8px;color:#ffcbd3;font-size:10px;font-weight:700}.ah-streak-foot span:last-child{color:#ffe5ac}.ah-streak-card [data-streak-status]{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
    @keyframes ah-streak-float{0%,100%{transform:rotateX(10deg) rotateY(-16deg) rotateZ(2deg) translateY(0)}50%{transform:rotateX(10deg) rotateY(-16deg) rotateZ(2deg) translateY(-5px)}}
    @media(max-width:480px){.ah-streak-card{min-height:174px;margin-left:12px;margin-right:12px;padding:16px 14px 13px}.ah-streak-art{width:105px;min-width:105px;transform:scale(.84);transform-origin:center right}.ah-streak-value strong{font-size:48px}.ah-streak-days{gap:5px}.ah-streak-day b{width:27px;height:27px}.ah-streak-foot{left:14px;right:14px}}
    @media(max-width:360px){.ah-streak-art{position:absolute;right:-15px;opacity:.55}.ah-streak-content{max-width:100%}.ah-streak-days{gap:4px}.ah-streak-day{font-size:8px}}
    @media(prefers-reduced-motion:reduce){.ah-streak-mascot{animation:none}}
  `;
  document.head.append(style);
})();
