/* Admission Hub data protection layer.
 * This file is intentionally additive: it never clears storage, deletes records,
 * or replaces user-created content. It stores only recovery metadata and summaries.
 */
(function (global) {
  'use strict';

  const PROTECTION_VERSION = 1;
  const BACKUP_KEY = 'admissionHub:data-protection:snapshots:v1';
  const MAX_SNAPSHOTS = 8;
  const STORE_NAMES = ['appMeta','subjects','topics','questions','exams','examResults','mistakes','vocabulary','dailyStats','activityLogs','settings','notes','ADMISSION_PLANS','PLAN_DAYS'];

  function safeParse(value, fallback) {
    try {
      const parsed = JSON.parse(value);
      return parsed && typeof parsed === 'object' ? parsed : fallback;
    } catch (_) {
      return fallback;
    }
  }

  function readSnapshots() {
    const raw = localStorage.getItem(BACKUP_KEY);
    if (raw == null) return [];
    const parsed = safeParse(raw, null);
    if (!Array.isArray(parsed)) {
      try { localStorage.setItem(BACKUP_KEY + ':corrupt:' + Date.now(), raw); } catch (_) {}
      return [];
    }
    return parsed.filter(x => x && typeof x === 'object' && x.snapshotId);
  }

  function writeSnapshot(snapshot) {
    const snapshots = readSnapshots();
    snapshots.push(snapshot);
    try {
      localStorage.setItem(BACKUP_KEY, JSON.stringify(snapshots.slice(-MAX_SNAPSHOTS)));
      localStorage.setItem('admissionHub:data-protection:last-snapshot', String(snapshot.snapshotId));
    } catch (error) {
      console.warn('[Admission Hub] Could not persist protection snapshot.', error);
    }
    return snapshot;
  }

  function requestToPromise(request) {
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
    });
  }

  async function summarizeDatabase(db) {
    const summary = { stores: {}, totalRecords: 0 };
    const names = Array.from(db.objectStoreNames);
    for (const name of names) {
      try {
        const tx = db.transaction(name, 'readonly');
        const count = await requestToPromise(tx.objectStore(name).count());
        summary.stores[name] = Number(count) || 0;
        summary.totalRecords += Number(count) || 0;
      } catch (error) {
        summary.stores[name] = { unreadable: true, error: String(error?.message || error) };
      }
    }
    return summary;
  }

  async function openForSummary(dbName) {
    if (!global.indexedDB) return null;
    return new Promise((resolve) => {
      let req;
      try { req = global.indexedDB.open(dbName); } catch (_) { resolve(null); return; }
      req.onsuccess = async () => {
        const db = req.result;
        try { resolve({ version: db.version, summary: await summarizeDatabase(db) }); }
        catch (_) { resolve({ version: db.version, summary: null }); }
        finally { db.close(); }
      };
      req.onerror = () => resolve(null);
      req.onblocked = () => resolve(null);
    });
  }

  async function snapshot(dbName, reason, extra) {
    const dbInfo = await openForSummary(dbName);
    const snapshot = {
      protectionVersion: PROTECTION_VERSION,
      snapshotId: 'snap-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8),
      createdAt: new Date().toISOString(),
      reason: String(reason || 'boot'),
      dbName,
      dbVersion: dbInfo?.version || 0,
      summary: dbInfo?.summary || { stores: {}, totalRecords: 0, unavailable: true },
      localStorageKeys: Object.keys(localStorage).filter(k => k !== BACKUP_KEY).sort(),
      extra: extra && typeof extra === 'object' ? extra : undefined
    };
    return writeSnapshot(snapshot);
  }

  function localStorageHealth() {
    const bad = [];
    for (let i = 0; i < localStorage.length; i += 1) {
      const key = localStorage.key(i);
      if (!key) continue;
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const looksJson = /^[\[{]/.test(raw.trim());
      if (looksJson && safeParse(raw, null) === null) bad.push(key);
    }
    return { ok: bad.length === 0, corruptedKeys: bad };
  }

  function validateImport(payload, options) {
    const opts = options || {};
    const source = Array.isArray(payload) ? payload : (payload && Array.isArray(payload.records) ? payload.records : null);
    if (!source) return { valid: false, records: [], rejected: [{ reason: 'Import must contain an array of records.' }] };
    const keyOf = typeof opts.keyOf === 'function' ? opts.keyOf : (record => record && (record.id || record.question || record.word || record.name));
    const seen = new Set();
    const records = [];
    const rejected = [];
    source.forEach((record, index) => {
      if (!record || typeof record !== 'object' || Array.isArray(record)) {
        rejected.push({ index, reason: 'Record is not an object.' });
        return;
      }
      const key = String(keyOf(record) || '').trim().toLowerCase();
      if (!key) {
        rejected.push({ index, reason: 'Record has no stable identity.' });
        return;
      }
      if (seen.has(key)) {
        rejected.push({ index, reason: 'Duplicate record in import.' });
        return;
      }
      seen.add(key);
      records.push(record);
    });
    return { valid: rejected.length === 0, records, rejected, duplicateCount: rejected.filter(x => /Duplicate/.test(x.reason)).length };
  }

  function dedupeRecords(records, keyOf) {
    const seen = new Set();
    return (Array.isArray(records) ? records : []).filter(record => {
      const key = String((keyOf || (x => x && (x.id || x.question || x.word || x.name)))(record) || '').trim().toLowerCase();
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  async function prepareOpen(dbName, targetVersion) {
    const before = await snapshot(dbName, 'before-open-or-migration', { targetVersion });
    return { before, localStorageHealth: localStorageHealth() };
  }

  async function verifyMigration(db, beforeSnapshot) {
    const after = await summarizeDatabase(db);
    const beforeStores = beforeSnapshot?.summary?.stores || {};
    const losses = [];
    Object.keys(beforeStores).forEach(name => {
      const beforeCount = Number(beforeStores[name]);
      const afterCount = Number(after.stores[name]);
      if (Number.isFinite(beforeCount) && Number.isFinite(afterCount) && afterCount < beforeCount) {
        losses.push({ store: name, before: beforeCount, after: afterCount });
      }
    });
    if (losses.length) {
      console.error('[Admission Hub] Migration count verification detected a possible loss.', losses);
      await snapshot(db.name, 'migration-count-warning', { losses, after });
    } else {
      await snapshot(db.name, 'after-open-or-migration', { after });
    }
    return { ok: losses.length === 0, losses, after };
  }

  global.AdmissionDataProtection = {
    version: PROTECTION_VERSION,
    storeNames: STORE_NAMES.slice(),
    snapshot,
    prepareOpen,
    summarizeDatabase,
    verifyMigration,
    validateImport,
    dedupeRecords,
    localStorageHealth,
    getSnapshots: readSnapshots
  };

  global.addEventListener('DOMContentLoaded', () => {
    snapshot('admissionHubDB', 'boot').catch(error => console.warn('[Admission Hub] Boot snapshot skipped.', error));
  }, { once: true });
})(window);
