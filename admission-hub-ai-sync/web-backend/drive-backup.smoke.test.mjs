// Drive backup smoke test — KV + Google API mock দিয়ে _worker.js এর নতুন রাউটগুলো যাচাই
import worker from './_worker.js';

const store = new Map();
store.set('cfg:GOOGLE_DRIVE_CLIENT_ID_1', 'cid-1');
store.set('cfg:GOOGLE_DRIVE_CLIENT_SECRET_1', 'sec-1');
store.set('cfg:GOOGLE_DRIVE_REFRESH_TOKEN_1', 'rt-1');

const AH_KV = {
  async get(k, type) { const v = store.get(k); if (v == null) return null; return type === 'json' ? JSON.parse(v) : v; },
  async put(k, v) { store.set(k, v); },
  async delete(k) { store.delete(k); },
};
const env = { AH_KV };

const calls = [];
let tokenCalls = 0;
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, opts = {}) => {
  const u = String(url);
  calls.push((opts.method || 'GET') + ' ' + u.split('?')[0]);
  if (u.startsWith('https://oauth2.googleapis.com/token')) {
    tokenCalls++;
    const p = new URLSearchParams(String(opts.body));
    if (p.get('client_id') !== 'cid-1' || p.get('client_secret') !== 'sec-1' || p.get('refresh_token') !== 'rt-1' || p.get('grant_type') !== 'refresh_token') {
      return new Response(JSON.stringify({ error: 'bad_request' }), { status: 400 });
    }
    return new Response(JSON.stringify({ access_token: 'AT-1', expires_in: 3600 }), { status: 200 });
  }
  if (u.startsWith('https://www.googleapis.com/upload/drive/v3/files')) {
    if ((opts.headers || {}).Authorization !== 'Bearer AT-1') return new Response('{}', { status: 401 });
    if (!/multipart\/related; boundary=/.test((opts.headers || {})['Content-Type'])) return new Response('{}', { status: 400 });
    if (!String(opts.body).includes('"parents":["FOLDER-1"]')) return new Response('{}', { status: 400 });
    return new Response(JSON.stringify({ id: 'DRIVE-FILE-1', name: 'notes.md', webViewLink: 'https://drive.google.com/file/d/DRIVE-FILE-1/view' }), { status: 200 });
  }
  if (u.startsWith('https://www.googleapis.com/drive/v3/files/')) { // DELETE
    return new Response('', { status: 204 });
  }
  if (u.startsWith('https://www.googleapis.com/drive/v3/files')) {
    if ((opts.method || 'GET') === 'POST') return new Response(JSON.stringify({ id: 'FOLDER-1' }), { status: 200 });
    const q = decodeURIComponent(new URL(u).searchParams.get('q') || '');
    if (q.includes("mimeType='application/vnd.google-apps.folder'")) return new Response(JSON.stringify({ files: [] }), { status: 200 }); // প্রথমবার folder নেই → create
    if (q.includes("'FOLDER-1' in parents")) return new Response(JSON.stringify({ files: [{ id: 'DRIVE-FILE-1' }] }), { status: 200 });
    return new Response(JSON.stringify({ files: [] }), { status: 200 });
  }
  if (u.startsWith('https://www.googleapis.com/drive/v3/about')) {
    return new Response(JSON.stringify({ user: { emailAddress: 'backup@example.com' }, storageQuota: { limit: '16106127360', usage: '1073741824', usageInDrive: '536870912' } }), { status: 200 });
  }
  return new Response(JSON.stringify({ error: 'unexpected fetch: ' + u }), { status: 500 });
};

const req = (path, method = 'GET', body) => worker.fetch(new Request('https://x.pages.dev' + path, { method, body: body ? JSON.stringify(body) : undefined, headers: { 'Content-Type': 'application/json' } }), env);

let pass = 0, fail = 0;
const ok = (name, cond, extra) => { if (cond) { pass++; console.log('✅', name); } else { fail++; console.log('❌', name, extra ?? ''); } };

