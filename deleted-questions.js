(() => {
  'use strict';

  const PAGE_SIZE = 30;
  let visibleCount = PAGE_SIZE;
  let currentRows = [];

  const qEsc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const dateLabel = (value) => {
    try { return new Date(value || Date.now()).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (_) { return ''; }
  };
  const getDeleted = async () => {
    if (typeof dbGetAll !== 'function') throw new Error('Deleted Questions storage is unavailable');
    const rows = await dbGetAll('deletedQuestions');
    CACHE.deletedQuestions = Array.isArray(rows) ? rows.filter(Boolean) : [];
    return CACHE.deletedQuestions;
  };
  const locationLabel = (question) => {
    try {
      const subject = typeof subjectName === 'function' ? subjectName(question?.subjectId) : '';
      const topic = typeof topicName === 'function' ? topicName(question?.topicId) : '';
      return [subject, topic].filter(Boolean).join(' · ') || 'Question Bank';
    } catch (_) { return 'Question Bank'; }
  };
  const questionCard = (question) => {
    const id = String(question?.id == null ? '' : question.id);
    return `<article class="deleted-question-card">
      <div class="deleted-question-meta"><span>মুছে ফেলা হয়েছে</span><time>${qEsc(dateLabel(question?.deletedAt))}</time></div>
      <div class="deleted-question-location">${qEsc(locationLabel(question))}</div>
      <h3>${qEsc(question?.question || 'Untitled question')}</h3>
      <div class="deleted-question-actions">
        <button class="btn danger" type="button" data-permanently-delete="${qEsc(id)}">চিরতরে ডিলিট</button>
      </div>
    </article>`;
  };

  function bindActions() {
    const root = document.querySelector('.deleted-questions-page');
    if (!root) return;
    root.querySelectorAll('[data-permanently-delete]').forEach((button) => {
      button.addEventListener('click', () => window.permanentlyDeleteQuestion(button.dataset.permanentlyDelete || ''));
    });
    root.querySelector('[data-empty-deleted]')?.addEventListener('click', () => window.emptyDeletedQuestions());
    root.querySelector('[data-load-more-deleted]')?.addEventListener('click', () => {
      visibleCount += PAGE_SIZE;
      renderRows(currentRows);
    });
    root.querySelector('[data-retry-deleted]')?.addEventListener('click', () => window.renderDeletedQuestions());
  }

  function renderRows(rows) {
    currentRows = Array.isArray(rows) ? rows : [];
    const visibleRows = currentRows.slice(0, visibleCount);
    const remaining = Math.max(0, currentRows.length - visibleRows.length);
    const content = currentRows.length ? `
      <div class="deleted-questions-toolbar"><span>${currentRows.length}টি প্রশ্ন এখানে আছে</span><button class="btn danger ghost" type="button" data-empty-deleted>সবগুলো চিরতরে ডিলিট</button></div>
      <div class="deleted-questions-list">${visibleRows.map(questionCard).join('')}</div>
      ${remaining ? `<button class="btn secondary deleted-load-more" type="button" data-load-more-deleted>আরও ${Math.min(PAGE_SIZE, remaining)}টি দেখুন</button>` : ''}` : `
      <div class="deleted-questions-empty"><div>🗑️</div><h2>Trash খালি</h2><p>Question Bank থেকে মুছে ফেলা প্রশ্নগুলো এখানে আসবে। এখান থেকে ডিলিট করলে সেগুলো চিরতরে মুছে যাবে।</p></div>`;
    renderShell(`<div class="deleted-questions-page">
      <div class="deleted-questions-hero"><div class="explorer-kicker">QUESTION MANAGEMENT</div><h1>Deleted Questions</h1><p>মুছে ফেলা প্রশ্নগুলো আগে এখানে থাকবে। এখান থেকে Delete করলে আর ফেরত আনা যাবে না।</p></div>
      ${content}
    </div>`, { title: 'Deleted Questions', back: "navigate('dashboard')" });
    bindActions();
  }

  function renderError(error) {
    console.error('[Admission Hub] Could not open Deleted Questions.', error);
    try {
      renderShell(`<div class="deleted-questions-page">
        <div class="deleted-questions-hero"><div class="explorer-kicker">QUESTION MANAGEMENT</div><h1>Deleted Questions</h1><p>Trash খোলার সময় সাময়িক সমস্যা হয়েছে। আপনার মূল question bank নিরাপদ আছে।</p></div>
        <div class="deleted-questions-empty"><div>⚠️</div><h2>Trash এখন খোলা যাচ্ছে না</h2><p>আবার চেষ্টা করুন। কোনো question এই error-এর কারণে মুছে যায়নি।</p><button class="btn secondary" type="button" data-retry-deleted>আবার চেষ্টা করুন</button></div>
      </div>`, { title: 'Deleted Questions', back: "navigate('dashboard')" });
      bindActions();
    } catch (fallbackError) {
      console.error('[Admission Hub] Deleted Questions fallback failed.', fallbackError);
      try {
        const app = document.getElementById('app');
        if (app) app.innerHTML = '<main style="padding:46px 18px;text-align:center;font:600 15px/1.6 -apple-system,BlinkMacSystemFont,sans-serif;color:#7f1d1d">Trash খোলা যাচ্ছে না — অ্যাপ বন্ধ করে আবার খুলো</main>';
      } catch (_) {}
    }
  }

  window.permanentlyDeleteQuestion = async (id) => {
    const question = (CACHE.deletedQuestions || []).find((item) => String(item?.id) === String(id));
    if (!question) return;
    const permanentlyRemove = async () => {
      try {
        await dbDelPermanent('deletedQuestions', id);
        await getDeleted();
        toast('প্রশ্নটি চিরতরে মুছে গেছে');
        visibleCount = PAGE_SIZE;
        await window.renderDeletedQuestions();
      } catch (error) {
        console.error('[Admission Hub] Permanent delete failed.', error);
        toast('প্রশ্নটি এখন মুছতে পারেনি। আবার চেষ্টা করুন।');
      }
    };
    if (typeof confirmModal === 'function') {
      confirmModal('চিরতরে ডিলিট', 'এই প্রশ্নটি Trash থেকেও স্থায়ীভাবে মুছে যাবে। পরে আর ফেরত আনা যাবে না।', permanentlyRemove, 'চিরতরে ডিলিট', true);
      return;
    }
    if (window.confirm('এই প্রশ্নটি চিরতরে মুছে ফেলবেন? পরে আর ফেরত আনা যাবে না।')) await permanentlyRemove();
  };

  window.emptyDeletedQuestions = async () => {
    const rows = Array.isArray(CACHE.deletedQuestions) ? CACHE.deletedQuestions.slice() : [];
    if (!rows.length) return;
    const ok = window.confirm(`${rows.length}টি প্রশ্ন Trash থেকেও চিরতরে মুছে ফেলবেন?`);
    if (!ok) return;
    try {
      for (const question of rows) await dbDelPermanent('deletedQuestions', question?.id);
      CACHE.deletedQuestions = [];
      toast('Trash খালি করা হয়েছে');
      visibleCount = PAGE_SIZE;
      await window.renderDeletedQuestions();
    } catch (error) {
      console.error('[Admission Hub] Empty Trash failed.', error);
      toast('Trash পুরোপুরি খালি করা যায়নি। আবার চেষ্টা করুন।');
      await window.renderDeletedQuestions();
    }
  };

  let trashRenderSeq = 0;
  let trashWatchdog = 0;
  const clearWatchdog = () => { if (trashWatchdog) { clearTimeout(trashWatchdog); trashWatchdog = 0; } };
  window.renderDeletedQuestions = async () => {
    const seq = ++trashRenderSeq;
    clearWatchdog();
    trashWatchdog = setTimeout(() => {
      if (trashRenderSeq !== seq) return;
      if (typeof Router === 'undefined' || Router.path !== 'deleted-questions') return;
      const app = document.getElementById('app');
      if (!app || app.querySelector('.deleted-questions-page')) return;
      const diag = [];
      try { diag.push('storage=' + (typeof STORAGE_MODE !== 'undefined' ? STORAGE_MODE : '?')); } catch (_) {}
      try { diag.push('db=' + (typeof DB !== 'undefined' && DB ? 'open' : 'null')); } catch (_) {}
      const fb = window.__admissionStorageFallback;
      if (fb && fb.active) diag.push('fallback=' + String(fb.error || 'active').slice(0, 120));
      try { diag.push('trace=' + (JSON.parse(localStorage.getItem('ah-trace') || '[]').map(x => x[1]).join('>'))); } catch (_) {}
      try {
        renderShell(`<div class="deleted-questions-page"><div class="deleted-questions-empty"><div>⏳</div><h2>Trash খুলতে বেশি সময় নিচ্ছে</h2><p>ডেটা পড়া কোথাও আটকে আছে — অ্যাপ বন্ধ করে আবার খুলো। নিচের তথ্যটা স্ক্রিনশটে পাঠালে সমস্যা ধরা সহজ হবে।</p><p style="margin-top:8px;color:#b3261e;font-size:11px;overflow-wrap:anywhere">${qEsc(diag.join(' | ') || 'কোনো তথ্য নেই')}</p></div></div>`, { title: 'Deleted Questions', back: "navigate('dashboard')" });
      } catch (_) {}
    }, 3500);
    try {
      const rows = (await getDeleted()).slice().sort((a, b) => Number(b?.deletedAt || 0) - Number(a?.deletedAt || 0));
      if (seq !== trashRenderSeq) return;
      clearWatchdog();
      renderRows(rows);
    } catch (error) {
      console.error('[DeletedQuestions] render failed', error);
      clearWatchdog();
      if (seq !== trashRenderSeq) return;
      renderError(error);
    }
  };

  const style = document.createElement('style');
  style.textContent = `
    .deleted-questions-page{padding-bottom:28px}
    .deleted-questions-hero{background:linear-gradient(135deg,#fff5f2,#fff);border:1px solid #f5d6cf;border-radius:24px;padding:22px;margin-bottom:16px;box-shadow:0 12px 28px rgba(130,44,31,.08)}
    .deleted-questions-hero h1{margin:5px 0 8px;font-size:28px;color:#7f1d1d}
    .deleted-questions-hero p{margin:0;color:#6b7280;line-height:1.7;font-size:13px}
    .deleted-questions-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:12px 0;color:#64748b;font-size:13px}
    .deleted-questions-list{display:grid;gap:12px}
    .deleted-question-card{background:#fff;border:1px solid #f1d6d1;border-left:5px solid #dc2626;border-radius:18px;padding:16px;box-shadow:0 8px 20px rgba(30,41,59,.05)}
    .deleted-question-meta{display:flex;justify-content:space-between;gap:8px;color:#991b1b;font-size:11px}.deleted-question-meta time{color:#94a3b8}
    .deleted-question-location{color:#64748b;font-size:11px;margin-top:8px}.deleted-question-card h3{font-size:16px;line-height:1.65;margin:7px 0 13px;color:#172033}
    .deleted-question-actions{display:flex;justify-content:flex-end}.deleted-question-actions .btn{font-size:12px;padding:9px 12px}
    .deleted-load-more{display:block;width:100%;margin-top:14px}
    .deleted-questions-empty{text-align:center;padding:62px 20px;color:#64748b}.deleted-questions-empty>div{font-size:45px}.deleted-questions-empty h2{color:#172033;margin:10px 0 7px}.deleted-questions-empty p{max-width:420px;margin:0 auto 16px;line-height:1.75;font-size:13px}
    [data-deleted-questions-card]{background:linear-gradient(135deg,#fff7f5,#fff)!important;border-color:#f4c9c2!important;border-left:5px solid #dc2626!important}
    [data-deleted-questions-card] .p3-special-info-v3 strong{color:#7f1d1d!important}[data-deleted-questions-card] .p3-special-info-v3 small{color:#9f1239!important}[data-deleted-questions-card] .p3-special-arrow-v3{color:#dc2626!important}
    @media(max-width:430px){.deleted-questions-hero{padding:18px;border-radius:20px}.deleted-questions-hero h1{font-size:24px}.deleted-questions-toolbar{align-items:flex-start;flex-direction:column}.deleted-question-card{padding:14px}}
  `;
  document.head.appendChild(style);
})();
