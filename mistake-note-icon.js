/*
  ADMISSION HUB · MISTAKE NOTE ICON
  Adds a small note icon to every wrong-question card (Mistake Bank & exam result).
  Clicking it saves the question as a note; if a Gemini explanation is pending,
  it saves with the AI explain, otherwise it opens the note editor directly.
*/
(function installMistakeNoteIcon(){
  'use strict';
  if (window.__mistakeNoteIconInstalled) return;
  window.__mistakeNoteIconInstalled = true;

  function getCache(){
    try { if (typeof CACHE !== 'undefined' && CACHE) return CACHE; } catch (_) {}
    return window.CACHE || { questions: [], mistakes: [], subjects: [], topics: [] };
  }

  function findQuestionForCard(card){
    const qid = card?.getAttribute?.('data-mistake-qid');
    if (!qid) return null;
    return getCache().questions?.find(x => String(x.id) === String(qid)) || null;
  }

  function openNoteFor(q){
    const pendingReady = typeof window.isManualGeminiNoteReady === 'function' && window.isManualGeminiNoteReady(q.id);
    if (pendingReady && typeof window.openManualGeminiNoteForQuestion === 'function') {
      window.openManualGeminiNoteForQuestion(q.id);
      return;
    }
    if (typeof window.openQuestionNoteEditor === 'function') {
      const correctIndex = Number(q?.answerIndex ?? q?.answer ?? 0);
      const wrongIndex = Number.isFinite(correctIndex) && (q?.options?.length || 0) > 1
        ? (correctIndex + 1) % q.options.length
        : 0;
      window.openQuestionNoteEditor({ q, selectedIndex: wrongIndex, source: 'Mistake Bank' });
    }
  }

  function attachIconToCard(card){
    const q = findQuestionForCard(card);
    if (!q || card.querySelector('.mn-note-icon')) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'mn-note-icon';
    btn.title = 'AI explain সহ নোট করুন';
    btn.setAttribute('aria-label', 'নোট করুন');
    btn.textContent = '📝';
    btn.onclick = (ev) => {
      ev.preventDefault();
      ev.stopPropagation();
      openNoteFor(q);
    };
    card.appendChild(btn);
  }

  function decorateList(containerSelector, cardSelector, extractId){
    const containers = document.querySelectorAll(containerSelector);
    containers.forEach(container => {
      const cards = container.querySelectorAll(cardSelector);
      cards.forEach(card => {
        if (card.getAttribute('data-mistake-qid')) return;
        const qid = extractId(card);
        if (qid) {
          card.setAttribute('data-mistake-qid', qid);
          attachIconToCard(card);
        }
      });
    });
  }

  // Mistake Bank cards use inline onclick handlers like startQuestionPractice(['qid'])
  function idFromHandler(card){
    const handler = card.getAttribute('onclick') || '';
    const match = handler.match(/startQuestionPractice\(\[["']([^"']+?)["']\]/);
    return match ? match[1] : null;
  }

  function run(){
    // Mistake Bank (Smart Mistake Book) — handlers live on buttons inside the card
    decorateList('.page, main', '.card.mistake-book-card', (card) => {
      const btn = card.querySelector('button[onclick*="startQuestionPractice"]');
      const handler = btn ? (btn.getAttribute('onclick') || '') : (card.getAttribute('onclick') || '');
      const match = handler.match(/startQuestionPractice\(\[["']([^"']+?)["']\]/);
      return match ? match[1] : null;
    });
    // Exam result wrong cards
    decorateList('.result-review-list', '.result-review-card.wrong', (card) => {
      const btn = card.querySelector('.result-action[onclick*="resultPracticeOne"]');
      if (!btn) return null;
      const match = (btn.getAttribute('onclick') || '').match(/resultPracticeOne\("([^"]+?)","([^"]+?)"/);
      return match ? match[2] : null;
    });
    // Mistake Bank 2.0 cards
    decorateList('.page, main', '.card.mistake-row', idFromHandler);
  }

  const style = document.createElement('style');
  style.id = 'mistake-note-icon-styles';
  style.textContent = `.card.mistake-book-card,.card.mistake-row,.result-review-card.wrong{position:relative}.mn-note-icon{position:absolute;bottom:12px;right:12px;border:1px solid #b9ddc8;background:#f1fbf4;color:#0f6b4f;border-radius:999px;min-width:34px;height:30px;font-size:13px;padding:0 8px;cursor:pointer;line-height:28px;box-shadow:0 2px 6px rgba(15,107,79,.12);z-index:3}.mn-note-icon:active{transform:scale(.94)}`;
  document.head.appendChild(style);

  // Keep the icons alive even when other scripts overwrite window.render:
  // observe the DOM for new cards and periodically re-check.
  const observer = new MutationObserver(() => setTimeout(run, 0));
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(run, 400));

  setTimeout(run, 400);
  setTimeout(run, 1200);
  setTimeout(run, 2600);
  setInterval(run, 3500);
})();
