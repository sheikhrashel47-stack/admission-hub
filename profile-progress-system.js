(() => {
  'use strict';

  const PROFILE_VERSION = 1;
  const TAB_KEYS = ['overview', 'performance', 'subjects', 'topics', 'mistakes', 'achievements', 'customize'];
  const PROFILE_TABS = {
    overview: 'Overview',
    performance: 'Performance',
    subjects: 'Subjects',
    topics: 'Topics',
    mistakes: 'Mistakes',
    achievements: 'Achievements',
    customize: 'Customize'
  };
  const TITLE_UNLOCKS = [
    { id: 'beginner', label: 'Beginner', level: 1 },
    { id: 'learner', label: 'Learner', level: 5 },
    { id: 'consistent-student', label: 'Consistent Student', level: 10 },
    { id: 'serious-candidate', label: 'Serious Candidate', level: 20 },
    { id: 'elite-candidate', label: 'Elite Candidate', level: 30 },
    { id: 'admission-warrior', label: 'Admission Warrior', level: 40 },
    { id: 'admission-legend', label: 'Admission Legend', level: 50 }
  ];
  const FRAME_UNLOCKS = [
    { id: 'basic', label: 'Basic Frame', level: 1, icon: '◌' },
    { id: 'emerald', label: 'Emerald Frame', level: 5, icon: '✦' },
    { id: 'gold', label: 'Gold Frame', level: 15, icon: '◇' },
    { id: 'diamond', label: 'Diamond Frame', level: 25, icon: '◆' },
    { id: 'cosmic', label: 'Cosmic Frame', level: 35, icon: '✧' },
    { id: 'elite', label: 'Elite Frame', level: 45, icon: '♛' }
  ];
  const PROFILE_THEMES = [
    { id: 'academic', label: 'Academic', level: 1, accent: '#0f6b4f' },
    { id: 'emerald', label: 'Emerald', level: 5, accent: '#13a879' },
    { id: 'golden', label: 'Golden Scholar', level: 15, accent: '#b27b17' },
    { id: 'cosmic', label: 'Cosmic Focus', level: 30, accent: '#6b5bd6' },
    { id: 'ultimate', label: 'Ultimate Identity', level: 50, accent: '#c75491' }
  ];
  const PROFILE_BACKGROUNDS = [
    { id: 'mint', label: 'Mint Garden', level: 1, color: '#effaf5', accent: '#dff5ed' },
    { id: 'leaf', label: 'Leaf Study', level: 5, color: '#edf7ef', accent: '#d7efdc' },
    { id: 'sky', label: 'Focus Sky', level: 15, color: '#eef7fb', accent: '#d9edf5' },
    { id: 'sunset', label: 'Warm Sunset', level: 30, color: '#fff6ed', accent: '#f8e7d4' },
    { id: 'aurora', label: 'Aurora Elite', level: 50, color: '#f5effc', accent: '#e8ddf8' }
  ];
  const AVATARS = ['🧑‍🎓', '📚', '🦉', '🦊', '🧠', '🌟', '👑', '🎯'];
  const LEVEL_TIERS = [
    { min: 1, name: 'Academic Beginner', className: 'academic', badge: '📘', accent: '#0f6b4f' },
    { min: 5, name: 'Polished Learner', className: 'polished', badge: '📗', accent: '#16895f' },
    { min: 10, name: 'Premium Scholar', className: 'premium', badge: '🏅', accent: '#2778b8' },
    { min: 15, name: 'Advanced Candidate', className: 'advanced', badge: '🎓', accent: '#7756bd' },
    { min: 20, name: 'Specialist', className: 'special', badge: '🛡️', accent: '#9a5c2d' },
    { min: 25, name: 'Premium Identity', className: 'identity', badge: '💠', accent: '#176d9e' },
    { min: 30, name: 'Futuristic Candidate', className: 'futuristic', badge: '🚀', accent: '#5b56bc' },
    { min: 35, name: 'Advanced Achiever', className: 'animated', badge: '⚡', accent: '#ad4e7d' },
    { min: 40, name: 'Elite Candidate', className: 'elite', badge: '🏆', accent: '#a76c14' },
    { min: 45, name: 'Ultra Scholar', className: 'ultra', badge: '💎', accent: '#b34178' },
    { min: 50, name: 'Admission Legend', className: 'ultimate', badge: '👑', accent: '#b68518' }
  ];
  const LEVELS = Array.from({ length: 50 }, (_, index) => {
    const level = index + 1;
    const requiredXp = level === 1 ? 0 : (200 * (level - 1)) + (18 * (level - 1) * (level - 2));
    const tier = LEVEL_TIERS.filter(item => item.min <= level).slice(-1)[0];
    return {
      level,
      requiredXp,
      requiredGold: level === 1 ? 0 : 50 + ((level - 2) * 35),
      requiredDiamond: level === 1 ? 0 : 1 + Math.floor((level - 2) / 6),
      title: TITLE_UNLOCKS.filter(item => item.level <= level).slice(-1)[0].label,
      tier
    };
  });

  let activeTab = 'overview';
  let selectedSubject = '';
  let achievementFilter = 'all';
  let progressPeriod = 'overview';
  let customizePart = 'avatar';
  let selectedLevelPreview = 0;
  let levelNotice = 0;
  let refreshQueued = false;

  const num = value => {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  };
  const escP = value => typeof esc === 'function' ? esc(String(value ?? '')) : String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  const currentPath = () => String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const settings = () => (window.CACHE && CACHE.settings) || {};
  const gamification = () => settings().gamificationV3 || {};
  const profileState = () => {
    const s = settings();
    const g = gamification();
    const stored = s.profileV1 && typeof s.profileV1 === 'object' ? s.profileV1 : {};
    const legacy = g.profile && typeof g.profile === 'object' ? g.profile : {};
    return {
      version: PROFILE_VERSION,
      name: String(stored.name || legacy.name || s.userName || 'Scholar'),
      avatar: String(stored.avatar || legacy.avatar || s.avatar || '🧑‍🎓'),
      title: String(stored.title || 'beginner'),
      frame: String(stored.frame || 'basic'),
      profileTheme: String(stored.profileTheme || 'academic'),
      background: String(stored.background || 'mint'),
      lastSeenLevel: stored.lastSeenLevel ? num(stored.lastSeenLevel) : 0,
      updatedAt: num(stored.updatedAt)
    };
  };
  const xpTotal = () => Math.max(0, num(settings().totalXpEarned || settings().xpBalance));
  const levelInfo = xp => {
    const value = Math.max(0, num(xp));
    let current = LEVELS[0];
    for (const item of LEVELS) {
      if (value >= item.requiredXp) current = item;
      else break;
    }
    const next = LEVELS[current.level] || null;
    const into = Math.max(0, value - current.requiredXp);
    const span = next ? Math.max(1, next.requiredXp - current.requiredXp) : 1;
    return {
      level: current.level,
      current,
      next,
      into,
      span,
      percent: next ? Math.min(100, Math.round(into / span * 100)) : 100,
      xp: value,
      isMax: !next
    };
  };
  const levelRequirements = level => {
    const item = LEVELS[Math.max(1, Math.min(50, Number(level) || 1)) - 1] || LEVELS[0];
    return { xp: item.requiredXp, gold: item.requiredGold, diamond: item.requiredDiamond };
  };
  const tierFor = level => LEVEL_TIERS.filter(item => item.min <= level).slice(-1)[0] || LEVEL_TIERS[0];
  const levelTitle = level => TITLE_UNLOCKS.filter(item => item.level <= level).slice(-1)[0]?.label || 'Beginner';
  const unlocked = (item, level) => item && num(item.level) <= level;

  window.AdmissionProfileLevel = {
    version: 1,
    levels: LEVELS.map(item => ({ ...item, tier: { ...item.tier } })),
    fromXp: xp => ({ ...levelInfo(xp), current: { ...levelInfo(xp).current }, next: levelInfo(xp).next ? { ...levelInfo(xp).next } : null }),
    requirements: levelRequirements,
    title: levelTitle,
    tier: tierFor
  };

  const resultCount = result => {
    if (typeof resultCounts === 'function') return resultCounts(result);
    const correct = Math.max(0, num(result?.correct));
    const wrong = Math.max(0, num(result?.wrong));
    const total = Math.max(correct + wrong, num(result?.questionCount || result?.totalQuestions));
    return { total, correct, wrong, skipped: Math.max(0, total - correct - wrong) };
  };
  const resultRows = () => Array.isArray(CACHE?.examResults) ? CACHE.examResults.slice().sort((a, b) => num(a.date) - num(b.date)) : [];
  const aggregate = rows => {
    const out = { questions: 0, correct: 0, wrong: 0, skipped: 0, exams: 0, score: 0, time: 0 };
    (rows || []).forEach(row => {
      const c = resultCount(row);
      out.questions += c.total; out.correct += c.correct; out.wrong += c.wrong; out.skipped += c.skipped;
      out.exams += 1; out.score += num(row.score); out.time += num(row.timeUsed || row.totalTime);
    });
    out.answered = out.correct + out.wrong;
    out.accuracy = out.answered ? Math.round(out.correct / out.answered * 1000) / 10 : 0;
    out.avgScore = out.exams ? Math.round(out.score / out.exams * 10) / 10 : 0;
    return out;
  };
  const dayKey = date => typeof todayKey === 'function' ? todayKey(date) : new Date(date).toISOString().slice(0, 10);
  const studySecondsFromDaily = rows => (rows || []).reduce((sum, row) => sum + Math.max(0, num(row.timeMs) / 1000), 0);
  const dateRange = (daysBack = 0) => {
    const now = new Date();
    const start = new Date(now); start.setHours(0, 0, 0, 0); start.setDate(start.getDate() - daysBack);
    return start.getTime();
  };
  const stats = () => {
    const rows = resultRows();
    const baseLife = aggregate(rows);
    const computedLife = typeof computeLifetimeStats === 'function' ? computeLifetimeStats() : {};
    const life = {
      ...baseLife,
      ...computedLife,
      questions: num(computedLife.questions ?? computedLife.totalQuestions ?? baseLife.questions),
      time: num(computedLife.time ?? baseLife.time),
      studySeconds: num(computedLife.studySeconds ?? baseLife.time)
    };
    const daily = Array.isArray(CACHE?.dailyStats) ? CACHE.dailyStats : [];
    const today = aggregate(rows.filter(row => dayKey(new Date(row.date)) === dayKey(new Date())));
    const weekRows = rows.filter(row => num(row.date) >= dateRange(6));
    const monthRows = rows.filter(row => num(row.date) >= dateRange(29));
    const allStudySeconds = aggregate(rows).time + studySecondsFromDaily(daily);
    const todayDaily = daily.filter(row => row.id === dayKey(new Date()));
    const todaySeconds = today.time + studySecondsFromDaily(todayDaily);
    const currentStreak = typeof computeStreak === 'function' ? num(computeStreak()) : 0;
    const best = typeof bestStreak === 'function' ? num(bestStreak()) : currentStreak;
    const mistakes = Array.isArray(CACHE?.mistakes) ? CACHE.mistakes : [];
    const activeMistakes = mistakes.filter(item => !item.mastered && item.revisionStatus !== 'mastered');
    const improvedMistakes = mistakes.filter(item => item.mastered || item.revisionStatus === 'mastered');
    return {
      life: { ...life, studySeconds: allStudySeconds },
      today: { ...today, studySeconds: todaySeconds },
      week: aggregate(weekRows),
      month: aggregate(monthRows),
      currentStreak,
      bestStreak: Math.max(currentStreak, best),
      mistakes: { total: mistakes.length, active: activeMistakes.length, improved: improvedMistakes.length, wrongAttempts: mistakes.reduce((sum, item) => sum + num(item.wrongCount), 0) },
      subjects: (typeof subjectPerformance === 'function' ? subjectPerformance() : []).map(item => {
        const ref = safeRows(CACHE?.subjects).find(subject => subject.id === item.id || subject.name === item.name);
        return { ...item, id: item.id || ref?.id || '', subjectId: item.subjectId || ref?.id || '' };
      }),
      topics: typeof topicAnalytics === 'function' ? (topicAnalytics() || []) : []
    };
  };
  const formatTime = seconds => {
    const value = Math.max(0, Math.round(num(seconds)));
    if (value < 60) return `${value}s`;
    const minutes = Math.floor(value / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}m`;
  };
  const percent = value => `${Math.max(0, Math.min(100, Math.round(num(value) * 10) / 10))}%`;
  const bars = (value, className = '') => `<div class="admission-profile-bar ${className}"><i style="width:${Math.max(0, Math.min(100, num(value)))}%"></i></div>`;
  const safeRows = list => Array.isArray(list) ? list : [];

  const topicTrends = rows => {
    const map = {};
    safeRows(rows).forEach(row => {
      safeRows(row.snapshot).forEach(item => {
        const id = item.topicId || 'unknown';
        const stamp = num(row.date);
        if (!map[id]) map[id] = { id, name: typeof topicName === 'function' ? topicName(id) : id, early: [], recent: [] };
        const bucket = stamp && stamp < dateRange(30) ? map[id].early : map[id].recent;
        if (item.status === 'correct' || item.status === 'wrong') bucket.push(item.status === 'correct' ? 1 : 0);
      });
    });
    return Object.values(map).map(item => {
      const oldAcc = item.early.length >= 2 ? Math.round(item.early.reduce((a, b) => a + b, 0) / item.early.length * 100) : null;
      const newAcc = item.recent.length >= 2 ? Math.round(item.recent.reduce((a, b) => a + b, 0) / item.recent.length * 100) : null;
      return { ...item, oldAcc, newAcc, delta: oldAcc !== null && newAcc !== null ? newAcc - oldAcc : null };
    }).filter(item => item.delta !== null).sort((a, b) => b.delta - a.delta);
  };
  const subjectTopics = subjectId => {
    const topicIds = new Set(safeRows(CACHE?.topics).filter(item => item.subjectId === subjectId).map(item => item.id));
    return stats().topics.filter(item => topicIds.has(item.id));
  };
  const achievementRows = data => {
    const g = gamification();
    const earned = g.achievements || {};
    const s = data.life;
    const rows = [
      { id: 'first-study', icon: '🌱', title: 'First Study Step', detail: 'Complete your first real attempt.', unlocked: s.attempted > 0 || earned.firstMock },
      { id: 'questions100', icon: '📚', title: 'Question Hunter', detail: 'Answer 100 questions.', unlocked: s.attempted >= 100 || earned.questions100 },
      { id: 'accuracy90', icon: '🏆', title: 'Accuracy Ace', detail: 'Reach 90% lifetime accuracy.', unlocked: s.accuracy >= 90 },
      { id: 'streak7', icon: '🔥', title: 'Routine Hero', detail: 'Maintain a 7-day streak.', unlocked: data.currentStreak >= 7 || earned.streak7 },
      { id: 'exams50', icon: '🎓', title: 'Test Builder', detail: 'Complete 50 tests.', unlocked: s.exams >= 50 },
      { id: 'mistake-improved', icon: '🧩', title: 'Mistake Crusher', detail: 'Master a recorded mistake.', unlocked: data.mistakes.improved > 0 }
    ];
    Object.keys(earned).filter(id => !rows.some(row => row.id === id)).slice(0, 12).forEach(id => rows.push({ id, icon: '🏅', title: id.replace(/[-_]/g, ' '), detail: 'Unlocked by the existing gamification engine.', unlocked: true }));
    return rows;
  };

  const readTheme = (profile, tier) => PROFILE_THEMES.find(item => item.id === profile.profileTheme && unlocked(item, tier.level)) || PROFILE_THEMES[0];
  const readBackground = (profile, level) => PROFILE_BACKGROUNDS.find(item => item.id === profile.background && unlocked(item, level)) || PROFILE_BACKGROUNDS[0];
  const profileStyle = (profile, info) => {
    const theme = readTheme(profile, info);
    const background = readBackground(profile, info.level);
    return `--profile-accent:${theme.accent};--profile-tier-accent:${info.current.tier.accent};--profile-background:${background.color};--profile-background-accent:${background.accent};`;
  };
  const titleOptions = level => TITLE_UNLOCKS.filter(item => unlocked(item, level));
  const frameOptions = level => FRAME_UNLOCKS.filter(item => unlocked(item, level));
  const themeOptions = level => PROFILE_THEMES.filter(item => unlocked(item, level));
  const backgroundOptions = level => PROFILE_BACKGROUNDS.filter(item => unlocked(item, level));

  const saveProfilePatch = async patch => {
    const activeSettings = settings();
    const mainSettings = activeSettings.id === 'main' ? activeSettings : await dbGet('settings', 'main');
    const s = mainSettings && typeof mainSettings === 'object' ? mainSettings : { ...activeSettings, id: 'main' };
    const current = profileState();
    const next = { ...current, ...patch, version: PROFILE_VERSION, updatedAt: Date.now() };
    s.profileV1 = next;
    s.gamificationV3 = s.gamificationV3 || {};
    s.gamificationV3.profile = { ...(s.gamificationV3.profile || {}), name: next.name, avatar: next.avatar };
    CACHE.settings = s;
    await dbPut('settings', s);
    window.dispatchEvent(new CustomEvent('profile:updated', { detail: { ...next } }));
    if (typeof toast === 'function') toast('Profile saved');
    renderProfile();
  };
  window.saveAdmissionProfile = saveProfilePatch;
  window.setAdmissionProfileTab = tab => {
    activeTab = TAB_KEYS.includes(tab) ? tab : 'overview';
    selectedSubject = '';
    if (currentPath() === 'profile') renderProfile();
  };
  window.selectAdmissionProfileSubject = subjectId => {
    selectedSubject = String(subjectId || '');
    activeTab = 'subjects';
    renderProfile();
  };
  window.openAdmissionProfileCustomize = () => { activeTab = 'customize'; renderProfile(); };
  window.setAdmissionAchievementFilter = filter => { achievementFilter = ['all', 'earned', 'locked'].includes(filter) ? filter : 'all'; activeTab = 'achievements'; renderProfile(); };
  window.setAdmissionProgressPeriod = period => { progressPeriod = ['overview', 'weekly', 'monthly', 'topics'].includes(period) ? period : 'overview'; activeTab = 'performance'; renderProfile(); };
  window.setAdmissionCustomizePart = part => { customizePart = ['avatar', 'frame', 'background', 'theme'].includes(part) ? part : 'avatar'; activeTab = 'customize'; renderProfile(); };
  window.openAdmissionProfileRoadmap = () => { activeTab = 'achievements'; selectedLevelPreview = 0; renderProfile(); setTimeout(() => document.getElementById('profileLevelJourney')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 40); };
  window.openAdmissionProfileLevelPreview = level => { selectedLevelPreview = Math.max(1, Math.min(50, Number(level) || 1)); activeTab = 'achievements'; renderProfile(); };
  window.closeAdmissionProfileLevelPreview = () => { selectedLevelPreview = 0; renderProfile(); };

  const renderHeader = (data, info, profile) => {
    const g = gamification();
    const totalGold = num(settings().totalGoldEarned);
    const totalDiamond = num(settings().totalDiamondEarned);
    const title = TITLE_UNLOCKS.find(item => item.id === profile.title && unlocked(item, info.level))?.label || levelTitle(info.level);
    const frame = FRAME_UNLOCKS.find(item => item.id === profile.frame && unlocked(item, info.level)) || FRAME_UNLOCKS[0];
    const pending = levelNotice || (profile.lastSeenLevel > 0 && info.level > profile.lastSeenLevel);
    return `<section class="admission-profile-hero ${info.current.tier.className}" style="${profileStyle(profile, info)}" data-profile-level="${info.level}">
      <div class="admission-profile-hero-top"><span class="admission-profile-kicker">EMERALD ACADEMIC · PROFILE</span><button class="admission-profile-settings" onclick="setAdmissionProfileTab('customize')" aria-label="Customize profile">⚙</button></div>
      <div class="admission-profile-identity"><div class="admission-profile-avatar frame-${escP(frame.id)}"><span>${escP(profile.avatar)}</span><em>${escP(frame.icon)}</em></div><div class="admission-profile-name"><span class="admission-profile-badge">${escP(info.current.tier.badge)} Level ${info.level}</span><h1>${escP(profile.name)}</h1><p>${escP(title)} · ${escP(info.current.tier.name)}</p></div></div>
      <div class="admission-profile-xp"><div class="row between"><span>XP Progress</span><b>${info.isMax ? 'MAX' : percent(info.percent)}</b></div>${bars(info.percent, 'hero-bar')}<small>${info.xp.toLocaleString()} total XP · ${info.isMax ? 'Ultimate level reached' : `${info.into.toLocaleString()} / ${info.span.toLocaleString()} XP to Level ${info.level + 1}`}</small></div>
      <div class="admission-profile-wallet"><div><small>⚡ XP Earned</small><b>${info.xp.toLocaleString()}</b></div><div><small>🪙 Gold</small><b>${num(g.gold || settings().gold).toLocaleString()}</b><em>${totalGold ? `${totalGold.toLocaleString()} earned` : 'Study currency'}</em></div><div><small>💎 Diamond</small><b>${num(g.diamonds || settings().diamonds).toLocaleString()}</b><em>${totalDiamond ? `${totalDiamond.toLocaleString()} earned` : 'Premium currency'}</em></div><div><small>🔥 Streak</small><b>${data.currentStreak} days</b><em>Best ${data.bestStreak}</em></div></div>
      ${pending ? `<div class="admission-profile-levelup" role="status"><span>✦</span><div><b>Level ${info.level} unlocked</b><small>Your study progress opened a new profile visual tier.</small></div></div>` : ''}
    </section>`;
  };
  const renderTabs = () => `<nav class="admission-profile-tabs" aria-label="Profile sections">${Object.entries(PROFILE_TABS).map(([key, label]) => `<button class="${activeTab === key ? 'active' : ''}" onclick="setAdmissionProfileTab('${key}')">${label}</button>`).join('')}</nav>`;
  const renderOverview = (data, info, profile) => {
    const next = info.next;
    const totalBankQuestions = Math.max(0, safeRows(CACHE?.questions).length);
    const overallProgress = totalBankQuestions ? Math.min(100, Math.round(data.life.attempted / totalBankQuestions * 100)) : 0;
    const companionText = data.mistakes.active ? `চলো ${data.mistakes.active}টি ভুল প্রশ্ন থেকে আজকের revision শুরু করি।` : data.today.questions ? 'আজকের session ভালোভাবে এগোচ্ছে—আরও একটি focused set শেষ করো।' : 'তোমার admission journey আজ থেকেই শুরু হোক। একটি ছোট study session দিয়ে শুরু করি।';
    const req = next ? levelRequirements(next.level) : null;
    const achievements = achievementRows(data).filter(item => item.unlocked).slice(0, 3);
    return `<section class="admission-profile-card profile-overview-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">COMMAND CENTER</span><h2>My Progress</h2></div><button class="admission-profile-link" onclick="setAdmissionProfileTab('performance')">View analytics →</button></div><div class="admission-profile-metric-grid"><div><b>${num(data.life.attempted).toLocaleString()}</b><span>Questions solved</span></div><div><b>${percent(data.life.accuracy)}</b><span>Accuracy</span></div><div><b>${num(data.life.exams).toLocaleString()}</b><span>Exams</span></div><div><b>${formatTime(data.life.studySeconds)}</b><span>Study time</span></div></div></section>
      <section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">NEXT MILESTONE</span><h2>${info.isMax ? 'Ultimate Profile Identity' : `Level ${info.level} → Level ${next.level}`}</h2></div><span class="admission-profile-tier-pill">${escP(info.current.tier.name)}</span></div>${info.isMax ? '<p class="admission-profile-muted">You have reached the highest Profile level. Keep studying to build your real academic record.</p>' : `<div class="admission-profile-requirements"><div><b>${req.xp.toLocaleString()} XP</b><span>Study requirement</span></div><div><b>${req.gold.toLocaleString()} Gold</b><span>Reward preview</span></div><div><b>${req.diamond} Diamond</b><span>Reward preview</span></div></div><p class="admission-profile-muted">Level is earned from real study XP. Gold and Diamond are shown as compatible reward milestones and never replace the existing XP engine.</p>`}</section>
      <section class="admission-profile-card admission-profile-overall"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">OVERALL ADMISSION PROGRESS</span><h2>Preparation overview</h2></div><button class="admission-profile-link" onclick="setAdmissionProfileTab('performance')">View all →</button></div><div class="admission-profile-overall-body"><div class="admission-profile-ring" style="--progress:${overallProgress * 3.6}deg"><b>${overallProgress}%</b><span>overall</span></div><div class="admission-profile-overall-list"><div>📚 <b>${data.life.attempted.toLocaleString()}</b><span>Questions solved</span></div><div>🎓 <b>${data.life.exams.toLocaleString()}</b><span>Exams completed</span></div><div>✅ <b>${percent(data.life.accuracy)}</b><span>Average accuracy</span></div><div>⏱ <b>${formatTime(data.life.studySeconds)}</b><span>Total study time</span></div></div></div></section>
      <section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">REAL DATA</span><h2>Today at a glance</h2></div><button class="admission-profile-link" onclick="setAdmissionProfileTab('performance')">Details →</button></div><div class="admission-profile-mini-grid"><div><b>${data.today.questions}</b><span>Questions</span></div><div><b>${data.today.correct}</b><span>Correct</span></div><div><b>${data.today.wrong}</b><span>Wrong</span></div><div><b>${formatTime(data.today.studySeconds)}</b><span>Study time</span></div></div></section>
      <section class="admission-profile-card admission-profile-companion"><div class="admission-profile-companion-icon">🐱</div><div><span class="admission-profile-eyebrow">YOUR STUDY COMPANION</span><p>${escP(companionText)}</p><small>Real progress only—no sample statistics are added.</small></div></section>
      <section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">QUICK ACTIONS</span><h2>Continue your journey</h2></div></div><div class="admission-profile-actions"><button onclick="navigate('mistakes')">Review Mistakes<span>${data.mistakes.active} active</span></button><button onclick="navigate('history')">View History<span>${data.life.exams} saved tests</span></button><button onclick="navigate('exam')">Start a Test<span>Use existing exam engine</span></button><button onclick="navigate('rewards')">Reward Shop<span>Use existing wallet</span></button></div></section>
      <section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">ACHIEVEMENTS</span><h2>Recent milestones</h2></div><button class="admission-profile-link" onclick="setAdmissionProfileTab('achievements')">See all →</button></div>${achievements.length ? `<div class="admission-profile-badge-list">${achievements.map(item => `<span>${escP(item.icon)} ${escP(item.title)}</span>`).join('')}</div>` : '<div class="admission-profile-empty">Your first achievement will appear after a real study milestone.</div>'}</section>`;
  };
  const renderPerformance = data => {
    const max = Math.max(1, data.week.questions);
    const dayLabels = ['6 days ago', '5 days ago', '4 days ago', '3 days ago', '2 days ago', 'Yesterday', 'Today'];
    const barsHtml = Array.from({ length: 7 }, (_, index) => {
      const date = new Date(); date.setHours(0, 0, 0, 0); date.setDate(date.getDate() - (6 - index));
      const rows = resultRows().filter(row => dayKey(new Date(row.date)) === dayKey(date));
      const item = aggregate(rows);
      return `<div class="admission-profile-chart-col"><i style="height:${Math.max(5, Math.round(item.questions / max * 92))}px" title="${item.questions} questions"></i><span>${date.getDate()}</span><small>${item.questions}</small></div>`;
    }).join('');
    const periodRows = progressPeriod === 'monthly' ? data.month : progressPeriod === 'weekly' ? data.week : data.life;
    const periodLabel = progressPeriod === 'monthly' ? 'Last 30 days' : progressPeriod === 'weekly' ? 'Last 7 days' : progressPeriod === 'topics' ? 'Topic intelligence' : 'Lifetime overview';
    const periodTabs = ['overview', 'weekly', 'monthly', 'topics'].map(item => `<button class="${progressPeriod === item ? 'active' : ''}" onclick="setAdmissionProgressPeriod('${item}')">${item[0].toUpperCase() + item.slice(1)}</button>`).join('');
    const periodSummary = progressPeriod === 'topics' ? `${safeRows(data.topics).length} topic records available · open Topics for weak areas and improvements.` : `${periodLabel}: ${num(periodRows.questions).toLocaleString()} questions · ${num(periodRows.exams).toLocaleString()} exams · ${percent(periodRows.accuracy)} accuracy.`;
    return `<section class="admission-profile-card admission-profile-progress-overview"><div class="admission-profile-subtabs">${periodTabs}</div><div class="admission-profile-period-note">${escP(periodSummary)}</div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">ANALYTICS</span><h2>Performance overview</h2></div><span class="admission-profile-tier-pill">Real saved data</span></div><div class="admission-profile-metric-grid wide"><div><b>${data.life.questions.toLocaleString()}</b><span>Total questions</span></div><div><b>${data.life.correct.toLocaleString()}</b><span>Correct</span></div><div><b>${data.life.wrong.toLocaleString()}</b><span>Wrong</span></div><div><b>${data.life.skipped.toLocaleString()}</b><span>Skipped</span></div><div><b>${percent(data.life.accuracy)}</b><span>Accuracy</span></div><div><b>${data.life.avgScore || 0}</b><span>Average score</span></div><div><b>${data.life.best || 0}</b><span>Best score</span></div><div><b>${data.life.exams}</b><span>Total exams</span></div></div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">STUDY RHYTHM</span><h2>Last 7 days</h2></div><span class="admission-profile-muted">${data.week.questions} questions</span></div><div class="admission-profile-chart">${barsHtml}</div><div class="admission-profile-chart-legend">${dayLabels.map(label => `<span>${label}</span>`).join('')}</div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">TIME WINDOWS</span><h2>Daily · Weekly · Monthly</h2></div></div><div class="admission-profile-time-grid"><div><b>${formatTime(data.today.studySeconds)}</b><span>Today</span></div><div><b>${formatTime(data.week.time)}</b><span>Last 7 days</span></div><div><b>${formatTime(data.month.time)}</b><span>Last 30 days</span></div><div><b>${data.currentStreak} days</b><span>Current streak</span></div></div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">STREAK</span><h2>Consistency</h2></div></div><p class="admission-profile-muted">Current streak: <b>${data.currentStreak} days</b> · Best recorded streak: <b>${data.bestStreak} days</b>.</p></section>`;
  };
  const renderSubjects = data => {
    const selected = selectedSubject ? safeRows(data.subjects).find(item => item.name && (item.id === selectedSubject || item.subjectId === selectedSubject)) : null;
    const rows = safeRows(data.subjects);
    if (!rows.length) return `<section class="admission-profile-card"><div class="admission-profile-empty"><b>No subject performance yet.</b><span>Complete a real test and subject analytics will appear here.</span></div></section>`;
    return `<section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">PERFORMANCE</span><h2>${selected ? escP(selected.name) : 'Subject performance'}</h2></div>${selected ? '<button class="admission-profile-link" onclick="selectAdmissionProfileSubject(\'\')">All subjects</button>' : '<span class="admission-profile-muted">Tap a subject for topics</span>'}</div>${selected ? `<div class="admission-profile-subject-focus"><div class="admission-profile-subject-icon">${escP(selected.icon || '📘')}</div><div><b>${percent(selected.acc)}</b><span>${selected.correct} correct · ${selected.wrong} wrong</span></div></div>${subjectTopics(selected.id || selected.subjectId).map(topic => `<div class="admission-profile-topic-row"><div class="row between"><b>${escP(topic.name)}</b><span>${percent(topic.acc)}</span></div>${bars(topic.acc)}<small>${topic.attempts} attempts · ${topic.wrong} mistakes</small></div>`).join('') || '<div class="admission-profile-empty">No topic-level attempts have been saved for this subject yet.</div>'}` : rows.map(item => `<button class="admission-profile-subject-row" onclick="selectAdmissionProfileSubject('${escP(item.id || item.subjectId || '')}')"><span class="admission-profile-subject-icon">${escP(item.icon || '📘')}</span><span><b>${escP(item.name)}</b><small>${item.correct} correct · ${item.wrong} wrong</small>${bars(item.acc)}</span><strong>${percent(item.acc)}<i>View topics →</i></strong></button>`).join('')}</section>`;
  };
  const renderTopics = data => {
    const topics = safeRows(data.topics).slice(0, 20);
    const weak = topics.filter(item => num(item.attempts) >= 3 && num(item.acc) < 70).slice(0, 5);
    const improvements = topicTrends(resultRows()).slice(0, 5);
    return `<section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">TOPIC INTELLIGENCE</span><h2>Weak Areas</h2></div><button class="admission-profile-link" onclick="navigate('mistakes')">Mistake Book →</button></div>${weak.length ? weak.map(item => `<button class="admission-profile-weak-row" onclick="startWeakTopicPractice('${escP(item.id)}')"><span>⚠</span><span><b>${escP(item.name)}</b><small>${item.attempts} attempts · ${item.wrong} mistakes</small></span><strong>${percent(item.acc)}<i>Practice →</i></strong></button>`).join('') : '<div class="admission-profile-empty">Complete at least three real attempts in a topic to detect a weak area.</div>'}</section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">TOPIC PERFORMANCE</span><h2>All topics</h2></div><span class="admission-profile-muted">Sorted by accuracy</span></div>${topics.length ? topics.map(item => `<div class="admission-profile-topic-row"><div class="row between"><b>${escP(item.name)}</b><span class="${num(item.acc) < 70 ? 'is-weak' : ''}">${percent(item.acc)}</span></div>${bars(item.acc)}<small>${item.attempts} attempts · ${item.correct} correct · ${item.wrong} wrong · avg ${item.avgTime || 0}s</small></div>`).join('') : '<div class="admission-profile-empty">Topic analytics will appear after real question attempts.</div>'}</section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">MOMENTUM</span><h2>Biggest Improvements</h2></div></div>${improvements.length ? improvements.map(item => `<div class="admission-profile-improvement-row"><div><b>${escP(item.name)}</b><small>Earlier ${item.oldAcc}% → Recent ${item.newAcc}%</small></div><strong>+${item.delta}%</strong></div>`).join('') : '<div class="admission-profile-empty">Improvement comparisons appear after a topic has enough earlier and recent real attempts.</div>'}</section>`;
  };
  const renderMistakes = data => {
    const rows = safeRows(CACHE?.mistakes).slice().sort((a, b) => num(b.lastWrongAt || b.updatedAt) - num(a.lastWrongAt || a.updatedAt)).slice(0, 10);
    return `<section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">MISTAKE BOOK CONNECTED</span><h2>Mistake progress</h2></div><button class="admission-profile-link" onclick="navigate('mistakes')">Open Mistake Book →</button></div><div class="admission-profile-metric-grid"><div><b>${data.mistakes.total}</b><span>Total mistakes</span></div><div><b>${data.mistakes.active}</b><span>Needs review</span></div><div><b>${data.mistakes.improved}</b><span>Improved</span></div><div><b>${data.mistakes.wrongAttempts}</b><span>Wrong attempts</span></div></div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">RECENT</span><h2>Recent mistakes</h2></div></div>${rows.length ? rows.map(item => { const q = CACHE.questions?.find(question => question.id === item.questionId); return `<button class="admission-profile-mistake-row" onclick="startQuestionPractice(['${escP(item.questionId || '')}'])"><span>❌</span><span><b>${escP(q?.question || item.question || 'Saved mistake')}</b><small>${escP(typeof subjectName === 'function' ? subjectName(item.subjectId || q?.subjectId) : '')} · Wrong ${num(item.wrongCount)}×</small></span><strong>Review →</strong></button>`; }).join('') : '<div class="admission-profile-empty">No mistake records yet. Wrong answers from the existing exam engine will appear here without duplication.</div>'}</section>`;
  };
  const renderAchievements = (data, info, profile) => {
    const rows = achievementRows(data);
    const filteredRows = rows.filter(item => achievementFilter === 'all' || (achievementFilter === 'earned' ? item.unlocked : !item.unlocked));
    const journey = LEVELS.map(item => `<button class="${item.level === info.level ? 'current' : item.level < info.level ? 'done' : ''}" onclick="openAdmissionProfileLevelPreview(${item.level})" title="Level ${item.level} · ${escP(item.title)}"><b>${item.level}</b></button>`).join('');
    const previewLevel = selectedLevelPreview || (info.isMax ? info.level : info.level + 1);
    const preview = LEVELS[previewLevel - 1] || LEVELS[0];
    const previewReq = levelRequirements(preview.level);
    const isUnlocked = preview.level <= info.level;
    const previewList = isUnlocked ? ['Current profile tier', 'Profile title available', 'Existing Experience Studio eligibility applies'] : ['Exclusive frame preview', 'Premium background preview', 'New badge and visual tier', 'New profile title'];
    const previewHtml = `<section class="admission-profile-card admission-profile-level-preview ${isUnlocked ? 'unlocked' : 'locked'}"><div class="admission-profile-preview-emblem">${escP(preview.tier.badge)}<b>${preview.level}</b></div><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">${isUnlocked ? 'CURRENT LEVEL' : 'LOCKED LEVEL PREVIEW'}</span><h2>Level ${preview.level} · ${escP(preview.title)}</h2></div><button class="admission-profile-link" onclick="closeAdmissionProfileLevelPreview()">Close</button></div><div class="admission-profile-unlock-list">${previewList.map(item => `<span>✦ ${escP(item)}</span>`).join('')}</div><div class="admission-profile-requirements"><div><b>${previewReq.xp.toLocaleString()} XP</b><span>Required XP</span></div><div><b>${previewReq.gold.toLocaleString()} Gold</b><span>Preview Gold</span></div><div><b>${previewReq.diamond} Diamond</b><span>Preview Diamond</span></div></div><button class="admission-profile-primary" onclick="${isUnlocked ? "setAdmissionProfileTab('customize')" : "setAdmissionProfileTab('performance')"}">${isUnlocked ? 'Customize this level' : 'Start progress'}</button></section>`;
    return `<section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">BADGES</span><h2>Achievements</h2></div><span class="admission-profile-tier-pill">${rows.filter(item => item.unlocked).length}/${rows.length} unlocked</span></div><div class="admission-profile-subtabs achievement-filters"><button class="${achievementFilter === 'all' ? 'active' : ''}" onclick="setAdmissionAchievementFilter('all')">All</button><button class="${achievementFilter === 'earned' ? 'active' : ''}" onclick="setAdmissionAchievementFilter('earned')">Earned</button><button class="${achievementFilter === 'locked' ? 'active' : ''}" onclick="setAdmissionAchievementFilter('locked')">Locked</button></div><div class="admission-profile-achievement-list">${filteredRows.map(item => `<article class="${item.unlocked ? 'unlocked' : 'locked'}"><span>${escP(item.icon)}</span><div><b>${escP(item.title)}</b><small>${escP(item.detail)}</small></div><em>${item.unlocked ? 'Unlocked' : 'Locked'}</em></article>`).join('') || '<div class="admission-profile-empty">No achievements in this filter yet.</div>'}</div></section>${previewHtml}<section class="admission-profile-card" id="profileLevelJourney"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">LEVEL JOURNEY</span><h2>Level 1 → Level 50</h2></div><span class="admission-profile-muted">Current: ${info.level}</span></div><div class="admission-profile-roadmap">${journey}</div><div class="admission-profile-roadmap-legend"><span>● Completed</span><span>◎ Current</span><span>○ Locked</span></div><div class="admission-profile-next-preview">${info.isMax ? '<b>Ultimate Admission Hub identity unlocked.</b>' : `<b>Next: Level ${info.next.level} · ${escP(info.next.title)}</b><span>${levelRequirements(info.next.level).xp.toLocaleString()} XP · ${levelRequirements(info.next.level).gold.toLocaleString()} Gold preview · ${levelRequirements(info.next.level).diamond} Diamond preview</span>`}</div></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">QUICK ACTIONS</span><h2>Your profile tools</h2></div></div><div class="admission-profile-actions"><button onclick="setAdmissionProfileTab('customize')">Customize Profile<span>Avatar · frame · title</span></button><button onclick="navigate('rewards')">Open Rewards<span>Existing shop and wallet</span></button><button onclick="navigate('history')">View History<span>Real saved results</span></button><button onclick="navigate('progress')">Legacy Progress<span>Compatibility route</span></button></div></section>`;
  };
  const renderCustomize = (data, info, profile) => {
    const titles = titleOptions(info.level); const frames = frameOptions(info.level); const themes = themeOptions(info.level); const backgrounds = PROFILE_BACKGROUNDS;
    const customizeTabs = ['avatar', 'frame', 'background', 'theme'].map(item => `<button class="${customizePart === item ? 'active' : ''}" onclick="setAdmissionCustomizePart('${item}')">${item[0].toUpperCase() + item.slice(1)}</button>`).join('');
    return `<section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">PERSONAL IDENTITY</span><h2>Customize Profile</h2></div><span class="admission-profile-muted">Saved locally</span></div><div class="admission-profile-subtabs customization-tabs">${customizeTabs}</div><label class="admission-profile-field"><span>Name</span><input id="profileNameInput" value="${escP(profile.name)}" maxlength="40"></label><div class="admission-profile-choice-label">Avatar</div><div class="admission-profile-choice-grid avatar-choice">${AVATARS.map(item => `<button class="${profile.avatar === item ? 'selected' : ''}" onclick="this.closest('.admission-profile-card').querySelectorAll('.avatar-choice button').forEach(x=>x.classList.remove('selected'));this.classList.add('selected');this.dataset.value='${item}'" data-value="${escP(item)}">${escP(item)}</button>`).join('')}</div><label class="admission-profile-field"><span>Title</span><select id="profileTitleInput">${titles.map(item => `<option value="${item.id}" ${profile.title === item.id ? 'selected' : ''}>${escP(item.label)} · Level ${item.level}+</option>`).join('')}</select></label><div class="admission-profile-choice-label">Profile frame</div><div class="admission-profile-choice-grid frame-choice">${frames.map(item => `<button class="${profile.frame === item.id ? 'selected' : ''}" onclick="this.closest('.admission-profile-card').querySelectorAll('.frame-choice button').forEach(x=>x.classList.remove('selected'));this.classList.add('selected');this.dataset.value='${item.id}'" data-value="${escP(item.id)}">${escP(item.icon)}<small>${escP(item.label)}</small></button>`).join('')}</div><div class="admission-profile-choice-label">Background</div><div class="admission-profile-choice-grid background-choice">${backgrounds.map(item => { const locked = !unlocked(item, info.level); return `<button class="${profile.background === item.id ? 'selected' : ''} ${locked ? 'locked' : ''}" ${locked ? 'disabled title="Unlocks at Level '+item.level+'"' : `onclick="this.closest('.admission-profile-card').querySelectorAll('.background-choice button').forEach(x=>x.classList.remove('selected'));this.classList.add('selected');this.dataset.value='${item.id}'"`} data-value="${escP(item.id)}" style="background:${item.color}">${locked ? '🔒' : '✦'}<small>${escP(item.label)}</small></button>`; }).join('')}</div><label class="admission-profile-field"><span>Profile theme</span><select id="profileThemeInput">${themes.map(item => `<option value="${item.id}" ${profile.profileTheme === item.id ? 'selected' : ''}>${escP(item.label)} · Level ${item.level}+</option>`).join('')}</select></label><button class="admission-profile-primary" onclick="saveAdmissionProfile({name:document.getElementById('profileNameInput').value.trim()||'Scholar',avatar:document.querySelector('.avatar-choice button.selected')?.dataset.value||'${escP(profile.avatar)}',title:document.getElementById('profileTitleInput').value,frame:document.querySelector('.frame-choice button.selected')?.dataset.value||'${escP(profile.frame)}',background:document.querySelector('.background-choice button.selected')?.dataset.value||'${escP(profile.background)}',profileTheme:document.getElementById('profileThemeInput').value})">Save Profile</button><p class="admission-profile-muted">Global app theme and Experience Studio remain separate. This profile presentation uses the existing level and customization architecture without copying or resetting its assets.</p></section><section class="admission-profile-card"><div class="admission-profile-section-head"><div><span class="admission-profile-eyebrow">VISUAL EVOLUTION</span><h2>Current tier</h2></div></div><div class="admission-profile-evolution"><span>${escP(info.current.tier.badge)}</span><div><b>${escP(info.current.tier.name)}</b><small>Level ${info.level} · ${escP(readTheme(profile, info).label)} · ${escP(FRAME_UNLOCKS.find(item => item.id === profile.frame)?.label || 'Basic Frame')}</small></div></div></section>`;
  };
  const renderProfile = () => {
    const data = stats();
    const info = levelInfo(xpTotal());
    const profile = profileState();
    if (!TAB_KEYS.includes(activeTab)) activeTab = 'overview';
    const body = activeTab === 'overview' ? renderOverview(data, info, profile) : activeTab === 'performance' ? renderPerformance(data) : activeTab === 'subjects' ? renderSubjects(data) : activeTab === 'topics' ? renderTopics(data) : activeTab === 'mistakes' ? renderMistakes(data) : activeTab === 'achievements' ? renderAchievements(data, info, profile) : renderCustomize(data, info, profile);
    const html = `<main class="admission-profile-v1 tier-${escP(info.current.tier.className)}" style="${profileStyle(profile, info)}" data-integrated-profile-render="1">${renderHeader(data, info, profile)}${renderTabs()}<div class="admission-profile-body">${body}</div></main>`;
    renderShell(html, { topbar: false });
    if (profile.lastSeenLevel > 0 && info.level > profile.lastSeenLevel) {
      setTimeout(() => {
        if (currentPath() !== 'profile') return;
        const s = settings();
        const current = profileState();
        if (current.lastSeenLevel >= info.level) return;
        s.profileV1 = { ...current, lastSeenLevel: info.level, updatedAt: Date.now() };
        CACHE.settings = s;
        dbPut('settings', s).catch(() => {});
      }, 1800);
    }
    levelNotice = 0;
  };
  window.__admissionIntegratedProfileRender = renderProfile;
  window.renderAdmissionProfile = renderProfile;

  const queueRefresh = () => {
    if (currentPath() !== 'profile' || refreshQueued) return;
    refreshQueued = true;
    requestAnimationFrame(() => { refreshQueued = false; if (currentPath() === 'profile') renderProfile(); });
  };
  ['gamification:updated', 'admission:activity', 'profile:updated', 'experience-studio-state-change'].forEach(eventName => window.addEventListener(eventName, queueRefresh));
  window.addEventListener('profile-level-change', event => { levelNotice = num(event.detail?.level); queueRefresh(); });
  window.__admissionProfileSystemReady = true;

  if (!document.getElementById('admission-profile-v1-style')) {
    const style = document.createElement('style');
    style.id = 'admission-profile-v1-style';
    style.textContent = `
      .admission-profile-v1{--profile-accent:#0f6b4f;--profile-tier-accent:#0f6b4f;max-width:820px;margin:0 auto;padding:16px 14px 112px;color:var(--text)}
      .admission-profile-hero{position:relative;overflow:hidden;background:linear-gradient(140deg,#073f30,#0f6b4f 55%,#1b9b70);color:#fff;border-radius:28px;padding:18px 16px 16px;box-shadow:0 16px 38px rgba(8,67,49,.2)}
      .admission-profile-hero:after{content:"";position:absolute;width:220px;height:220px;border-radius:50%;right:-90px;top:-90px;background:rgba(255,255,255,.1);box-shadow:-26px 28px 0 rgba(255,255,255,.05)}
      .admission-profile-hero.futuristic,.admission-profile-hero.ultimate{background:linear-gradient(140deg,#251b53,#5b56bc 56%,#b34178)}
      .admission-profile-hero.elite,.admission-profile-hero.ultra{background:linear-gradient(140deg,#57300a,#a76c14 55%,#d7a739)}
      .admission-profile-hero-top,.admission-profile-identity,.admission-profile-section-head,.admission-profile-wallet,.admission-profile-wallet>div,.admission-profile-actions,.admission-profile-action-row,.admission-profile-subject-row,.admission-profile-weak-row,.admission-profile-mistake-row,.admission-profile-improvement-row,.admission-profile-evolution{display:flex;align-items:center}
      .admission-profile-hero-top{position:relative;z-index:1;justify-content:space-between}.admission-profile-kicker,.admission-profile-eyebrow{font-size:10px;font-weight:900;letter-spacing:.14em}.admission-profile-kicker{opacity:.78}.admission-profile-settings{border:1px solid rgba(255,255,255,.28);background:rgba(255,255,255,.12);color:#fff;border-radius:11px;padding:7px 9px;cursor:pointer}
      .admission-profile-identity{position:relative;z-index:1;gap:12px;margin:23px 0 17px}.admission-profile-avatar{position:relative;display:grid;place-items:center;width:78px;height:78px;flex:0 0 78px;border-radius:50%;background:rgba(255,255,255,.18);border:4px solid rgba(255,255,255,.74);box-shadow:0 0 0 5px rgba(255,255,255,.12)}.admission-profile-avatar span{font-size:40px}.admission-profile-avatar em{position:absolute;right:-7px;bottom:-5px;width:27px;height:27px;display:grid;place-items:center;background:#fff;color:var(--profile-accent);border-radius:50%;font-style:normal;font-size:14px;box-shadow:0 3px 9px rgba(0,0,0,.16)}.admission-profile-avatar.frame-gold{border-color:#f7d47a}.admission-profile-avatar.frame-diamond{border-color:#a8e5ff}.admission-profile-avatar.frame-cosmic{border-color:#d6b1ff}.admission-profile-avatar.frame-elite{border-color:#ffe396}.admission-profile-name{min-width:0}.admission-profile-badge{display:inline-block;background:rgba(255,255,255,.16);border:1px solid rgba(255,255,255,.23);border-radius:999px;padding:5px 8px;font-size:10px;font-weight:900}.admission-profile-name h1{margin:6px 0 2px;font-size:26px;letter-spacing:-.5px}.admission-profile-name p{margin:0;opacity:.82;font-size:12px}.admission-profile-xp{position:relative;z-index:1;background:rgba(0,0,0,.13);border-radius:16px;padding:11px 12px}.admission-profile-xp span,.admission-profile-xp small{font-size:11px;opacity:.83}.admission-profile-bar{height:8px;background:var(--line);border-radius:999px;overflow:hidden;margin:7px 0}.admission-profile-bar i{display:block;height:100%;background:linear-gradient(90deg,var(--profile-accent),#b9f4d3);border-radius:inherit}.hero-bar{background:rgba(255,255,255,.2)}.hero-bar i{background:linear-gradient(90deg,#c8f7df,#fff)}.admission-profile-wallet{position:relative;z-index:1;display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:11px}.admission-profile-wallet>div{display:block;min-width:0;padding:9px 6px;background:rgba(255,255,255,.11);border-radius:12px}.admission-profile-wallet small,.admission-profile-wallet b,.admission-profile-wallet em{display:block}.admission-profile-wallet small{font-size:9px;opacity:.75}.admission-profile-wallet b{font-size:16px;margin-top:3px}.admission-profile-wallet em{font-size:9px;opacity:.68;font-style:normal;margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.admission-profile-levelup{position:relative;z-index:1;display:flex;align-items:center;gap:9px;margin-top:11px;padding:9px 10px;background:rgba(255,255,255,.17);border:1px solid rgba(255,255,255,.3);border-radius:12px;animation:admissionProfileLevelGlow 1.8s ease both}.admission-profile-levelup>span{font-size:22px}.admission-profile-levelup b,.admission-profile-levelup small{display:block}.admission-profile-levelup small{font-size:10px;opacity:.8;margin-top:2px}
      .admission-profile-tabs{display:flex;gap:6px;overflow:auto;padding:12px 1px 9px;scrollbar-width:none}.admission-profile-tabs::-webkit-scrollbar{display:none}.admission-profile-tabs button{flex:0 0 auto;border:1px solid var(--line);background:var(--card);color:var(--sub);border-radius:999px;padding:8px 11px;font-size:11px;font-weight:800;cursor:pointer}.admission-profile-tabs button.active{border-color:var(--profile-accent);background:var(--profile-accent);color:#fff}.admission-profile-subtabs{display:flex;gap:6px;overflow:auto;padding:2px 0 10px;scrollbar-width:none}.admission-profile-subtabs::-webkit-scrollbar{display:none}.admission-profile-subtabs button{border:1px solid var(--line);background:var(--card);color:var(--sub);border-radius:999px;padding:7px 12px;font-size:10px;font-weight:800;cursor:pointer;white-space:nowrap}.admission-profile-subtabs button.active{border-color:var(--profile-accent);background:var(--profile-accent);color:#fff}.admission-profile-period-note{background:var(--mint);border-radius:12px;padding:10px;color:var(--sub);font-size:11px;line-height:1.5}.admission-profile-body{display:grid;gap:12px}.admission-profile-card{background:var(--card);border:1px solid var(--line);border-radius:20px;padding:15px;box-shadow:var(--shadow)}.admission-profile-level-preview{background:linear-gradient(145deg,var(--profile-background),var(--card));border-color:var(--profile-accent)}.admission-profile-level-preview.locked{border-color:#c9d2cf}.admission-profile-preview-emblem{width:82px;height:82px;margin:0 auto 10px;display:grid;place-items:center;align-content:center;border-radius:50%;background:radial-gradient(circle at 35% 25%,#fff,var(--profile-background-accent));border:4px solid var(--profile-accent);color:var(--profile-accent);font-size:29px;box-shadow:0 8px 18px rgba(15,107,79,.12)}.admission-profile-preview-emblem b{font-size:11px;margin-top:-4px}.admission-profile-unlock-list{display:grid;gap:6px;margin:10px 0}.admission-profile-unlock-list span{background:var(--mint);border-radius:10px;padding:8px 10px;color:var(--sub);font-size:11px}.admission-profile-choice-grid button.locked{opacity:.52;cursor:not-allowed;filter:grayscale(.25)}.admission-profile-body{background:transparent}.admission-profile-section-head{justify-content:space-between;gap:10px;margin-bottom:12px}.admission-profile-section-head h2{font-size:18px;margin:3px 0 0}.admission-profile-eyebrow{color:var(--profile-accent)}.admission-profile-link{border:0;background:none;color:var(--profile-accent);font-size:11px;font-weight:900;cursor:pointer;padding:4px 0}.admission-profile-muted{color:var(--sub);font-size:11px;line-height:1.55}.admission-profile-tier-pill{border-radius:999px;background:var(--mint);color:var(--profile-accent);padding:6px 8px;font-size:10px;font-weight:900;white-space:nowrap}      .admission-profile-metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.admission-profile-metric-grid.wide{grid-template-columns:repeat(4,1fr)}.admission-profile-overall-body{display:flex;align-items:center;gap:16px}.admission-profile-ring{width:112px;height:112px;flex:0 0 112px;border-radius:50%;display:grid;place-items:center;align-content:center;background:conic-gradient(var(--profile-accent) var(--progress),var(--mint) 0);position:relative}.admission-profile-ring:after{content:"";position:absolute;inset:9px;border-radius:50%;background:var(--card)}.admission-profile-ring b,.admission-profile-ring span{position:relative;z-index:1;display:block}.admission-profile-ring b{font-size:24px;color:var(--profile-accent)}.admission-profile-ring span{font-size:9px;color:var(--sub);text-align:center}.admission-profile-overall-list{display:grid;gap:8px;flex:1;min-width:0}.admission-profile-overall-list div{display:grid;grid-template-columns:22px 1fr;column-gap:5px;align-items:center;font-size:12px}.admission-profile-overall-list span{grid-column:2;color:var(--sub);font-size:10px}.admission-profile-companion{display:flex;align-items:center;gap:12px;background:linear-gradient(135deg,var(--mint),var(--card))}.admission-profile-companion-icon{width:58px;height:58px;display:grid;place-items:center;flex:0 0 58px;border-radius:18px;background:#dff5ed;font-size:33px}.admission-profile-companion p{margin:5px 0 3px;font-size:13px;line-height:1.55}.admission-profile-companion small{color:var(--sub);font-size:10px}.admission-profile-metric-grid>div,.admission-profile-mini-grid>div,.admission-profile-requirements>div,.admission-profile-time-grid>div{background:var(--mint);border-radius:14px;padding:11px 8px}.admission-profile-metric-grid b,.admission-profile-mini-grid b,.admission-profile-requirements b,.admission-profile-time-grid b{display:block;color:var(--profile-accent);font-size:18px}.admission-profile-metric-grid span,.admission-profile-mini-grid span,.admission-profile-requirements span,.admission-profile-time-grid span{display:block;color:var(--sub);font-size:10px;margin-top:4px}.admission-profile-mini-grid,.admission-profile-time-grid,.admission-profile-requirements{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}.admission-profile-requirements{grid-template-columns:repeat(3,1fr)}.admission-profile-requirements b{font-size:15px}.admission-profile-actions{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.admission-profile-actions button{border:1px solid var(--line);background:var(--mint);color:var(--text);border-radius:13px;padding:11px;text-align:left;font-weight:900;cursor:pointer}.admission-profile-actions span{display:block;color:var(--sub);font-size:10px;font-weight:500;margin-top:4px}.admission-profile-badge-list{display:flex;gap:7px;flex-wrap:wrap}.admission-profile-badge-list span{background:var(--mint);border-radius:999px;padding:8px 10px;color:var(--profile-accent);font-size:11px;font-weight:800}.admission-profile-empty{display:grid;gap:4px;text-align:center;color:var(--sub);font-size:12px;line-height:1.6;padding:16px 8px}.admission-profile-chart{height:120px;display:flex;align-items:flex-end;gap:7px;padding:0 4px}.admission-profile-chart-col{flex:1;height:100%;display:flex;flex-direction:column;justify-content:flex-end;align-items:center;gap:4px}.admission-profile-chart-col i{display:block;width:70%;min-height:5px;background:linear-gradient(180deg,var(--profile-accent),#b9f4d3);border-radius:7px 7px 3px 3px}.admission-profile-chart-col span{font-size:10px;color:var(--sub)}.admission-profile-chart-col small{font-size:9px;color:var(--sub)}.admission-profile-chart-legend{display:flex;justify-content:space-between;color:var(--sub);font-size:9px;margin-top:8px}.admission-profile-time-grid{grid-template-columns:repeat(4,1fr)}.admission-profile-subject-row,.admission-profile-weak-row,.admission-profile-mistake-row{width:100%;border:0;border-bottom:1px solid var(--line);background:none;color:var(--text);gap:9px;padding:11px 2px;text-align:left;cursor:pointer}.admission-profile-subject-row:last-child,.admission-profile-weak-row:last-child,.admission-profile-mistake-row:last-child{border-bottom:0}.admission-profile-subject-icon{width:34px;height:34px;display:grid;place-items:center;flex:0 0 34px;border-radius:11px;background:var(--mint);font-size:18px}.admission-profile-subject-row>span:nth-child(2),.admission-profile-weak-row>span:nth-child(2),.admission-profile-mistake-row>span:nth-child(2){flex:1;min-width:0}.admission-profile-subject-row b,.admission-profile-subject-row small,.admission-profile-weak-row b,.admission-profile-weak-row small,.admission-profile-mistake-row b,.admission-profile-mistake-row small{display:block}.admission-profile-subject-row small,.admission-profile-weak-row small,.admission-profile-mistake-row small{color:var(--sub);font-size:10px;margin-top:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}.admission-profile-subject-row strong,.admission-profile-weak-row strong,.admission-profile-mistake-row strong{color:var(--profile-accent);font-size:13px;text-align:right}.admission-profile-subject-row strong i,.admission-profile-weak-row strong i{display:block;color:var(--sub);font-size:9px;font-style:normal;font-weight:500;margin-top:3px}.admission-profile-subject-row .admission-profile-bar{margin:6px 0 0}.admission-profile-topic-row{padding:10px 0;border-bottom:1px solid var(--line)}.admission-profile-topic-row:last-child{border-bottom:0}.admission-profile-topic-row small{color:var(--sub);font-size:10px}.admission-profile-topic-row .is-weak{color:var(--red)}.admission-profile-improvement-row{justify-content:space-between;gap:8px;padding:11px 0;border-bottom:1px solid var(--line)}.admission-profile-improvement-row:last-child{border-bottom:0}.admission-profile-improvement-row b,.admission-profile-improvement-row small{display:block}.admission-profile-improvement-row small{color:var(--sub);font-size:10px;margin-top:3px}.admission-profile-improvement-row strong{color:var(--green);font-size:18px}.admission-profile-achievement-list{display:grid;gap:8px}.admission-profile-achievement-list article{display:flex;align-items:center;gap:9px;padding:10px;border-radius:13px;background:var(--mint)}.admission-profile-achievement-list article.locked{opacity:.52}.admission-profile-achievement-list article>span{font-size:24px}.admission-profile-achievement-list article>div{flex:1;min-width:0}.admission-profile-achievement-list b,.admission-profile-achievement-list small{display:block}.admission-profile-achievement-list small{color:var(--sub);font-size:10px;margin-top:3px}.admission-profile-achievement-list em{font-style:normal;color:var(--profile-accent);font-size:10px;font-weight:900}.admission-profile-roadmap{display:flex;gap:7px;overflow:auto;padding:8px 2px 11px;scrollbar-width:thin}.admission-profile-roadmap span{width:35px;height:35px;flex:0 0 35px;display:grid;place-items:center;border-radius:50%;border:2px solid var(--line);color:var(--sub);background:var(--card);font-size:10px}.admission-profile-roadmap span.done{border-color:var(--profile-accent);background:var(--mint);color:var(--profile-accent)}.admission-profile-roadmap span.current{border-color:var(--profile-accent);background:var(--profile-accent);color:#fff;box-shadow:0 0 0 4px color-mix(in srgb,var(--profile-accent) 18%,transparent)}.admission-profile-roadmap-legend{display:flex;gap:10px;flex-wrap:wrap;color:var(--sub);font-size:10px}.admission-profile-next-preview{display:grid;gap:3px;margin-top:12px;padding:11px;background:var(--mint);border-radius:12px;font-size:12px}.admission-profile-next-preview span{color:var(--sub);font-size:10px}.admission-profile-field{display:grid;gap:5px;margin:10px 0;color:var(--sub);font-size:11px;font-weight:800}.admission-profile-field input,.admission-profile-field select{width:100%;box-sizing:border-box;border:1px solid var(--line);border-radius:11px;background:var(--card);color:var(--text);padding:11px;font-size:14px}.admission-profile-choice-label{color:var(--sub);font-size:11px;font-weight:800;margin:13px 0 6px}.admission-profile-choice-grid{display:flex;gap:7px;flex-wrap:wrap}.admission-profile-choice-grid button{border:1px solid var(--line);background:var(--mint);color:var(--text);border-radius:11px;padding:8px 10px;min-width:43px;cursor:pointer}.admission-profile-choice-grid button.selected{border-color:var(--profile-accent);box-shadow:0 0 0 2px color-mix(in srgb,var(--profile-accent) 15%,transparent);background:var(--card)}.frame-choice button{display:flex;align-items:center;gap:6px}.frame-choice small{font-size:10px}.admission-profile-primary{width:100%;border:0;border-radius:13px;padding:12px;background:var(--profile-accent);color:#fff;font-weight:900;cursor:pointer;margin-top:15px}.admission-profile-evolution{gap:10px;padding:12px;background:var(--mint);border-radius:14px}.admission-profile-evolution>span{font-size:31px}.admission-profile-evolution b,.admission-profile-evolution small{display:block}.admission-profile-evolution small{color:var(--sub);font-size:10px;margin-top:3px}@keyframes admissionProfileLevelGlow{0%{opacity:0;transform:translateY(5px);box-shadow:0 0 0 rgba(255,255,255,0)}30%{opacity:1;transform:none;box-shadow:0 0 25px rgba(255,255,255,.36)}100%{opacity:1;transform:none;box-shadow:none}}      @media(max-width:620px){.admission-profile-wallet{grid-template-columns:repeat(2,1fr)}.admission-profile-metric-grid,.admission-profile-metric-grid.wide{grid-template-columns:repeat(2,1fr)}.admission-profile-mini-grid,.admission-profile-time-grid{grid-template-columns:repeat(2,1fr)}.admission-profile-overall-body{gap:10px}.admission-profile-ring{width:96px;height:96px;flex-basis:96px}}@media(max-width:390px){.admission-profile-v1{padding-left:10px;padding-right:10px}.admission-profile-name h1{font-size:22px}.admission-profile-requirements{gap:5px}.admission-profile-requirements b{font-size:12px}.admission-profile-requirements span{font-size:9px}.admission-profile-actions{grid-template-columns:1fr}.admission-profile-chart-legend span{font-size:8px}}@media(prefers-reduced-motion:reduce){.admission-profile-levelup{animation:none}.admission-profile-chart-col i{transition:none}}`;
    document.head.appendChild(style);
  }
})();
