(() => {
  'use strict';
  const escU = v => typeof esc === 'function' ? esc(String(v ?? '')) : String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const numU = v => Number.isFinite(Number(v)) ? Number(v) : 0;
  const nowU = () => Date.now();
  const toastU = m => typeof toast === 'function' ? toast(m) : window.alert(m);
  const settingsU = () => { CACHE.settings = CACHE.settings || {}; return CACHE.settings; };
  const gameU = () => { const s = settingsU(); const g = s.gamificationV3 = s.gamificationV3 || {}; g.gold = numU(g.gold); g.diamonds = numU(g.diamonds); g.inventory = g.inventory || {}; g.active = g.active || {}; g.transactions = Array.isArray(g.transactions) ? g.transactions : []; return g; };
  const saveSettingsU = async () => { await dbPut('settings', settingsU()); window.dispatchEvent(new CustomEvent('gamification:updated')); };

  function levelInfoU(total) {
    let level = 1, into = Math.max(0, numU(total));
    while (into >= level * 500 && level < 99) { into -= level * 500; level += 1; }
    const next = level * 500;
    return { level, into, next, percent: Math.min(100, Math.round(into / Math.max(1, next) * 100)) };
  }
  window.getXPLevelInfo = levelInfoU;

  async function addXPU(amount, source, label) {
    const s = settingsU();
    s.totalXpEarned = numU(s.totalXpEarned);
    s.xpBalance = numU(s.xpBalance);
    s.xpLedger = Array.isArray(s.xpLedger) ? s.xpLedger : [];
    const key = String(source || `xp-${nowU()}`);
    if (s.xpLedger.some(x => x.source === key)) return false;
    const value = Math.max(0, Math.round(numU(amount)));
    if (!value) return false;
    s.xpBalance += value;
    s.totalXpEarned += value;
    s.xpLedger.push({ id: `xp-${nowU()}-${Math.random().toString(36).slice(2, 7)}`, source: key, amount: value, label: label || 'Study XP', date: nowU() });
    s.xpLedger = s.xpLedger.slice(-3000);
    s.xpLevel = levelInfoU(s.totalXpEarned).level;
    await saveSettingsU();
    return true;
  }
  window.addStudyXP = addXPU;

  const extraRewardRows = [
    ['VIP Profile','Velvet Scholar Frame','A deep velvet frame for the profile header.','🟥'],['VIP Profile','Platinum Scholar Frame','A polished platinum frame for your profile.','⬜'],['VIP Profile','Diamond Halo','A diamond halo marks a premium scholar.','💎'],['VIP Profile','Emerald Monarch','An emerald crown for the active profile.','👑'],['VIP Profile','Sapphire Scholar','A sapphire crest for consistent learners.','🔷'],['VIP Profile','Golden Laurel','A gold laurel surrounds your avatar.','🏵️'],['VIP Profile','Pearl Academy','A pearl badge for calm mastery.','⚪'],['VIP Profile','Ruby Vanguard','A ruby accent celebrates bold progress.','🔴'],['VIP Profile','Amethyst Mentor','An amethyst profile emblem for mentors.','🟣'],['VIP Profile','Celestial Scholar','A celestial seal for the highest tier.','🌠'],
    ['Premium Theme','Emerald Glass','Soft emerald glass surfaces across the app.','🟢'],['Premium Theme','Sapphire Night','A calm sapphire night study palette.','🌌'],['Premium Theme','Rose Academy','A refined rose academic palette.','🌹'],['Premium Theme','Gold Library','Warm gold library accents and panels.','📚'],['Premium Theme','Cobalt Focus','Cobalt controls for a focused workspace.','🔵'],['Premium Theme','Mint Horizon','A bright mint horizon for daily study.','🌿'],['Premium Theme','Violet Study','A violet study space for revision.','🟪'],['Premium Theme','Crimson Focus','A crimson focus accent for exams.','🔺'],['Premium Theme','Cloud White','A clean white premium workspace.','☁️'],['Premium Theme','Aurora Scholar','An aurora gradient for the scholar dashboard.','🌈'],
    ['Study Effect','Focus Flame','A focus flame appears on active study sessions.','🔥'],['Study Effect','Calm Orbit','A calm orbit marks a live study streak.','🪐'],['Study Effect','Scholar Pulse','A pulse effect celebrates answered questions.','💚'],['Study Effect','Revision Spark','A spark appears when mistakes are reviewed.','✨'],['Study Effect','Deep Work Aura','An aura marks a long uninterrupted session.','🧠'],['Study Effect','Accuracy Beam','A beam celebrates a high-accuracy session.','🎯'],['Study Effect','Streak Comet','A comet appears on streak milestones.','☄️'],['Study Effect','Learning Bloom','A bloom appears after a completed target.','🌸'],['Study Effect','Focus Shield Plus','A shield marks a distraction-free session.','🛡️'],['Study Effect','Scholar Rain','A gentle reward rain follows a completed set.','🌧️'],
    ['Achievement','First 250 Questions','A milestone badge for 250 answered questions.','🥉'],['Achievement','First 750 Questions','A milestone badge for 750 answered questions.','🥈'],['Achievement','First 1500 Questions','A milestone badge for 1500 answered questions.','🥇'],['Achievement','Five Day Focus','Study on five different days.','📅'],['Achievement','Fourteen Day Focus','Study on fourteen different days.','🗓️'],['Achievement','Thirty Day Focus','Study on thirty different days.','🏆'],['Achievement','Accuracy 80','Reach 80% recorded accuracy.','✅'],['Achievement','Accuracy 95','Reach 95% recorded accuracy.','🎯'],['Achievement','Ten Topic Explorer','Study ten distinct topics.','🧭'],['Achievement','Mistake Mentor','Review and master ten mistakes.','🧠'],
    ['VIP Utility','Gold Wallet Frame','A premium frame for the Gold wallet.','🪙'],['VIP Utility','XP Level Crest','A crest showing your current XP level.','⚡'],['VIP Utility','Progress Ribbon','A ribbon for your lifetime progress.','🎗️'],['VIP Utility','Exam Champion Seal','A seal for completed mock exams.','🏅'],['VIP Utility','Question Bank Crown','A crown for Question Bank explorers.','📖'],['VIP Utility','Study Time Medal','A medal for accumulated study time.','⏱️'],['VIP Utility','Daily Goal Stamp','A stamp for completed daily goals.','✅'],['VIP Utility','Profile Spotlight','A spotlight accent for the VIP profile.','🔦'],['VIP Utility','Scholar Signature','A signature badge for the profile card.','✍️'],['VIP Utility','Ultimate VIP Seal','The final seal for a complete VIP collection.','♾️']
  ];
  const extraRewards = extraRewardRows.map((r, i) => ({ id: `upgrade-reward-${String(i + 1).padStart(3, '0')}`, category: r[0], name: r[1], description: r[2], icon: r[3], rarity: ['Rare','Epic','Legendary','Mythic','Cosmic'][i % 5], functionality: r[0] === 'Premium Theme' ? 'theme' : r[0] === 'Achievement' ? 'badge' : r[0] === 'VIP Profile' ? 'profile' : 'cosmetic', currency: 'Gold', price: 180 + (i % 10) * 70 + Math.floor(i / 10) * 120 }));
  function rewardCatalogU() {
    const old = Array.isArray(window.__phase1RewardCatalog) ? window.__phase1RewardCatalog : [];
    const merged = [...old, ...extraRewards];
    const seen = new Set();
    return merged.filter(r => { if (!r?.id || seen.has(r.id)) return false; seen.add(r.id); return true; }).map(r => ({ ...r, currency: 'Gold', price: Math.max(50, Math.round(numU(r.price) || 100)) }));
  }
  window.__upgradeExtraRewards = extraRewards;

  function rewardOwnedU(g, id) { return !!g.inventory?.[id]?.ownedAt; }
  function rewardActiveU(g, id) { return !!g.active?.[id]?.active; }
  async function buyRewardU(id) {
    const reward = rewardCatalogU().find(r => r.id === id); const g = gameU();
    if (!reward) return;
    if (rewardOwnedU(g, id)) { toastU('এই reward আগে থেকেই তোমার আছে।'); return; }
    if (g.gold < reward.price) { toastU(`আরও ${reward.price - g.gold} Gold প্রয়োজন।`); return; }
    g.gold -= reward.price;
    g.inventory[id] = { ownedAt: nowU(), used: 0, remaining: null };
    g.transactions.unshift({ id: `gold-buy-${nowU()}`, date: nowU(), gold: -reward.price, label: `-${reward.price} Gold — ${reward.name}`, source: `upgrade-purchase-${id}` });
    await saveSettingsU();
    toastU(`${reward.name} Gold দিয়ে কেনা হয়েছে।`);
    renderUpgradeRouteU();
  }
  async function equipRewardU(id) {
    const reward = rewardCatalogU().find(r => r.id === id); const g = gameU();
    if (!reward || !rewardOwnedU(g, id)) return;
    const active = rewardActiveU(g, id);
    if (active) g.active[id] = { ...g.active[id], active: false };
    else { g.active[id] = { active: true, activatedAt: nowU() }; }
    await saveSettingsU();
    toastU(active ? 'Reward unequipped' : 'Reward equipped');
    renderUpgradeRouteU();
  }
  window.upgradeBuyReward = buyRewardU;
  window.upgradeEquipReward = equipRewardU;

  function rewardCardU(r, g) {
    const owned = rewardOwnedU(g, r.id), active = rewardActiveU(g, r.id);
    const action = owned ? `<button class="u-reward-action ${active ? 'active' : ''}" onclick="upgradeEquipReward('${escU(r.id)}')">${active ? 'Equipped · Unequip' : 'Equip / Use'}</button>` : `<button class="u-reward-action" onclick="upgradeBuyReward('${escU(r.id)}')">Buy · ${r.price} Gold</button>`;
    return `<article class="u-reward-card ${String(r.rarity || '').toLowerCase()}" data-reward-search="${escU(`${r.name} ${r.category} ${r.description} ${r.rarity}`.toLowerCase())}"><div class="u-reward-head"><span class="u-rarity">${escU(r.rarity || 'Rare')}</span><span class="u-reward-icon">${escU(r.icon || '✦')}</span></div><h3>${escU(r.name)}</h3><p>${escU(r.description)}</p><div class="u-reward-meta"><span>${escU(r.category)}</span><b>${owned ? (active ? 'ACTIVE' : 'OWNED') : `${r.price} Gold`}</b></div>${action}</article>`;
  }
  function renderRewardShopU() {
    const s = settingsU(), g = gameU(), info = levelInfoU(s.totalXpEarned), catalog = rewardCatalogU();
    renderShell(`<div class="u-premium-page"><header class="u-vip-header"><button class="u-back" onclick="navigate('dashboard')">←</button><div><span>GOLD · XP · VIP REWARDS</span><h1>Reward Shop</h1><p>${catalog.length} rewards · সব purchase Gold দিয়ে</p></div></header><section class="u-wallet-grid"><div><small>🪙 Gold</small><b>${g.gold.toLocaleString()}</b><span>Available to spend</span></div><div><small>⚡ XP Level</small><b>${info.level}</b><span>${info.into}/${info.next} XP</span></div><div><small>💎 Diamond</small><b>${g.diamonds.toLocaleString()}</b><span>Collection gems</span></div><div><small>🎒 Owned</small><b>${Object.keys(g.inventory).filter(k => g.inventory[k]?.ownedAt).length}</b><span>Rewards owned</span></div></section><section class="u-xp-progress"><div class="u-row-between"><strong>Level ${info.level} progress</strong><span>${info.percent}%</span></div><div class="u-progress"><i style="width:${info.percent}%"></i></div><small>Study questions, complete exams and review mistakes to earn XP.</small></section><div class="u-shop-tools"><input id="uRewardSearch" type="search" placeholder="Search rewards..." oninput="filterUpgradeRewardsU(this.value)"><select id="uRewardCategory" onchange="filterUpgradeRewardsU()"><option value="">All categories</option>${[...new Set(catalog.map(r => r.category))].map(c => `<option value="${escU(c)}">${escU(c)}</option>`).join('')}</select></div><div class="u-reward-grid" id="uRewardGrid">${catalog.map(r => rewardCardU(r, g)).join('')}</div></div>`, { topbar: false });
  }
  window.filterUpgradeRewardsU = value => { const q = String(value ?? document.getElementById('uRewardSearch')?.value ?? '').toLowerCase().trim(); const c = document.getElementById('uRewardCategory')?.value || ''; document.querySelectorAll('#uRewardGrid [data-reward-search]').forEach(card => { const ok = (!q || card.dataset.rewardSearch.includes(q)) && (!c || card.querySelector('.u-reward-meta')?.textContent.includes(c)); card.hidden = !ok; }); };

  function renderVIPProfileU() {
    const s = settingsU(), g = gameU(), info = levelInfoU(s.totalXpEarned), stats = typeof computeLifetimeStats === 'function' ? computeLifetimeStats() : {}, streak = typeof computeStreak === 'function' ? computeStreak() : 0, catalog = rewardCatalogU(), owned = catalog.filter(r => rewardOwnedU(g, r.id)), active = owned.filter(r => rewardActiveU(g, r.id));
    const badges = owned.filter(r => r.functionality === 'badge' || r.category === 'Achievement').slice(0, 12);
    renderShell(`<div class="u-premium-page"><header class="u-vip-hero"><button class="u-back" onclick="navigate('dashboard')">←</button><div class="u-crown">♛</div><div><span>VIP SCHOLAR PROFILE</span><h1>${escU(g.profile?.name || s.userName || 'Scholar')}</h1><p>${escU(g.profile?.avatar || '🧑‍🎓')} · Level ${info.level} Scholar</p></div><div class="u-vip-pill">VIP</div></header><section class="u-vip-level"><div class="u-row-between"><div><small>XP LEVEL</small><strong>Level ${info.level}</strong></div><b>${s.xpBalance.toLocaleString()} XP</b></div><div class="u-progress"><i style="width:${info.percent}%"></i></div><div class="u-row-between"><span>${info.into.toLocaleString()} / ${info.next.toLocaleString()} XP to next level</span><span>${info.percent}%</span></div></section><section class="u-stat-grid"><div><small>Gold</small><b>🪙 ${g.gold.toLocaleString()}</b><span>Spendable balance</span></div><div><small>Questions</small><b>${stats.attempted || 0}</b><span>${stats.accuracy || 0}% accuracy</span></div><div><small>Study Streak</small><b>${streak} days</b><span>Keep going</span></div><div><small>Rewards</small><b>${owned.length}</b><span>${active.length} equipped</span></div></section><section class="u-vip-panel"><div class="u-row-between"><h2>VIP achievements</h2><button class="u-link" onclick="navigate('rewards')">Open Shop →</button></div><div class="u-badges">${badges.map(r => `<span title="${escU(r.description)}">${escU(r.icon)} ${escU(r.name)}</span>`).join('') || '<span class="u-muted">Reward Shop থেকে badge কিনলে এখানে দেখা যাবে।</span>'}</div></section><section class="u-vip-panel"><div class="u-row-between"><h2>Equipped rewards</h2><span>${active.length} active</span></div>${active.map(r => `<div class="u-equipped"><span>${escU(r.icon)} <b>${escU(r.name)}</b></span><button class="u-link" onclick="upgradeEquipReward('${escU(r.id)}')">Unequip</button></div>`).join('') || '<p class="u-muted">Reward Shop থেকে reward equip করো।</p>'}</section><button class="u-vip-main" onclick="navigate('rewards')">Open Gold Reward Shop · ${catalog.length} rewards</button></div>`, { topbar: false });
  }

  // In-place Question Bank search. It works for subject cards, topic cards and question cards without losing focus.
  function applyQuestionSearchU(value) {
    const q = String(value || '').toLocaleLowerCase().trim();
    const root = document.querySelector('.q-bank-container'); if (!root) return;
    const cards = [...root.querySelectorAll('[data-qnav-card], .q-card-v2')];
    let visible = 0;
    cards.forEach(card => { const text = (card.textContent || '').toLocaleLowerCase(); const ok = !q || text.includes(q); card.hidden = !ok; if (ok) visible++; });
    let empty = root.querySelector('[data-upgrade-search-empty]');
    if (!empty && cards.length) { empty = document.createElement('div'); empty.className = 'empty card'; empty.dataset.upgradeSearchEmpty = '1'; root.querySelector('.q-feed-body,.q-list-body')?.appendChild(empty); }
    if (empty) { empty.textContent = visible ? '' : 'কোনো মিল পাওয়া যায়নি।'; empty.hidden = visible > 0; }
  }
  window.applyQuestionBankSearch = applyQuestionSearchU;
  document.addEventListener('input', e => { const el = e.target; if (!(el instanceof HTMLInputElement) || el.type !== 'search') return; if (!el.closest('.q-bank-container')) return; setTimeout(() => applyQuestionSearchU(el.value), 0); setTimeout(() => applyQuestionSearchU(el.value), 260); }, true);

  // Study timer: only Exam running and Question Bank question feed count. No popup or visible overlay.
  const studyRoutesU = path => path === 'exam/running' || path.startsWith('question-bank/topic/');
  const currentPathU = () => (location.hash || '#dashboard').slice(1).split('?')[0] || 'dashboard';
  let timerPathU = '', lastTickU = nowU(), pendingMsU = 0, flushBusyU = false;
  async function flushStudyU() {
    if (flushBusyU || pendingMsU < 500) return;
    flushBusyU = true; const add = pendingMsU; pendingMsU = 0;
    try {
      const key = typeof todayKey === 'function' ? todayKey() : new Date().toISOString().slice(0, 10);
      let row = (CACHE.dailyStats || []).find(x => x.id === key);
      if (!row) row = { id: key, date: key, questions: 0, correct: 0, wrong: 0, exams: 0, timeMs: 0 };
      row.timeMs = numU(row.timeMs) + add;
      await dbPut('dailyStats', row);
      CACHE.dailyStats = (CACHE.dailyStats || []).filter(x => x.id !== key).concat(row);
    } catch (_) { pendingMsU += add; } finally { flushBusyU = false; }
  }
  function studyTickU() {
    const path = currentPathU(), t = nowU(), delta = Math.max(0, Math.min(5000, t - lastTickU)); lastTickU = t;
    if (path !== timerPathU) { timerPathU = path; pendingMsU = 0; }
    if (studyRoutesU(path) && document.visibilityState !== 'hidden') pendingMsU += delta;
    if (pendingMsU >= 5000) flushStudyU();
  }
  window.studyTimeTracker = { isActive: () => studyRoutesU(currentPathU()), flush: flushStudyU };
  setInterval(studyTickU, 1000);
  window.addEventListener('hashchange', () => { studyTickU(); flushStudyU(); });
  window.addEventListener('beforeunload', () => { studyTickU(); flushStudyU(); });

  // Earn XP from real answer events without touching question correctness.
  function installXPHooksU() {
    if (typeof window.selectTopicAnswer === 'function' && !window.selectTopicAnswer.__xpUpgrade) {
      const old = window.selectTopicAnswer;
      const wrapped = function(qid, idx) { const before = window.QuestionBankPracticeSession?.answers?.[qid]; const out = old.apply(this, arguments); const after = window.QuestionBankPracticeSession?.answers?.[qid]; if (!before && after) addXPU(after.correct ? 5 : 2, `answer-${qid}-${after.answeredAt || nowU()}`, after.correct ? 'Correct question answer' : 'Question attempted'); return out; };
      wrapped.__xpUpgrade = true; window.selectTopicAnswer = wrapped; try { selectTopicAnswer = wrapped; } catch (_) {}
    }
    if (typeof window.submitExam === 'function' && !window.submitExam.__xpUpgrade) {
      const oldSubmit = window.submitExam;
      const wrappedSubmit = async function() { const out = await oldSubmit.apply(this, arguments); const r = window.LastResult || window.CACHE?.examResults?.at(-1); if (r) addXPU(Math.max(0, numU(r.correct) * 5 + numU(r.wrong) * 1), `exam-xp-${r.id}`, 'Completed exam'); return out; };
      wrappedSubmit.__xpUpgrade = true; window.submitExam = wrappedSubmit; try { submitExam = wrappedSubmit; } catch (_) {}
    }
  }

  const uStyle = document.createElement('style');
  uStyle.id = 'feature-upgrade-2026-style';
  uStyle.textContent = `.u-premium-page{max-width:760px;margin:auto;padding:18px 14px 110px;color:var(--text)}.u-vip-header,.u-vip-hero{display:flex;align-items:flex-start;gap:13px;margin-bottom:16px}.u-vip-header>div:last-child,.u-vip-hero>div:nth-last-child(2){flex:1}.u-vip-header span,.u-vip-hero span{font-size:10px;letter-spacing:.16em;font-weight:900;color:#0f6b4f}.u-vip-header h1,.u-vip-hero h1{font-size:29px;margin:4px 0}.u-vip-header p,.u-vip-hero p{margin:0;color:#65716b}.u-back{border:0;border-radius:14px;background:#fff;color:#0f6b4f;font-size:24px;padding:8px 13px;cursor:pointer}.u-crown{font-size:42px;color:#c98a2c;line-height:1}.u-vip-pill{background:linear-gradient(135deg,#c98a2c,#f1d58b);color:#3c2600;font-weight:900;padding:7px 10px;border-radius:999px}.u-wallet-grid,.u-stat-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:14px 0}.u-wallet-grid>div,.u-stat-grid>div{background:#fff;border:1px solid rgba(15,107,79,.12);border-radius:18px;padding:13px;box-shadow:0 10px 28px rgba(23,58,43,.07)}.u-wallet-grid small,.u-wallet-grid b,.u-wallet-grid span,.u-stat-grid small,.u-stat-grid b,.u-stat-grid span{display:block}.u-wallet-grid b,.u-stat-grid b{font-size:20px;margin:5px 0;color:#0f6b4f}.u-wallet-grid span,.u-stat-grid span{font-size:10px;color:#65716b}.u-xp-progress,.u-vip-level{background:linear-gradient(145deg,#ecf8f2,#e1f1e9);border:1px solid rgba(15,107,79,.13);border-radius:20px;padding:16px;margin:12px 0}.u-row-between{display:flex;justify-content:space-between;align-items:center;gap:10px}.u-progress{height:10px;border-radius:999px;background:rgba(15,107,79,.14);overflow:hidden;margin:11px 0}.u-progress i{display:block;height:100%;border-radius:inherit;background:#0f6b4f}.u-xp-progress small{color:#65716b}.u-shop-tools{display:grid;grid-template-columns:2fr 1fr;gap:9px;margin:16px 0}.u-shop-tools input,.u-shop-tools select{width:100%;box-sizing:border-box;border:1px solid rgba(15,107,79,.16);border-radius:13px;background:#fff;color:var(--text);padding:12px;font-size:16px}.u-reward-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}.u-reward-card{background:#fff;border:1px solid rgba(15,107,79,.14);border-radius:18px;padding:14px;box-shadow:0 10px 28px rgba(23,58,43,.07);border-top:3px solid #0f6b4f}.u-reward-card.rare{border-color:#4e9cff}.u-reward-card.epic{border-color:#a868ff}.u-reward-card.legendary{border-color:#e99d24}.u-reward-card.mythic{border-color:#ed5368}.u-reward-card.cosmic{border-color:#48bdb7}.u-reward-card[hidden]{display:none}.u-reward-head,.u-reward-meta{display:flex;justify-content:space-between;align-items:center;gap:8px}.u-rarity{font-size:9px;font-weight:900;padding:5px 7px;border-radius:99px;background:#e8f4ee;color:#0f6b4f}.u-reward-icon{font-size:25px}.u-reward-card h3{font-size:15px;margin:10px 0 5px}.u-reward-card p{font-size:11px;color:#65716b;min-height:46px;line-height:1.45}.u-reward-meta{font-size:10px;color:#65716b}.u-reward-meta b{color:#0f6b4f}.u-reward-action,.u-vip-main{width:100%;border:0;border-radius:11px;background:#0f6b4f;color:#fff;padding:10px;margin-top:12px;font-weight:900;cursor:pointer}.u-reward-action.active{background:#c98a2c}.u-vip-panel{background:#fff;border:1px solid rgba(15,107,79,.13);border-radius:20px;padding:16px;margin:12px 0;box-shadow:0 10px 28px rgba(23,58,43,.06)}.u-vip-panel h2{font-size:18px;margin:0}.u-link{border:0;background:transparent;color:#0f6b4f;font-weight:900;cursor:pointer}.u-badges{display:flex;flex-wrap:wrap;gap:8px;margin-top:12px}.u-badges span{background:#e8f4ee;border-radius:10px;padding:8px;font-size:11px}.u-equipped{display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(15,107,79,.1);padding:10px 0;font-size:13px}.u-muted{color:#65716b;font-size:13px}.q-card-v2{border-radius:22px!important;border:1px solid rgba(15,107,79,.14)!important;box-shadow:0 10px 28px rgba(23,58,43,.07)!important;padding:20px!important;background:#fff!important}.q-card-v2 .q-text-v2{font-size:20px;line-height:1.55;font-weight:800}.q-card-v2 .q-opt-v2{min-height:56px;border-radius:15px;background:#fff}.q-card-v2 .q-explanation-v2{border-radius:16px;padding:16px}.q-card-v2 .q-card-footer{gap:8px}.q-card-v2 .q-footer-btn{border-radius:10px;padding:9px 11px}.mistake-row{border-radius:22px!important;border:1px solid rgba(15,107,79,.14)!important;border-left:5px solid #e06a6a!important;box-shadow:0 10px 28px rgba(23,58,43,.07)!important;padding:20px!important;background:#fff!important}.mistake-row.priority-high{border-left-color:#e06a6a!important}.mistake-row.priority-medium{border-left-color:#e6a13a!important}.mistake-row.priority-low{border-left-color:#4caf80!important}.mistake-row b{display:block;font-size:20px;line-height:1.55;color:var(--text)}.mistake-row .history-tool-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;padding:14px 0;margin-top:16px;border-top:1px solid rgba(15,107,79,.12);border-bottom:1px solid rgba(15,107,79,.12);font-size:11px;color:var(--sub)}.mistake-row .history-tool-stats span{background:#f1f8f4;border-radius:12px;padding:8px 7px;text-align:center}.mistake-row .btn{border-radius:12px!important;padding:9px 12px!important}.mistake-row .pill{border-radius:999px;padding:7px 9px}@media(max-width:680px){.u-wallet-grid,.u-stat-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.u-reward-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}@media(max-width:430px){.mistake-row .history-tool-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.mistake-row b{font-size:18px}.u-premium-page{padding-left:10px;padding-right:10px}.u-reward-grid{grid-template-columns:1fr}.u-shop-tools{grid-template-columns:1fr}.u-vip-header h1,.u-vip-hero h1{font-size:25px}}`;
  document.head.appendChild(uStyle);

  let oldRenderU = window.render;
  function renderUpgradeRouteU() { const p = (window.Router?.path || currentPathU()); if (p === 'rewards' || p === 'reward-shop') return renderRewardShopU(); if (p === 'profile') return renderVIPProfileU(); return oldRenderU.apply(this, arguments); }
  if (typeof oldRenderU === 'function' && !oldRenderU.__upgrade2026) { renderUpgradeRouteU.__upgrade2026 = true; window.render = renderUpgradeRouteU; try { render = renderUpgradeRouteU; } catch (_) {} }
  window.renderUpgradeRoute = renderUpgradeRouteU;
  function initU() { installXPHooksU(); if (typeof window.loadCache === 'function') setTimeout(installXPHooksU, 1200); }
  function reconcileUpgradeRouteU() { const p = currentPathU(); if (p !== 'rewards' && p !== 'reward-shop' && p !== 'profile') return; if (!document.querySelector('.u-premium-page')) renderUpgradeRouteU(); }
  window.addEventListener('hashchange', () => { setTimeout(reconcileUpgradeRouteU, 0); setTimeout(reconcileUpgradeRouteU, 450); setTimeout(reconcileUpgradeRouteU, 1200); });
  initU(); setInterval(installXPHooksU, 1500); setInterval(reconcileUpgradeRouteU, 700); setTimeout(reconcileUpgradeRouteU, 1250); setTimeout(reconcileUpgradeRouteU, 2200);
})();
