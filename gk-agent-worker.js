/**
 * 🤖 ADMISSION HUB — Daily GK Agent Worker
 * v111 · Browser Use cloud (৩ key failover) → দিনে মাত্র ১ রান → GK MCQ + verified admission news
 *
 * Secrets:
 *   BROWSER_USE_API_KEYS — কমা-দিয়ে আলাদা করা ৩টা Browser Use cloud key (একাউন্ট ১,২,৩)
 *   TG_BOT_TOKEN, TG_CHAT_ID — রান শেষে Telegram খবর
 * KV: GK_KV (namespace admission-gk-kv)
 * Cron: 30 18 * * * (UTC) = রাত ০০:৩০ ঢাকা — অ্যাপ না খুললেও দিনে ১ বার
 *
 * নীতি: প্রতিদিন ঠিক ১টা run (KV date-guard)। key শেষ/না-চলা (401/402/429) হলে
 * স্বয়ংক্রিয়ভাবে পরের key — সেদিনের জন্য ও key আর চেষ্টা হয় না।
 */

const APP_HEADER = 'admission-hub';
const BU_BASE = 'https://api.browser-use.com/api/v2';
const POLL_EVERY_MS = 20000;
const POLL_MAX_MS = 8 * 60000;

const GK_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    questions: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          q: { type: 'string' },
          options: { type: 'array', items: { type: 'string' } },
          answer: { type: 'string' },
          explain: { type: 'string' },
          source: { type: 'string' }
        },
        required: ['q', 'options', 'answer']
      }
    }
  },
  required: ['questions']
});
const NEWS_SCHEMA = JSON.stringify({
  type: 'object',
  properties: {
    news: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          title: { type: 'string' },
          date: { type: 'string' },
          summary: { type: 'string' },
          source: { type: 'string' },
          url: { type: 'string' }
        },
        required: ['title', 'summary']
      }
    }
  },
  required: ['news']
});

const cors = request => {
  const origin = request.headers.get('Origin') || '';
  const ok = /^https:\/\/([a-z0-9-]+\.)?github\.io$/.test(origin) || /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
  const headers = { 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, X-AH-App', 'Access-Control-Max-Age': '86400' };
  if (ok) headers['Access-Control-Allow-Origin'] = origin;
  return headers;
};
const json = (request, obj, status = 200) => new Response(JSON.stringify(obj), { status, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...cors(request) } });
const dhakaToday = () => new Date(Date.now() + 6 * 3600000).toISOString().slice(0, 10);
const sleep = ms => new Promise(r => setTimeout(r, ms));

const keys = env => String(env.BROWSER_USE_API_KEYS || '').split(',').map(k => k.trim()).filter(Boolean);

const badKeysToday = async (env, date) => {
  try { return JSON.parse(await env.GK_KV.get('badKeys:' + date) || '[]'); } catch (_) { return []; }
};
const markBad = async (env, date, index) => {
  try {
    const bad = await badKeysToday(env, date);
    if (!bad.includes(index)) { bad.push(index); await env.GK_KV.put('badKeys:' + date, JSON.stringify(bad)); }
  } catch (_) {}
};

