/**
 * nav-resume-fix.js — Permanent fix for bottom navigation bar shifting up
 * when returning to the PWA from an external app (Gemini/ChatGPT).
 *
 * Root cause: On iOS standalone PWA, when the user navigates away via
 * window.location.assign() to Gemini/ChatGPT and then returns (via back
 * gesture or app switcher), the visualViewport temporarily reports a
 * smaller height. This triggers the keyboard-detection logic which adds
 * 'keyboard-open' class and/or sets --visual-viewport-height to a wrong
 * value, causing the bottom nav to float above its correct position.
 *
 * Fix: On pageshow/visibilitychange (resume), suppress keyboard detection
 * for a brief period and force-reset the nav bar position.
 */
(() => {
  'use strict';

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  // Track when we're returning from an external provider
  let resumeGuardActive = false;
  let resumeGuardTimer = null;

  function activateResumeGuard() {
    resumeGuardActive = true;
    clearTimeout(resumeGuardTimer);
    // Guard for 1200ms — enough for iOS to stabilize viewport
    resumeGuardTimer = setTimeout(() => {
      resumeGuardActive = false;
    }, 1200);
  }

  function forceNavReset() {
    // Remove keyboard-open class that may have been wrongly added
    document.body.classList.remove('keyboard-open');

    // Reset visual viewport CSS variable to full height
    document.documentElement.style.setProperty('--visual-viewport-height', '100dvh');
    document.documentElement.style.setProperty('--visual-viewport-offset-top', '0px');
    document.documentElement.style.setProperty('--keyboard-inset', '0px');

    // Force navRoot to correct position
    const navRoot = document.getElementById('navRoot');
    if (navRoot) {
      navRoot.style.cssText = '';
      const nav = navRoot.querySelector('.bottomnav');
      if (nav) nav.style.cssText = '';
    }

    // After viewport stabilizes, let the normal sync take over
    setTimeout(() => {
      const vv = window.visualViewport;
      if (vv) {
        document.documentElement.style.setProperty('--visual-viewport-height', `${vv.height}px`);
      }
    }, 800);
  }

  // Intercept the syncViewport / phaseKeyboardViewport to skip during resume
  const originalToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(token, force) {
    if (token === 'keyboard-open' && resumeGuardActive && this === document.body.classList) {
      // During resume guard, never add keyboard-open
      if (force === true || (force === undefined && !this.contains(token))) {
        return this.contains(token); // no-op, return current state
      }
    }
    return originalToggle.call(this, token, force);
  };

  // Also intercept classList.add for keyboard-open during resume
  const originalAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function(...tokens) {
    if (resumeGuardActive && this === document.body.classList && tokens.includes('keyboard-open')) {
      tokens = tokens.filter(t => t !== 'keyboard-open');
      if (tokens.length === 0) return;
    }
    return originalAdd.apply(this, tokens);
  };

  // Listen for app resume events
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      activateResumeGuard();
      // Use rAF + setTimeout to ensure we run after other handlers
      requestAnimationFrame(() => {
        setTimeout(forceNavReset, 50);
      });
    }
  });

  window.addEventListener('pageshow', (event) => {
    // event.persisted means page was restored from bfcache
    activateResumeGuard();
    requestAnimationFrame(() => {
      setTimeout(forceNavReset, 50);
    });
  });

  // Also handle focus event (some iOS versions fire this instead)
  window.addEventListener('focus', () => {
    if (isStandalone) {
      activateResumeGuard();
      requestAnimationFrame(() => {
        setTimeout(forceNavReset, 80);
      });
    }
  });

  // Additional safety: periodically check if nav is displaced while no input is focused
  let navCheckInterval = null;
  function startNavCheck() {
    if (navCheckInterval) return;
    navCheckInterval = setInterval(() => {
      const active = document.activeElement;
      const isEditing = active && active.matches('input,textarea,select,[contenteditable]');
      if (isEditing) return; // keyboard might legitimately be open

      // If keyboard-open is set but no input is focused, remove it
      if (document.body.classList.contains('keyboard-open')) {
        document.body.classList.remove('keyboard-open');
      }
    }, 2000);
  }
  startNavCheck();

})();
