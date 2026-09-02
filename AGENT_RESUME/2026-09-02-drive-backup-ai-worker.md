# Resume — 2026-09-02 · admission-hub-ai Worker: Google Drive ব্যাকআপ (কোড রেডি, push ব্লকড)

## ভাইয়ের নির্দেশ
admission-hub-ai-এর `web-backend/_worker.js`-এ Google Drive ব্যাকআপ। টোকেন KV থেকে
(`cfg:GOOGLE_DRIVE_CLIENT_ID_1`, `cfg:GOOGLE_DRIVE_CLIENT_SECRET_1`, `cfg:GOOGLE_DRIVE_REFRESH_TOKEN_1`) —
`loadKeys()` প্যাটার্নে। `/api/files` আপলোডে Drive ব্যাকআপ + `/api/storage` endpoint। KV-তে টোকেন বসানো আছে।

## যা বানানো হলো (সম্পূর্ণ, টেস্টেড)
সিঙ্কড কপি: **`admission-hub-ai-sync/web-backend/_worker.js`** (এই কন্ট্রোল রিপোতে) — টার্গেট পাথ `admission-hub-ai` রিপোর `web-backend/_worker.js`।

1. **`loadDriveCfg(env)`** — loadKeys() প্যাটার্ন: env binding → না পেলে KV `cfg:GOOGLE_DRIVE_*_1`; isolate-লেভেল ক্যাশ
2. **`driveToken(env)`** — refresh_token → access_token (oauth2.googleapis.com), ৬০সে বাফারসহ ক্যাশ
3. **`driveFolderId`** — Drive-এ `ADMISSION-HUB-AI-Backups` ফোল্ডার খোঁজে/বানায়, id KV `drive:folder_1`-এ ক্যাশ; বাসি হলে auto re-create
4. **POST `/api/files`** — আপলোডে multipart Drive ব্যাকআপ; সফলে meta-তে `drive:{fileId,link,ts}`, ব্যর্থে `driveError` (আপলোড কখনো আটকায় না)
5. **DELETE `/api/files/:id`** — Drive কপিও মুছে (best-effort)
6. **GET `/api/storage`** — `kv:{files,bytes,backedUp}` + `drive:{configured,connected,account,quota{limit,usage,percent},folder,backups}`
7. `/api/config` features-এ `driveBackup:true/false`; `/api/system` services-এ "Drive Backup" লাইন

## টেস্ট — ১৯/১৯ ✅ (`drive-backup.smoke.test.mjs`, KV+Google mock)
upload+drive meta, token cache, folder create+cache, list, storage (quota percent 6.7 সঠিক), system লাইন, delete→Drive DELETE, Drive-down হলেও upload সফল + driveError, cfg-বিহীন: Drive স্কিপ/configured:false — সব পাস। `node --check` ✅

## 🚨 ব্লকার — push হয়নি
`admission-hub-ai` রিপোতে push **403** (arena-ai-coding-agent integration-এর ওই রিপোতে access নেই; git+gh API দুটোই)।
কমিট লোকালি রেডি ছিল (`f2c7550` মেসেজসহ) কিন্তু remote-এ যায়নি — **live deploy হয়নি**।

## পরের ধাপ
1. ভাই Arena-র GitHub App-এ `admission-hub-ai` রিপো access দিলে → sync-কপি থেকে সরাসরি push
2. অথবা ম্যানুয়াল: `admission-hub-ai-sync/web-backend/_worker.js`-এর পুরো কনটেন্ট `admission-hub-ai` রিপোর `web-backend/_worker.js`-এ paste → commit → Pages auto-deploy
3. Deploy-পর live verify: `GET https://admission-hub-ai.pages.dev/api/storage` → `drive.connected:true` + account ইমেইল; একটা টেস্ট ফাইল আপলোড → Drive-এ `ADMISSION-HUB-AI-Backups` ফোল্ডারে কপি

## সতর্কতা
- টোকেন/সিক্রেট কোথাও কোডে নেই — শুধু KV `cfg:*` থেকে পড়ে
- Worker-এর বাকি সব রাউট অপরিবর্তিত
