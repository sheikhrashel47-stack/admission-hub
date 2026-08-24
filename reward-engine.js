(() => {
  'use strict';

  const VERSION = 2;
  const KEY = 'rewardEngineV2';
  const LEGACY_KEY = 'rewardEngineV1';
  const DAY_LIMIT = 500;
  const EVENT_LIMIT = 2500;
  const now = () => Date.now();
  const num = value => Math.max(0, Number(value) || 0);
  const pct = (correct, attempted) => attempted ? Math.round((correct / attempted) * 100) : 0;
  const keyOf = date => typeof window.todayKey === 'function' ? window.todayKey(date) : new Date(date || now()).toISOString().slice(0, 10);
  const uid = () => typeof window.uid === 'function' ? window.uid() : `reward-${now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  const getCache = () => { try { return window.CACHE || CACHE || null; } catch (_) { return window.CACHE || null; } };

  const iconByCategory = { STARTER:'✦', GRIND:'◈', MASTERY:'◆', MISTAKE:'↻', EXAM:'▣' };
  const make = (number, title, category, rarity, xp, metric, target, description, extra = {}) => ({
    id: `reward-${String(number).padStart(2, '0')}`,
    number, title, category, rarity, icon: iconByCategory[category], xpReward: xp, metric, target, description, ...extra
  });

  const DEFINITIONS = [
    make(1, 'First Step', 'STARTER', 'COMMON', 25, 'sessions', 1, 'প্রথম সম্পন্ন study session।'),
    make(2, 'First 100', 'STARTER', 'COMMON', 50, 'uniqueQuestions', 100, '১০০টি unique question attempted।'),
    make(3, 'Sharp Start', 'STARTER', 'COMMON', 50, 'highAccuracyTests', 1, 'কমপক্ষে ১০ প্রশ্নের একটি test-এ ৮০% accuracy।'),
    make(4, 'First Mock', 'STARTER', 'COMMON', 75, 'mockTests', 1, 'প্রথম completed Mock Test।'),
    make(5, 'Revision Starter', 'STARTER', 'COMMON', 75, 'mistakesFixed', 25, '২৫টি unique mistake question ঠিক করা।'),
    make(6, '3-Day Streak', 'STARTER', 'COMMON', 50, 'streak', 3, '৩ দিন ধারাবাহিক meaningful study।'),
    make(7, '7-Day Streak', 'STARTER', 'COMMON', 100, 'streak', 7, '৭ দিন ধারাবাহিক meaningful study।'),
    make(8, 'Accuracy 80', 'STARTER', 'COMMON', 100, 'accuracy80', 100, '১০০ unique question ও ন্যূনতম ৮০% accuracy।'),
    make(9, 'First Improvement', 'STARTER', 'COMMON', 100, 'improvements', 1, 'তুলনীয় test-এ ন্যূনতম ১০% improvement।'),
    make(10, 'First Mastery', 'STARTER', 'COMMON', 100, 'masteredTopics', 1, 'একটি topic-এ ৯০% mastery।'),
    make(11, '500 Solver', 'GRIND', 'COMMON', 150, 'uniqueQuestions', 500, '৫০০টি unique question।'),
    make(12, '1K Solver', 'GRIND', 'RARE', 250, 'uniqueQuestions', 1000, '১,০০০টি unique question।'),
    make(13, '2.5K Solver', 'GRIND', 'RARE', 350, 'uniqueQuestions', 2500, '২,৫০০টি unique question।'),
    make(14, '5K Solver', 'GRIND', 'RARE', 500, 'uniqueQuestions', 5000, '৫,০০০টি unique question।'),
    make(15, '10K Solver', 'GRIND', 'RARE', 750, 'uniqueQuestions', 10000, '১০,০০০টি unique question।'),
    make(16, '20K Solver', 'GRIND', 'EPIC', 1000, 'uniqueQuestions', 20000, '২০,০০০টি unique question।'),
    make(17, '30K Solver', 'GRIND', 'EPIC', 1500, 'uniqueQuestions', 30000, '৩০,০০০টি unique question।'),
    make(18, '50K Solver', 'GRIND', 'EPIC', 2000, 'uniqueQuestions', 50000, '৫০,০০০টি unique question।'),
    make(19, '1000 Correct', 'GRIND', 'RARE', 500, 'firstAttemptCorrect', 1000, '১,০০০টি first-attempt correct answer।'),
    make(20, 'Question Warrior', 'GRIND', 'LEGENDARY', 5000, 'uniqueQuestions', 100000, '১,০০,০০০টি unique question।'),
    make(21, 'Accuracy 90', 'MASTERY', 'RARE', 500, 'accuracy90', 500, '৫০০ unique question ও ৯০% overall accuracy।'),
    make(22, 'Perfect Test', 'MASTERY', 'RARE', 300, 'perfectTests', 1, 'কমপক্ষে ২০ প্রশ্নের ১০০% accurate test।'),
    make(23, '5 Topic Master', 'MASTERY', 'RARE', 500, 'masteredTopics', 5, '৫টি topic-এ ৯০% mastery।'),
    make(24, '10 Topic Master', 'MASTERY', 'EPIC', 1000, 'masteredTopics', 10, '১০টি topic-এ ৯০% mastery।'),
    make(25, 'Subject Master', 'MASTERY', 'EPIC', 1000, 'masteredSubjects', 1, 'একটি subject-এ ৯০% mastery।'),
    make(26, '3 Subject Master', 'MASTERY', 'EPIC', 1500, 'masteredSubjects', 3, '৩টি subject-এ ৯০% mastery।'),
    make(27, 'Accuracy 95', 'MASTERY', 'EPIC', 1500, 'accuracy95', 1000, '১,০০০ unique question ও ৯৫% accuracy।'),
    make(28, 'Speed Master', 'MASTERY', 'EPIC', 1000, 'speedTests', 1, 'সময়-এর ৮৫%-এর মধ্যে শেষ করা ৯০% accurate timed test।'),
    make(29, 'Time Master', 'MASTERY', 'EPIC', 1500, 'timedReliableTests', 10, '১০টি timeout ছাড়া timed test ও ৮৫% average accuracy।'),
    make(30, 'Academic Weapon', 'MASTERY', 'LEGENDARY', 3000, 'academicWeapon', 1, 'সব major subject mastered, ৫K unique ও ৯০% accuracy।', { titleUnlock:'Academic Weapon' }),
    make(31, 'First Mistake Fixed', 'MISTAKE', 'COMMON', 25, 'mistakesFixed', 1, 'প্রথম previously wrong question ঠিক করা।'),
    make(32, '100 Mistakes Fixed', 'MISTAKE', 'RARE', 250, 'mistakesFixed', 100, '১০০টি unique mistake question ঠিক করা।'),
    make(33, '250 Mistakes Fixed', 'MISTAKE', 'RARE', 500, 'mistakesFixed', 250, '২৫০টি unique mistake question ঠিক করা।'),
    make(34, '500 Mistakes Fixed', 'MISTAKE', 'EPIC', 1000, 'mistakesFixed', 500, '৫০০টি unique mistake question ঠিক করা।'),
    make(35, 'Comeback', 'MISTAKE', 'EPIC', 750, 'mistakeCorrections', 100, '১০০টি previous wrong question revision-এ correct করা।'),
    make(36, 'Zero Repeat', 'MISTAKE', 'EPIC', 1000, 'doubleCorrections', 100, '১০০টি wrong question পরের দুই valid attempt-এ correct করা।'),
    make(37, 'Weak Topic Crusher', 'MISTAKE', 'EPIC', 1000, 'weakTopicRecoveries', 1, '৬০%-এর নিচের weak topic ৮৫%-এ উন্নীত করা।'),
    make(38, 'Error Hunter', 'MISTAKE', 'EPIC', 1500, 'revisionReviews', 1000, '১,০০০টি mistake/revision question review।'),
    make(39, 'Mistake Bank Master', 'MISTAKE', 'LEGENDARY', 2500, 'mistakeMastery', 90, 'Active Mistake Bank-এর ৯০% mastered।', { titleUnlock:'Mistake Master' }),
    make(40, 'Mistake Master', 'MISTAKE', 'LEGENDARY', 3000, 'mistakeMaster', 1, '১,০০০ mistakes fixed, ৯০% mistake accuracy ও no major weakness।', { titleUnlock:'Mistake Master' }),
    make(41, '10 Mock Veteran', 'EXAM', 'RARE', 500, 'mockTests', 10, '১০টি completed Mock Test।'),
    make(42, '25 Mock Veteran', 'EXAM', 'EPIC', 1000, 'mockTests', 25, '২৫টি completed Mock Test।'),
    make(43, '50 Mock Veteran', 'EXAM', 'EPIC', 2000, 'mockTests', 50, '৫০টি completed Mock Test।'),
    make(44, '100 Mock Veteran', 'EXAM', 'LEGENDARY', 3000, 'mockTests', 100, '১০০টি completed Mock Test।'),
    make(45, 'Personal Best', 'EXAM', 'RARE', 200, 'personalBests', 1, 'কমপক্ষে ২০ প্রশ্নের valid test-এ previous best score ভাঙা।'),
    make(46, 'Comeback Champion', 'EXAM', 'LEGENDARY', 2500, 'comebackChampion', 1, '২৫% comparable improvement অথবা ৩টি ধারাবাহিক score improvement।'),
    make(47, 'Elite Performer', 'EXAM', 'LEGENDARY', 3000, 'elitePerformer', 1, '১০ Mock, ৯০% average accuracy ও no major weakness।'),
    make(48, '100-Day Warrior', 'EXAM', 'LEGENDARY', 5000, 'warrior100', 1, '১০০-day streak, ৫K unique ও ২০ completed test।', { titleUnlock:'100-Day Warrior' }),
    make(49, 'ADMISSION READY', 'EXAM', 'ULTIMATE', 10000, 'admissionReady', 1, 'সব readiness condition পূর্ণ করা।', { titleUnlock:'ADMISSION READY' }),
    make(50, 'ADMISSION HUB LEGEND', 'EXAM', 'ULTIMATE', 25000, 'hubLegend', 1, 'চূড়ান্ত ১০০-day admission achievement।', { titleUnlock:'ADMISSION HUB LEGEND' })
  ];

  function emptyState() {
    return { version:VERSION, migratedAt:0, xp:0, totalXpEarned:0, unlocked:{}, activeDays:[], dailyGoalDays:{}, studySessionDays:{}, vocabularyDays:{}, processedEvents:[],
      totals:{ uniqueQuestions:0, firstAttemptCorrect:0, attempts:0, correct:0, revisionReviews:0, mistakesFixed:0, mistakeCorrections:0, doubleCorrections:0, mockTests:0, flashTests:0, completedTests:0, highAccuracyTests:0, perfectTests:0, speedTests:0, timedReliableTests:0, timedAccuracyTotal:0, personalBests:0, improvements:0, consecutiveImprovedTests:0, weakTopicRecoveries:0, sessions:0, vocabularyAnswers:0, revisionXp:0, bestScore:null, lastComparableScore:null, lastFiveMockAccuracy:[], masteredTopics:0, masteredSubjects:0, mistakeMastery:0, mistakeAccuracy:0, allMajorSubjectsMastered:false, noMajorWeakness:false, allMajorSubjectsCount:0 }, selectedTitle:'' };
  }
  function state() {
    const saved = getCache()?.settings?.[KEY] || getCache()?.settings?.[LEGACY_KEY];
    const base = emptyState();
    return saved && typeof saved === 'object' ? { ...base, ...saved, version:VERSION, totals:{ ...base.totals, ...(saved.totals || {}) }, unlocked:{ ...(saved.unlocked || {}) }, activeDays:Array.isArray(saved.activeDays) ? saved.activeDays : [], dailyGoalDays:{ ...(saved.dailyGoalDays || {}) }, studySessionDays:{ ...(saved.studySessionDays || {}) }, vocabularyDays:{ ...(saved.vocabularyDays || {}) }, processedEvents:Array.isArray(saved.processedEvents) ? saved.processedEvents.slice(-EVENT_LIMIT) : [] } : base;
  }
  function claimEvent(next, eventId) {
    const id = String(eventId || '').trim();
    if (!id) return true;
    if (next.processedEvents.includes(id)) return false;
    next.processedEvents = [...next.processedEvents, id].slice(-EVENT_LIMIT);
    return true;
  }
  async function persist(next) {
    if (!getCache()) return;
    getCache().settings = { ...(getCache().settings || { id:'main' }), [KEY]:next };
    await window.dbPut?.('settings', getCache().settings);
  }
  function isUnlocked(next, definition) { return Boolean(next.unlocked[definition.id]); }
  function addDay(next, date = now()) {
    const key = keyOf(date);
    if (!next.activeDays.includes(key)) next.activeDays = [...next.activeDays, key].sort().slice(-DAY_LIMIT);
  }
  function streak(next) {
    const days = new Set(next.activeDays);
    let count = 0, cursor = new Date();
    while (days.has(keyOf(cursor))) { count++; cursor.setDate(cursor.getDate() - 1); }
    return count;
  }
  function overallAccuracy(t) { return pct(t.correct, t.attempts); }
  function ratio(t) { return t.mistakeMastery; }
  function metric(definition, next) {
    const t = next.totals;
    const direct = { sessions:t.sessions, uniqueQuestions:t.uniqueQuestions, firstAttemptCorrect:t.firstAttemptCorrect, mistakesFixed:t.mistakesFixed, streak:streak(next), masteredTopics:t.masteredTopics, masteredSubjects:t.masteredSubjects, mockTests:t.mockTests, revisionReviews:t.revisionReviews, mistakeCorrections:t.mistakeCorrections, doubleCorrections:t.doubleCorrections, weakTopicRecoveries:t.weakTopicRecoveries, highAccuracyTests:t.highAccuracyTests, perfectTests:t.perfectTests, speedTests:t.speedTests, timedReliableTests:t.timedReliableTests, personalBests:t.personalBests, improvements:t.improvements };
    if (definition.metric === 'timedReliableTests') return { value:t.timedReliableTests, target:definition.target, complete:t.timedReliableTests >= definition.target && num(t.timedAverageAccuracy) >= 85 };
    if (Object.prototype.hasOwnProperty.call(direct, definition.metric)) return { value:num(direct[definition.metric]), target:definition.target, complete:num(direct[definition.metric]) >= definition.target };
    if (definition.metric === 'accuracy80') return { value:t.uniqueQuestions >= 100 ? overallAccuracy(t) : 0, target:80, complete:t.uniqueQuestions >= 100 && overallAccuracy(t) >= 80 };
    if (definition.metric === 'accuracy90') return { value:t.uniqueQuestions >= 500 ? overallAccuracy(t) : 0, target:90, complete:t.uniqueQuestions >= 500 && overallAccuracy(t) >= 90 };
    if (definition.metric === 'accuracy95') return { value:t.uniqueQuestions >= 1000 ? overallAccuracy(t) : 0, target:95, complete:t.uniqueQuestions >= 1000 && overallAccuracy(t) >= 95 };
    if (definition.metric === 'academicWeapon') return { value:(t.allMajorSubjectsMastered && t.uniqueQuestions >= 5000 && overallAccuracy(t) >= 90) ? 1 : 0, target:1, complete:t.allMajorSubjectsMastered && t.uniqueQuestions >= 5000 && overallAccuracy(t) >= 90 };
    if (definition.metric === 'mistakeMastery') return { value:ratio(t), target:90, complete:ratio(t) >= 90 };
    if (definition.metric === 'mistakeMaster') return { value:(t.mistakesFixed >= 1000 && t.mistakeAccuracy >= 90 && t.noMajorWeakness) ? 1 : 0, target:1, complete:t.mistakesFixed >= 1000 && t.mistakeAccuracy >= 90 && t.noMajorWeakness };
    if (definition.metric === 'comebackChampion') return { value:(t.improvements >= 1 || t.consecutiveImprovedTests >= 3) ? 1 : 0, target:1, complete:t.improvements >= 1 || t.consecutiveImprovedTests >= 3 };
    if (definition.metric === 'elitePerformer') return { value:(t.mockTests >= 10 && t.mockAverageAccuracy >= 90 && t.noMajorWeakness) ? 1 : 0, target:1, complete:t.mockTests >= 10 && t.mockAverageAccuracy >= 90 && t.noMajorWeakness };
    if (definition.metric === 'warrior100') return { value:(streak(next) >= 100 && t.uniqueQuestions >= 5000 && t.completedTests >= 20) ? 1 : 0, target:1, complete:streak(next) >= 100 && t.uniqueQuestions >= 5000 && t.completedTests >= 20 };
    if (definition.metric === 'admissionReady') return { value:(t.uniqueQuestions >= 10000 && overallAccuracy(t) >= 90 && t.mistakeMastery >= 90 && t.masteredTopics >= 10 && t.masteredSubjects >= 3 && t.mockTests >= 20 && t.lastFiveMockAverage >= 85 && t.noMajorWeakness && next.activeDays.length >= 30) ? 1 : 0, target:1, complete:t.uniqueQuestions >= 10000 && overallAccuracy(t) >= 90 && t.mistakeMastery >= 90 && t.masteredTopics >= 10 && t.masteredSubjects >= 3 && t.mockTests >= 20 && t.lastFiveMockAverage >= 85 && t.noMajorWeakness && next.activeDays.length >= 30 };
    if (definition.metric === 'hubLegend') return { value:(streak(next) >= 100 && t.uniqueQuestions >= 50000 && overallAccuracy(t) >= 90 && t.accuracy95Reached && t.mistakesFixed >= 1000 && t.mistakeMastery >= 90 && t.masteredTopics >= 20 && t.allMajorSubjectsMastered && t.mockTests >= 50 && t.personalBests >= 5 && t.revisionXp >= 3000 && isUnlocked(next, DEFINITIONS[48])) ? 1 : 0, target:1, complete:streak(next) >= 100 && t.uniqueQuestions >= 50000 && overallAccuracy(t) >= 90 && t.accuracy95Reached && t.mistakesFixed >= 1000 && t.mistakeMastery >= 90 && t.masteredTopics >= 20 && t.allMajorSubjectsMastered && t.mockTests >= 50 && t.personalBests >= 5 && t.revisionXp >= 3000 && isUnlocked(next, DEFINITIONS[48]) };
    return { value:0, target:definition.target || 1, complete:false };
  }
  function refreshDerived(next) {
    const t = next.totals;
    t.accuracy95Reached = Boolean(t.uniqueQuestions >= 1000 && overallAccuracy(t) >= 95);
    const activeMistakes = (getCache()?.mistakes || []).filter(row => row && row.mastered !== true);
    const allMistakes = (getCache()?.mistakes || []).filter(Boolean);
    const mastered = allMistakes.filter(row => row.mastered || row.revisionStatus === 'mastered').length;
    t.mistakeMastery = allMistakes.length ? Math.round((mastered / allMistakes.length) * 100) : 0;
    const corrected = allMistakes.filter(row => row.rewardFixedAt).length;
    t.mistakeAccuracy = allMistakes.length ? Math.round((corrected / allMistakes.length) * 100) : 0;
    t.noMajorWeakness = !(getCache()?.examResults || []).some(result => (result.topicBreakdown ? Object.values(result.topicBreakdown) : []).some(topic => Number(topic.total || 0) >= 10 && Number(topic.correct || 0) / Number(topic.total || 1) < 0.55));
    t.activeMistakeCount = activeMistakes.length;
  }
  function refreshMastery(next) {
    const topics = {}, subjects = {};
    (getCache()?.examResults || []).forEach(result => (result.snapshot || []).forEach(item => {
      if (item.status === 'skipped') return;
      const topic = topics[item.topicId] || (topics[item.topicId] = { total:0, correct:0, subjectId:item.subjectId });
      topic.total++; if (item.status === 'correct') topic.correct++;
      const subject = subjects[item.subjectId] || (subjects[item.subjectId] = { total:0, correct:0 });
      subject.total++; if (item.status === 'correct') subject.correct++;
    }));
    const masteredTopics = Object.values(topics).filter(row => row.total >= 10 && row.correct / row.total >= 0.9);
    const masteredSubjects = Object.values(subjects).filter(row => row.total >= 30 && row.correct / row.total >= 0.9);
    next.totals.masteredTopics = masteredTopics.length;
    next.totals.masteredSubjects = masteredSubjects.length;
    next.totals.allMajorSubjectsCount = Object.values(subjects).filter(row => row.total >= 30).length;
    next.totals.allMajorSubjectsMastered = next.totals.allMajorSubjectsCount > 0 && next.totals.masteredSubjects >= next.totals.allMajorSubjectsCount;
  }
  function award(next, amount, reason) {
    const gained = num(amount); if (!gained) return;
    next.xp += gained; next.totalXpEarned += gained;
    window.dispatchEvent(new CustomEvent('admission:xp-earned', { detail:{ amount:gained, reason } }));
  }
  function evaluate(next, source = 'activity', options = {}) {
    if (options.refreshDerived !== false) refreshDerived(next);
    const unlocked = [];
    DEFINITIONS.forEach(definition => {
      if (isUnlocked(next, definition)) return;
      const progress = metric(definition, next);
      if (!progress.complete) return;
      const record = { id:definition.id, unlockedAt:now(), source, xp:definition.xpReward };
      next.unlocked[definition.id] = record;
      award(next, definition.xpReward, definition.id);
      unlocked.push({ definition, record });
      if (definition.titleUnlock && !next.selectedTitle) next.selectedTitle = definition.titleUnlock;
    });
    return unlocked;
  }
  async function commit(next, source, options = {}) {
    const unlocked = evaluate(next, source, options);
    await persist(next);
    if (unlocked.length) window.dispatchEvent(new CustomEvent('admission:rewards-unlocked', { detail:{ unlocked, stats:getStats(next) } }));
    return unlocked;
  }
  function addMeaningfulActivity(next, timestamp) {
    addDay(next, timestamp);
    const day = keyOf(timestamp);
    if (!next.studySessionDays[day]) { next.studySessionDays[day] = now(); next.totals.sessions++; }
    const target = num(getCache()?.settings?.dailyTarget || 100);
    const daily = (getCache()?.dailyStats || []).find(row => row.id === day);
    if (num(daily?.questions) >= target && !next.dailyGoalDays[day]) { next.dailyGoalDays[day] = now(); award(next, 20, 'daily-goal'); }
  }
  function comparableScore(result) { return num(result?.accuracy); }
  function recordTestStatistics(next, result) {
    const t = next.totals, count = num(result.questionCount || result.snapshot?.length), accuracy = num(result.accuracy), valid = count >= 10 && !result.autoSubmit;
    if (!valid) return;
    t.completedTests++; addMeaningfulActivity(next, result.completedAt || result.date || now());
    if (result.mode === 'mock') t.mockTests++; else t.flashTests++;
    if (count >= 10 && accuracy >= 80) t.highAccuracyTests++;
    if (count >= 20 && accuracy === 100) t.perfectTests++;
    const allocated = num(result.duration) * 60;
    if (allocated && num(result.timeUsed) <= allocated * 0.85 && accuracy >= 90) t.speedTests++;
    if (allocated && !result.autoSubmit) { t.timedReliableTests++; t.timedAccuracyTotal += accuracy; }
    if (t.timedReliableTests) t.timedAverageAccuracy = Math.round(t.timedAccuracyTotal / t.timedReliableTests);
    const score = comparableScore(result);
    if (count >= 20) {
      if (t.bestScore === null || score > t.bestScore) { if (t.bestScore !== null) t.personalBests++; t.bestScore = score; }
      if (t.lastComparableScore !== null && score >= t.lastComparableScore * 1.1) t.improvements++;
      t.consecutiveImprovedTests = t.lastComparableScore !== null && score > t.lastComparableScore ? t.consecutiveImprovedTests + 1 : 0;
      t.lastComparableScore = score;
    }
    if (result.mode === 'mock') {
      t.lastFiveMockAccuracy = [...(t.lastFiveMockAccuracy || []), accuracy].slice(-5);
      t.lastFiveMockAverage = t.lastFiveMockAccuracy.length ? Math.round(t.lastFiveMockAccuracy.reduce((sum, value) => sum + value, 0) / t.lastFiveMockAccuracy.length) : 0;
      t.mockAverageAccuracy = t.lastFiveMockAverage;
    }
    refreshMastery(next);
  }
  async function migrate() {
    const next = state();
    if (next.migratedAt && getCache()?.settings?.[KEY]?.version === VERSION) return next;
    const legacySettings = getCache()?.settings || {};
    const legacyXp = num(legacySettings.xpBalance);
    if (legacyXp && !next.totalXpEarned) { next.xp = legacyXp; next.totalXpEarned = legacyXp; }
    if (legacySettings[LEGACY_KEY] && !legacySettings[KEY]) next.migratedAt = 0;
    const questions = getCache()?.questions || [];
    questions.forEach(question => {
      const stats = question.stats || {};
      if (num(stats.attempts)) { next.totals.uniqueQuestions++; next.totals.attempts += num(stats.attempts); next.totals.correct += num(stats.correct); }
    });
    (getCache()?.activityLogs || []).forEach(row => { if (row?.day) addDay(next, `${row.day}T12:00:00`); });
    (getCache()?.examResults || []).forEach(result => { recordTestStatistics(next, result); });
    (getCache()?.mistakes || []).forEach(mistake => { if (mistake?.rewardFixedAt) next.totals.mistakesFixed++; });
    refreshMastery(next); refreshDerived(next);
    next.migratedAt = now();
    const savedSettings = getCache()?.settings || {};
    const retired = { ...savedSettings, [KEY]:next };
    delete retired[LEGACY_KEY]; delete retired.xpBalance; delete retired.rewardInventory; delete retired.activeRewards; delete retired.rewardRemaining; delete retired.selectedRewardTheme; delete retired.gold; delete retired.diamonds;
    getCache().settings = retired;
    await window.dbPut?.('settings', retired);
    const unlocked = evaluate(next, 'historical-migration');
    await persist(next);
    if (unlocked.length) window.dispatchEvent(new CustomEvent('admission:rewards-unlocked', { detail:{ unlocked, stats:getStats(next) } }));
    return next;
  }
  async function recordQuestionAttempt({ question, correct, isFirstAttempt, isRevision, timestamp = now() } = {}) {
    if (!question) return [];
    const wasMigrated = Boolean(state().migratedAt);
    const next = await migrate();
    const eventId = `question:${question.id}:${isRevision ? 'revision' : 'attempt'}:${num(question.stats?.attempts)}`;
    if (!claimEvent(next, eventId)) return [];
    const t = next.totals;
    t.attempts++; if (correct) t.correct++;
    addMeaningfulActivity(next, timestamp);
    if (isFirstAttempt && wasMigrated && !question.rewardFirstAttemptLogged) {
      question.rewardFirstAttemptLogged = true; question.rewardFirstAttemptedAt = timestamp;
      t.uniqueQuestions++; if (correct) t.firstAttemptCorrect++;
      await window.dbPut?.('questions', question);
      award(next, 2 + (correct ? 1 : 0), correct ? 'first-correct' : 'first-attempt');
    } else if (isRevision) {
      t.revisionReviews++;
      const mistake = (getCache()?.mistakes || []).find(row => row.questionId === question.id);
      if (mistake && correct) { const priorCorrectRevisions = num(mistake.rewardCorrectRevisionCount); mistake.rewardCorrectRevisionCount = priorCorrectRevisions + 1; if (priorCorrectRevisions === 1 && !mistake.rewardDoubleCorrectedAt) { mistake.rewardDoubleCorrectedAt = timestamp; t.doubleCorrections++; } if (!mistake.rewardFixedAt) { mistake.rewardFixedAt = timestamp; mistake.revisionStatus = 'mastered'; mistake.mastered = true; t.mistakesFixed++; t.mistakeCorrections++; award(next, 3, 'mistake-fixed'); } await window.dbPut?.('mistakes', mistake); }
    }
    return commit(next, 'question-attempt', { refreshDerived:false });
  }
  async function recordTestCompleted(result) {
    if (!result?.id || result.rewardProcessedV1) return [];
    const wasMigrated = Boolean(state().migratedAt);
    const next = await migrate();
    if (!claimEvent(next, `test:${result.id}`)) return [];
    if (!wasMigrated) { result.rewardProcessedV1 = true; await window.dbPut?.('examResults', result); return []; }
    const t = next.totals;
    result.rewardProcessedV1 = true;
    for (const item of (result.snapshot || [])) {
      if (item.status === 'skipped') continue;
      t.attempts++; if (item.status === 'correct') t.correct++;
      const question = (getCache()?.questions || []).find(row => row.id === item.questionId);
      if (question && num(question.stats?.attempts) === 1 && !question.rewardFirstAttemptLogged) {
        question.rewardFirstAttemptLogged = true; question.rewardFirstAttemptedAt = result.completedAt || result.date || now();
        t.uniqueQuestions++; if (item.status === 'correct') t.firstAttemptCorrect++;
        award(next, 2 + (item.status === 'correct' ? 1 : 0), item.status === 'correct' ? 'first-test-correct' : 'first-test-attempt');
        await window.dbPut?.('questions', question);
      }
    }
    recordTestStatistics(next, result);
    const baseXp = result.mode === 'mock' ? 30 : 20;
    award(next, baseXp, result.mode === 'mock' ? 'mock-completed' : 'flash-completed');
    await window.dbPut?.('examResults', result);
    return commit(next, 'test-completed');
  }
  async function recordVocabularyActivity(detail = {}) {
    if (!detail.meaningful) return [];
    const next = await migrate(); const timestamp = detail.timestamp || now(), day = keyOf(timestamp);
    const eventId = detail.eventId || `vocabulary:${day}:${detail.kind || 'answer'}:${String(detail.word || '').trim().toLocaleLowerCase()}`;
    if (!claimEvent(next, eventId)) return [];
    if (!next.vocabularyDays[day]) next.vocabularyDays[day] = timestamp;
    next.totals.vocabularyAnswers = num(next.totals.vocabularyAnswers) + 1;
    addMeaningfulActivity(next, timestamp); award(next, 1, 'vocabulary-answer');
    return commit(next, 'vocabulary-study', { refreshDerived:false });
  }
  async function recordDailyProgress(detail = {}) {
    const next = await migrate(); const timestamp = detail.timestamp || now(), day = keyOf(timestamp);
    const daily = (getCache()?.dailyStats || []).find(row => row.id === day);
    if (!daily || num(daily.questions) < num(getCache()?.settings?.dailyTarget || 100) || next.dailyGoalDays[day]) return [];
    next.dailyGoalDays[day] = timestamp; award(next, 20, 'daily-goal');
    return commit(next, 'daily-goal', { refreshDerived:false });
  }
  function hookVocabulary() {
    const api = window.VocabularyMaster;
    if (!api || api.__rewardEngineHooked) return false;
    ['answerPractice','pickMatchMeaning'].forEach(name => {
      if (typeof api[name] !== 'function') return;
      const original = api[name];
      api[name] = function rewardVocabularyAnswer(...args) { const before = JSON.stringify(api.__rewardLastPractice || {}); const output = original.apply(this, args); const after = JSON.stringify(api.__rewardLastPractice || {}); if (before !== after || name === 'answerPractice') void recordVocabularyActivity({ meaningful:true, kind:name, word:args[0], timestamp:now() }); return output; };
    });
    api.__rewardEngineHooked = true; return true;
  }
  function getStats(next = state()) {
    const unlocked = Object.keys(next.unlocked || {}).length;
    return { xp:num(next.xp), totalXpEarned:num(next.totalXpEarned), unlocked, total:DEFINITIONS.length, percent:Math.round((unlocked / DEFINITIONS.length) * 100), streak:streak(next), accuracy:overallAccuracy(next.totals), ...next.totals };
  }
  function getRewards(filter = 'all') {
    const next = state();
    return DEFINITIONS.map(definition => {
      const progress = metric(definition, next); const unlocked = next.unlocked[definition.id] || null;
      return { ...definition, unlocked, progressValue:Math.min(progress.value, progress.target), targetValue:progress.target, progressPercent:Math.min(100, Math.round((progress.value / Math.max(1, progress.target)) * 100)) };
    }).filter(reward => filter === 'unlocked' ? reward.unlocked : filter === 'locked' ? !reward.unlocked : filter === 'legendary' ? reward.rarity === 'LEGENDARY' : filter === 'ultimate' ? reward.rarity === 'ULTIMATE' : true);
  }
  function getNextRewards(limit = 3) { return getRewards('all').filter(reward => !reward.unlocked && reward.progressValue > 0).sort((a, b) => b.progressPercent - a.progressPercent || a.number - b.number).slice(0, limit); }
  async function selectTitle(title) { const next = await migrate(); const valid = DEFINITIONS.some(definition => definition.titleUnlock === title && isUnlocked(next, definition)); if (!valid) return false; next.selectedTitle = title; await persist(next); return true; }

  const esc = value => String(value ?? '').replace(/[&<>'"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;' })[char]);
  let activeFilter = 'all';
  function rewardCard(reward) {
    const stateLabel = reward.unlocked ? `Unlocked ${new Date(reward.unlocked.unlockedAt).toLocaleDateString()}` : `${reward.progressValue.toLocaleString()} / ${reward.targetValue.toLocaleString()}`;
    return `<article id="reward-${reward.id}" class="reward-card ${reward.unlocked ? 'is-unlocked' : 'is-locked'} rarity-${reward.rarity.toLowerCase()}"><div class="reward-card-head"><span class="reward-icon" aria-hidden="true">${reward.icon}</span><span class="reward-number">${String(reward.number).padStart(2, '0')}</span><span class="reward-rarity">${esc(reward.rarity)}</span></div><h3>${esc(reward.title)}</h3><p>${esc(reward.description)}</p><div class="reward-progress" aria-label="${esc(reward.title)} progress ${reward.progressPercent}%"><i style="width:${reward.progressPercent}%"></i></div><div class="reward-card-foot"><span>${esc(stateLabel)}</span><b>+${reward.xpReward.toLocaleString()} XP</b></div></article>`;
  }
  function renderRewards() {
    const stats = getStats(), rewards = getRewards(activeFilter), titles = DEFINITIONS.filter(definition => definition.titleUnlock && state().unlocked[definition.id]);
    const filters = [['all','All'],['unlocked','Unlocked'],['locked','Locked'],['legendary','Legendary'],['ultimate','Ultimate']].map(([key,label]) => `<button class="reward-filter ${activeFilter === key ? 'active' : ''}" onclick="RewardEngine.setFilter('${key}')">${label}</button>`).join('');
    const next = getNextRewards();
    const nextHtml = next.length ? next.map(reward => `<button class="reward-next-row" onclick="RewardEngine.focus('${reward.id}')"><span>${reward.icon}</span><span><b>${esc(reward.title)}</b><small>${reward.progressValue.toLocaleString()} / ${reward.targetValue.toLocaleString()}</small></span><i>${reward.progressPercent}%</i></button>`).join('') : '<p class="reward-empty">নতুন activity শুরু করলে নিকটবর্তী reward এখানে দেখা যাবে।</p>';
    const titleHtml = titles.length ? `<div class="reward-title-row"><span>Achievement title</span><select onchange="RewardEngine.selectTitle(this.value)"><option value="">No title</option>${titles.map(definition => `<option value="${esc(definition.titleUnlock)}" ${state().selectedTitle === definition.titleUnlock ? 'selected' : ''}>${esc(definition.titleUnlock)}</option>`).join('')}</select></div>` : '';
    window.renderShell(`<main class="reward-center"><header class="reward-hero"><div><span>ADMISSION HUB · ACHIEVEMENTS</span><h1>🏆 Your Rewards</h1><p>Real study activity থেকে আপনার preparation journey।</p></div><div class="reward-xp"><b>${stats.xp.toLocaleString()}</b><small>XP EARNED</small></div></header><section class="reward-summary"><div><b>${stats.unlocked} / ${stats.total}</b><span>Unlocked</span></div><div><b>${stats.percent}%</b><span>Complete</span></div><div><b>${stats.streak}</b><span>Day Streak</span></div></section>${titleHtml}<section class="reward-next"><div class="reward-section-head"><div><span>NEXT 3 REWARDS</span><h2>সবচেয়ে কাছের লক্ষ্য</h2></div></div>${nextHtml}</section><div class="reward-filters" role="tablist">${filters}</div><section class="reward-grid">${rewards.map(rewardCard).join('') || '<p class="reward-empty">এই filter-এ কোনো reward নেই।</p>'}</section></main>`, { title:'Rewards', back:"navigate('dashboard')" });
  }
  function injectDashboardCard() {
    const path = String(window.Router?.path || '');
    if (path !== 'dashboard') return;
    const page = document.querySelector('#app .page');
    if (!page || page.querySelector('[data-reward-dashboard]')) return;
    const stats = getStats(), next = getNextRewards(1)[0];
    const card = document.createElement('button');
    card.type = 'button'; card.className = 'reward-dashboard-card'; card.dataset.rewardDashboard = 'true';
    card.innerHTML = `<span class="reward-dashboard-icon">🏆</span><span class="reward-dashboard-copy"><small>REWARDS</small><b>${stats.unlocked} / ${stats.total} unlocked · ${stats.xp.toLocaleString()} XP</b><em><i style="width:${stats.percent}%"></i></em>${next ? `<strong>Next: ${esc(next.title)} · ${next.progressValue}/${next.targetValue}</strong>` : '<strong>Study activity শুরু করলে progress দেখা যাবে</strong>'}</span><span class="reward-dashboard-arrow">›</span>`;
    card.onclick = () => window.navigate('rewards');
    const anchor = page.querySelector('.p3-command-section-v3') || page.querySelector('[data-unified-study-tools-list]') || page.firstElementChild;
    if (anchor?.parentElement) anchor.before(card); else page.appendChild(card);
  }
  function showUnlock(unlocked) {
    const winner = unlocked?.[0]?.definition; if (!winner) return;
    document.getElementById('rewardUnlockToast')?.remove();
    const toast = document.createElement('button'); toast.id = 'rewardUnlockToast'; toast.type = 'button'; toast.innerHTML = `<span>🏆</span><span><small>REWARD UNLOCKED</small><b>${esc(winner.title)} · +${winner.xpReward.toLocaleString()} XP</b></span><i>View →</i>`;
    toast.onclick = () => window.navigate('rewards'); document.body.appendChild(toast); setTimeout(() => toast.remove(), 7000);
  }
  function installUi() {
    const previousRoute = window.__admissionRenderRoute;
    if (typeof previousRoute === 'function' && !previousRoute.__rewardEngineWrapped) {
      const wrapped = function rewardRouteRenderer() { const path = String(window.Router?.path || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard'); if (path === 'rewards') return renderRewards(); return previousRoute.apply(this, arguments); };
      wrapped.__rewardEngineWrapped = true; window.__admissionRenderRoute = wrapped;
    }
    const previousDashboard = window.renderDashboard;
    if (typeof previousDashboard === 'function' && !previousDashboard.__rewardEngineWrapped) { const wrapped = function rewardDashboardRenderer() { const output = previousDashboard.apply(this, arguments); requestAnimationFrame(injectDashboardCard); return output; }; wrapped.__rewardEngineWrapped = true; window.renderDashboard = wrapped; }
    window.addEventListener('admission:rewards-unlocked', event => { showUnlock(event.detail?.unlocked); requestAnimationFrame(injectDashboardCard); });
    window.addEventListener('hashchange', () => requestAnimationFrame(injectDashboardCard), { passive:true });
    document.addEventListener('admission:route-rendered', () => requestAnimationFrame(injectDashboardCard));
    const style = document.createElement('style'); style.textContent = `.reward-center{display:grid;gap:16px;padding-bottom:10px}.reward-hero{display:flex;align-items:flex-start;justify-content:space-between;gap:14px;padding:22px;border:1px solid #cfe6da;border-radius:22px;background:linear-gradient(145deg,#f7fcfa,#e8f6ee)}.reward-hero>div>span,.reward-next span{color:#367462;font-size:10px;font-weight:900;letter-spacing:.13em}.reward-hero h1{margin:7px 0 5px;color:#173e31;font-size:27px}.reward-hero p{margin:0;color:#5d7469;font-size:12px}.reward-xp{min-width:88px;padding:13px 10px;border-radius:15px;background:#fff;text-align:center;box-shadow:0 6px 16px rgba(15,107,79,.08)}.reward-xp b,.reward-xp small{display:block}.reward-xp b{color:#0d684d;font-size:20px}.reward-xp small{margin-top:3px;color:#739185;font-size:8px;font-weight:900;letter-spacing:.08em}.reward-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}.reward-summary>div{padding:14px 8px;border:1px solid #dfece6;border-radius:15px;background:#fff;text-align:center}.reward-summary b,.reward-summary span{display:block}.reward-summary b{color:#154c3b;font-size:17px}.reward-summary span{margin-top:3px;color:#7b9187;font-size:10px;font-weight:800}.reward-title-row{display:flex;align-items:center;justify-content:space-between;gap:10px;padding:12px 14px;border:1px solid #dbe9e2;border-radius:15px;background:#fff}.reward-title-row span{font-size:12px;font-weight:800;color:#315f4f}.reward-title-row select{max-width:190px;min-height:38px;font:inherit}.reward-next{padding:16px;border:1px solid #d9e9e0;border-radius:19px;background:#fff}.reward-section-head h2{margin:4px 0 12px;color:#193e32;font-size:18px}.reward-next-row{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;width:100%;padding:11px 0;border:0;border-top:1px solid #edf3ef;background:transparent;color:var(--text);font:inherit;text-align:left}.reward-next-row:first-of-type{border-top:0}.reward-next-row>span:first-child{display:grid;place-items:center;width:32px;height:32px;border-radius:10px;background:#edf8f2}.reward-next-row b,.reward-next-row small{display:block}.reward-next-row b{font-size:13px}.reward-next-row small{margin-top:3px;color:#7b9187;font-size:11px}.reward-next-row i{color:#167555;font-size:12px;font-style:normal;font-weight:900}.reward-filters{display:flex;gap:7px;overflow:auto;padding-bottom:2px}.reward-filter{flex:0 0 auto;padding:8px 11px;border:1px solid #d9e9e0;border-radius:999px;background:#fff;color:#4d6f60;font:700 11px inherit}.reward-filter.active{border-color:#0f6b4f;background:#0f6b4f;color:#fff}.reward-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}.reward-card{display:grid;gap:9px;padding:14px;border:1px solid #dfece6;border-radius:17px;background:#fff}.reward-card.is-locked{background:#fbfdfc;opacity:.76}.reward-card-head{display:flex;align-items:center;gap:6px}.reward-icon{display:grid;place-items:center;width:30px;height:30px;border-radius:10px;background:#e8f6ee}.reward-number{color:#6b877a;font-size:10px;font-weight:900}.reward-rarity{margin-left:auto;font-size:8px;font-weight:900;letter-spacing:.06em}.rarity-legendary .reward-rarity{color:#875b1e}.rarity-ultimate .reward-rarity{color:#7d3c76}.reward-card h3{margin:0;color:#204838;font-size:14px;line-height:1.25}.reward-card p{min-height:46px;margin:0;color:#6a8277;font-size:11px;line-height:1.42}.reward-progress{height:6px;overflow:hidden;border-radius:999px;background:#e4efe9}.reward-progress i{display:block;height:100%;border-radius:inherit;background:#2d9b70}.reward-card-foot{display:flex;justify-content:space-between;gap:5px;color:#708a7e;font-size:9px;line-height:1.3}.reward-card-foot b{color:#187154;font-size:10px;white-space:nowrap}.reward-empty{margin:8px 0;color:#789084;font-size:12px}.reward-dashboard-card{display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:11px;width:100%;margin:0 0 14px;padding:14px;border:1px solid #cfe6da;border-radius:18px;background:linear-gradient(130deg,#f8fcfa,#ecf8f1);color:#204a3a;text-align:left;box-shadow:0 7px 18px rgba(15,107,79,.06);font:inherit}.reward-dashboard-icon{display:grid;place-items:center;width:39px;height:39px;border-radius:13px;background:#dff3e8;font-size:20px}.reward-dashboard-copy{display:grid;gap:3px;min-width:0}.reward-dashboard-copy small{color:#407967;font-size:9px;font-weight:900;letter-spacing:.11em}.reward-dashboard-copy b{overflow:hidden;font-size:12px;text-overflow:ellipsis;white-space:nowrap}.reward-dashboard-copy strong{overflow:hidden;color:#6b867a;font-size:10px;font-weight:700;text-overflow:ellipsis;white-space:nowrap}.reward-dashboard-copy em{height:5px;overflow:hidden;border-radius:99px;background:#dcece4}.reward-dashboard-copy em i{display:block;height:100%;border-radius:inherit;background:#1c805d}.reward-dashboard-arrow{color:#19805e;font-size:24px}.reward-dashboard-card:active{transform:scale(.985)}#rewardUnlockToast{position:fixed;right:14px;bottom:calc(88px + env(safe-area-inset-bottom));z-index:1500;display:grid;grid-template-columns:auto 1fr auto;align-items:center;gap:10px;max-width:calc(100vw - 28px);padding:12px 14px;border:1px solid #baddcc;border-radius:16px;background:#fff;color:#194c3a;box-shadow:0 12px 28px rgba(15,78,57,.18);font:inherit;text-align:left}.reward-title-row select{border:1px solid #cfe1d7;border-radius:10px;background:#fff;padding:7px;color:#244a3c}@media(max-width:370px){.reward-hero{padding:18px}.reward-hero h1{font-size:23px}.reward-grid{grid-template-columns:1fr}.reward-card p{min-height:auto}.reward-dashboard-copy b{font-size:11px}}`;
    document.head.appendChild(style); requestAnimationFrame(injectDashboardCard);
  }
  window.RewardEngine = { VERSION, definitions:DEFINITIONS, migrate, recordQuestionAttempt, recordTestCompleted, recordVocabularyActivity, recordDailyProgress, render:renderRewards, evaluateRewards:async () => { const next = await migrate(); return commit(next, 'manual-safe-evaluation'); }, getRewardProgress:id => getRewards('all').find(reward => reward.id === id) || null, getUnlockedRewards:() => getRewards('unlocked'), getLockedRewards:() => getRewards('locked'), getNextRewards, getRewardStats:() => getStats(), getRewards, selectTitle:async title => { await selectTitle(title); renderRewards(); }, setFilter:filter => { activeFilter = filter; renderRewards(); }, focus:id => { activeFilter = 'all'; renderRewards(); setTimeout(() => document.getElementById(`reward-${id}`)?.scrollIntoView({ behavior:'smooth', block:'center' }), 0); } };
  installUi();
  if (!hookVocabulary()) { let retries = 0; const timer = setInterval(() => { if (hookVocabulary() || ++retries > 20) clearInterval(timer); }, 300); }
  window.addEventListener('load', () => { const wait = () => { if (window.__admissionBootStatus === 'ready') { window.RewardEngine.migrate().catch(error => console.warn('[RewardEngine] migration skipped safely', error)); return; } setTimeout(wait, 350); }; wait(); }, { once:true });
})();
