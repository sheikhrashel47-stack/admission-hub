/* Personal Admission Hub clone mode.
 * This file is intentionally UI-only: it never deletes or rewrites user data.
 * Content is managed from the main Add to Home Screen app; this clone is for
 * reading, practice, exams, history, progress, vocabulary and routine activity.
 */
(() => {
  'use strict';

  const BLOCKED_ROUTES = new Set(['settings', 'question-parser', 'smart-formatter', 'routine-parser']);
  const textOf = el => `${el?.textContent || ''} ${el?.getAttribute?.('aria-label') || ''} ${el?.getAttribute?.('title') || ''} ${el?.getAttribute?.('onclick') || ''}`.replace(/\s+/g, ' ').trim();
  const currentPath = () => String(location.hash.replace(/^#\/?/, '').split('?')[0] || window.Router?.path || 'dashboard');

  window.ADMISSION_HUB_PERSONAL_CLONE = true;
  document.title = 'My Admission Hub · Personal Study';

  function isBlocked(path = currentPath()) {
    return BLOCKED_ROUTES.has(path) || [...BLOCKED_ROUTES].some(route => path.startsWith(`${route}/`));
  }

  function redirectBlockedRoute() {
    if (!isBlocked()) return false;
    if (window.Router) window.Router.path = 'dashboard';
    const target = `${location.pathname}${location.search}#dashboard`;
    if (location.href !== `${location.origin}${target}`) history.replaceState(null, document.title, target);
    if (typeof window.renderDashboard === 'function') window.renderDashboard();
    return true;
  }

  function hideCustomizationControls(root = document) {
    root.querySelectorAll('button, a, [role="button"]').forEach(el => {
      if (el.closest('[data-personal-clone-hidden]')) return;
      const text = textOf(el).toLowerCase();
      const isSettingsControl = /settings|app settings|question bank settings|private online backup|customi[sz]e/.test(text);
      if (isSettingsControl) {
        el.setAttribute('data-personal-clone-hidden', 'true');
        el.style.display = 'none';
      }
    });
    root.querySelectorAll('[data-personal-clone-badge]').forEach(() => {});
  }

  function patchRenderers() {
    const previousRender = window.render;
    if (typeof previousRender === 'function' && !previousRender.__personalCloneWrapped) {
      const wrapped = function personalCloneRender() {
        if (redirectBlockedRoute()) return;
        const result = previousRender.apply(this, arguments);
        setTimeout(() => hideCustomizationControls(), 0);
        setTimeout(() => hideCustomizationControls(), 120);
        return result;
      };
      wrapped.__personalCloneWrapped = true;
      window.render = wrapped;
    }

    const previousRoute = window.__admissionRenderRoute;
    if (typeof previousRoute === 'function' && !previousRoute.__personalCloneWrapped) {
      const wrappedRoute = function personalCloneRoute() {
        if (redirectBlockedRoute()) return;
        return previousRoute.apply(this, arguments);
      };
      wrappedRoute.__personalCloneWrapped = true;
      window.__admissionRenderRoute = wrappedRoute;
    }
  }

  let connectPromptShown = false;
  async function requestFirstConnection() {
    if (connectPromptShown || !window.AdmissionCloudSync?.status) return;
    try {
      const meta = await window.AdmissionCloudSync.status();
      if (meta?.vaultId) return;
      connectPromptShown = true;
      window.setTimeout(() => {
        if (!window.AdmissionCloudSync?.openConnectDialog) return;
        window.openModal(`<h3>Personal Study App connect করুন</h3><div class="muted">Main Add to Home Screen app-এর Recovery code একবার paste করুন। এরপর Question Bank, Vocabulary, Exam History, Progress ও 90-Day Routine দুই app-এ sync হবে। এই personal app-এ কোনো Settings বা content customization নেই।</div><button class="btn" style="margin-top:14px" onclick="AdmissionCloudSync.openConnectDialog()">Recovery code দিন</button>`);
      }, 900);
    } catch (_) {
      // The app remains usable offline; connection can be retried after reload.
    }
  }

  function start() {
    patchRenderers();
    hideCustomizationControls();
    redirectBlockedRoute();
    requestFirstConnection();
    const app = document.getElementById('app');
    if (app && !app.__personalCloneObserver) {
      const observer = new MutationObserver(() => hideCustomizationControls(app));
      observer.observe(app, { childList: true, subtree: true });
      app.__personalCloneObserver = observer;
    }
    window.addEventListener('hashchange', () => {
      if (redirectBlockedRoute()) return;
      patchRenderers();
      setTimeout(() => hideCustomizationControls(), 0);
    }, { passive: true });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, { once: true });
  else window.setTimeout(start, 0);
})();
