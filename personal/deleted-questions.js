(() => {
  'use strict';

  const qEsc = (value) => String(value == null ? '' : value).replace(/[&<>"']/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[char]));
  const dateLabel = (value) => {
    try { return new Date(value || Date.now()).toLocaleString('bn-BD', { dateStyle: 'medium', timeStyle: 'short' }); }
    catch (_) { return ''; }
  };
  const getDeleted = async () => {
    const rows = typeof dbGetAll === 'function' ? await dbGetAll('deletedQuestions') : [];
    CACHE.deletedQuestions = Array.isArray(rows) ? rows : [];
    return CACHE.deletedQuestions;
  };
  const locationLabel = (question) => {
    const subject = typeof subjectName === 'function' ? subjectName(question.subjectId) : '';
    const topic = typeof topicName === 'function' ? topicName(question.topicId) : '';
    return [subject, topic].filter(Boolean).join(' · ') || 'Question Bank';
  };
  const questionCard = (question) => `<article class="deleted-question-card">
    <div class="deleted-question-meta"><span>মুছে ফেলা হয়েছে</span><time>${qEsc(dateLabel(question.deletedAt))}</time></div>
    <div class="deleted-question-location">${qEsc(locationLabel(question))}</div>
    <h3>${qEsc(question.question || 'Untitled question')}</h3>
    <div class="deleted-question-actions">
      <button class="btn danger" type="button" onclick="permanentlyDeleteQuestion('${qEsc(question.id)}')">চিরতরে ডিলিট</button>
    </div>
  </article>`;

  window.permanentlyDeleteQuestion = async (id) => {
    const question = (CACHE.deletedQuestions || []).find((item) => String(item.id) === String(id));
    if (!question) return;
    const permanentlyRemove = async () => {
      await dbDelPermanent('deletedQuestions', id);
      await getDeleted();
      toast('প্রশ্নটি চিরতরে মুছে গেছে');
      window.renderDeletedQuestions();
    };
    if (typeof confirmModal === 'function') {
      confirmModal('চিরতরে ডিলিট', 'এই প্রশ্নটি Trash থেকেও স্থায়ীভাবে মুছে যাবে। পরে আর ফেরত আনা যাবে না।', permanentlyRemove, 'চিরতরে ডিলিট', true);
      return;
    }
    if (window.confirm('এই প্রশ্নটি চিরতরে মুছে ফেলবেন? পরে আর ফেরত আনা যাবে না।')) await permanentlyRemove();
  };

  window.emptyDeletedQuestions = async () => {
    const count = (CACHE.deletedQuestions || []).length;
    if (!count) return;
    const ok = window.confirm(`${count}টি প্রশ্ন Trash থেকেও চিরতরে মুছে ফেলবেন?`);
    if (!ok) return;
    for (const question of CACHE.deletedQuestions || []) await dbDelPermanent('deletedQuestions', question.id);
    CACHE.deletedQuestions = [];
    toast('Trash খালি করা হয়েছে');
    window.renderDeletedQuestions();
  };

  window.renderDeletedQuestions = async () => {
    const rows = (await getDeleted()).slice().sort((a, b) => Number(b.deletedAt || 0) - Number(a.deletedAt || 0));
    const content = rows.length ? `
      <div class="deleted-questions-toolbar"><span>${rows.length}টি প্রশ্ন এখানে আছে</span><button class="btn danger ghost" type="button" onclick="emptyDeletedQuestions()">সবগুলো চিরতরে ডিলিট</button></div>
      <div class="deleted-questions-list">${rows.map(questionCard).join('')}</div>` : `
      <div class="deleted-questions-empty"><div>🗑️</div><h2>Trash খালি</h2><p>Question Bank থেকে মুছে ফেলা প্রশ্নগুলো এখানে আসবে। এখান থেকে ডিলিট করলে সেগুলো চিরতরে মুছে যাবে।</p></div>`;
    renderShell(`<div class="deleted-questions-page">
      <div class="deleted-questions-hero"><div class="explorer-kicker">QUESTION MANAGEMENT</div><h1>Deleted Questions</h1><p>মুছে ফেলা প্রশ্নগুলো আগে এখানে থাকবে। এখান থেকে Delete করলে আর ফেরত আনা যাবে না।</p></div>
      ${content}
    </div>`, { title: 'Deleted Questions', back: "navigate('dashboard')" });
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
    .deleted-questions-empty{text-align:center;padding:62px 20px;color:#64748b}.deleted-questions-empty>div{font-size:45px}.deleted-questions-empty h2{color:#172033;margin:10px 0 7px}.deleted-questions-empty p{max-width:420px;margin:0 auto;line-height:1.75;font-size:13px}
    [data-deleted-questions-card]{background:linear-gradient(135deg,#fff7f5,#fff)!important;border-color:#f4c9c2!important;border-left:5px solid #dc2626!important}
    [data-deleted-questions-card] .p3-special-info-v3 strong{color:#7f1d1d!important}[data-deleted-questions-card] .p3-special-info-v3 small{color:#9f1239!important}[data-deleted-questions-card] .p3-special-arrow-v3{color:#dc2626!important}
    @media(max-width:430px){.deleted-questions-hero{padding:18px;border-radius:20px}.deleted-questions-hero h1{font-size:24px}.deleted-questions-toolbar{align-items:flex-start;flex-direction:column}.deleted-question-card{padding:14px}}
  `;
  document.head.appendChild(style);
})();
