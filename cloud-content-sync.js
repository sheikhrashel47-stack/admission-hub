/* D-V189: global content cloud bridge — updated to admissionhub.workers.dev
   control → POST /api/admin/publish ; public ← GET /api/content (no auth) */
(() => {
  'use strict';
  const WORKER = 'https://admission-gk.admissionhub.workers.dev';
  const ROLE = String(window.AH_CLOUD_ROLE || '').trim() || 'public';
  const GLOBAL_STORES = ['subjects', 'topics', 'questions', 'vocabulary', 'vocabularyMaster'];
  const META_KEY = 'ahCloudApplied';
  const APP_HEADER = { 'X-AH-App': 'admission-hub', 'Content-Type': 'application/json' };

  const bootReady = async () => {
    if (window.__admissionBootPromise) {
      try { await window.__admissionBootPromise; } catch (_) {}
    }
    return typeof dbGetAll === 'function' && typeof dbPut === 'function';
  };

  const stripHeavy = rec => {
    if (!rec || typeof rec !== 'object') return rec;
    const o = Object.assign({}, rec);
    ['imageDataUrl', 'image', 'thumbnail'].forEach(k => {
      if (typeof o[k] === 'string' && o[k].startsWith('data:') && o[k].length > 900000) delete o[k];
    });
    return o;
  };

  const nativeQuestion = q => q && q.id && (q.question || q.q) && (Array.isArray(q.options) || Array.isArray(q.o));

  const putManyFast = async (store, items) => {
    const rows = Array.isArray(items) ? items.filter(x => x && x.id) : [];
    if (!rows.length) return true;
    const db = (typeof DB !== 'undefined' && DB) ? DB : null;
    const chunkSize = 400;
    for (let i = 0; i < rows.length; i += chunkSize) {
      const chunk = rows.slice(i, i + chunkSize);
      if (db && db.objectStoreNames.contains(store)) {
        await new Promise((resolve, reject) => {
          let settled = false;
          try {
            const tx = db.transaction(store, 'readwrite');
            const os = tx.objectStore(store);
            for (let n = 0; n < chunk.length; n++) os.put(chunk[n]);
            tx.oncomplete = () => { settled = true; resolve(true); };
            tx.onabort = () => { if (!settled) { settled = true; reject(tx.error || new Error('abort')); } };
            tx.onerror = () => { if (!settled) { settled = true; reject(tx.error); } };
          } catch (err) { reject(err); }
        });
      } else {
        for (let n = 0; n < chunk.length; n++) await dbPut(store, chunk[n]);
      }
      await new Promise(r => setTimeout(r, 0));
    }
    return true;
  };

  if (typeof window.dbPutMany === 'function' && !window.__ahFastPutMany) {
    window.__ahFastPutMany = true;
    const orig = window.dbPutMany;
    window.dbPutMany = async function (store, arr) {
      try { return await putManyFast(store, arr); } catch (_) { return orig.apply(this, arguments); }
    };
  }

  const collect = async () => {
    const out = {};
    for (const st of GLOBAL_STORES) {
      const rows = await dbGetAll(st).catch(() => []);
      out[st] = (Array.isArray(rows) ? rows : []).filter(x => x && x.id).map(stripHeavy);
    }
    return out;
  };

  const fingerprint = data => {
    const q = data.questions || [];
    const vm = data.vocabularyMaster || [];
    const imgs = vm.filter(x => x && (x.imageDataUrl || x.image)).length;
    return [
      (data.subjects || []).length,
      (data.topics || []).length,
      q.length,
      (data.vocabulary || []).length,
      vm.length,
      imgs,
      q.reduce((n, x) => n + String(x.question || x.q || '').length, 0)
    ].join(':');
  };

  let publishTimer = 0;
  let publishing = false;
  const publish = async () => {
    if (ROLE !== 'control' || publishing) return;
    if (!(await bootReady())) return;
    const full = await collect();
    if (!(full.questions || []).length && !(full.vocabularyMaster || []).length && !(full.vocabulary || []).length) return;
    const fp = fingerprint(full);
    try { if (sessionStorage.getItem('ahCloudFp') === fp) return; } catch (_) {}
    publishing = true;
    try {
      const res = await fetch(WORKER + '/api/admin/publish', { method: 'POST', headers: APP_HEADER, body: JSON.stringify(full) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || ('http-' + res.status));
      try { sessionStorage.setItem('ahCloudFp', fp); localStorage.setItem('ahCloudLastPublishAt', String(Date.now())); } catch (_) {}
      window.__ahCloudLastPublish = data;
    } catch (e) {
      window.__ahCloudPublishErr = String(e && e.message || e).slice(0, 120);
    } finally {
      publishing = false;
    }
  };

  const schedulePublish = () => {
    if (ROLE !== 'control') return;
    clearTimeout(publishTimer);
    publishTimer = setTimeout(() => { publish().catch(() => {}); }, 4000);
  };

  const hookWrites = () => {
    if (ROLE !== 'control' || window.__ahCloudWriteHook) return;
    window.__ahCloudWriteHook = true;
    const stores = new Set(GLOBAL_STORES);
    ['dbPut', 'dbPutMany', 'dbDel', 'dbDelRaw', 'dbClear'].forEach(name => {
      const orig = window[name];
      if (typeof orig !== 'function') return;
      window[name] = function ahCloudWrapped() {
        const store = arguments[0];
        const ret = orig.apply(this, arguments);
        if (stores.has(store)) schedulePublish();
        return ret;
      };
    });
  };

  const appliedMeta = () => {
    try { return JSON.parse(localStorage.getItem(META_KEY) || 'null') || { v: 0 }; } catch (_) { return { v: 0 }; }
  };
  const saveApplied = meta => {
    try { localStorage.setItem(META_KEY, JSON.stringify(meta)); } catch (_) {}
  };

  const applyDoc = async doc => {
    if (!doc) return false;
    const subjects = Array.isArray(doc.subjects) ? doc.subjects : [];
    const topics = Array.isArray(doc.topics) ? doc.topics : [];
    const questions = Array.isArray(doc.questions) ? doc.questions : [];
    const vocabulary = Array.isArray(doc.vocabulary) ? doc.vocabulary : [];
    const vocabularyMaster = Array.isArray(doc.vocabularyMaster) ? doc.vocabularyMaster : [];
    if (!questions.length || !nativeQuestion(questions[0])) return false;
    if (!subjects.length || !topics.length) return false;
    await putManyFast('subjects', subjects);
    await putManyFast('topics', topics);
    await putManyFast('questions', questions);
    if (vocabulary.length) await putManyFast('vocabulary', vocabulary.filter(x => x && x.id));
    if (vocabularyMaster.length) await putManyFast('vocabularyMaster', vocabularyMaster.filter(x => x && x.id));
    if (typeof loadCache === 'function') await loadCache();
    if (typeof render === 'function') render();
    return true;
  };

  const applySeedIfEmpty = async () => {
    if (!window.AH_SEED || typeof dbGetAll !== 'function') return false;
    const qs = await dbGetAll('questions').catch(() => []);
    if ((qs || []).length) return false;
    const seed = window.AH_SEED;
    const ok = await applyDoc({
      subjects: seed.subjects || [],
      topics: seed.topics || [],
      questions: seed.questions || [],
      vocabulary: seed.vocabulary || [],
      vocabularyMaster: seed.vocabularyMaster || []
    });
    return ok;
  };

  /* D-V189: public content pull — no auth required (global read-only data) */
  const pull = async () => {
    if (ROLE !== 'public') return;
    if (!(await bootReady())) return;
    const localQs = await dbGetAll('questions').catch(() => []);
    if (!(localQs || []).length) await applySeedIfEmpty();
    let meta = null;
    try { meta = await fetch(WORKER + '/api/content/meta').then(r => r.ok ? r.json() : null); } catch (_) { meta = null; }
    const local = appliedMeta();
    if (meta && Number(meta.v || 0) > 0 && Number(meta.v) === Number(local.v) && meta.sig && meta.sig === local.sig) return;
    let doc = null;
    try { doc = await fetch(WORKER + '/api/content').then(r => r.ok ? r.json() : null); } catch (_) { doc = null; }
    if (!doc || Number(doc.v || 0) <= 0) return;
    if (Number(doc.v) === Number(local.v) && doc.sig && doc.sig === local.sig) return;
    const ok = await applyDoc(doc);
    if (ok) saveApplied({ v: doc.v, at: doc.at, sig: doc.sig || (meta && meta.sig) || '', pulledAt: Date.now() });
    else if (!(await dbGetAll('questions').catch(() => []) || []).length) await applySeedIfEmpty();
    window.__ahCloudLastPull = { ok, v: doc && doc.v, at: doc && doc.at };
  };

  const start = async () => {
    if (!(await bootReady())) return;
    if (ROLE === 'control') {
      hookWrites();
      await publish();
      setInterval(() => { publish().catch(() => {}); }, 45000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') schedulePublish();
      });
      return;
    }
    await pull();
    setInterval(() => { pull().catch(() => {}); }, 60000);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') pull().catch(() => {});
    });
  };

  /* ── D-V189: Export Data — IndexedDB থেকে সব ডেটা JSON file-এ download ── */
  const exportData = async () => {
    if (!(await bootReady())) return alert('DB ready না হওয়া পর্যন্ত অপেক্ষা করুন');
    try {
      const data = await collect();
      const counts = {
        subjects: (data.subjects || []).length,
        topics: (data.topics || []).length,
        questions: (data.questions || []).length,
        vocabulary: (data.vocabulary || []).length,
        vocabularyMaster: (data.vocabularyMaster || []).length
      };
      const fp = fingerprint(data);
      const json = JSON.stringify({
        v: 1,
        at: Date.now(),
        sig: fp,
        counts: counts,
        subjects: data.subjects,
        topics: data.topics,
        questions: data.questions,
        vocabulary: data.vocabulary,
        vocabularyMaster: data.vocabularyMaster
      });
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'admission-hub-export-' + Date.now() + '.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      alert('✅ ডেটা export হয়েছে!\n' +
        'Subjects: ' + counts.subjects +
        '\nTopics: ' + counts.topics +
        '\nQuestions: ' + counts.questions +
        '\nVocabulary: ' + counts.vocabulary);
    } catch (e) {
      alert('Export failed: ' + (e.message || e));
    }
  };
  window.AdmissionCloudContent = { publish, pull, role: ROLE, putManyFast, exportData };

  /* ── D-V189: Sync UI — Export + Sync Now buttons ── */
  const createSyncUI = () => {
    if (document.getElementById('ah-sync-panel')) return;
    const panel = document.createElement('div');
    panel.id = 'ah-sync-panel';
    panel.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:6px;background:linear-gradient(135deg,#1a1a2e,#16213e);border:1px solid rgba(255,255,255,0.1);border-radius:24px;padding:6px 12px;box-shadow:0 4px 20px rgba(0,0,0,0.3);backdrop-filter:blur(12px);font-family:system-ui,sans-serif;transition:all 0.3s ease;opacity:0.95;';
    panel.innerHTML = `
      <span id="ah-sync-dot" style="width:8px;height:8px;border-radius:50%;background:#ffc107;flex-shrink:0;"></span>
      <span id="ah-sync-text" style="color:#e0e0e0;font-size:11px;white-space:nowrap;">ডেটা লোড...</span>
      <button id="ah-sync-btn" style="background:linear-gradient(135deg,#4361ee,#3a0ca3);color:#fff;border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;">🔄 Sync</button>
      <button id="ah-export-btn" style="background:linear-gradient(135deg,#f59e0b,#d97706);color:#fff;border:none;border-radius:16px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;white-space:nowrap;" title="তোমার ডেটা export করো">📤 Export</button>
    `;
    document.body.appendChild(panel);

    document.getElementById('ah-sync-btn').addEventListener('click', () => {
      const btn = document.getElementById('ah-sync-btn');
      const dot = document.getElementById('ah-sync-dot');
      const text = document.getElementById('ah-sync-text');
      btn.disabled = true; btn.textContent = '⏳...';
      dot.style.background = '#4361ee';
      text.textContent = 'Sync হচ্ছে...';
      pull().then(() => {
        const qs = window.__ahCloudLastPull;
        if (qs && qs.ok) {
          dot.style.background = '#00c853';
          text.textContent = '✅ ' + (qs.v || '') + ' synced';
          setTimeout(() => { text.textContent = '📚 Ready'; dot.style.background = '#00c853'; }, 3000);
        } else {
          dot.style.background = '#ff5252';
          text.textContent = '❌ Server থেকে data আসেনি';
        }
        btn.disabled = false; btn.textContent = '🔄 Sync';
      }).catch(() => {
        dot.style.background = '#ff5252';
        text.textContent = '❌ ব্যর্থ';
        btn.disabled = false; btn.textContent = '🔄 Sync';
      });
    });

    document.getElementById('ah-export-btn').addEventListener('click', () => {
      const text = document.getElementById('ah-sync-text');
      text.textContent = 'Export হচ্ছে...';
      exportData().then(() => { text.textContent = '📤 Exported'; }).catch(() => { text.textContent = '❌ Export failed'; });
    });

    // Pulse animation
    if (!document.getElementById('ah-sync-style')) {
      const style = document.createElement('style');
      style.id = 'ah-sync-style';
      style.textContent = '@keyframes ah-pulse{0%,100%{opacity:1}50%{opacity:0.4}}';
      document.head.appendChild(style);
    }
  };

  const kick = async () => {
    createSyncUI();
    try {
      await start();
      const qs = await dbGetAll('questions').catch(() => []);
      const dot = document.getElementById('ah-sync-dot');
      const text = document.getElementById('ah-sync-text');
      if (qs && qs.length > 0) {
        if (dot) dot.style.background = '#00c853';
        if (text) text.textContent = '📚 ' + qs.length + ' প্রশ্ন Ready';
      } else {
        if (dot) dot.style.background = '#ff5252';
        if (text) text.textContent = '📤 Export করে server-এ পাঠাও';
      }
    } catch (_) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(kick, 100));
  else setTimeout(kick, 100);
})();
