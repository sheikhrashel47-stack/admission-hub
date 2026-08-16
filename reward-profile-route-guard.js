/* Admission Hub · Reward/Profile route guard
 * Keeps the purchase-gated Blueprint Shop and VIP Profile renderer authoritative
 * without interrupting the app's original Dashboard renderer.
 */
(() => {
  'use strict';
  const path = () => String((window.Router && window.Router.path) || location.hash.replace(/^#\/?/, '').split('?')[0] || 'dashboard');
  const previous = window.render;
  const renderRoute = function () {
    const p = path();
    if (p === 'profile' && typeof window.__advancedProfileRender === 'function') return window.__advancedProfileRender();
    if ((p === 'rewards' || p === 'reward-shop') && typeof window.rewardFirst50Render === 'function') return window.rewardFirst50Render();
    return typeof previous === 'function' ? previous.apply(this, arguments) : undefined;
  };
  const guarded = function () {
    const p = path();
    if (p === 'profile' && typeof window.__advancedProfileRender === 'function') return window.__advancedProfileRender();
    if ((p === 'rewards' || p === 'reward-shop') && typeof window.rewardFirst50Render === 'function') return window.rewardFirst50Render();
    return typeof previous === 'function' ? previous.apply(this, arguments) : undefined;
  };
  guarded.__rewardProfileGuard = true;
  window.render = guarded;
  const needsRepair = () => {
    const p = path();
    if (p === 'profile') return !!window.__advancedProfileRender && !document.querySelector('[data-reward-profile-render]');
    if (p === 'rewards' || p === 'reward-shop') return !!window.rewardFirst50Render && !document.querySelector('[data-blueprint-shop-render]');
    return false;
  };
  const repair = () => { if (needsRepair()) renderRoute(); };
  window.addEventListener('hashchange', () => setTimeout(renderRoute, 0));
  window.addEventListener('load', () => setTimeout(renderRoute, 0));
  [250, 900, 1800, 3200].forEach(ms => setTimeout(repair, ms));
  setInterval(repair, 700);
  window.__rewardProfileRouteGuard = renderRoute;
})();