// একটা key দিয়ে task তৈরি; 401/402/429 হলে {exhausted:true}
const tryCreate = async (key, body) => {
  try {
    const resp = await fetch(`${BU_BASE}/tasks`, {
      method: 'POST',
      headers: { 'X-Browser-Use-API-Key': key, 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (resp.status === 401 || resp.status === 402 || resp.status === 429) return { exhausted: true };
    if (!resp.ok) return { error: 'http-' + resp.status };
    const data = await resp.json();
    return data?.id ? { id: data.id } : { error: 'no-id' };
  } catch (_) { return { error: 'network' }; }
};

const createWithFailover = async (env, date, body) => {
  const all = keys(env);
  const bad = await badKeysToday(env, date);
  for (let i = 0; i < all.length; i++) {
    if (bad.includes(i)) continue;
    const result = await tryCreate(all[i], body);
    if (result.exhausted) { await markBad(env, date, i); continue; }
    if (result.id) return { id: result.id, keyIndex: i };
    await markBad(env, date, i); // নেটওয়ার্ক/অদ্ভুত ত্রুটি — পরের key দিয়ে চেষ্টা
  }
  return null;
};

const GK_PROMPT = date => `Today's date is ${date} (Bangladesh, Asia/Dhaka). You are preparing daily current-affairs GK practice for Bangladeshi university admission candidates.
Browse credible Bangladeshi and international sources today — e.g. prothomalo.com, bangla.bdnews24.com, jagonews24.com, kalerkantho.com, ittefaq.com.bd, bbc.com/bengali, samakal.com, and any reliable reference pages needed for verification.
Collect 20-30 multiple-choice current-affairs/GK questions useful for university admission tests. Rules:
- Only facts you verified during this session from at least one credible source; skip anything uncertain.
- Prefer the last ~30 days: national BD news, international, sports, science-tech, awards, economy, and important anniversaries.
- Write the question in Bangla (short), options in Bangla (exactly 4, one clearly correct), "answer" must exactly match one option, "explain" is one short Bangla line, "source" is the site name or URL you verified from.
- No duplicates, no opinion-based questions, no placeholder text.`;

const NEWS_PROMPT = date => `Today's date is ${date} (Bangladesh, Asia/Dhaka). Search for TODAY's verified news about university admission in Bangladesh: application openings, deadlines, exam dates, seat-plan/result announcements, requirements for DU, BUET, CU, JU, RU, GST, GUST, agricultural and private universities.
Check official/portals and credible national dailies (e.g. admission websites linked from prothomalo.com, bangla.bdnews24.com, jagonews24.com, university.ac.bd domains).
Return ONLY genuinely verified, current items with their real source name, URL and date. If there are no relevant verified items today, return an empty news array — do NOT invent anything.`;

const parseOutput = task => {
  if (!task) return null;
  if (task.status !== 'finished') return null;
  const raw = task.output ?? task.result ?? task.data ?? task.finalResult;
  if (raw == null) return null;
  try {
    const parsed = typeof raw === 'string' ? JSON.parse(raw.replace(/^```json\s*|```$/g, '').trim()) : raw;
    return parsed;
  } catch (_) { return null; }
};

const getTask = async (key, id) => {
  try {
    const resp = await fetch(`${BU_BASE}/tasks/${id}`, { headers: { 'X-Browser-Use-API-Key': key } });
    if (!resp.ok) return null;
    return await resp.json();
  } catch (_) { return null; }
};

// সব টাস্ক শেষ হলে ডেটা KV-তে + Telegram খবর
const runBackground = async (env, date, jobs) => {
  const all = keys(env);
  const deadline = Date.now() + POLL_MAX_MS;
  const results = { gk: null, news: null };
  while (Date.now() < deadline) {
    await sleep(POLL_EVERY_MS);
    for (const job of jobs) {
      if (results[job.kind]) continue;
      const task = await getTask(all[job.keyIndex] || all[0], job.id);
      if (!task) continue;
      if (task.status === 'failed') results[job.kind] = { error: 'agent-failed' };
      else results[job.kind] = parseOutput(task);
    }
    if (results.gk && results.news) break;
  }
  const questions = Array.isArray(results.gk?.questions) ? results.gk.questions.filter(q => q?.q && Array.isArray(q.options) && q.options.length >= 2).slice(0, 40) : [];
  const news = Array.isArray(results.news?.news) ? results.news.news.filter(n => n?.title && n?.summary).slice(0, 8) : [];
  const payload = { date, count: questions.length, newsCount: news.length, questions, news, finishedAt: Date.now(), partial: !results.gk || !results.news };
  try { await env.GK_KV.put(`gkData:${date}`, JSON.stringify(payload)); await env.GK_KV.put('latest', JSON.stringify(payload)); } catch (_) {}
  try {
    if (env.TG_BOT_TOKEN && env.TG_CHAT_ID) {
      const msg = questions.length
        ? `🤖 আজকের GK এসেছে!\n\n📚 ${questions.length}টি নতুন MCQ${news.length ? `\n📰 ${news.length}টি verified admission news` : '\n📰 আজ কোনো verified news নেই'}\n\nঅ্যাপে Dashboard → 🤖 ডেইলি GK এজেন্ট খোলো!`
        : '🤖 আজ GK এজেন্ট যথেষ্ট verified প্রশ্ন জোগাড় করতে পারেনি — কাল আবার চেষ্টা হবে।';
      await fetch(`https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text: msg }) }).catch(() => {});
    }
  } catch (_) {}
};

const maybeStart = async (request, env, ctx) => {
  const date = dhakaToday();
  try {
    const lastDay = await env.GK_KV.get('gkDay');
    if (lastDay === date) {
      const stored = await env.GK_KV.get(`gkData:${date}`);
      return json(request, stored ? { already: true, ready: true } : { already: true, ready: false });
    }
    if (!keys(env).length) return json(request, { error: 'keys-not-configured' }, 503);
    await env.GK_KV.put('gkDay', date); // দিনে ১ run — এখনই গার্ড বসে
    const gkJob = await createWithFailover(env, date, { task: GK_PROMPT(date), llm: env.BU_LLM || 'browser-use-llm', maxSteps: 45, structuredOutput: GK_SCHEMA, flashMode: false });
    const newsJob = await createWithFailover(env, date, { task: NEWS_PROMPT(date), llm: env.BU_LLM || 'browser-use-llm', maxSteps: 25, structuredOutput: NEWS_SCHEMA, flashMode: true });
    const jobs = [
      gkJob ? { kind: 'gk', id: gkJob.id, keyIndex: gkJob.keyIndex } : null,
      newsJob ? { kind: 'news', id: newsJob.id, keyIndex: newsJob.keyIndex } : null
    ].filter(Boolean);
    await env.GK_KV.put(`gkTasks:${date}`, JSON.stringify({ jobs, startedAt: Date.now() }));
    if (!jobs.length) return json(request, { error: 'all-keys-exhausted' }, 429);
    if (ctx && ctx.waitUntil) ctx.waitUntil(runBackground(env, date, jobs));
    else runBackground(env, date, jobs);
    return json(request, { started: true, tasks: jobs.length });
  } catch (error) {
    return json(request, { error: 'run-failed' }, 500);
  }
};

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(request) });

    if (url.pathname === '/health') {
      return json(request, { ok: true, keys: keys(env).length, kv: !!env.GK_KV, tg: !!env.TG_BOT_TOKEN, lastDay: env.GK_KV ? await env.GK_KV.get('gkDay') : null });
    }

    if (request.headers.get('X-AH-App') !== APP_HEADER) return json(request, { error: 'forbidden' }, 403);

    if (request.method === 'POST' && url.pathname === '/api/gk/run') return maybeStart(request, env, ctx);

    if (request.method === 'GET' && url.pathname === '/api/gk/today') {
      const date = dhakaToday();
      try {
        const stored = await env.GK_KV.get(`gkData:${date}`);
        if (stored) return json(request, { ready: true, date, payload: JSON.parse(stored) });
        const tasks = await env.GK_KV.get(`gkTasks:${date}`);
        return json(request, { ready: false, date, running: !!tasks });
      } catch (_) { return json(request, { ready: false, date, running: false }); }
    }

    return json(request, { error: 'not_found' }, 404);
  },

  async scheduled(event, env, ctx) {
    if (!env.GK_KV || !keys(env).length) return;
    const date = dhakaToday();
    try { if ((await env.GK_KV.get('gkDay')) === date) return; } catch (_) {}
    const fakeRequest = new Request('https://cron/api/gk/run', { method: 'POST', headers: { 'X-AH-App': APP_HEADER } });
    await maybeStart(fakeRequest, env, ctx);
  }
};

export const __test = { tryCreate, createWithFailover, parseOutput, dhakaToday, keys, GK_PROMPT };
