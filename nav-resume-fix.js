/**
 * nav-resume-fix.js v3 — Fix bottom nav bar floating above screen bottom
 * when returning to iOS PWA from external app (Gemini/ChatGPT).
 *
 * iOS Standalone PWA Bug:
 * When you navigate away (location.assign to Gemini/ChatGPT) and return,
 * iOS WebKit sometimes shrinks the reported viewport height. This causes
 * `position:fixed; bottom:0` to anchor to a point ABOVE the actual screen
 * bottom, leaving a visible white gap below the navigation bar.
 *
 * Fix Strategy:
 * 1. On resume, force a full-page scroll + resize recalculation
 * 2. Use window.innerHeight to set an explicit height on html/body
 * 3. Force the nav to use calc with window.innerHeight as fallback
 * 4. Trigger a minimal resize event to wake up WebKit's layout engine
 * 5. Remove false keyboard-open class
 */
(() => {
  'use strict';

  const isStandalone = window.matchMedia('(display-mode: standalone)').matches
    || window.navigator.standalone === true;

  let fixing = false;

  function fixNavPosition() {
    if (fixing) return;
    fixing = true;

    // 1. Remove false keyboard state
    document.body.classList.remove('keyboard-open');

    // 2. Scroll to 0,0 — iOS sometimes has phantom scroll offset after return
    window.scrollTo(0, 0);

    // 3. Force body/html to use actual window height
    const h = window.innerHeight;
    document.documentElement.style.setProperty('--app-vh', h + 'px');
    document.documentElement.style.height = h + 'px';
    document.body.style.height = h + 'px';
    document.body.style.minHeight = h + 'px';

    // 4. Reset viewport CSS vars
    document.documentElement.style.setProperty('--visual-viewport-height', h + 'px');
    document.documentElement.style.setProperty('--visual-viewport-offset-top', '0px');
    document.documentElement.style.setProperty('--keyboard-inset', '0px');

    // 5. Force nav element to absolute screen bottom using JS
    const navRoot = document.getElementById('navRoot');
    const nav = navRoot ? navRoot.querySelector('.bottomnav') : null;
    if (navRoot) {
      navRoot.style.setProperty('position', 'fixed', 'important');
      navRoot.style.setProperty('bottom', '0px', 'important');
      navRoot.style.setProperty('top', 'auto', 'important');
    }
    if (nav) {
      nav.style.setProperty('position', 'fixed', 'important');
      nav.style.setProperty('bottom', '0px', 'important');
      nav.style.setProperty('top', 'auto', 'important');
    }

    // 6. Trick WebKit into recalculating viewport by toggling a meta viewport
    const vp = document.querySelector('meta[name="viewport"]');
    if (vp) {
      const original = vp.content;
      vp.content = original + ', shrink-to-fit=no';
      requestAnimationFrame(() => {
        vp.content = original;
      });
    }

    // 7. Also try dispatching a resize event to trigger layout recalc
    try {
      window.dispatchEvent(new Event('resize'));
    } catch(e) {}

    // 8. After stabilization, remove inline styles so CSS takes over
    setTimeout(() => {
      document.documentElement.style.height = '';
      document.body.style.height = '';
      document.body.style.minHeight = '';
      if (navRoot) {
        navRoot.style.removeProperty('position');
        navRoot.style.removeProperty('bottom');
        navRoot.style.removeProperty('top');
      }
      if (nav) {
        nav.style.removeProperty('position');
        nav.style.removeProperty('bottom');
        nav.style.removeProperty('top');
      }
      // Re-check: if still displaced, keep the fix permanent
      requestAnimationFrame(() => {
        const navEl = document.getElementById('navRoot');
        if (navEl) {
          const rect = navEl.getBoundingClientRect();
          const screenH = window.innerHeight;
          // If nav bottom is more than 5px away from screen bottom, re-apply fix
          if (Math.abs(rect.bottom - screenH) > 5) {
            applyPermanentFix();
          }
        }
        fixing = false;
      });
    }, 2500);
  }

  function applyPermanentFix() {
    // If the normal CSS isn't working, inject a permanent style override
    let style = document.getElementById('nav-resume-permanent-fix');
    if (!style) {
      style = document.createElement('style');
      style.id = 'nav-resume-permanent-fix';
      document.head.appendChild(style);
    }
    const h = window.innerHeight;
    style.textContent = `
      #navRoot, #navRoot .bottomnav {
        position: fixed !important;
        bottom: 0px !important;
        top: auto !important;
        left: 0 !important;
        right: 0 !important;
        transform: translateZ(0) !important;
        -webkit-transform: translateZ(0) !important;
      }
      html, body {
        height: ${h}px !important;
        min-height: ${h}px !important;
        max-height: ${h}px !important;
        overflow: hidden !important;
      }
      #app {
        height: ${h}px !important;
        overflow-y: auto !important;
        overflow-x: hidden !important;
        -webkit-overflow-scrolling: touch !important;
      }
    `;
    // Remove the permanent fix after a while if viewport normalizes
    setTimeout(() => {
      const navEl = document.getElementById('navRoot');
      if (navEl) {
        // Temporarily remove fix to test
        style.textContent = '';
        requestAnimationFrame(() => {
          const rect = navEl.getBoundingClientRect();
          if (Math.abs(rect.bottom - window.innerHeight) > 5) {
            // Still broken, re-apply
            applyPermanentFix();
          }
          // else: fixed naturally, leave it removed
        });
      }
    }, 10000);
  }

  function handleResume() {
    // Immediate
    fixNavPosition();
    // Retry multiple times as iOS viewport settles
    setTimeout(fixNavPosition, 150);
    setTimeout(fixNavPosition, 400);
    setTimeout(fixNavPosition, 800);
    setTimeout(fixNavPosition, 1500);
  }

  // Suppress keyboard-open class during resume period
  let suppressUntil = 0;
  const origToggle = DOMTokenList.prototype.toggle;
  DOMTokenList.prototype.toggle = function(cls, force) {
    if (cls === 'keyboard-open' && Date.now() < suppressUntil && this === document.body.classList) {
      return false;
    }
    return origToggle.call(this, cls, force);
  };
  const origAdd = DOMTokenList.prototype.add;
  DOMTokenList.prototype.add = function(...cls) {
    if (Date.now() < suppressUntil && this === document.body.classList) {
      cls = cls.filter(c => c !== 'keyboard-open');
      if (!cls.length) return;
    }
    return origAdd.apply(this, cls);
  };

  // Event listeners for app resume
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      suppressUntil = Date.now() + 2000;
      handleResume();
    }
  });

  window.addEventListener('pageshow', () => {
    suppressUntil = Date.now() + 2000;
    handleResume();
  });

  if (isStandalone) {
    window.addEventListener('focus', () => {
      suppressUntil = Date.now() + 2000;
      setTimeout(handleResume, 30);
    });
  }

  // Safety: periodically check nav position and fix if displaced
  setInterval(() => {
    const el = document.activeElement;
    const editing = el && el.matches('input,textarea,select,[contenteditable]');
    if (editing) return; // Don't interfere during typing

    // Remove false keyboard-open
    if (document.body.classList.contains('keyboard-open')) {
      document.body.classList.remove('keyboard-open');
    }

    // Check nav position
    const navEl = document.getElementById('navRoot');
    if (navEl && navEl.querySelector('.bottomnav')) {
      const rect = navEl.getBoundingClientRect();
      const screenH = window.innerHeight;
      if (rect.bottom > 0 && Math.abs(rect.bottom - screenH) > 10) {
        fixNavPosition();
      }
    }
  }, 2000);

})();
