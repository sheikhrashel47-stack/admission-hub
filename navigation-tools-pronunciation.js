(() => {
  'use strict';

  const stack = [];
  let restoring = false;
  const currentRoute = () => String(window.Router?.path || location.hash.replace(/^#\/?/, '') || 'dashboard').split('?')[0] || 'dashboard';
  const baseNavigate = window.navigate;

  function restoreViewport(top = 0) {
    [0, 90, 240].forEach(wait => window.setTimeout(() => window.scrollTo({ top: Math.max(0, top), behavior: 'auto' }), wait));
  }

  function fallbackBack(path) {
    if (path === 'vocabulary-master' || path === 'notes' || path === 'deleted-questions') return { path: 'dashboard', top: document.querySelector('[data-unified-study-tools-list]')?.getBoundingClientRect().top + window.scrollY - 16 || 0 };
    if (path.startsWith('vocabulary-master/')) return { path: 'vocabulary-master', top: 0 };
    if (path.startsWith('notes/')) return { path: 'notes', top: 0 };
    if (path.startsWith('question-bank') || path === 'settings' || path === 'mistakes' || path === 'progress') return { path: 'dashboard', top: 0 };
    return { path: 'dashboard', top: 0 };
  }

  function goBackSafely() {
    const previous = stack.pop() || fallbackBack(currentRoute());
    restoring = true;
    window.navigate(previous.path);
    restoreViewport(previous.top || 0);
  }

  if (typeof baseNavigate === 'function' && !baseNavigate.__navigationPolishWrapped) {
    const wrapped = function (path) {
      const next = String(path || 'dashboard').replace(/^#\/?/, '').split('?')[0] || 'dashboard';
      const current = currentRoute();
      if (!restoring && next !== current) stack.push({ path: current, top: window.scrollY || 0 });
      const result = baseNavigate.apply(this, arguments);
      if (restoring) restoring = false;
      return result;
    };
    wrapped.__navigationPolishWrapped = true;
    window.navigate = wrapped;
  }

  document.addEventListener('click', event => {
    const button = event.target.closest('#app .backbtn');
    if (!button) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    goBackSafely();
  }, true);

  window.addEventListener('hashchange', () => requestAnimationFrame(() => document.body.classList.remove('admission-route-moving')), { passive: true });

  const style = document.createElement('style');
  style.textContent = `
    #app .page{animation:admissionRouteIn 170ms cubic-bezier(.23,1,.32,1)}
    @keyframes admissionRouteIn{from{opacity:.01;transform:translateY(4px)}to{opacity:1;transform:translateY(0)}}
    .topbar{min-height:64px;padding:calc(10px + env(safe-area-inset-top)) 16px 10px!important}
    .topbar .backbtn{width:42px;height:42px;display:grid;place-items:center;border-radius:14px;font-size:25px;line-height:1}
    [data-unified-study-tools-list]{display:grid!important;grid-template-columns:minmax(0,1fr)!important;gap:12px!important;align-items:stretch!important}
    [data-unified-study-tools-list]>button{width:100%!important;min-height:88px!important;margin:0!important}
    [data-unified-study-tools-list] .special-tool-card,[data-unified-study-tools-list] .p3-special-card-v3,[data-unified-study-tools-list] .vm-dashboard-entry,[data-unified-study-tools-list] .mm-dashboard-entry{min-height:88px!important;margin:0!important}
    @media(prefers-reduced-motion:reduce){#app .page{animation:none!important}}
  `;
  document.head.appendChild(style);
})();
