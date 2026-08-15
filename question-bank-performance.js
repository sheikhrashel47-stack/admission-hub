/**
 * Question Bank Performance Layer v3
 * 
 * Strategy: Keep the original qbank-redesign.js rendering intact but intercept
 * selectTopicAnswer, revealTopicAnswer, and bookmark to do in-place card patching
 * instead of full page re-render (which causes scroll reset).
 * 
 * Also adds: numeric question ordering, stable question numbers, scroll position
 * save/restore on topic navigation, and native smooth scrolling.
 * 
 * NO virtualization, NO scroll manipulation, NO auto-scroll.
 * Pure native scrolling like premium mobile apps.
 */
(() => {
  'use strict';

  const practice = window.QuestionBankPracticeSession;
  if (!practice) return; // qbank-redesign.js must load first

  const scrollKey = 'admission_qbank_scroll_v2';
  const scrollState = (() => {
    try { return JSON.parse(sessionStorage.getItem(scrollKey) || '{}') || {}; } catch (_) { return {}; }
  })();

  const esc = s => { const d = document.createElement('div'); d.textContent = String(s ?? ''); return d.innerHTML; };
  const answerFor = q => Number(q?.answerIndex ?? q?.answer ?? 0);

  // --- Numeric ordering helpers ---
  function explicitNumber(q) {
    if (q?.questionNumber != null) {
      const n = Number(q.questionNumber);
      if (Number.isFinite(n)) return n;
    }
    if (q?.number != null) {
      const n = Number(q.number);
      if (Number.isFinite(n)) return n;
    }
    const source = String(q?.sourceQuestionId || q?.id || '');
    const match = source.match(/(\d+)$/);
    return match ? Number(match[1]) : null;
  }

  // --- Save/restore scroll per topic ---
  function saveScroll() {
    const topicId = ExplorerState.topicId;
    if (!topicId) return;
    scrollState[topicId] = { y: window.scrollY || document.documentElement.scrollTop || 0, t: Date.now() };
    try { sessionStorage.setItem(scrollKey, JSON.stringify(scrollState)); } catch (_) {}
  }

  function restoreScroll(topicId) {
    const saved = scrollState[topicId];
    if (saved && Number.isFinite(saved.y) && saved.y > 0) {
      // Use setTimeout to let the DOM render first
      setTimeout(() => { window.scrollTo(0, saved.y); }, 50);
    }
  }

  // --- In-place card patch (no full re-render, no scroll reset) ---
  function patchCardInPlace(qid) {
    const q = CACHE.questions.find(x => x.id === qid);
    if (!q) return;
    // Find the card in DOM
    const card = document.querySelector(`[data-qid="${CSS.escape(qid)}"]`);
    if (!card) return;

    const topic = CACHE.topics.find(t => t.id === q.topicId);
    const subject = CACHE.subjects.find(s => s.id === topic?.subjectId);
    const state = practice.answers[qid];
    const revealed = practice.revealed[qid] || state;
    const correct = answerFor(q);

    // Update status badge
    const statusEl = card.querySelector('.q-status');
    if (statusEl) {
      const status = state ? (state.correct ? 'Correct' : 'Wrong') : 'Unattempted';
      const statusClass = state ? (state.correct ? 'correct' : 'wrong') : 'unattempted';
      statusEl.className = `q-status ${statusClass}`;
      statusEl.textContent = status;
    }

    // Update options
    const opts = card.querySelectorAll('.q-opt-v2');
    opts.forEach((btn, j) => {
      btn.className = 'q-opt-v2';
      if (state) {
        if (j === correct) btn.classList.add('correct');
        else if (j === state.selected) btn.classList.add('wrong');
        btn.disabled = true;
      } else if (revealed && j === correct) {
        btn.classList.add('correct');
      }
      // Update icon
      let icon = btn.querySelector('.q-opt-icon');
      if (state || revealed) {
        if (j === correct) {
          if (!icon) { icon = document.createElement('span'); icon.className = 'q-opt-icon'; btn.appendChild(icon); }
          icon.textContent = '✓';
        } else if (state && j === state.selected) {
          if (!icon) { icon = document.createElement('span'); icon.className = 'q-opt-icon'; btn.appendChild(icon); }
          icon.textContent = '✕';
        } else if (icon) {
          icon.remove();
        }
      }
    });

    // Add/update explanation
    let explanation = card.querySelector('.q-explanation-v2');
    if (revealed && !explanation) {
      const expDiv = document.createElement('div');
      const cls = state?.correct ? 'correct' : state ? 'wrong' : 'revealed';
      expDiv.className = `q-explanation-v2 ${cls}`;
      const label = state ? (state.correct ? '✓ Correct' : '✕ Wrong') : 'Answer revealed';
      expDiv.innerHTML = `<strong>${label}</strong><p>Correct answer: ${esc((q.options || [])[correct] || '')}</p>${q.explanation ? `<p>${esc(q.explanation)}</p>` : ''}`;
      const optionsDiv = card.querySelector('.q-options-v2');
      if (optionsDiv) optionsDiv.after(expDiv);
    }

    // Remove "Show Answer" button if answered/revealed
    if (revealed || state) {
      const showBtn = [...card.querySelectorAll('.q-footer-btn')].find(b => b.textContent.includes('Show Answer'));
      if (showBtn) showBtn.remove();
    }

    // Update footer stats
    updateFooterStats();
  }

  function updateFooterStats() {
    const topicId = ExplorerState.topicId;
    if (!topicId) return;
    const allQs = CACHE.questions.filter(q => q.topicId === topicId);
    const answered = allQs.filter(q => practice.answers[q.id]);
    const acc = answered.length ? Math.round(answered.filter(q => practice.answers[q.id].correct).length / answered.length * 100) : 0;
    const mistakeCount = answered.filter(q => !practice.answers[q.id].correct).length;

    // Update all accuracy/mistake spans in visible cards
    document.querySelectorAll('.q-card-footer').forEach(footer => {
      const spans = footer.querySelectorAll(':scope > span');
      if (spans[0]) spans[0].innerHTML = `Accuracy <strong>${acc}%</strong>`;
      if (spans[1]) spans[1].innerHTML = `Mistakes <strong>${mistakeCount}</strong>`;
    });

    // Update feed summary
    const summarySpans = document.querySelectorAll('.q-feed-summary span');
    if (summarySpans[1]) summarySpans[1].textContent = `${answered.length}/${allQs.length} answered`;
  }

  // --- Override selectTopicAnswer to patch in place ---
  window.selectTopicAnswer = (qid, idx) => {
    if (practice.topicId !== ExplorerState.topicId || practice.answers[qid]) return;
    const q = CACHE.questions.find(x => x.id === qid);
    if (!q || q.topicId !== ExplorerState.topicId) return;
    const correct = answerFor(q);
    practice.answers[qid] = { selected: idx, correct: idx === correct, answeredAt: Date.now() };
    practice.recent = [qid, ...practice.recent.filter(id => id !== qid)];
    // Patch card in place - NO re-render, NO scroll change
    patchCardInPlace(qid);
  };

  // --- Override revealTopicAnswer to patch in place ---
  window.revealTopicAnswer = qid => {
    const q = CACHE.questions.find(x => x.id === qid);
    if (!q || q.topicId !== ExplorerState.topicId || practice.answers[qid]) return;
    practice.revealed[qid] = true;
    patchCardInPlace(qid);
  };

  // --- Wrap the original renderQuestionBankV2 to add data-qid attributes and numeric ordering ---
  const originalRender = window.renderQuestionBankV2;
  window.renderQuestionBankV2 = function() {
    const path = Router.path || location.hash.slice(1);
    
    // Save scroll before re-render if we're in a topic
    if (ExplorerState.topicId && path.startsWith('question-bank/topic/')) {
      saveScroll();
    }

    // Call original render
    const result = originalRender ? originalRender() : undefined;

    // After render, add data-qid attributes to cards for in-place patching
    requestAnimationFrame(() => {
      addDataAttributes();
      // Restore scroll if returning to a topic
      if (path.startsWith('question-bank/topic/')) {
        const topicId = decodeURIComponent(path.split('/')[2] || '');
        restoreScroll(topicId);
      }
    });

    return result;
  };

  function addDataAttributes() {
    // Find all q-card-v2 elements and add data-qid based on their edit button onclick
    document.querySelectorAll('.q-card-v2').forEach(card => {
      if (card.dataset.qid) return; // already tagged
      // Find the edit button which has ahEditQuestion('id')
      const editBtn = [...card.querySelectorAll('.q-footer-btn')].find(b => b.textContent.includes('Edit'));
      if (editBtn) {
        const match = editBtn.getAttribute('onclick')?.match(/ahEditQuestion\('([^']+)'\)/);
        if (match) card.dataset.qid = match[1];
      }
      // Alternative: find from option onclick
      if (!card.dataset.qid) {
        const optBtn = card.querySelector('.q-opt-v2');
        if (optBtn) {
          const match = optBtn.getAttribute('onclick')?.match(/selectTopicAnswer\('([^']+)'/);
          if (match) card.dataset.qid = match[1];
        }
      }
    });
  }

  // --- Save scroll on navigation away ---
  const originalLeaveTopic = window.leaveTopic;
  if (typeof originalLeaveTopic === 'function') {
    window.leaveTopic = function() {
      saveScroll();
      return originalLeaveTopic.apply(this, arguments);
    };
  }

  window.addEventListener('hashchange', () => {
    const next = location.hash.slice(1) || 'dashboard';
    if (ExplorerState.topicId && !next.startsWith('question-bank/topic/')) {
      saveScroll();
    }
  });

  // --- Override toggleQuestionBookmark to patch in place when in topic view ---
  const originalToggleBookmark = window.toggleQuestionBookmark;
  window.toggleQuestionBookmark = function(id) {
    const q = CACHE.questions.find(x => x.id === id);
    if (!q) return;
    // If we're in topic feed view, do in-place update
    if (ExplorerState.topicId && document.querySelector(`[data-qid="${CSS.escape(id)}"]`)) {
      q.bookmarked = !q.bookmarked;
      q.bookmarkUpdatedAt = Date.now();
      dbPut('questions', q).then(() => {
        // Update bookmark button in place
        const card = document.querySelector(`[data-qid="${CSS.escape(id)}"]`);
        if (card) {
          const bmBtn = [...card.querySelectorAll('.q-footer-btn')].find(b => b.textContent.includes('Bookmark'));
          if (bmBtn) {
            bmBtn.classList.toggle('active', !!q.bookmarked);
            bmBtn.setAttribute('aria-pressed', String(!!q.bookmarked));
            bmBtn.innerHTML = `⭐ ${q.bookmarked ? 'Bookmarked' : 'Bookmark'}`;
          }
        }
        toast(q.bookmarked ? 'Question bookmarked' : 'Bookmark removed');
      }).catch(() => {
        q.bookmarked = !q.bookmarked;
        toast('Could not update bookmark');
      });
    } else {
      // Fall back to original
      if (originalToggleBookmark) originalToggleBookmark(id);
    }
  };

  // --- Ensure nextQuestionNumberForTopic is available ---
  if (typeof window.nextQuestionNumberForTopic !== 'function') {
    window.nextQuestionNumberForTopic = function(topicId, excludeId) {
      const numbers = (CACHE.questions || [])
        .filter(q => q.topicId === topicId && q.id !== excludeId)
        .map(q => Number(q.questionNumber ?? q.number))
        .filter(Number.isFinite);
      return (numbers.length ? Math.max(...numbers) : (CACHE.questions || []).filter(q => q.topicId === topicId).length) + 1;
    };
  }

})();
