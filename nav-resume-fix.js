/**
 * nav-resume-fix.js v4 — Safety net for bottom nav bar displacement
 * in iOS PWA after returning from background/external app.
 *
 * Primary fix: openExternalProvider now uses window.open('_blank') in
 * standalone mode, which prevents the viewport bug entirely.
 *
 * This file provides a fallback safety net:
 * - Removes false keyboard-open class on resume
 * - Periodically checks nav position and scrolls to fix if needed
 */
(() => {
  'use strict';

  function resetNavState() {
    // Remove false keyboard state if no input is focused
    const el = document.activeElement;
    const editing = el && el.matches('input,textarea,select,[contenteditable]');
    if (!editing) {
      document.body.classList.remove('keyboard-open');
    }
    // Reset scroll position if it's somehow offset
    if (window.scrollY > 0 && !editing) {
      window.scrollTo(0, 0);
    }
  }

  // On visibility change (returning to app)
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      setTimeout(resetNavState, 100);
      setTimeout(resetNavState, 500);
    }
  });

  window.addEventListener('pageshow', () => {
    setTimeout(resetNavState, 100);
    setTimeout(resetNavState, 500);
  });

  // Safety: periodic check - if keyboard-open is set but nothing is focused, remove it
  setInterval(() => {
    const el = document.activeElement;
    const editing = el && el.matches('input,textarea,select,[contenteditable]');
    if (!editing && document.body.classList.contains('keyboard-open')) {
      document.body.classList.remove('keyboard-open');
    }
  }, 3000);

})();
