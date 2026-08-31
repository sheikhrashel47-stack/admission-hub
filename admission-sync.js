/* Admission Hub private online sync.
 * This module never starts a first migration by itself. The standalone PWA owner
 * must explicitly start the first encrypted backup from Settings. */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://mqgfxpuiclizbuesklva.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xZ2Z4cHVpY2xpemJ1ZXNrbHZhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc1ODIzMjAsImV4cCI6MjEwMzE1ODMyMH0.pYYAxv-IdnJgqhONKDqMrSOwxEB3MDOm06CUdpMg7zU';
  const META_ID = 'cloudSync';
  const AUTO_SYNC_KEY = 'cloudSyncAutoSync';
  const TOMBSTONES_ID = 'syncTombstones';
  const LOCAL_MERGE_BACKUP_ID = 'cloudSyncLocalMergeBackup';
  const CONFLICTS_ID = 'cloudSyncConflicts';
  const SNAPSHOT_STORES = ['appMeta','subjects','topics','questions','deletedQuestions','exams','examResults','mistakes','vocabulary','vocabularyMaster','dailyStats','activityLogs','settings','notes','ADMISSION_PLANS','PLAN_DAYS'];
  const SYNCABLE_STORES = new Set(SNAPSHOT_STORES.filter(store => store !== 'appMeta'));
  const INITIAL_AUTHORITATIVE_STORES = ['vocabulary', 'vocabularyMaster', 'exams', 'examResults', 'mistakes', 'dailyStats', 'activityLogs', 'notes', 'ADMISSION_PLANS', 'PLAN_DAYS'];
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  let applyingRemote = false;
  let syncing = false;
  let queuedReason = '';
  let nativeDbPut = null;
  let nativeDbDel = null;
  let nativeDbDelPermanent = null;
  let nativeDbDelRaw = null;

  function now() { return Date.now(); }
  function isStandalone() {
    return Boolean((window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || window.navigator.standalone === true);
  }
  function isSafeStorage() { return window.__admissionStorageFallback?.active !== true && window.STORAGE_MODE !== 'memory'; }
  function makeDeviceId() { return `device-${now().toString(36)}-${crypto.getRandomValues(new Uint32Array(2)).join('-')}`; }
  function isRecord(value) { return value && typeof value === 'object' && !Array.isArray(value); }
  function stableJson(value) {
    if (value === null || typeof value !== 'object') return JSON.stringify(value);
    if (Array.isArray(value)) return `[${value.map(stableJson).join(',')}]`;
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableJson(value[key])}`).join(',')}}`;
  }
  function bytesToBase64Url(bytes) {
    let binary = '';
    for (let start = 0; start < bytes.length; start += 0x8000) binary += String.fromCharCode(...bytes.subarray(start, start + 0x8000));
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
  }
  function base64UrlToBytes(value) {
    const padded = String(value || '').replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((String(value || '').length + 3) % 4);
    const binary = atob(padded);
    return Uint8Array.from(binary, char => char.charCodeAt(0));
  }
  async function sha256(value) {
    const data = typeof value === 'string' ? encoder.encode(value) : value;
    return bytesToBase64Url(new Uint8Array(await crypto.subtle.digest('SHA-256', data)));
  }
  async function cryptoKey(secret) {
    const digest = await crypto.subtle.digest('SHA-256', encoder.encode(secret));
    return crypto.subtle.importKey('raw', digest, { name: 'AES-GCM' }, false, ['encrypt', 'decrypt']);
  }
  async function encryptPayload(secret, payload) {
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const encrypted = new Uint8Array(await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, await cryptoKey(secret), encoder.encode(payload)));
    const packed = new Uint8Array(iv.length + encrypted.length);
    packed.set(iv); packed.set(encrypted, iv.length);
    return bytesToBase64Url(packed);
  }
  async function decryptPayload(secret, packed) {
    const bytes = base64UrlToBytes(packed);
    if (bytes.length < 29) throw new Error('Encrypted backup is incomplete.');
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: bytes.slice(0, 12) }, await cryptoKey(secret), bytes.slice(12));
    return decoder.decode(plain);
  }
  function recoverySecret() { return bytesToBase64Url(crypto.getRandomValues(new Uint8Array(32))); }
  function recoveryCode(meta) { return `AH1.${meta.vaultId}.${meta.secret}`; }
  function parseRecoveryCode(value) {
    const parts = String(value || '').trim().split('.');
    if (parts.length !== 3 || parts[0] !== 'AH1' || !/^[0-9a-f-]{36}$/i.test(parts[1]) || parts[2].length < 40) throw new Error('Recovery codeটি ঠিক নয়।');
    return { vaultId: parts[1], secret: parts[2] };
  }
  function recordTimestamp(record) {
    const raw = record?.updatedAt ?? record?.deletedAt ?? record?.completedAt ?? record?.createdAt ?? record?.date ?? 0;
    const numeric = Number(raw);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    const parsed = Date.parse(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  function relevantAppMeta(record) {
    return record?.id !== META_ID && record?.id !== LOCAL_MERGE_BACKUP_ID && record?.id !== CONFLICTS_ID;
  }

  async function rpc(name, payload) {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/${name}`, {
      method: 'POST', cache: 'no-store',
      headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const body = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(body.message || body.hint || `Online sync failed (${response.status})`);
    return body;
  }
  async function meta() { return window.dbGet ? window.dbGet('appMeta', META_ID) : null; }
  async function setMeta(value) { return nativeDbPut ? nativeDbPut('appMeta', value) : window.dbPut('appMeta', value); }
  async function tombstones() { return (await window.dbGet('appMeta', TOMBSTONES_ID)) || { id: TOMBSTONES_ID, entries: [] }; }
  async function addTombstone(store, id) {
    if (!id || store === 'appMeta') return;
    const current = await tombstones();
    const key = `${store}:${String(id)}`;
    const entries = (current.entries || []).filter(entry => `${entry.store}:${String(entry.id)}` !== key);
    entries.push({ store, id, deletedAt: now() });
    await (nativeDbPut || window.dbPut)('appMeta', { id: TOMBSTONES_ID, entries: entries.slice(-2000), updatedAt: now() });
  }

  async function buildSnapshot() {
    const stores = {};
    for (const store of SNAPSHOT_STORES) {
      const rows = await window.dbGetAll(store);
      stores[store] = store === 'appMeta' ? rows.filter(relevantAppMeta) : rows;
    }
    const payload = { schemaVersion: 1, createdAt: now(), stores };
    const canonical = stableJson(payload);
    const manifest = { schemaVersion: 1, createdAt: payload.createdAt, counts: Object.fromEntries(Object.entries(stores).map(([store, rows]) => [store, rows.length])), contentHash: await sha256(canonical) };
    return { payload, canonical, manifest };
  }
  async function packedSnapshot(secret) {
    const snapshot = await buildSnapshot();
    return { ...snapshot, ciphertext: await encryptPayload(secret, snapshot.canonical) };
  }
  async function pullRemote(currentMeta) {
    const rows = await rpc('admission_sync_pull', { p_vault_id: currentMeta.vaultId, p_secret: currentMeta.secret });
    const row = Array.isArray(rows) ? rows[0] : null;
    if (!row) throw new Error('Online backup পাওয়া যায়নি।');
    const canonical = await decryptPayload(currentMeta.secret, row.ciphertext);
    const calculated = await sha256(canonical);
    if (calculated !== row.content_hash || row.manifest?.contentHash !== row.content_hash) throw new Error('Online backup validation failed; local data was left unchanged.');
    const payload = JSON.parse(canonical);
    if (payload?.schemaVersion !== 1 || !payload?.stores) throw new Error('Online backup version is not supported.');
    return { row, payload };
  }
  function sameRecord(a, b) { return stableJson(a) === stableJson(b); }
  async function storeConflicts(conflicts) {
    if (!conflicts.length) return;
    const existing = (await window.dbGet('appMeta', CONFLICTS_ID)) || { id: CONFLICTS_ID, entries: [] };
    const entries = [...(existing.entries || []), ...conflicts].slice(-100);
    await (nativeDbPut || window.dbPut)('appMeta', { id: CONFLICTS_ID, entries, updatedAt: now() });
  }
  async function ensureLocalMergeBackup() {
    if (await window.dbGet('appMeta', LOCAL_MERGE_BACKUP_ID)) return;
    const localBefore = await buildSnapshot();
    await nativeDbPut('appMeta', { id: LOCAL_MERGE_BACKUP_ID, createdAt: now(), snapshot: localBefore.payload, note: 'Local safety copy before first cloud reconciliation' });
  }
  async function mergeRemoteSnapshot(payload, options = {}) {
    const conflicts = [];
    const replaceStores = new Set(options.replaceStores || []);
    let added = 0, updated = 0, deleted = 0;
    applyingRemote = true;
    try {
      for (const store of SNAPSHOT_STORES) {
        const incomingRows = Array.isArray(payload.stores?.[store]) ? payload.stores[store] : [];
        const localRows = await window.dbGetAll(store);
        const local = new Map(localRows.filter(Boolean).map(row => [String(row.id), row]));
        // During the first connection, the Add to Home Screen app is the
        // authoritative source for the 90-day plan. The live site's existing
        // rows are preserved in cloudSyncLocalMergeBackup before this runs.
        if (replaceStores.has(store) && incomingRows.length) {
          const incomingIds = new Set(incomingRows.filter(Boolean).map(row => String(row.id)));
          for (const existing of localRows.filter(Boolean)) {
            if (!incomingIds.has(String(existing.id))) {
              await nativeDbDelRaw(store, existing.id);
              local.delete(String(existing.id));
            }
          }
        }
        for (const incoming of incomingRows) {
          if (!isRecord(incoming) || incoming.id === undefined || (store === 'appMeta' && !relevantAppMeta(incoming))) continue;
          const existing = local.get(String(incoming.id));
          if (!existing) {
            await nativeDbPut(store, incoming); added += 1; continue;
          }
          if (sameRecord(existing, incoming)) continue;
          if (recordTimestamp(incoming) > recordTimestamp(existing)) {
            await nativeDbPut(store, incoming); updated += 1;
          } else {
            conflicts.push({ store, id: incoming.id, detectedAt: now(), localUpdatedAt: recordTimestamp(existing), remoteUpdatedAt: recordTimestamp(incoming) });
          }
        }
      }
      const remoteTombstones = payload.stores?.appMeta?.find(row => row?.id === TOMBSTONES_ID)?.entries || [];
      for (const tombstone of remoteTombstones) {
        if (!SYNCABLE_STORES.has(tombstone?.store)) continue;
        const local = await window.dbGet(tombstone.store, tombstone.id);
        if (local && recordTimestamp(local) <= Number(tombstone.deletedAt || 0)) {
          await nativeDbDelRaw(tombstone.store, tombstone.id); deleted += 1;
        }
      }
      await storeConflicts(conflicts);
    } finally { applyingRemote = false; }
    return { added, updated, deleted, conflicts: conflicts.length };
  }
  function autoSyncEnabled() {
    try { return localStorage.getItem(AUTO_SYNC_KEY) !== '0'; } catch (_) { return true; }
  }
  function formatSyncDate(value) {
    try {
      const date = new Date(typeof value === 'number' || /^\d+$/.test(String(value || '')) ? Number(value) : value);
      if (Number.isNaN(date.getTime())) return String(value || '—');
      return date.toLocaleString('bn-BD');
    } catch (_) { return new Date(value).toLocaleString(); }
  }
  function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>\"']/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', "'": '&#39;' }[ch]));
  }
  function statusText(currentMeta) {
    if (!currentMeta?.vaultId) return isStandalone() ? 'এখনো private backup তৈরি হয়নি — এখান থেকেই শুরু করো।' : 'প্রথম backup শুরু করতে Add to Home Screen app-এ একবার Settings খোলো।';
    if (currentMeta.lastError) return `Sync-এ সমস্যা: ${currentMeta.lastError}`;
    if (currentMeta.lastSyncedAt) return `Private backup চালু · শেষ Sync: ${formatSyncDate(currentMeta.lastSyncedAt)}`;
    return 'Private backup যুক্ত আছে।';
  }
  async function saveStatus(currentMeta, patch) {
    await setMeta({ ...currentMeta, ...patch, id: META_ID, updatedAt: now() });
  }
  async function syncNow(reason = 'manual') {
    let currentMeta;
    try { currentMeta = await meta(); }
    catch (error) {
      if (reason === 'manual') notifySync('Backup status লোড হয়নি — Settings আবার খুলে চেষ্টা করো।');
      console.warn('[Admission Hub sync] Could not read local backup status.', error);
      return false;
    }
    if (!currentMeta?.vaultId || !currentMeta.secret) {
      if (reason === 'manual') notifySync('আগে Private backup যুক্ত করো, তারপর Sync করো।');
      return false;
    }
    if (syncing || applyingRemote) {
      if (reason === 'manual') notifySync('একটি Sync ইতিমধ্যে চলছে।');
      return false;
    }
    if (!navigator.onLine) {
      if (reason === 'manual') notifySync('ইন্টারনেট নেই — online হলে আবার চেষ্টা করো।');
      return false;
    }
    syncing = true;
    void renderSyncPanel();
    try {
      let remote = await pullRemote(currentMeta);
      let activeMeta = { ...currentMeta, revision: Number(remote.row.revision || currentMeta.revision || 0) };
      // Reconcile clients that connected before the complete content-loading
      // fix was deployed. This is a one-time, scoped repair: selected content
      // stores are replaced by the Add to Home Screen snapshot, and the
      // pre-merge live data is saved under cloudSyncLocalMergeBackup.
      const needsInitialReconciliation = currentMeta.initialReconciliationVersion !== 3;
      if (needsInitialReconciliation) {
        // Only the normal live website repairs its pre-existing default copy.
        // The standalone Add to Home Screen app is the source of truth and is
        // never replaced during this migration.
        if (!isStandalone()) {
          await ensureLocalMergeBackup();
          await mergeRemoteSnapshot(remote.payload, { replaceStores: INITIAL_AUTHORITATIVE_STORES });
          await window.loadCache();
        }
        activeMeta.initialReconciliationVersion = 3;
      } else if (Number(remote.row.revision) > Number(currentMeta.revision || 0)) {
        await mergeRemoteSnapshot(remote.payload);
        await window.loadCache();
      }
      let local = await packedSnapshot(activeMeta.secret);
      if (local.manifest.contentHash !== remote.row.content_hash) {
        let response;
        try {
          response = await rpc('admission_sync_push', { p_vault_id: activeMeta.vaultId, p_secret: activeMeta.secret, p_expected_revision: Number(remote.row.revision), p_device_id: activeMeta.deviceId, p_ciphertext: local.ciphertext, p_manifest: local.manifest, p_content_hash: local.manifest.contentHash });
        } catch (error) {
          if (!/revision_conflict/i.test(String(error.message || error))) throw error;
          remote = await pullRemote(activeMeta);
          await mergeRemoteSnapshot(remote.payload);
          local = await packedSnapshot(activeMeta.secret);
          response = await rpc('admission_sync_push', { p_vault_id: activeMeta.vaultId, p_secret: activeMeta.secret, p_expected_revision: Number(remote.row.revision), p_device_id: activeMeta.deviceId, p_ciphertext: local.ciphertext, p_manifest: local.manifest, p_content_hash: local.manifest.contentHash });
        }
        activeMeta.revision = Number(Array.isArray(response) ? response[0]?.revision : response?.revision);
      }
      await saveStatus(activeMeta, { lastSyncedAt: now(), lastError: '', lastReason: reason });
      if (reason === 'manual') notifySync('Private backup up to date ✓');
      return true;
    } catch (error) {
      await saveSyncError(currentMeta, error);
      if (reason === 'manual') notifySync('Sync হয়নি: ' + String(error?.message || 'অনলাইন সমস্যা').slice(0, 80));
      console.warn('[Admission Hub sync]', error);
      return false;
    } finally {
      syncing = false;
      void renderSyncPanel();
    }
  }
  const queueSync = (() => {
    let timer = 0;
    return reason => {
      if (!autoSyncEnabled() && reason !== 'manual') return;
      queuedReason = reason || queuedReason || 'change';
      clearTimeout(timer);
      timer = window.setTimeout(() => {
        const reasonToUse = queuedReason;
        queuedReason = '';
        if (autoSyncEnabled() || reasonToUse === 'manual') void syncNow(reasonToUse);
      }, 3500);
    };
  })();
  async function bootstrapStandalone() {
    if (!isSafeStorage()) throw new Error('Persistent local storage is unavailable; no backup was started.');
    if (!isStandalone()) throw new Error('Start the first backup from the Add to Home Screen app, not the normal website.');
    if (await meta()) throw new Error('This app is already connected to private backup.');
    const secret = recoverySecret();
    const snapshot = await packedSnapshot(secret);
    const deviceId = makeDeviceId();
    const rows = await rpc('admission_sync_bootstrap', { p_secret: secret, p_device_id: deviceId, p_ciphertext: snapshot.ciphertext, p_manifest: snapshot.manifest, p_content_hash: snapshot.manifest.contentHash });
    const row = Array.isArray(rows) ? rows[0] : rows;
    if (!row?.vault_id || Number(row.revision) !== 1) throw new Error('Online backup confirmation was incomplete.');
    const currentMeta = { id: META_ID, vaultId: row.vault_id, secret, deviceId, revision: 1, schemaVersion: 1, initialReconciliationVersion: 3, enrolledAt: now(), lastSyncedAt: now(), lastError: '' };
    await setMeta(currentMeta);
    return { meta: currentMeta, snapshot };
  }
  async function connectExisting(code) {
    if (!isSafeStorage()) throw new Error('Persistent local storage is unavailable; existing data was left unchanged.');
    if (await meta()) throw new Error('This app is already connected to private backup.');
    const identity = parseRecoveryCode(code);
    const deviceId = makeDeviceId();
    const transient = { ...identity, deviceId, revision: 0 };
    const remote = await pullRemote(transient);
    await ensureLocalMergeBackup();
    const result = await mergeRemoteSnapshot(remote.payload, { replaceStores: INITIAL_AUTHORITATIVE_STORES });
    const connected = { id: META_ID, ...identity, deviceId, revision: Number(remote.row.revision), schemaVersion: 1, initialReconciliationVersion: 3, enrolledAt: now(), lastSyncedAt: now(), lastError: '' };
    await setMeta(connected);
    await window.loadCache();
    return { connected, result };
  }
  function notifySync(message) {
    if (typeof window.toast === 'function') window.toast(message);
    else console.warn('[Admission Hub sync]', message);
  }
  function openAppModal(html) {
    if (typeof window.openModal === 'function') { window.openModal(html); return true; }
    const root = document.getElementById('modalRoot');
    if (!root) return false;
    document.body.classList.add('modal-open');
    root.innerHTML = `<div class="modal-bg" onclick="if(event.target===this){this.remove();document.body.classList.remove('modal-open');}"><div class="modal">${html}</div></div>`;
    return true;
  }
  function closeAppModal() {
    if (typeof window.closeModal === 'function') { window.closeModal(); return; }
    const root = document.getElementById('modalRoot');
    if (root) root.innerHTML = '';
    document.body.classList.remove('modal-open');
  }
  async function saveSyncError(currentMeta, error) {
    try { await saveStatus(currentMeta, { lastError: String(error?.message || 'Online sync failed').slice(0, 180) }); } catch (_) {}
  }

  function openMigrationDialog() {
    const message = isStandalone()
      ? 'This makes one encrypted online copy of the current Add to Home Screen data. Nothing is removed from this device.'
      : 'For safety, the first backup must start from the Add to Home Screen app where your main study data already exists.';
    openAppModal(`<h3>Private online backup</h3><div class="muted">${message}</div>${isStandalone() ? '<button class="btn" style="margin-top:14px" onclick="AdmissionCloudSync.beginMigration()">Create private backup</button>' : ''}`);
  }
  async function beginMigration() {
    try {
      closeAppModal();
      const result = await bootstrapStandalone();
      const code = recoveryCode(result.meta);
      openAppModal(`<h3>Private backup created</h3><div class="muted">Keep this one-time recovery code private. Open the normal website once, go to Settings → Private online backup, and paste it there.</div><textarea readonly style="width:100%;min-height:92px;margin-top:12px;">${code}</textarea><button class="btn secondary" style="margin-top:12px" onclick="navigator.clipboard.writeText(${JSON.stringify(code)}).then(()=>toast('Recovery code copied'))">Copy recovery code</button>`);
    } catch (error) { closeAppModal(); window.toast(String(error?.message || 'Private backup was not started.')); }
  }
  function openConnectDialog() {
    openAppModal(`<h3>Connect private backup</h3><div class="muted">Paste the one-time recovery code shown by the Add to Home Screen app. Local data is backed up before anything is merged.</div><textarea id="cloudSyncCode" placeholder="AH1.…" style="width:100%;min-height:92px;margin-top:12px;"></textarea><button class="btn" style="margin-top:12px" onclick="AdmissionCloudSync.connectFromDialog()">Connect safely</button>`);
  }
  async function connectFromDialog() {
    try {
      const value = document.getElementById('cloudSyncCode')?.value || '';
      closeAppModal();
      const result = await connectExisting(value);
      window.toast(`Private backup connected · ${result.result.added} records added`);
      if (typeof window.render === 'function') window.render();
    } catch (error) { window.toast(String(error?.message || 'Could not connect private backup.')); }
  }
  async function syncAiNow() {
    if (typeof window.StudyAiTool?.forceSync !== 'function') {
      if (typeof window.toast === 'function') window.toast('Study AI sync এখনো লোড হয়নি — একটু পরে চেষ্টা করো।');
      return;
    }
    try { await window.StudyAiTool.forceSync(); }
    finally { void renderSyncPanel(); }
  }
  function setAiAutoSync(enabled) {
    if (typeof window.StudyAiTool?.setAutoSync === 'function') window.StudyAiTool.setAutoSync(Boolean(enabled));
    else { try { localStorage.setItem('studyAiAutoSync', enabled ? '1' : '0'); } catch (_) {} }
    void renderSyncPanel();
  }
  function setAutoSync(enabled) {
    try { localStorage.setItem(AUTO_SYNC_KEY, enabled ? '1' : '0'); } catch (_) {}
    if (enabled) queueSync('auto enabled');
    void renderSyncPanel();
  }
  async function renderSyncPanel() {
    const node = document.getElementById('cloudSyncPanel');
    if (!node) return;
    let currentMeta = null;
    let metaError = '';
    try { currentMeta = await meta(); }
    catch (error) { metaError = String(error?.message || 'Local backup status could not be loaded').slice(0, 120); }
    let conflictMeta = null;
    try { conflictMeta = window.dbGet ? await window.dbGet('appMeta', CONFLICTS_ID) : null; } catch (_) {}
    const conflicts = conflictMeta?.entries?.length || 0;
    const connected = Boolean(currentMeta?.vaultId && currentMeta?.secret);
    const privateAuto = autoSyncEnabled();
    const privateActions = metaError
      ? '<button class="btn secondary" onclick="AdmissionCloudSync.refreshSettings()">Status আবার দেখো</button>'
      : (connected
        ? `<button class="btn secondary" onclick="AdmissionCloudSync.syncNow('manual')">${syncing ? 'Sync হচ্ছে…' : 'Sync now · এখনই'}</button><button class="btn ghost" style="margin-left:8px" onclick="AdmissionCloudSync.showRecoveryCode()">Recovery code</button>`
        : (isStandalone()
          ? '<button class="btn secondary" onclick="AdmissionCloudSync.openMigrationDialog()">Private backup শুরু করো</button>'
          : '<button class="btn secondary" onclick="AdmissionCloudSync.openConnectDialog()">Recovery code দিয়ে যুক্ত করো</button>'));

    let aiState = {};
    try { aiState = window.StudyAiTool?._state?.() || {}; } catch (_) {}
    const appCache = window.CACHE || {};
    const questionCount = Array.isArray(appCache.questions) ? appCache.questions.length : 0;
    let aiShared = false, aiSavedAt = '';
    try {
      aiShared = localStorage.getItem('studyAiShared') === '1';
      aiSavedAt = aiState.bankInfo?.savedAt || localStorage.getItem('studyAiBankAt') || '';
    } catch (_) {}
    const aiAuto = (() => { try { return localStorage.getItem('studyAiAutoSync') !== '0'; } catch (_) { return true; } })();
    const aiReady = typeof window.StudyAiTool?.forceSync === 'function';
    const aiBusy = Boolean(aiState.syncing);
    const aiStatus = aiSavedAt
      ? `AI memory-তে শেষ Sync: ${formatSyncDate(Number(aiSavedAt))}`
      : (aiShared ? 'AI memory যুক্ত আছে; এখনো এই ডিভাইসের নতুন Sync-এর সময় লেখা নেই।' : 'এখনো AI memory-তে ডেটা পাঠানো হয়নি।');
    const aiButton = aiReady
      ? `<button class="btn secondary" onclick="AdmissionCloudSync.syncAiNow()">${aiBusy ? 'Sync হচ্ছে…' : (aiShared ? 'এখনই AI Sync' : 'একবার AI Sync শুরু করো')}</button>`
      : '<button class="btn secondary" disabled>Study AI লোড হচ্ছে…</button>';
    const localSummary = `এই ডিভাইসে ${String(questionCount).replace(/\d/g, d => '০১২৩৪৫৬৭৮৯'[d])}টি প্রশ্ন আছে।`;
    const privateStatus = metaError ? `Backup status লোড হয়নি: ${metaError}` : statusText(currentMeta);
    const markup = `<div class="h2">Private online backup / Sync</div><div class="card" aria-label="Private online backup"><b>🔐 Encrypted private backup</b><div class="muted" style="margin:8px 0 10px;line-height:1.55;">${escapeHtml(privateStatus)}</div><div class="row wrap" style="gap:8px;">${privateActions}</div><div class="togglerow" style="margin-top:12px;"><div><b>Automatic private backup</b><div class="muted">Backup যুক্ত থাকলে পরিবর্তন নিজে থেকে সুরক্ষিত কপিতে যাবে।</div></div><button type="button" role="switch" aria-checked="${privateAuto}" class="toggle ${privateAuto ? 'on' : ''}" onclick="AdmissionCloudSync.setAutoSync(${!privateAuto})"><div class="dot"></div></button></div>${conflicts ? `<div class="muted" style="margin-top:10px;">${conflicts}টি protected conflict আলাদা করে রাখা আছে; কোনো record চুপিচুপি overwrite হয়নি।</div>` : ''}</div><div class="h2" style="margin-top:18px;">Study AI data sync</div><div class="card" aria-label="Study AI data sync"><b>📚 AI memory আপডেট</b><div class="muted" style="margin:8px 0;line-height:1.55;">${escapeHtml(localSummary)} প্রশ্নব্যাংক, পরীক্ষার ইতিহাস, ভুল-প্রশ্ন ও progress AI-এর memory-তে পাঠিয়ে আপডেট করে। এটি encrypted private backup-এর থেকে আলাদা।</div><div class="muted" style="font-size:12px;margin-bottom:10px;">${escapeHtml(aiStatus)}</div><div class="row wrap" style="gap:8px;">${aiButton}</div><div class="togglerow" style="margin-top:12px;"><div><b>Automatic AI sync</b><div class="muted">ডেটা শেয়ার করার পর নতুন প্রশ্ন বা পরীক্ষা হলে প্রায় ৯০ সেকেন্ড পর update হবে।</div></div><button type="button" role="switch" aria-checked="${aiAuto}" class="toggle ${aiAuto ? 'on' : ''}" onclick="AdmissionCloudSync.setAiAutoSync(${!aiAuto})"><div class="dot"></div></div></div></div><div class="card" style="margin-top:10px;"><div class="muted" style="line-height:1.6;"><b>কেন automatic Sync দেখা যায়?</b><br>Study AI-তে data share করার পরে নতুন data বদলেছে কি না দেখে প্রায় ৯০ সেকেন্ডে একবার update চেষ্টা করে। Private backup যুক্ত থাকলে app চালু হওয়া, online হওয়া, focus-এ ফেরা, background থেকে ফিরে আসা এবং visible অবস্থায় ২০ সেকেন্ডের refresh-এ backup check করে। Backup যুক্ত না থাকলে private অংশ কোনো encrypted snapshot পাঠায় না।</div></div>`;
    const currentNode = document.getElementById('cloudSyncPanel');
    if (currentNode && currentNode.innerHTML !== markup) currentNode.innerHTML = markup;
  }

  function isSettingsRoute() {
    const hash = typeof location !== 'undefined' ? location.hash : '';
    return String(window.Router?.path || hash || '').replace(/^#\/?/, '').split('?')[0] === 'settings';
  }
  let settingsPanelTimer = 0;
  function mountSettingsPanel() {
    if (!isSettingsRoute()) return;
    const app = document.getElementById('app');
    if (!app) return;
    let node = document.getElementById('cloudSyncPanel');
    if (!node) {
      node = document.createElement('section');
      node.id = 'cloudSyncPanel';
      const dangerHeading = [...app.querySelectorAll('.h2')].find(item => item.textContent.trim().toLowerCase() === 'danger zone');
      if (dangerHeading) dangerHeading.before(node);
      else app.appendChild(node);
    }
    void renderSyncPanel();
  }
  function scheduleSettingsPanel() {
    if (settingsPanelTimer) return;
    settingsPanelTimer = window.setTimeout(() => {
      settingsPanelTimer = 0;
      mountSettingsPanel();
    }, 0);
  }
  function observeSettingsMount() {
    const app = document.getElementById('app');
    if (!app || app.__cloudSyncSettingsObserved || !window.MutationObserver) return;
    app.__cloudSyncSettingsObserved = true;
    new MutationObserver(scheduleSettingsPanel).observe(app, { childList: true, subtree: true });
  }
  async function showRecoveryCode() {
    try {
      const currentMeta = await meta();
      if (!currentMeta?.vaultId || !currentMeta.secret) {
        notifySync('এই ডিভাইসে Recovery code পাওয়া যায়নি।');
        return;
      }
      const code = recoveryCode(currentMeta);
      if (!openAppModal(`<h3>Recovery code</h3><div class="muted">Keep it private. It is only needed to connect a new browser or recover after reinstall.</div><textarea readonly style="width:100%;min-height:92px;margin-top:12px;">${code}</textarea><button class="btn secondary" style="margin-top:12px" onclick="navigator.clipboard.writeText(${JSON.stringify(code)}).then(()=>toast('Recovery code copied')).catch(()=>toast('Copy করা যায়নি'))">Copy recovery code</button>`)) notifySync('Recovery code দেখানোর জায়গা পাওয়া যায়নি।');
    } catch (error) {
      notifySync('Recovery code লোড হয়নি — Settings আবার খুলে চেষ্টা করো।');
      console.warn('[Admission Hub sync] Could not read recovery code.', error);
    }
  }
  function hookSettings() {
    const original = window.renderSettings;
    if (typeof original !== 'function' || original.__cloudSyncWrapped) return;
    const wrapped = function () {
      const value = original.apply(this, arguments);
      const app = document.getElementById('app');
      if (app && !document.getElementById('cloudSyncPanel')) app.insertAdjacentHTML('beforeend', '<div id="cloudSyncPanel"></div>');
      void renderSyncPanel();
      return value;
    };
    wrapped.__cloudSyncWrapped = true;
    window.renderSettings = wrapped;
  }
  function hookWrites() {
    nativeDbPut = window.dbPut;
    nativeDbDel = window.dbDel;
    nativeDbDelPermanent = window.dbDelPermanent;
    nativeDbDelRaw = window.dbDelRaw;
    if (typeof nativeDbPut !== 'function' || typeof nativeDbDel !== 'function' || typeof nativeDbDelRaw !== 'function') return;
    window.dbPut = async function (store, object) {
      const syncable = SYNCABLE_STORES.has(store) && isRecord(object);
      const stamped = syncable && !applyingRemote ? { ...object, updatedAt: now() } : object;
      const result = await nativeDbPut(store, stamped);
      if (syncable && !applyingRemote && await meta()) queueSync('local change');
      return result;
    };
    window.dbDel = async function (store, id) {
      const result = await nativeDbDel(store, id);
      if (SYNCABLE_STORES.has(store) && !applyingRemote && await meta()) { await addTombstone(store, id); queueSync('local deletion'); }
      return result;
    };
    window.dbDelPermanent = async function (store, id) {
      const result = await nativeDbDelPermanent(store, id);
      if (SYNCABLE_STORES.has(store) && !applyingRemote && await meta()) { await addTombstone(store, id); queueSync('local deletion'); }
      return result;
    };
  }
  function start() {
    hookWrites();
    hookSettings();
    observeSettingsMount();
    scheduleSettingsPanel();
    window.addEventListener('hashchange', scheduleSettingsPanel, { passive: true });
    window.addEventListener('online', () => { queueSync('online'); scheduleSettingsPanel(); });
    document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') { queueSync('resume'); scheduleSettingsPanel(); } });
    window.addEventListener('focus', () => { queueSync('focus'); scheduleSettingsPanel(); });
    // Keep both clients near-live while visible without introducing a server worker.
    // Changes sync after a short debounce; the periodic check is only a safety refresh.
    // Avoid repeatedly writing a large encrypted snapshot and locking the Supabase row.
    window.setInterval(() => { if (document.visibilityState === 'visible') { if (autoSyncEnabled()) queueSync('visible refresh'); scheduleSettingsPanel(); } }, 20000);
    const waitForBoot = () => {
      if (window.__admissionBootStatus === 'ready') { if (autoSyncEnabled()) void syncNow('launch'); return; }
      window.setTimeout(waitForBoot, 450);
    };
    waitForBoot();
  }
  window.AdmissionCloudSync = { openMigrationDialog, beginMigration, openConnectDialog, connectFromDialog, syncNow, showRecoveryCode, syncAiNow, setAiAutoSync, setAutoSync, refreshSettings: () => { void renderSyncPanel(); }, status: meta, isStandalone };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => window.setTimeout(start, 0));
  else window.setTimeout(start, 0);
})();
