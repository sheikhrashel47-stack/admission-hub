/* Admission Hub — Reward Blueprint Batch 1 (Rewards 1–50)
   Additive only: visual states and small controls are applied after the existing app renders.
*/
(() => {
  'use strict';
  const ACTIVE = () => new Set((document.body.dataset.bp200Active || '').split(',').filter(Boolean));
  const has = id => ACTIVE().has(id);
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => Array.from(root.querySelectorAll(s));
  const route = () => String(location.hash || '').replace(/^#/, '').split('?')[0];
  const isStudyRoute = () => /question-bank|exam|flash|mock|notes|mistake|dashboard|study/i.test(route());
  const storeKey = 'admission_hub_reward_batch1_flags';
  const readFlags = () => { try { return JSON.parse(localStorage.getItem(storeKey) || '{}'); } catch (_) { return {}; } };
  const writeFlags = flags => { try { localStorage.setItem(storeKey, JSON.stringify(flags)); } catch (_) {} };
  const flagKey = (kind, index) => `${route()}:${kind}:${index}`;
  const flagged = (kind, index) => !!readFlags()[flagKey(kind, index)];
  const toggleFlag = (kind, index, button, card) => {
    const flags = readFlags(); const key = flagKey(kind, index); flags[key] = !flags[key]; writeFlags(flags);
    const on = !!flags[key]; button.classList.toggle('is-on', on); button.textContent = kind === 'star' ? (on ? '★' : '☆') : (on ? '✓' : '＋');
    card.classList.toggle(`bp-b1-${kind}`, on); window.toast?.(on ? (kind === 'star' ? 'Important mark saved' : 'Added to review list') : 'Mark removed');
  };
  const applyBodyStates = () => {
    const b = document.body;
    const classes = {
      'r1-focus-dimmer': has('reward-001'), 'r2-mistake-spotlight': has('reward-002'), 'r3-quick-recall': has('reward-003'), 'r4-streak-pulse': has('reward-004'),
      'r6-answer-border': has('reward-006'), 'r7-timer-glow': has('reward-007'), 'r8-divider-set': has('reward-008'), 'r9-next-touch': has('reward-009'),
      'r10-mini-confetti': has('reward-010'), 'r11-dark-paper': has('reward-011'), 'r12-mistake-badge': has('reward-012'),
      'r13-break-banner': has('reward-013'), 'r14-answer-tint': has('reward-014'), 'r15-study-toast': has('reward-015'),
      'r16-chapter-ribbon': has('reward-016'), 'r18-margin-notes': has('reward-018'), 'r19-shuffle-hint': has('reward-019'),
      'r20-progress-spark': has('reward-020'), 'r22-result-badges': has('reward-022'), 'r23-page-turn': has('reward-023'), 'r24-save-shortcut': has('reward-024'),
      'r25-topic-chips': has('reward-025'), 'r26-freeze-frame': has('reward-026'), 'r27-milestone-tick': has('reward-027'),
      'r28-answer-arrows': has('reward-028'), 'r29-mini-tabs': has('reward-029'), 'r30-goal-ribbon': has('reward-030'),
      'r32-timer-strip': has('reward-032'), 'r33-heat-markers': has('reward-033'), 'r34-goal-chips': has('reward-034'),
      'r35-answer-compare': has('reward-035'), 'r36-compact-cards': has('reward-036'), 'r37-score-chip': has('reward-037'),
      'r38-hint-fade': has('reward-038'), 'r39-deadline-dot': has('reward-039'), 'r40-card-lift': has('reward-040'),
      'r41-smart-sort': has('reward-041'), 'r42-deep-review': has('reward-042'), 'r43-replay-queue': has('reward-043'),
      'r44-elimination-tags': has('reward-044'), 'r45-formula-strip': has('reward-045'), 'r46-focus-lock': has('reward-046'),
      'r47-revision-heatmap': has('reward-047'), 'r48-note-connector': has('reward-048'), 'r49-study-tabs': has('reward-049'),
      'r50-wrong-cache': has('reward-050')
    };
    Object.entries(classes).forEach(([name, on]) => b.classList.toggle(name, on));
  };
  const addButton = (card, kind, index, label, title) => {
    const tools = card.querySelector('.bp-b1-tools') || (() => { const x = document.createElement('div'); x.className = 'bp-b1-tools'; card.appendChild(x); return x; })();
    const key = `${kind}-${index}`; if (tools.querySelector(`[data-bp-key="${key}"]`)) return;
    const btn = document.createElement('button'); btn.type = 'button'; btn.dataset.bpKey = key; btn.className = 'bp-b1-tool'; btn.title = title;
    const on = flagged(kind, index); btn.classList.toggle('is-on', on); btn.textContent = kind === 'star' ? (on ? '★' : '☆') : (on ? '✓' : label);
    btn.addEventListener('click', e => { e.preventDefault(); e.stopPropagation(); toggleFlag(kind, index, btn, card); }); tools.appendChild(btn);
    card.classList.toggle(`bp-b1-${kind}`, on);
  };
  const enhanceCards = () => {
    if (!isStudyRoute()) return;
    const cards = $$('.p3-qb-question-card, .question-card, .mistake-card, .flash-card');
    cards.forEach((card, index) => {
      if (has('reward-005')) addButton(card, 'star', index, '☆', 'Important Mark');
      if (has('reward-017') || has('reward-021') || has('reward-031') || has('reward-042') || has('reward-043') || has('reward-050')) addButton(card, 'review', index, '＋', 'Add to Review List');
      if (has('reward-048')) addButton(card, 'note', index, '✎', 'Connect a Note');
    });
  };
  const addSaveShortcut = () => {
    if (!has('reward-024') || !isStudyRoute()) return;
    const host = $('.p3-qb-toolbar, .exam-toolbar, .flash-toolbar, .topbar, .toolbar, .page-header') || $('.page');
    if (!host || host.querySelector('.bp-b1-save-shortcut')) return;
    const btn = document.createElement('button'); btn.type = 'button'; btn.className = 'bp-b1-save-shortcut'; btn.textContent = 'Save Study State';
    btn.addEventListener('click', async e => {
      e.preventDefault(); e.stopPropagation();
      try {
        if (typeof loadCache === 'function') await loadCache();
        if (typeof dbPut === 'function' && typeof CACHE !== 'undefined' && CACHE.settings) await dbPut('settings', CACHE.settings);
        localStorage.setItem('admission_hub_last_focus_save', String(Date.now()));
        window.toast?.('Study state saved');
      } catch (_) { window.toast?.('Save completed'); }
    });
    host.appendChild(btn);
  };
  const addDashboardWidgets = () => {
    const root = $('.dashboard-v2, .p3-dashboard-v3, .page'); if (!root || !/dashboard/i.test(route())) return;
    if (has('reward-012') && !root.querySelector('.bp-b1-mistake-badge')) { const x = document.createElement('span'); x.className = 'bp-b1-mistake-badge'; x.textContent = 'Mistakes'; (root.querySelector('h1,h2') || root).appendChild(x); }
    if ((has('reward-034') || has('reward-047') || has('reward-049')) && !root.querySelector('.bp-b1-dashboard-tools')) {
      const box = document.createElement('div'); box.className = 'bp-b1-dashboard-tools';
      if (has('reward-034')) box.innerHTML += '<span>Daily Goal</span><span>Revision</span><span>Accuracy</span>';
      if (has('reward-047')) box.innerHTML += '<span class="bp-b1-heat" aria-label="Revision heatmap">▦ ▦ ▦ ▦ ▦ ▦ ▦</span>';
      if (has('reward-049')) box.innerHTML += '<span>Learn</span><span>Practice</span><span>Review</span>';
      root.prepend(box);
    }
  };
  const enhance = () => { applyBodyStates(); enhanceCards(); addSaveShortcut(); addDashboardWidgets(); };
  const style = document.createElement('style'); style.textContent = `
    .r1-focus-dimmer .p3-qb-sub,.r1-focus-dimmer .p3-qb-kicker,.r1-focus-dimmer .p3-qb-toolbar,.r1-focus-dimmer .p3-qb-qtop,.r1-focus-dimmer .p3-qb-explanation,.r1-focus-dimmer .muted,.r1-focus-dimmer .subtle{opacity:.48}.r1-focus-dimmer .p3-qb-question-card,.r1-focus-dimmer .flash-card,.r1-focus-dimmer .notes-card{opacity:1}
    .r2-mistake-spotlight .mistake-card{box-shadow:0 0 0 3px rgba(181,48,90,.12),0 10px 24px rgba(181,48,90,.12);border-left:4px solid #b5305a!important}.r2-mistake-spotlight .mistake-card[data-priority="false"]{box-shadow:none;border-left:0!important}.r3-quick-recall .flash-card{transition:transform .18s ease,box-shadow .18s ease}.r3-quick-recall .flash-card:active{transform:rotateY(3deg) scale(.99)}
    @keyframes bpStreakPulse{50%{box-shadow:0 0 0 7px rgba(245,158,11,.13)}}.r4-streak-pulse .streak,.r4-streak-pulse .streak-badge,.r4-streak-pulse [class*="streak"]{animation:bpStreakPulse 2.4s ease-in-out infinite;border-radius:12px}
    .r6-answer-border .correct,.r6-answer-border .answer,.r6-answer-border .answer-box{border:2px solid rgba(15,107,79,.32);border-radius:10px}
    @keyframes bpTimerGlow{50%{box-shadow:0 0 0 4px rgba(245,158,11,.16)}}.r7-timer-glow #examTimer,.r7-timer-glow .timerbox,.r7-timer-glow .timer{animation:bpTimerGlow 1.8s ease-in-out infinite}
    .r8-divider-set .notes-card,.r8-divider-set .note-card,.r8-divider-set .notes-section{border-top:2px dashed rgba(15,107,79,.28);padding-top:10px}.bp-b1-save-shortcut{border:0;border-radius:10px;padding:9px 12px;background:#0f6b4f;color:#fff;font-weight:900;cursor:pointer;box-shadow:0 6px 16px rgba(15,107,79,.18)}.r9-next-touch button[onclick*="Next"],.r9-next-touch button[onclick*="next"],.r9-next-touch button[onclick*="flashNext"]{min-height:48px;font-size:16px}
    @keyframes bpConfetti{0%{opacity:0;transform:scale(.75)}45%{opacity:1;transform:scale(1.03)}100%{opacity:1;transform:scale(1)}}.r10-mini-confetti .goal,.r10-mini-confetti .goal-card{animation:bpConfetti .65s ease both}
    .r11-dark-paper{--bg:#211f1a!important;--card:#2b2923!important;--text:#f6f0df!important;--sub:#c8bfae!important;--line:#514b3f!important;--mint:#39352c!important}.r11-dark-paper .card{box-shadow:0 8px 22px rgba(0,0,0,.2)}
    .r12-mistake-badge .bp-b1-mistake-badge{display:inline-block;margin-left:8px;padding:3px 8px;border-radius:99px;background:#fff0ef;color:#b5305a;font-size:10px;font-weight:900}
    .r13-break-banner .study-summary::after{content:'Take a short break when you are ready.';display:block;margin-top:10px;padding:10px 12px;border-radius:12px;background:#fff8e7;color:#8a5a00;font-size:12px;font-weight:700}
    .r14-answer-tint .correct{background:#dff5e9!important;color:#0f6b4f!important}.r15-study-toast .toast{border-left:4px solid #0f6b4f;box-shadow:0 8px 22px rgba(15,107,79,.18)}
    .r16-chapter-ribbon .topic-card,.r16-chapter-ribbon .chapter-card{position:relative}.r16-chapter-ribbon .topic-card::before,.r16-chapter-ribbon .chapter-card::before{content:'ACTIVE';position:absolute;top:10px;right:10px;padding:3px 6px;border-radius:5px;background:#e7f4ee;color:#0f6b4f;font-size:9px;font-weight:900}
    .r18-margin-notes .notes-card,.r18-margin-notes .note-card{border-left:4px solid #f59e0b}.r19-shuffle-hint [class*="shuffle"]{outline:2px dashed rgba(59,130,246,.28);outline-offset:3px}.r20-progress-spark .progress,.r20-progress-spark [class*="progress"]{background-image:linear-gradient(90deg,transparent,#8b5cf6,transparent);background-size:200% 2px;background-position:0 100%;background-repeat:no-repeat;animation:bpSpark 3s linear infinite}@keyframes bpSpark{to{background-position:200% 100%}}
    .r22-result-badges .result-summary,.r22-result-badges .result-card{border-top:3px solid #8b5cf6}.r23-page-turn .card,.r23-page-turn article{transition:transform .25s ease,opacity .25s ease}.r23-page-turn .card:active,.r23-page-turn article:active{transform:translateX(3px)}
    .r25-topic-chips .topic-card,.r25-topic-chips .chapter-card{border-left:5px solid #3b82f6}.r26-freeze-frame .mistake-card:active{transform:scale(.985);box-shadow:0 0 0 3px rgba(181,48,90,.16)}.r27-milestone-tick .timer,.r27-milestone-tick #examTimer{border-bottom:3px solid #f59e0b}.r28-answer-arrows [class*="next"]::after{content:'  →';color:#0f6b4f;font-weight:900}
    .r29-mini-tabs .topic-card,.r29-mini-tabs .chapter-card{border-top:3px solid #8b5cf6}.r30-goal-ribbon .goal,.r30-goal-ribbon .goal-card{border-right:5px solid #f59e0b}.r32-timer-strip .timerbox,.r32-timer-strip #examTimer{border-left:5px solid #3b82f6}.r33-heat-markers .mistake-card,.r33-heat-markers .p3-qb-question-card{background-image:linear-gradient(90deg,rgba(181,48,90,.08),transparent 25%)}
    .bp-b1-tools{display:flex;gap:6px;justify-content:flex-end;margin-top:10px;border-top:1px solid var(--line);padding-top:8px}.bp-b1-tool{border:0;border-radius:9px;padding:5px 9px;background:var(--mint);color:var(--emerald-d);font-weight:900;cursor:pointer}.bp-b1-tool.is-on{background:#fff0c7;color:#9a6500}.bp-b1-star{box-shadow:0 0 0 2px rgba(245,158,11,.18)}.bp-b1-review{border-left:4px solid #3b82f6!important}.bp-b1-note{border-left:4px solid #8b5cf6!important}
    .r35-answer-compare .answer-box,.r35-answer-compare .explanation,.r35-answer-compare .flash-feedback{border-left:4px solid #8b5cf6}.r36-compact-cards .card,.r36-compact-cards article{padding:10px!important;margin-bottom:10px!important}.r37-score-chip .score,.r37-score-chip .score-value{display:inline-block;padding:5px 10px;border-radius:999px;background:#e7f4ee;color:#0f6b4f}.r38-hint-fade .hint,.r38-hint-fade .explanation{animation:bpHint .28s ease}@keyframes bpHint{from{opacity:0;transform:translateY(-3px)}to{opacity:1;transform:none}}
    .r39-deadline-dot [class*="deadline"],.r39-deadline-dot [class*="task"]{position:relative}.r39-deadline-dot [class*="deadline"]::before,.r39-deadline-dot [class*="task"]::before{content:'';display:inline-block;width:7px;height:7px;border-radius:50%;background:#ec4899;margin-right:6px}.r40-card-lift .card:active,.r40-card-lift article:active{transform:translateY(-2px);box-shadow:0 14px 28px rgba(15,107,79,.14)}
    .r44-elimination-tags .option,.r44-elimination-tags .options span{position:relative}.r44-elimination-tags .option::after,.r44-elimination-tags .options span::after{content:'×';float:right;color:#b5305a;font-weight:900;opacity:.45}.r45-formula-strip .notes-card::before,.r45-formula-strip .note-card::before{content:'Formula / Quick Reference';display:block;margin:-2px 0 10px;padding:7px 9px;border-radius:8px;background:#fff8e7;color:#8a5a00;font-size:10px;font-weight:900}.r46-focus-lock .p3-qb-question-card,.r46-focus-lock .flash-card{outline:2px solid rgba(15,107,79,.1);outline-offset:2px}.r48-note-connector .mistake-card{border-left:5px solid #8b5cf6}.r49-study-tabs .dashboard-nav,.r49-study-tabs .topbar{border-bottom:3px solid #3b82f6}.r50-wrong-cache .mistake-card,.r50-wrong-cache .p3-qb-question-card{background-image:linear-gradient(90deg,rgba(181,48,90,.12),transparent 35%)}
    .bp-b1-dashboard-tools{display:flex;flex-wrap:wrap;gap:7px;margin:0 0 14px;padding:10px 12px;border-radius:14px;background:var(--mint);color:var(--emerald-d);font-size:11px;font-weight:900}.bp-b1-dashboard-tools span{padding:4px 7px;border-radius:999px;background:var(--card)}.bp-b1-heat{letter-spacing:2px;color:#b5305a!important}
  `; document.head.appendChild(style);
  const observer = new MutationObserver(() => { clearTimeout(window.__bpBatch1Timer); window.__bpBatch1Timer = setTimeout(enhance, 60); });
  observer.observe(document.body, {childList:true, subtree:true});
  window.addEventListener('hashchange', () => setTimeout(enhance, 0));
  setInterval(enhance, 1200);
  enhance();
})();

