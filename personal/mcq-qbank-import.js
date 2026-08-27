(() => {
  'use strict';

  const IMPORT_ID = 'mcq_final_import_v1';
  const SOURCE = 'mcq_final.json';
  const SUBJECT_NAME = 'বাংলা';

  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

  async function waitForApp() {
    try {
      if (window.__admissionBootPromise && typeof window.__admissionBootPromise.then === 'function') {
        await window.__admissionBootPromise;
      }
    } catch (error) {
      console.warn('[MCQ import] app bootstrap failed before import', error);
      return false;
    }
    for (let attempt = 0; attempt < 200; attempt += 1) {
      if (typeof dbGet === 'function' && typeof dbGetAll === 'function' &&
          typeof dbPut === 'function' && typeof loadCache === 'function' &&
          typeof DB !== 'undefined' && DB && typeof CACHE !== 'undefined' && Array.isArray(CACHE.subjects)) {
        return true;
      }
      await sleep(100);
    }
    return false;
  }

  function topicCounts(questions) {
    return questions.reduce((counts, question) => {
      counts[question.topic] = (counts[question.topic] || 0) + 1;
      return counts;
    }, {});
  }

  async function ensureSubject() {
    let subject = CACHE.subjects.find(item => item.name === SUBJECT_NAME);
    if (subject) return subject;

    subject = {
      id: `${IMPORT_ID}_subject`,
      name: SUBJECT_NAME,
      icon: '📘',
      color: '#0f6b4f',
      order: CACHE.subjects.length,
      createdAt: Date.now()
    };
    if (await dbGet('subjects', subject.id)) subject.id = uid();
    await dbPut('subjects', subject);
    return subject;
  }

  async function ensureTopic(subject, name, order) {
    let topic = CACHE.topics.find(item => item.subjectId === subject.id && item.name === name);
    if (topic) return topic;

    topic = {
      id: `${IMPORT_ID}_topic_${order + 1}`,
      subjectId: subject.id,
      name,
      description: `MCQ questions from ${SOURCE}`,
      order,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    if (await dbGet('topics', topic.id)) topic.id = uid();
    await dbPut('topics', topic);
    return topic;
  }

  function validatePayload(payload) {
    if (!payload || !Array.isArray(payload.questions)) {
      throw new Error('mcq_final.json does not contain a questions array');
    }
    if (payload.questions.length !== 1046) {
      throw new Error(`Expected 1046 questions, received ${payload.questions.length}`);
    }
    const ids = new Set();
    for (const [index, item] of payload.questions.entries()) {
      if (!item || typeof item.id !== 'string' || ids.has(item.id)) {
        throw new Error(`Invalid or duplicate source id at row ${index + 1}`);
      }
      ids.add(item.id);
      if (typeof item.topic !== 'string' || !item.topic.trim()) {
        throw new Error(`Missing topic at row ${index + 1}`);
      }
      if (typeof item.question !== 'string' || !item.question.trim()) {
        throw new Error(`Missing question text at row ${index + 1}`);
      }
      if (!Array.isArray(item.options) || item.options.length !== 4 ||
          item.options.some(option => typeof option !== 'string')) {
        throw new Error(`Invalid options at row ${index + 1}`);
      }
      if (!Number.isInteger(item.answer) || item.answer < 0 || item.answer > 3) {
        throw new Error(`Invalid answer index at row ${index + 1}`);
      }
    }
  }

  async function importQuestions() {
    if (!(await waitForApp())) throw new Error('Question Bank database was not ready');

    const marker = await dbGet('appMeta', IMPORT_ID);
    if (marker && marker.count === 1046) return;

    const response = await fetch(new URL(SOURCE, document.baseURI), { cache: 'no-store' });
    if (!response.ok) throw new Error(`Could not load ${SOURCE}: HTTP ${response.status}`);
    const payload = await response.json();
    validatePayload(payload);

    await loadCache();
    const subject = await ensureSubject();
    const topicNames = [...new Set(payload.questions.map(item => item.topic))];
    const topics = {};
    for (const [order, name] of topicNames.entries()) {
      topics[name] = await ensureTopic(subject, name, order);
    }

    await loadCache();
    const existingIds = new Set(CACHE.questions.map(item => item.id));
    const records = payload.questions
      .filter(item => !existingIds.has(`mcq-${item.id}`))
      .map(item => ({
        id: `mcq-${item.id}`,
        subjectId: subject.id,
        topicId: topics[item.topic].id,
        question: item.question.trim(),
        options: item.options.map(option => option.trim()),
        answer: item.answer,
        explanation: item.explanation || '',
        tags: Array.isArray(item.tags) ? item.tags : [],
        difficulty: item.difficulty || 'medium',
        source: SOURCE,
        sourceQuestionId: item.id,
        questionNumber: Number.isFinite(Number(item.id)) ? Number(item.id) : undefined,
        sourcePage: item.source_page,
        stats: { attempts: 0, correct: 0, wrong: 0 },
        bookmarked: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }));

    for (let index = 0; index < records.length; index += 50) {
      await dbPutMany('questions', records.slice(index, index + 50));
      await sleep(0);
    }

    await loadCache();
    const importedIds = new Set(payload.questions.map(item => `mcq-${item.id}`));
    const importedCount = CACHE.questions.filter(item => importedIds.has(item.id)).length;
    if (importedCount !== 1046) {
      throw new Error(`Import verification failed: ${importedCount}/1046 records present`);
    }

    await dbPut('appMeta', {
      id: IMPORT_ID,
      source: SOURCE,
      count: 1046,
      topicCounts: topicCounts(payload.questions),
      importedAt: Date.now()
    });
    await loadCache();
    if (typeof render === 'function') render();
    console.info(`[MCQ import] ${records.length} new questions added; 1046 verified across ${topicNames.length} topics.`);
  }

  importQuestions().catch(error => console.error('[MCQ import] failed:', error));
})();
