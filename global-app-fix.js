(() => {
  'use strict';

  if (!document.getElementById('ah-natural-scroll-fix')) {
    const style = document.createElement('style');
    style.id = 'ah-natural-scroll-fix';
    style.textContent = `
      html, body { overflow-y: auto !important; }
      #app { overflow: visible !important; }
      .setup-scroll { height: auto !important; max-height: none !important; overflow: visible !important; padding-bottom: 24px !important; }
      .setup-footer { position: sticky !important; bottom: calc(74px + var(--safe-b)) !important; }
    `;
    document.head.appendChild(style);
  }

  // Route changes begin at the top once, while scrolling inside a view remains natural.
  window.addEventListener('hashchange', () => window.scrollTo(0, 0), false);

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
