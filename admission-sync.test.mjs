import assert from 'node:assert/strict';

const data = new Map();
let networkCalls = 0;
let modalHtml = '';

const dbGet = async (store, id) => data.get(`${store}:${id}`);
const dbPut = async (store, value) => {
  data.set(`${store}:${value.id}`, structuredClone(value));
  return value;
};
const dbGetAll = async store => [...data.entries()]
  .filter(([key]) => key.startsWith(`${store}:`))
  .map(([, value]) => structuredClone(value));

globalThis.window = {
  dbGet,
  dbPut,
  dbGetAll,
  dbDel: async () => true,
  dbDelRaw: async () => true,
  dbDelPermanent: async () => true,
  loadCache: async () => true,
  __admissionBootStatus: 'ready',
  __admissionStorageFallback: { active: false },
  STORAGE_MODE: 'indexeddb',
  navigator: { standalone: true },
  matchMedia: () => ({ matches: true }),
  addEventListener: () => {},
  setTimeout: fn => { queueMicrotask(fn); return 1; },
  clearTimeout: () => {},
  setInterval: () => 1,
  openModal: html => { modalHtml = html; },
  closeModal: () => {},
  toast: () => {},
};
globalThis.document = {
  readyState: 'complete',
  visibilityState: 'visible',
  addEventListener: () => {},
  getElementById: () => null,
};
Object.defineProperty(globalThis, 'navigator', {
  value: { onLine: true, standalone: true, clipboard: { writeText: async () => {} } },
  configurable: true,
});
if (!globalThis.crypto) {
  Object.defineProperty(globalThis, 'crypto', {
    value: (await import('node:crypto')).webcrypto,
    configurable: true,
  });
}
globalThis.fetch = async (url, options) => {
  networkCalls += 1;
  assert.match(url, /admission_sync_bootstrap$/);
  const body = JSON.parse(options.body);
  assert.equal(body.p_device_id.startsWith('device-'), true);
  assert.equal(body.p_secret.length >= 40, true);
  assert.equal(body.p_manifest.schemaVersion, 1);
  return { ok: true, json: async () => [{ vault_id: '11111111-1111-1111-1111-111111111111', revision: 1 }] };
};

await import(`./admission-sync.js?test=${Date.now()}`);
await new Promise(resolve => setTimeout(resolve, 0));

assert.equal(networkCalls, 0, 'Sync must never upload a first snapshot automatically.');
assert.equal(await dbGet('appMeta', 'cloudSync'), undefined, 'No local sync identity exists before explicit migration.');

await window.AdmissionCloudSync.beginMigration();
const savedMeta = await dbGet('appMeta', 'cloudSync');

assert.equal(networkCalls, 1, 'Explicit migration creates exactly one remote encrypted snapshot.');
assert.equal(savedMeta.vaultId, '11111111-1111-1111-1111-111111111111');
assert.equal(savedMeta.revision, 1);
assert.match(modalHtml, /AH1\.11111111-1111-1111-1111-111111111111\./);

console.log('admission-sync safety test passed');
