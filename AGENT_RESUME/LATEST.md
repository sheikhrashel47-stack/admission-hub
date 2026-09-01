# 📍 LATEST — Admission Hub (কন্ট্রোল) · সর্বশেষ অবস্থা

**আপডেট:** 2026-09-01 (Worker sync + icons) · **এজেন্ট:** জুজু
> নতুন এজেন্ট: প্রথমে এটা পড়ো, তারপর `AGENT_RESUME/`-এর সবচেয়ে নতুন ডেটেড resume।

---

## 🎯 প্রজেক্ট

**Admission Hub** — বাংলাদেশের ভর্তি পরীক্ষার প্রস্তুতির বাংলা PWA (static HTML+JS+IndexedDB, GitHub Pages)।

| | কন্ট্রোল (এটা) | পাবলিক |
|---|---|---|
| Repo | `admission-hub` | `admission-hub-demo` |
| Live | https://sheikhrashel47-stack.github.io/admission-hub/ | https://sheikhrashel47-stack.github.io/admission-hub-demo/ |
| ভূমিকা | মালিকের ফুল অ্যাপ + cloud backend source | Public auth + onboarding product |

---

## 📌 বর্তমান অবস্থা

- **public-worker.js এখন GitHub-এ committed** (আগে শুধু working tree-তে ছিল) — deployed worker state-এর সাথে মিলেছে ✅
- **নতুন ব্র্যান্ড আইকন committed** (icon-192/512 আপডেট, icon-1024, apple-touch-icon) ✅
- Phase 1 Exact Clone frozen · Phase 2 live · Phase 3 workers deployed · **🛑 STOP: Phase 4 `PHASE 3 APPROVED` ছাড়া না**
- SW build: `v137-android-p3-20260831`

## ⚠️ পেন্ডিং / জানা ঝুলন্ত কাজ (এই repo)

1. **manifest.json/index.html-এ icon-1024 + apple-touch-icon বসানো বাকি** (ফাইল আছে, রেফারেন্স করা হয়নি)
2. Gmail "Send-as" নাম `mahmudrashel1034`-এ সেট (user-এর কাজ)

## ☁️ Cloudflare (কন্ট্রোলের ব্যাকএন্ড)

- Account: `abb783e456e51a5d338419de93d5e576`
- **`admission-gk`** (main, Version `679b071b`): modules `gk-agent-worker.js` + `public-worker.js`, KV GK_KV + PUB_KV, ১৩ সিক্রেট
- Workers: `ah-public`, `admission-hub-ai-proxy`, `admission-notify`, `admission-voice`
- KV: `admission-gk-kv`, `admihub-public`, `admission-voice-cache`, `admission-hub-ai-analysis`, `admission-notify-kv`
- অ্যাপ endpoints: `admission-gk.rashelzayan213.workers.dev`, `admission-hub-ai-proxy.../analyze`, `admission-notify...`, `admission-voice...`
- **⚠️ Worker redeploy:** CF API PUT-এ সিক্রেট ভ্যালু লাগে (জানা নেই) — **wrangler দিয়ে deploy করো** (সিক্রেট অটো থাকে)
- **R2 ব্যবহার হয় না** — content KV-তে (`pubContent`)

## 🔗 গুরুত্বপূর্ণ লিংক

- Worker: https://admission-gk.rashelzayan213.workers.dev (`/pub/health`, `/pub/auth/config` live)
- AI proxy: https://admission-hub-ai-proxy.rashelzayan213.workers.dev/analyze
- Supabase private sync: `mqgfxpuiclizbuesklva.supabase.co`

## 🧠 ডেটা/আর্কিটেকচার (দ্রুত রিকল)

- Hash routes: `#dashboard #bank #courses #mock #quick #progress #mistakes #vocabulary #study-ai #gk #notes ...`
- IndexedDB stores: `appMeta subjects topics questions deletedQuestions exams examResults mistakes vocabulary vocabularyMaster dailyStats activityLogs settings notes ADMISSION_PLANS PLAN_DAYS`
- `mcq_final.json`: ১,০৪৬ MCQ (৫ বিষয়, প্রতিটা ≥২০০)
- SW: `sw.js` — APP_SHELL versioned list, network-first documents
- Content pipeline: control → `POST /api/cloud/publish` → KV → public

## ⏭️ পরবর্তী কাজ (প্রস্তাবিত)

1. Manifest/index.html icon-1024 + apple-touch-icon বসানো
2. Live QA: same-browser verify (ডেমো)
3. `PHASE 3 APPROVED` পেলে **Phase 4** (Connected Lexicon + Smart Memorizing Center — `phase345.patch.js` blueprint)