// 1) /api/config — driveBackup feature flag
let r = await req('/api/config'); let j = await r.json();
ok('config: driveBackup=true', j.features?.driveBackup === true, JSON.stringify(j.features));

// 2) POST /api/files — Drive ব্যাকআপসহ আপলোড
r = await req('/api/files', 'POST', { name: 'notes.md', content: '# হ্যালো ব্যাকআপ' });
j = await r.json();
ok('upload: 200 + meta', r.status === 200 && j.id && j.name === 'notes.md', JSON.stringify(j));
ok('upload: drive.fileId রেকর্ড হয়েছে', j.drive?.fileId === 'DRIVE-FILE-1' && !!j.drive?.link, JSON.stringify(j.drive));
ok('upload: token একবারই নেওয়া (cache)', tokenCalls === 1, 'tokenCalls=' + tokenCalls);
const fileId = j.id;

// KV-তে meta + content দুটোই আছে
const filesMeta = JSON.parse(store.get('files'));
ok('KV: files meta-তে drive info', filesMeta[fileId]?.drive?.fileId === 'DRIVE-FILE-1');
ok('KV: file content সংরক্ষিত', store.get('file:' + fileId) === '# হ্যালো ব্যাকআপ');
ok('KV: folder id cache', store.get('drive:folder_1') === 'FOLDER-1');

// 3) GET /api/files — তালিকায় drive info
r = await req('/api/files'); j = await r.json();
ok('list: drive info দৃশ্যমান', Array.isArray(j) && j[0]?.drive?.fileId === 'DRIVE-FILE-1');

// 4) GET /api/storage
r = await req('/api/storage'); j = await r.json();
ok('storage: kv স্ট্যাটস', j.kv?.files === 1 && j.kv?.backedUp === 1 && j.kv?.bytes > 0, JSON.stringify(j.kv));
ok('storage: drive connected + account', j.drive?.connected === true && j.drive?.account === 'backup@example.com', JSON.stringify(j.drive));
ok('storage: quota + percent', j.drive?.quota?.limit === 16106127360 && j.drive?.quota?.percent === 6.7, JSON.stringify(j.drive?.quota));
ok('storage: folder + backups গোনা', j.drive?.folder?.id === 'FOLDER-1' && j.drive?.backups === 1, JSON.stringify(j.drive));

// 5) /api/system — Drive Backup সার্ভিস লাইন
r = await req('/api/system'); j = await r.json();
const drvLine = (j.services || []).find((s) => s.name === 'Drive Backup');
ok('system: Drive Backup=Operational', drvLine?.dot === 'ok', JSON.stringify(drvLine));

// 6) DELETE — Drive কপিও মুছে
r = await req('/api/files/' + fileId, 'DELETE'); j = await r.json();
ok('delete: ok', j.ok === true);
ok('delete: Drive DELETE কল হয়েছে', calls.some((c) => c === 'DELETE https://www.googleapis.com/drive/v3/files/DRIVE-FILE-1'), calls.join(' | '));

// 7) Drive cfg ছাড়া (নতুন isolate সিমুলেট করা যায় না — তাই আলাদা প্রসেসে চেক হবে) — এখানে ব্যর্থ-নিরাপত্তা: upload API ভাঙে যখন Drive 500 দেয়?
globalThis.fetch = async (u, o = {}) => {
  const s = String(u);
  if (s.startsWith('https://oauth2.googleapis.com/token')) return new Response('{}', { status: 500 });
  return new Response('{}', { status: 500 });
};
r = await req('/api/files', 'POST', { name: 'x.txt', content: 'abc' });
j = await r.json();
ok('drive down: আপলোড তবুও সফল + driveError', r.status === 200 && j.id && typeof j.driveError === 'string', JSON.stringify(j));

globalThis.fetch = realFetch;
console.log(`\n${pass} pass, ${fail} fail`);
process.exit(fail ? 1 : 0);
