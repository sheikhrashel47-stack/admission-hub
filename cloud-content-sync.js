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

  /* ── D-V189: Sync & Export functions exposed for Settings UI ── */
  window.cloudSyncPull = async () => {
    const status = document.getElementById('cloud-sync-status');
    if (status) { status.textContent = '⏳ Syncing from server...'; status.style.color = '#4361ee'; }
    try {
      await pull();
      const last = window.__ahCloudLastPull;
      if (last && last.ok) {
        const qs = await dbGetAll('questions').catch(() => []);
        if (status) { status.textContent = `✅ Synced! ${qs.length} questions loaded from server (v${last.v})`; status.style.color = '#00c853'; }
        if (typeof render === 'function') render();
        toast('✅ Synced from server!');
      } else {
        if (status) { status.textContent = '❌ Server থেকে ডেটা আসেনি। Server-এ এখনো content publish হয়নি।'; status.style.color = '#ff5252'; }
        toast('❌ Server থেকে ডেটা আসেনি');
      }
    } catch (e) {
      if (status) { status.textContent = '❌ Sync failed: ' + (e.message || e); status.style.color = '#ff5252'; }
      toast('Sync failed');
    }
  };

  window.cloudExportData = async () => {
    if (!(await bootReady())) { toast('DB ready না'); return; }
    const status = document.getElementById('cloud-sync-status');
    if (status) { status.textContent = ' Collecting data...'; status.style.color = '#f59e0b'; }
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
        v: 1, at: Date.now(), sig: fp, counts,
        subjects: data.subjects, topics: data.topics,
        questions: data.questions, vocabulary: data.vocabulary,
        vocabularyMaster: data.vocabularyMaster
      });
      const blob = new Blob([json], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'admission-hub-cloud-export-' + Date.now() + '.json';
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
      URL.revokeObjectURL(url);
      if (status) {
        status.textContent = `✅ Exported! ${counts.questions} questions, ${counts.vocabulary} vocabulary, ${counts.subjects} subjects, ${counts.topics} topics — JSON file download হয়েছে।`;
        status.style.color = '#00c853';
      }
      toast('✅ Data exported! JSON file save করো।');
    } catch (e) {
      if (status) { status.textContent = '❌ Export failed: ' + (e.message || e); status.style.color = '#ff5252'; }
      toast('Export failed');
    }
  };

  window.AdmissionCloudContent = { publish, pull, role: ROLE, putManyFast, exportData: window.cloudExportData };

  const kick = async () => {
    try { await start(); } catch (_) {}
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => setTimeout(kick, 100));
  else setTimeout(kick, 100);
})();
