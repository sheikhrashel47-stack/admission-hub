(() => {
  'use strict';

  const CHATBOT_ID = 'university-admission-mistake-analysis-agent-fog';
  const SCRIPT_ID = 'mindpal-question-analysis-embed';
  const ACTIVE_ATTR = 'data-mindpal-question-analysis';
  const trackedNodes = new Set();
  let observer = null;
  let syncTimer = 0;
  let scriptLoading = false;
  let active = false;

  function currentPath() {
    return String(window.Router?.path || location.hash.slice(1) || 'dashboard').split('?')[0];
  }

  function isQuestionTopicRoute() {
    return currentPath().startsWith('question-bank/topic/');
  }

  function questionCardsPresent() {
    return !!document.querySelector(
      '.q-card-v2, [data-qnav-card].q-card-v2, .p3-qb-question-card, .question-card'
    );
  }

  function rememberNode(node) {
    if (node instanceof Element && node !== document.body && node !== document.head) trackedNodes.add(node);
  }

  function nodeLooksLikeMindPal(node) {
    if (!(node instanceof Element)) return false;
    const value = [node.id, node.className, node.getAttribute('src'), node.getAttribute('data-testid')]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();
    return /mindpal|getmindpal|chatbot/.test(value);
  }

  function trackGeneratedNodes() {
    document.querySelectorAll('iframe, [id], [class], [data-testid]').forEach(node => {
      if (nodeLooksLikeMindPal(node)) rememberNode(node);
    });
  }

  function cleanup() {
    active = false;
    scriptLoading = false;
    document.documentElement.removeAttribute(ACTIVE_ATTR);
    document.body?.removeAttribute(ACTIVE_ATTR);

    const script = document.getElementById(SCRIPT_ID);
    if (script) script.remove();

    trackedNodes.forEach(node => {
      if (node.isConnected && nodeLooksLikeMindPal(node)) node.remove();
    });
    trackedNodes.clear();

    document.querySelectorAll('iframe[src*="chatbot.getmindpal.com"], iframe[src*="getmindpal.com"]')
      .forEach(node => node.remove());

    if (window.mindpalConfig?.chatbotId === CHATBOT_ID) {
      try { delete window.mindpalConfig; } catch (_) { window.mindpalConfig = undefined; }
    }
  }

  function loadWidget() {
    if (active || scriptLoading || document.getElementById(SCRIPT_ID)) return;
    active = true;
    scriptLoading = true;
    document.documentElement.setAttribute(ACTIVE_ATTR, 'active');
    document.body?.setAttribute(ACTIVE_ATTR, 'active');

    window.mindpalConfig = {
      chatbotId: CHATBOT_ID,
      display: { type: 'floating-corner', anchor: 'right' },
      behavior: {
        showInitialMessageBubbleWhenMinimized: true,
        minimizedByDefault: true
      }
    };

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.async = true;
    script.src = 'https://chatbot.getmindpal.com/embed.min.js';
    script.onload = () => {
      scriptLoading = false;
      setTimeout(trackGeneratedNodes, 300);
    };
    script.onerror = () => {
      scriptLoading = false;
      active = false;
      script.remove();
    };
    document.head.appendChild(script);
  }

  function sync() {
    const shouldShow = isQuestionTopicRoute() && questionCardsPresent();
    if (shouldShow) loadWidget();
    else if (active || document.getElementById(SCRIPT_ID)) cleanup();
  }

  function scheduleSync() {
    clearTimeout(syncTimer);
    syncTimer = setTimeout(sync, 40);
  }

  window.addEventListener('hashchange', () => {
    cleanup();
    setTimeout(sync, 0);
    setTimeout(sync, 350);
    setTimeout(sync, 1000);
  });

  observer = new MutationObserver(scheduleSync);
  observer.observe(document.body, { childList: true, subtree: true });

  window.questionAnalysisChatbot = {
    sync,
    cleanup,
    isActive: () => active && isQuestionTopicRoute() && questionCardsPresent()
  };

  setTimeout(sync, 0);
  setTimeout(sync, 500);
  setTimeout(sync, 1200);
})();
