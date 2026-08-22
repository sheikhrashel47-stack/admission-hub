/* Requested removals only. This layer intentionally preserves all non-requested tools. */
(() => {
  'use strict';
  const removeByText = (root = document) => {
    const targetText = /^(Weak Topic Test|Bookmarked|Unattempted|Random Challenge|Subject Test|Topic Test)$/i;
    root.querySelectorAll('button, [role="button"], article, section, .card, .p3-special-card-v3, .p3-command-card').forEach((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (targetText.test(text) || /Smart Dictionary|Daily GK|Web Chat|Memorizing|আজকের প্রস্তুতি শুরু করো|Today.?s smart focus/i.test(text)) {
        const candidate = node.closest('button, article, section, .card, .p3-special-card-v3, .p3-command-card') || node;
        if (candidate !== document.body) candidate.remove();
      }
    });
    root.querySelectorAll('.p3-recommend-v3, .p3-tasks-v3, .p3-bottom-row-v3').forEach((node) => node.remove());
    const specialSections = [...root.querySelectorAll('.p3-special-section-v3')];
    if (specialSections[0]) specialSections[0].remove();
  };
  const trimExamModes = () => {
    const remove = /Weak Topic Test|Bookmarked|Unattempted|Random Challenge|Subject Test|Topic Test/i;
    document.querySelectorAll('button, article, [role="button"], .exam-mode-card, .mode-card').forEach((node) => {
      const text = (node.textContent || '').replace(/\s+/g, ' ').trim();
      if (remove.test(text)) {
        const candidate = node.closest('button, article, [role="button"], .exam-mode-card, .mode-card') || node;
        if (candidate !== document.body) candidate.remove();
      }
    });
  };
  const apply = () => { removeByText(); trimExamModes(); };
  const originalRender = window.render;
  if (typeof originalRender === 'function' && !originalRender.__requestedRemovals) {
    const wrapped = function requestedRemovalsRender() {
      const path = String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
      if (path === 'dictionary') { location.hash = '#dashboard'; return; }
      const result = originalRender.apply(this, arguments);
      setTimeout(apply, 0); setTimeout(apply, 120); setTimeout(apply, 500);
      return result;
    };
    wrapped.__requestedRemovals = true;
    window.render = wrapped;
    try { render = wrapped; } catch (_) {}
  }
  const observer = new MutationObserver(() => apply());
  observer.observe(document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => { if (location.hash.includes('dictionary')) location.hash = '#dashboard'; setTimeout(apply, 0); });
  setTimeout(apply, 0); setTimeout(apply, 800);
})();
