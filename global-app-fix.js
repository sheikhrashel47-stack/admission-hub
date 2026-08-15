(() => {
  'use strict';

  const resetViewScroll = () => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    document.querySelectorAll('.page, .setup-scroll').forEach(node => {
      node.scrollTop = 0;
    });
  };

  const scheduleScrollReset = () => {
    resetViewScroll();
    requestAnimationFrame(resetViewScroll);
    setTimeout(resetViewScroll, 50);
  };

  const originalNavigate = window.navigate;
  if (typeof originalNavigate === 'function') {
    window.navigate = function(...args) {
      const result = originalNavigate.apply(this, args);
      scheduleScrollReset();
      return result;
    };
  }

  window.addEventListener('hashchange', scheduleScrollReset, false);

  const bindNestedClickGuards = () => {
    document.querySelectorAll('[role="button"][onclick] button, [role="button"][onclick] a, [role="button"][onclick] input, [role="button"][onclick] select, [role="button"][onclick] textarea, [role="button"][onclick] [role="button"]').forEach(control => {
      if (control.dataset.nestedClickGuard === '1') return;
      control.dataset.nestedClickGuard = '1';
      control.addEventListener('click', event => event.stopPropagation(), false);
    });
  };

  bindNestedClickGuards();
  const app = document.getElementById('app');
  if (app && typeof MutationObserver === 'function') {
    new MutationObserver(bindNestedClickGuards).observe(app, { childList: true, subtree: true });
  }
})();

//# sourceURL=global-app-fix.js
