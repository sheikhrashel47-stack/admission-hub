/* Admission Hub — Reward Blueprint Batch 2 (Rewards 51–100)
   Additive effects only. The shop owns purchase state; this layer applies effects after activation.
*/
(() => {
  'use strict';
  const ACTIVE = () => new Set((document.body.dataset.bp200Active || '').split(',').filter(Boolean));
  const has = id => ACTIVE().has(id);
  const route = () => String(location.hash || '').replace(/^#/, '').split('?')[0].toLowerCase();
  const isStudy = () => /question-bank|exam|flash|mock|notes|mistake|dashboard|study|result|review/.test(route());
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const storeKey = 'admission_hub_reward_batch2_data';
  const readStore = () => { try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (_) { return {}; } };
  const writeStore = data => { try { localStorage.setItem(storeKey, JSON.stringify(data)); } catch (_) {} };
  const applyBodyStates = () => {
    const body = document.body;
    const states = {
      'r51-segmented-progress': has('reward-051'), 'r52-review-notes': has('reward-052'), 'r53-mistake-filter': has('reward-053'),
      'r54-checklist-overlay': has('reward-054'), 'r55-fast-toggle': has('reward-055'), 'r56-chapter-lens': has('reward-056'),
      'r57-revision-dot': has('reward-057'), 'r58-answer-focus': has('reward-058'), 'r59-score-graph': has('reward-059'),
      'r60-test-rewind': has('reward-060'), 'r61-topic-rail': has('reward-061'), 'r62-severity-flag': has('reward-062'),
      'r63-revision-stack': has('reward-063'), 'r64-completion-seal': has('reward-064'), 'r65-daily-frame': has('reward-065'),
      'r66-exam-strip': has('reward-066'), 'r67-recall-badge': has('reward-067'), 'r68-note-tabs': has('reward-068'),
      'r69-question-cloud': has('reward-069'), 'r70-quiet-theme': has('reward-070'), 'r71-score-hint': has('reward-071'),
      'r72-mistake-timeline': has('reward-072'), 'r73-mastery-meter': has('reward-073'), 'r74-formula-search': has('reward-074'),
      'r75-session-replay': has('reward-075'), 'r76-chapter-aura': has('reward-076'), 'r77-sequence-pin': has('reward-077'),
      'r78-better-missed-card': has('reward-078'), 'r79-sprint-banner': has('reward-079'), 'r80-topic-collapse': has('reward-080'),
      'r81-elite-result': has('reward-081'), 'r82-diamond-focus': has('reward-082'), 'r83-prestige-frame': has('reward-083'),
      'r84-master-sequence': has('reward-084'), 'r85-premium-reveal': has('reward-085'), 'r86-diamond-study-frame': has('reward-086'),
      'r87-elite-mistake': has('reward-087'), 'r88-streak-halo': has('reward-088'), 'r89-notes-glow': has('reward-089'),
      'r90-study-hud': has('reward-090'), 'r91-question-edge': has('reward-091'), 'r92-victory-review': has('reward-092'),
      'r93-precision-banner': has('reward-093'), 'r94-elite-mistake-frame': has('reward-094'), 'r95-premium-chapter': has('reward-095'),
      'r96-recall-trail': has('reward-096'), 'r97-prestige-tint': has('reward-097'), 'r98-badge-slot': has('reward-098'),
      'r99-focus-ring': has('reward-099'), 'r100-revision-tabs': has('reward-100')
    };
    Object.entries(states).forEach(([className, enabled]) => body.classList.toggle(className, enabled));
  };
  const addChecklist = () => {
    if (!has('reward-054') || !/dashboard|study/.test(route()) || $('.bp2-checklist-launch')) return;
    const host = $('.dashboard-v2, .p3-dashboard-v3, .page') || document.body;
    const button = document.createElement('button'); button.type = 'button'; button.className = 'bp2-checklist-launch'; button.textContent = '✓ Quick Study Checklist';
    button.addEventListener('click', () => {
      const data = readStore(); const items = Array.isArray(data.checklist) ? data.checklist : ['Water ready', 'Notes open', 'Timer set', 'Topic selected'];
      const modal = document.createElement('div'); modal.className = 'bp2-overlay';
      modal.innerHTML = `<div class="bp2-dialog"><button class="bp2-close" type="button">×</button><span class="bp2-eyebrow">PRE-STUDY RITUAL</span><h3>Quick Study Checklist</h3><p>শুরু করার আগে ছোট্ট প্রস্তুতি সম্পন্ন করুন।</p><div class="bp2-checklist">${items.map((item, index) => `<label><input type="checkbox" data-index="${index}"> <span>${item}</span></label>`).join('')}</div><button class="bp2-dialog-save" type="button">Save checklist</button></div>`;
      const close = () => modal.remove(); modal.querySelector('.bp2-close').addEventListener('click', close); modal.addEventListener('click', e => { if (e.target === modal) close(); });
      modal.querySelector('.bp2-dialog-save').addEventListener('click', () => { writeStore({...data, checklist: Array.from(modal.querySelectorAll('label span')).map(x => x.textContent.trim())}); close(); window.toast?.('Checklist saved'); });
      document.body.appendChild(modal);
    });
    host.prepend(button);
  };
  const addFastToggleBar = () => {
    if (!has('reward-055') || !/question-bank|exam|flash|mock/.test(route()) || $('.bp2-fast-toggle')) return;
    const host = $('.exam-toolbar, .mock-toolbar, .flash-toolbar, .p3-qb-toolbar, .page-header, .toolbar'); if (!host) return;
    const bar = document.createElement('div'); bar.className = 'bp2-fast-toggle'; bar.innerHTML = '<span>Quick settings</span><button type="button" data-toggle="timer">Timer</button><button type="button" data-toggle="shuffle">Shuffle</button><button type="button" data-toggle="hint">Hints</button>';
    bar.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { const key = button.dataset.toggle; const on = !button.classList.contains('is-on'); button.classList.toggle('is-on', on); document.body.dataset[`bp2${key}`] = on ? 'on' : 'off'; window.toast?.(`${key} ${on ? 'on' : 'off'}`); })); host.appendChild(bar);
  };
  const addExamStrip = () => {
    if (!has('reward-066') || !/exam|mock/.test(route()) || $('.bp2-exam-strip')) return;
    const host = $('.exam-toolbar, .mock-toolbar, .exam-header, .page-header, .toolbar'); if (!host) return;
    const timer = $('#examTimer, .timer, .timerbox')?.textContent?.trim() || 'Ready'; const strip = document.createElement('div'); strip.className = 'bp2-exam-strip'; strip.innerHTML = `<strong>EXAM MODE</strong><span>${timer}</span><span>Focused review</span>`; host.prepend(strip);
  };
  const addTopicRail = () => {
    if (!has('reward-061') || !/dashboard/.test(route()) || $('.bp2-topic-rail')) return;
    const cards = $$('.topic-card, .chapter-card, [class*="subject-card"]').slice(0, 8); if (!cards.length) return;
    const rail = document.createElement('div'); rail.className = 'bp2-topic-rail'; rail.innerHTML = `<strong>Pinned topics</strong>${cards.map((card, index) => `<button type="button" data-target="${index}">${(card.querySelector('h3,h4,strong')?.textContent || `Topic ${index + 1}`).trim()}</button>`).join('')}`;
    rail.querySelectorAll('button').forEach(button => button.addEventListener('click', () => cards[Number(button.dataset.target)]?.scrollIntoView({behavior:'smooth', block:'center'}))); (document.querySelector('.dashboard-v2, .p3-dashboard-v3, .page') || document.body).prepend(rail);
  };
  const addScoreGraph = () => {
    if (!has('reward-059') || !/dashboard/.test(route()) || $('.bp2-score-graph')) return;
    const host = $('.dashboard-v2, .p3-dashboard-v3, .page'); if (!host) return;
    const box = document.createElement('section'); box.className = 'bp2-score-graph'; box.innerHTML = '<div><strong>Score trend</strong><span>Recent performance</span></div><svg viewBox="0 0 300 74" role="img" aria-label="Score trend"><polyline points="0,60 55,48 110,53 165,30 220,36 300,14"></polyline><circle cx="300" cy="14" r="4"></circle></svg>'; host.prepend(box);
  };
  const addNoteTabs = () => {
    if (!has('reward-100') || !/notes/.test(route()) || $('.bp2-note-tabs')) return;
    const host = $('.notes-tool, .notes-page, .page'); if (!host) return;
    const tabs = document.createElement('div'); tabs.className = 'bp2-note-tabs'; tabs.innerHTML = '<button type="button" class="is-on">Concept</button><button type="button">Formula</button><button type="button">Mistakes</button>';
    tabs.querySelectorAll('button').forEach(button => button.addEventListener('click', () => { tabs.querySelectorAll('button').forEach(x => x.classList.remove('is-on')); button.classList.add('is-on'); })); host.prepend(tabs);
  };
  const enhanceCards = () => {
    if (!isStudy()) return;
    if (has('reward-057')) $$('.mistake-card, .question-card, .p3-qb-question-card, .saved-item').forEach(card => card.classList.add('bp2-revision-due'));
    if (has('reward-062')) $$('.mistake-card').forEach(card => { if (!card.querySelector('.bp2-severity')) { const flag = document.createElement('span'); flag.className = 'bp2-severity'; flag.textContent = 'Priority'; card.prepend(flag); } });
    if (has('reward-064')) $$('.chapter-card, .topic-card').forEach(card => { if (/complete|100%|finished|done/i.test(card.textContent) && !card.querySelector('.bp2-seal')) { const seal = document.createElement('span'); seal.className = 'bp2-seal'; seal.textContent = '✓ Complete'; card.appendChild(seal); } });
    if (has('reward-067') && !$('.bp2-recall-badge') && /question-bank|flash/.test(route())) { const badge = document.createElement('span'); badge.className = 'bp2-recall-badge'; badge.textContent = 'Recall streak ready'; ($('.page-header, .toolbar, .topbar') || document.body).appendChild(badge); }
  };
  const enhance = () => { applyBodyStates(); addChecklist(); addFastToggleBar(); addExamStrip(); addTopicRail(); addScoreGraph(); addNoteTabs(); enhanceCards(); };
  const style = document.createElement('style'); style.textContent = `
    .r51-segmented-progress .progress,.r51-segmented-progress [class*="progress"]{background-image:linear-gradient(90deg,#0f6b4f 0 35%,#69b995 35% 68%,#dbeee6 68%);background-size:100% 100%;background-repeat:no-repeat}.r56-chapter-lens .chapter-card:first-of-type,.r56-chapter-lens .topic-card:first-of-type{transform:scale(1.015);box-shadow:0 0 0 3px rgba(112,76,193,.12),0 14px 26px rgba(112,76,193,.1)}.r57-revision-dot .mistake-card:after,.r57-revision-dot .saved-item:after{content:'';display:inline-block;width:7px;height:7px;margin-left:7px;border-radius:50%;background:#ec4899;box-shadow:0 0 0 4px rgba(236,72,153,.12)}.r62-severity-flag .mistake-card{border-left:4px solid #f59e0b!important}.r65-daily-frame .daily-summary,.r65-daily-frame .study-summary,.r65-daily-frame .today-card{outline:2px solid rgba(245,158,11,.35);outline-offset:3px;border-radius:16px}.r66-exam-strip .exam-toolbar,.r66-exam-strip .mock-toolbar{box-shadow:0 4px 0 rgba(15,107,79,.1)}.r70-quiet-theme{--bg:#f4f1ea!important;--card:#fffdf7!important;--text:#2a302d!important;--sub:#77766f!important;--line:#e4dfd2!important}.r70-quiet-theme .card,.r70-quiet-theme article{box-shadow:0 8px 22px rgba(77,67,47,.08)}.r73-mastery-meter .progress,.r73-mastery-meter [class*="progress"]{box-shadow:inset 0 0 0 2px rgba(112,76,193,.16),0 0 18px rgba(112,76,193,.1)}.r76-chapter-aura .chapter-card,.r76-chapter-aura .topic-card{box-shadow:0 0 0 3px rgba(112,76,193,.1),0 12px 28px rgba(112,76,193,.12)}.r78-better-missed-card .mistake-card{border-radius:20px;background:linear-gradient(135deg,#fff7f8,#fff)}.r79-sprint-banner .goal,.r79-sprint-banner .goal-card{border-top:4px solid #ec4899}.r81-elite-result .result-card,.r81-elite-result .result-summary{background:linear-gradient(135deg,#fff,#f8f0ff);border:1px solid rgba(112,76,193,.24)}.r82-diamond-focus .p3-qb-question-card,.r82-diamond-focus .question-card,.r82-diamond-focus .flash-card{box-shadow:0 0 0 2px rgba(34,211,238,.22),0 14px 28px rgba(34,211,238,.1)}.r83-prestige-frame .card,.r83-prestige-frame article{border-image:linear-gradient(135deg,#f59e0b,#8b5cf6) 1}.r86-diamond-study-frame .study-summary,.r86-diamond-study-frame .daily-summary{border:2px solid rgba(34,211,238,.34)}.r87-elite-mistake .mistake-card{box-shadow:0 0 0 2px rgba(236,72,153,.18),0 14px 28px rgba(236,72,153,.1)}@keyframes bpHalo{50%{box-shadow:0 0 0 8px rgba(245,158,11,.1),0 0 24px rgba(245,158,11,.22)}}.r88-streak-halo .streak,.r88-streak-halo .streak-badge{animation:bpHalo 2.2s ease-in-out infinite;border-radius:50%}.r89-notes-glow .notes-card,.r89-notes-glow .note-card{box-shadow:0 0 0 2px rgba(139,92,246,.15),0 10px 26px rgba(139,92,246,.1)}.r90-study-hud .topbar,.r90-study-hud .page-header{background:linear-gradient(90deg,rgba(15,107,79,.08),rgba(112,76,193,.1));border-radius:14px}.r91-question-edge .question-card,.r91-question-edge .p3-qb-question-card{border-right:4px solid #8b5cf6!important}.r92-victory-review .result-summary,.r92-victory-review .result-card{border-top:4px solid #f59e0b}.r93-precision-banner .result-actions{background:rgba(15,107,79,.06);border-radius:14px;padding:10px}.r94-elite-mistake-frame .mistake-card{border:2px solid rgba(236,72,153,.25)!important}.r95-premium-chapter .chapter-card,.r95-premium-chapter .topic-card{border-bottom:4px solid #f59e0b}.r96-recall-trail .flash-card,.r96-recall-trail .question-card{background-image:linear-gradient(135deg,rgba(34,211,238,.08),transparent 48%)}.r97-prestige-tint .correct{background:#e8e0ff!important;color:#5439a3!important}.r98-badge-slot .profile,.r98-badge-slot .profile-card{outline:2px dashed rgba(245,158,11,.3)}.r99-focus-ring .focus-score,.r99-focus-ring [class*="focus-score"]{box-shadow:0 0 0 5px rgba(34,211,238,.12)}.bp2-checklist-launch{display:inline-flex;align-items:center;gap:6px;margin:0 0 12px;padding:10px 13px;border:0;border-radius:12px;background:linear-gradient(135deg,#0f6b4f,#704cc1);color:#fff;font-weight:900;box-shadow:0 8px 18px rgba(15,107,79,.16)}.bp2-fast-toggle{display:flex;flex-wrap:wrap;align-items:center;gap:7px;margin-top:10px;padding:8px 10px;border-radius:12px;background:rgba(112,76,193,.08);font-size:11px;font-weight:900}.bp2-fast-toggle span{margin-right:auto;color:#704cc1}.bp2-fast-toggle button{border:0;border-radius:999px;padding:6px 9px;background:#fff;color:#6d7d76;font-size:10px;font-weight:900}.bp2-fast-toggle button.is-on{background:#0f6b4f;color:#fff}.bp2-exam-strip{display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 12px;border-radius:12px;background:linear-gradient(90deg,#18332a,#0f6b4f);color:#fff;font-size:11px}.bp2-exam-strip strong{letter-spacing:.08em}.bp2-exam-strip span{opacity:.82}.bp2-topic-rail{display:flex;gap:7px;align-items:center;flex-wrap:wrap;margin:0 0 14px;padding:10px;border-radius:14px;background:rgba(112,76,193,.08)}.bp2-topic-rail strong{font-size:11px;color:#704cc1}.bp2-topic-rail button,.bp2-note-tabs button{border:0;border-radius:999px;padding:6px 9px;background:#fff;color:#5e7068;font-size:10px;font-weight:900}.bp2-topic-rail button:hover,.bp2-note-tabs button.is-on{background:#704cc1;color:#fff}.bp2-score-graph{margin:0 0 14px;padding:12px 14px;border-radius:16px;background:linear-gradient(135deg,#fff,#f1edff);border:1px solid rgba(112,76,193,.18)}.bp2-score-graph>div{display:flex;justify-content:space-between;gap:10px}.bp2-score-graph strong{font-size:13px}.bp2-score-graph span{font-size:10px;color:#72847d}.bp2-score-graph svg{display:block;width:100%;height:74px;margin-top:8px}.bp2-score-graph polyline{fill:none;stroke:#704cc1;stroke-width:4;stroke-linecap:round;stroke-linejoin:round}.bp2-score-graph circle{fill:#ec4899}.bp2-note-tabs{display:flex;gap:7px;margin:0 0 12px;padding:5px;border-radius:14px;background:rgba(112,76,193,.08)}.bp2-note-tabs button{flex:1}.bp2-revision-due{position:relative}.bp2-severity{display:inline-block;margin:0 0 6px;padding:3px 7px;border-radius:999px;background:#fff2ce;color:#92703a;font-size:9px;font-weight:900}.bp2-seal{display:inline-block;margin:8px 0 0;padding:4px 8px;border-radius:999px;background:#e5f7ee;color:#0f6b4f;font-size:9px;font-weight:900}.bp2-recall-badge{display:inline-block;margin:6px;padding:5px 8px;border-radius:999px;background:#e8e0ff;color:#5439a3;font-size:10px;font-weight:900}.bp2-overlay{position:fixed;z-index:2147482900;inset:0;display:grid;place-items:center;padding:18px;background:rgba(11,24,20,.58);backdrop-filter:blur(8px)}.bp2-dialog{width:min(420px,100%);padding:22px;border-radius:24px;background:#fff;box-shadow:0 25px 70px rgba(0,0,0,.3);position:relative}.bp2-close{position:absolute;right:12px;top:10px;border:0;background:#eef7f2;color:#0f6b4f;width:34px;height:34px;border-radius:50%;font-size:23px}.bp2-eyebrow{font-size:10px;font-weight:900;color:#704cc1;letter-spacing:.1em}.bp2-dialog h3{margin:7px 0 4px}.bp2-dialog p{font-size:12px;color:#688077}.bp2-checklist{display:grid;gap:9px;margin:16px 0}.bp2-checklist label{display:flex;gap:8px;align-items:center;padding:10px;border-radius:12px;background:#f4f8f6;font-size:12px}.bp2-dialog-save{width:100%;padding:11px;border:0;border-radius:12px;background:#0f6b4f;color:#fff;font-weight:900}
  `; document.head.appendChild(style);
  const observer = new MutationObserver(() => { clearTimeout(window.__bp2Timer); window.__bp2Timer = setTimeout(enhance, 70); });
  observer.observe(document.body, {childList:true, subtree:true}); window.addEventListener('hashchange', () => setTimeout(enhance, 0)); setInterval(enhance, 1400); enhance();
})();
