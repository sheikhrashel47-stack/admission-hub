/*
  ADMISSION HUB · MISTAKE NOTE ICON
  Adds a small note icon to every wrong-question card (practice review card,
  Mistake Bank, exam result review). Clicking it opens the note editor so the
  question — with its wrong answer and a pasted Gemini AI explain — can be
  saved into the Notes tool.
*/
(function installMistakeNoteIcon(){
  'use strict';
  if (window.__mistakeNoteIconInstalled) return;
  window.__mistakeNoteIconInstalled = true;

  function getCache(){
    try { if (typeof CACHE !== 'undefined' && CACHE) return CACHE; } catch (_) {}
    return window.CACHE || { questions: [], mistakes: [], subjects: [], topics: [] };
  }

  function findQuestionById(qid){
    if (!qid) return null;
    return getCache().questions?.find(x => String(x.id) === String(qid)) || null;
  }

  // Fallback: match a wrong question by its text (used by the Mistake Bank
  // where the card keeps the full question text, not the id).
  function findQuestionByText(text){
    if (!text || text.length < 12) return null;
    const t = String(text).trim();
    return getCache().questions?.find(q => String(q.question).trim() === t) || null;
  }

  function findQuestionForCard(card){
    const qid = card?.getAttribute?.('data-mistake-qid');
    const q = findQuestionById(qid);
    if (q) return q;
    // Fallback: card keeps the question text in .mistake-question etc.
    const text = card?.textContent || '';
    return findQuestionByText(text) || null;
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

  // Extract a question id from any inline onclick handler string.
  const ID_PATTERNS = [
    /data-qid="([^"]+)"/,                       // practice review card (q-card-v2)
    /resultPracticeOne\("([^"]+?)","([^"]+?)"/,  // exam result review card
    /resultPracticeOne\('([^']+?)','([^']+?)'/,
    /resultAddMistake\(\s*'([^']+?)'\s*,\s*'([^']+?)'/,
    /startQuestionPractice\(\[[\s\S]*?["']([^"']+?)["']\]/,
    /toggleQuestionBookmark\(['"]([^"']+?)['"]\)/,
    /ahEditQuestion\(['"]([^"']+?)['"]\)/,
    /ahDuplicateQuestion\(['"]([^"']+?)['"]\)/,
    /ahDeleteQuestion\(['"]([^"']+?)['"]\)/,
    /revealTopicAnswer\(['"]([^"']+?)['"]\)/,
    /selectTopicAnswer\(['"]([^"']+?)['"]\)/
  ];

  function extractIdFromHandlers(card){
    const buttons = card.querySelectorAll('[onclick]');
    for (const b of buttons) {
      const oc = b.getAttribute('onclick') || '';
      for (const pat of ID_PATTERNS) {
        const m = oc.match(pat);
        if (m) return m[1];
      }
    }
    const own = card.getAttribute('onclick') || '';
    for (const pat of ID_PATTERNS) {
      const m = own.match(pat);
      if (m) return m[1];
    }
    return null;
  }

  // Whether the card represents a wrong/attempted question worth noting.
  function isWrongCard(card){
    const cls = (card.className || '').toString();
    if (cls.indexOf('wrong') !== -1) return true;
    const text = card.textContent || '';
    return /Wrong answer|ভুল উত্তর|✕ Wrong|Mistakes \d+/.test(text);
  }

  const CARD_SELECTORS = [
    '.q-card-v2',                     // practice / topic review card (video flow)
    '.result-review-card',            // exam result review card
    '.card.mistake-book-card',        // Smart Mistake Book
    '.card.mistake-row'               // Mistake Bank 2.0
  ];

  function run(){
    CARD_SELECTORS.forEach(sel => {
      document.querySelectorAll(sel).forEach(card => {
        if (!isWrongCard(card)) return;
        if (card.getAttribute('data-mistake-qid')) return;
        const qid = extractIdFromHandlers(card);
        if (qid) {
          card.setAttribute('data-mistake-qid', qid);
          attachIconToCard(card);
        } else if (findQuestionByText(card.textContent || '')) {
          // No handler id found; match by question text instead.
          card.setAttribute('data-mistake-qid', '__bytext__');
          attachIconToCard(card);
        }
      });
    });
  }

  const style = document.createElement('style');
  style.id = 'mistake-note-icon-styles';
  style.textContent = `.q-card-v2,.card.mistake-book-card,.card.mistake-row,.result-review-card{position:relative}.mn-note-icon{position:absolute;top:12px;right:10px;border:1px solid #b9ddc8;background:#f1fbf4;color:#0f6b4f;border-radius:999px;min-width:36px;height:32px;font-size:14px;padding:0 9px;cursor:pointer;line-height:30px;box-shadow:0 2px 6px rgba(15,107,79,.14);z-index:5}.mn-note-icon:active{transform:scale(.94)}`;
  document.head.appendChild(style);

  // Keep icons alive regardless of other scripts overwriting window.render:
  const observer = new MutationObserver(() => setTimeout(run, 0));
  observer.observe(document.body || document.documentElement, { childList: true, subtree: true });
  window.addEventListener('hashchange', () => setTimeout(run, 400));

  setTimeout(run, 400);
  setTimeout(run, 1200);
  setTimeout(run, 2600);
  setInterval(run, 2000);
})();
