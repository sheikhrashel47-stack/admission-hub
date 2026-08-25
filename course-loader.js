(() => {
  'use strict';

  const DATA_SOURCES = [
    './parts-of-speech-course-data.js?v=parts-of-speech-course-v1-160-mcqs',
    './noun-course-data.js?v=noun-course-v1-148-mcqs',
    './voice-course-data.js?v=voice-course-v2-144-mcqs',
    './four-grammar-courses-data.js?v=four-grammar-v1-premium',
    './mass-grammar-courses-data.js?v=mass-grammar-v1-premium-pack',
    './pdf-grammar-courses-data.js?v=pdf-grammar-v1-five-courses-380-mcqs',
    './bangla-courses-data.js?v=bangla-courses-v1-18-source-isolated-498-mcqs'
  ];
  const TOOL_SOURCE = './course-tool.js?v=course-tool-v35-bangla-categories';
  let loadPromise = null;

  const currentPath = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const isCoursePath = () => currentPath() === 'courses' || currentPath().startsWith('courses/');

  const loadScript = src => new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[data-course-lazy="${src}"]`);
    if (existing?.dataset.loaded === 'true') return resolve();
    if (existing) {
      existing.addEventListener('load', resolve, {once:true});
      existing.addEventListener('error', reject, {once:true});
      return;
    }
    const script = document.createElement('script');
    script.src = src;
    script.async = false;
    script.dataset.courseLazy = src;
    script.addEventListener('load', () => { script.dataset.loaded = 'true'; resolve(); }, {once:true});
    script.addEventListener('error', () => reject(new Error(`Course module failed: ${src}`)), {once:true});
    document.head.appendChild(script);
  });

  const redrawCourseRoute = () => {
    if (!isCoursePath() || window.__admissionBootStatus !== 'ready') return;
    try {
      if (typeof window.__admissionRenderRoute === 'function') window.__admissionRenderRoute();
      else if (typeof window.render === 'function') window.render();
    } catch (error) {
      console.warn('[Admission Hub] Course route redraw deferred.', error);
    }
  };

  window.ensureCourseModules = () => {
    if (window.__courseToolReady) return Promise.resolve(true);
    if (loadPromise) return loadPromise;
    loadPromise = Promise.all(DATA_SOURCES.map(loadScript))
      .then(() => loadScript(TOOL_SOURCE))
      .then(() => {
        window.__courseToolReady = true;
        redrawCourseRoute();
        return true;
      })
      .catch(error => {
        loadPromise = null;
        console.error('[Admission Hub] Course modules could not load.', error);
        return false;
      });
    return loadPromise;
  };

  const ensureForRoute = () => { if (isCoursePath()) window.ensureCourseModules(); };
  window.addEventListener('hashchange', ensureForRoute, {passive:true});
  window.addEventListener('admission:route-rendered', ensureForRoute, {passive:true});
  ensureForRoute();
})();
