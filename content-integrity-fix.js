/* Content integrity and user-triggered cleanup. This module never runs destructive work automatically. */
(() => {
  'use strict';
  const topicIdsFor = (rootId) => {
    const ids = new Set([rootId]);
    let changed = true;
    while (changed) {
      changed = false;
      for (const topic of (window.CACHE?.topics || [])) {
        if (topic.parentTopicId && ids.has(topic.parentTopicId) && !ids.has(topic.id)) {
          ids.add(topic.id);
          changed = true;
        }
      }
    }
    return ids;
  };

  const cache = () => (typeof CACHE !== 'undefined' ? CACHE : { questions: [], topics: [], exams: [], examResults: [] });
  const counts = () => ({
    questions: Array.isArray(cache().questions) ? cache().questions.length : 0,
    topics: Array.isArray(cache().topics) ? cache().topics.length : 0,
    exams: Array.isArray(cache().exams) ? cache().exams.length : 0,
    results: Array.isArray(cache().examResults) ? cache().examResults.length : 0,
  });

  window.clearQuestionsTopicsAndExamHistory = () => {
    const before = counts();
    if (!before.questions && !before.topics && !before.exams && !before.results) {
      window.toast?.('Questions, Topics and Exam history are already empty.');
      return;
    }
    const summary = `Questions: ${before.questions}\nTopics: ${before.topics}\nExam records: ${before.exams}\nExam results: ${before.results}`;
    const run = async () => {
      try {
        for (const store of ['questions', 'topics', 'exams', 'examResults']) await dbClear(store);
        if (typeof ActiveExam !== 'undefined') ActiveExam = null;
        await loadCache();
        const after = counts();
        const safe = after.questions === 0 && after.topics === 0 && after.exams === 0 && after.results === 0;
        if (!safe) throw new Error('Verification failed: one or more content stores are not empty.');
        window.toast?.('Questions, Topics and Exam history permanently deleted.');
        if (typeof render === 'function') render();
      } catch (error) {
        console.error('[Admission Hub] scoped cleanup failed', error);
        window.toast?.('Cleanup failed; saved data was not reported as deleted.');
      }
    };
    window.confirmModal?.(
      'Permanent Content Cleanup',
      `শুধু Questions, Topics এবং Exam history/results মুছে যাবে। Subjects, Settings, Vocabulary, Mistakes এবং app tools অক্ষত থাকবে।\n\n${summary}\n\nএই কাজটি Undo করা যাবে না।`,
      run,
      'Delete Permanently',
      true
    );
  };

  const cleanupPanel = () => `<section id="ah-content-cleanup-panel" class="card" style="margin-top:14px;border:1px solid color-mix(in srgb, #b42318 25%, var(--line));background:color-mix(in srgb, #fff 92%, #b42318)"><div class="row between"><div><strong>Permanent Content Cleanup</strong><small style="display:block;margin-top:4px">শুধু Questions, Topics এবং Exam history/results মুছবে। Subjects, Settings, Vocabulary ও app tools অক্ষত থাকবে।</small></div><span class="pill" style="color:#b42318">IRREVERSIBLE</span></div><button class="btn danger" style="margin-top:12px" type="button" onclick="clearQuestionsTopicsAndExamHistory()">Clear Questions, Topics & Exam History</button></section>`;

  const injectCleanupPanel = () => {
    const page = document.querySelector('.ah-settings-page');
    if (!page || page.querySelector('#ah-content-cleanup-panel')) return;
    const toolbar = page.querySelector('.ah-settings-toolbar');
    if (toolbar) toolbar.insertAdjacentHTML('afterend', cleanupPanel());
  };

  const originalSettings = window.renderQuestionBankSettings;
  if (typeof originalSettings === 'function' && !window.__ahCleanupSettingsPatched) {
    window.__ahCleanupSettingsPatched = true;
    window.renderQuestionBankSettings = function () {
      const result = originalSettings.apply(this, arguments);
      window.setTimeout(injectCleanupPanel, 0);
      return result;
    };
  }

  // The settings route can be rendered by another route dispatcher; observe only this page.
  const observer = new MutationObserver(() => {
    if (location.hash.includes('question-bank/settings')) injectCleanupPanel();
  });
  observer.observe(document.body, { childList: true, subtree: true });

  // Expose a small pure helper for automated regression tests.
  window.__admissionContentIntegrity = { topicIdsFor, counts };
})();
