# 📍 LATEST — Admission Hub (কন্ট্রোল) · সর্বশেষ অবস্থা

**আপডেট:** 2026-09-01 · **এজেন্ট:** জুজু
> নতুন এজেন্ট: প্রথমে এটা পড়ো, তারপর `AGENT_RESUME/`-এর সবচেয়ে নতুন ডেটেড resume।

---

## 🎯 প্রজেক্ট

**Admission Hub** — বাংলাদেশের ভর্তি পরীক্ষার প্রস্তুতির বাংলা PWA (static HTML+JS+IndexedDB, GitHub Pages)।

| | কন্ট্রোল (এটা) | পাবলিক (আলাদা repo) |
|---|---|---|
| Repo | `admission-hub` | `admission-hub-demo` |
| Live | https://sheikhrashel47-stack.github.io/admission-hub/ | https://sheikhrashel47-stack.github.io/admission-hub-demo/ |
| ভূমিকা | মালিকের ফুল অ্যাপ + cloud backend source | Public auth + onboarding product |

---

## 📌 বর্তমান অবস্থা

- **HEAD:** `d353285` (Signup: register-email and profile fields) — main, pushed
- **Phase 1** Exact Clone — frozen
- **Phase 2** Central cloud content pipeline — **live**
- **Phase 3** auth — workers deployed (passkey + register-email + onboarding routes), UI ডেমো repo-তে
- **Phase 6** onboarding — ডেমো repo-তে live
- **🛑 STOP:** `PHASE 3 APPROVED` না বলা পর্যন্ত **Phase 4 শুরু করবে না**
- SW build: `v137-android-p3-20260831`

## ⚠️ পেন্ডিং / জানা ঝুলন্ত কাজ (এই repo)

1. **`public-worker.js` working tree-তে আপডেট ছিল কিন্তু commit হয়নি** (auth/wait, auth/confirm, onboarding routes, officialLetter, rateLimit fix) — ডেমো repo-তে commit হয়েছে, এখানে এখনো HEAD-এ নেই। GitHub থেকে deploy করলে regression হবে; **worker-এ কিন্তু latest code deployed** (`admission-gk`).
2. **নতুন ব্র্যান্ড আইকন** (icon-192/512 আপডেট, icon-1024, apple-touch-icon) commit হয়নি — manifest/index.html-এও ঠিকমতো বসানো হয়নি।
3. Gmail "Send-as" নাম এখনো `mahmudrashel1034`-এ সেট করতে হবে (user-এর কাজ)।

## ☁️ Cloudflare (কন্ট্রোলের ব্যাকএন্ড)

- Account: `abb783e456e51a5d338419de93d5e576` (Rashelzayan213@icloud.com's Account)
- Workers: `admission-gk` (main, `gk-agent-worker.js` + `public-worker.js`), `ah-public`, `admission-hub-ai-proxy`, `admission-notify`, `admission-voice`
- KV: `admission-gk-kv`, `admihub-public`, `admission-voice-cache`, `admission-hub-ai-analysis`, `admission-notify-kv`
- অ্যাপ endpoints: `admission-gk.rashelzayan213.workers.dev` (cloud sync/study-ai/GK), `admission-hub-ai-proxy.../analyze`, `admission-notify...`, `admission-voice...`
- Secrets worker-এ (repo-তে নয়): RESEND_KEY/_2, GOOGLE_CLIENT_ID, MAIL_FROM, MAIL_HOOK, MAIL_HOOK_SECRET, ADMIN_TOKEN, GEMINI_KEYS, BROWSER_USE_API_KEYS, TG_BOT_TOKEN, TG_CHAT_ID, BULKSMS_API_KEY (live নয়), BREVO_KEY (live নয়)

## 🔗 গুরুত্বপূর্ণ লিংক

- Worker: https://admission-gk.rashelzayan213.workers.dev (`/pub/health`, `/pub/auth/config` live)
- AI proxy: https://admission-hub-ai-proxy.rashelzayan213.workers.dev/analyze
- Supabase private sync: `mqgfxpuiclizbuesklva.supabase.co` (admission-sync.js-এ anon key)

## 🧠 ডেটা/আর্কিটেকচার (দ্রুত রিকল)

- Hash routes: `#dashboard #bank #courses #mock #quick #progress #mistakes #vocabulary #study-ai #gk #notes ...`
- IndexedDB stores: `appMeta subjects topics questions deletedQuestions exams examResults mistakes vocabulary vocabularyMaster dailyStats activityLogs settings notes ADMISSION_PLANS PLAN_DAYS`
- `mcq_final.json`: ১,০৪৬ MCQ (৫ বিষয়, প্রতিটা ≥২০০)
- SW: `sw.js` — APP_SHELL versioned list, network-first documents
- Content pipeline: control → `POST /api/cloud/publish` → KV → public

## ⏭️ পরবর্তী কাজ (প্রস্তাবিত)

1. এই repo-র pending পরিবর্তনগুলো commit+push (public-worker.js, icons, AGENT_RESUME) — GitHub-কে deployed state-এর সাথে মেলানো
2. Manifest/index.html-এ নতুন আইকন বসানো
3. User `PHASE 3 APPROVED` বললে **Phase 4** (Connected Lexicon + Smart Memorizing Center — `phase345.patch.js` blueprint)
