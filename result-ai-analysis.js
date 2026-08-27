/*
 * Result AI Analysis foundation — Admission Hub
 *
 * This layer never stores or exposes an API key. The frontend builds a small,
 * verified result summary. A future secure backend may be configured through
 * window.ADMISSION_HUB_AI_ENDPOINT and will receive only that summary.
 */
(() => {
  'use strict';

  const safe = (value) => String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[c]);
  const number = (value, fallback = 0) => Number.isFinite(Number(value)) ? Number(value) : fallback;
  const round = (value, digits = 2) => Number(number(value).toFixed(digits));
  const cache = () => typeof CACHE !== 'undefined' ? CACHE : { examResults: [], questions: [], subjects: [], topics: [] };
  const resultId = (result) => String(result?.id || result?.resultId || '');
  const snapshot = (result) => Array.isArray(result?.snapshot) ? result.snapshot : [];
  const totalOf = (result) => Math.max(0, number(result?.questionCount || result?.totalQuestions || snapshot(result).length));
  const countsOf = (result) => {
    const rows = snapshot(result);
    if (rows.length) return rows.reduce((out, row) => {
      if (row?.status === 'correct') out.correct += 1;
      else if (row?.status === 'wrong') out.wrong += 1;
      else out.skipped += 1;
      return out;
    }, { correct: 0, wrong: 0, skipped: 0 });
    const correct = Math.max(0, number(result?.correct));
    const wrong = Math.max(0, number(result?.wrong));
    const total = totalOf(result);
    return { correct, wrong, skipped: Math.max(0, number(result?.skipped, total - correct - wrong)) };
  };
  const dateOf = (result) => number(result?.completedAt || result?.date || result?.createdAt, Date.now());
  const accuracyOf = (result, counts = countsOf(result)) => {
    const attempted = counts.correct + counts.wrong;
    return attempted ? round(counts.correct / attempted * 100, 1) : 0;
  };
  const metricsOf = (result) => {
    const total = totalOf(result);
    const counts = countsOf(result);
    const attempted = counts.correct + counts.wrong;
    const marks = Math.max(0.01, number(result?.configuration?.marksPerQ || result?.marksPerQ, 1));
    const positive = number(result?.positive, counts.correct * marks);
    const negative = Math.max(0, number(result?.negativeMarks ?? result?.negative));
    const score = number(result?.score, positive - negative);
    const maxScore = total * marks;
    return {
      total,
      correct: counts.correct,
      wrong: counts.wrong,
      skipped: counts.skipped,
      attempted,
      accuracy: accuracyOf(result, counts),
      attemptRate: total ? round(attempted / total * 100, 1) : 0,
      marks,
      positive: round(positive),
      negative: round(negative),
      score: round(score),
      maxScore: round(maxScore),
      scorePercent: maxScore ? round(score / maxScore * 100, 1) : 0,
      timeUsed: number(result?.timeUsed),
      averageTimePerQuestion: total ? round(number(result?.timeUsed) / total, 1) : 0
    };
  };
  const questionById = (id) => (cache().questions || []).find((item) => String(item?.id) === String(id));
  const labelFor = (kind, id, row) => {
    const list = kind === 'subject' ? (cache().subjects || []) : (cache().topics || []);
    const found = list.find((item) => String(item?.id) === String(id));
    return found?.name || row?.[kind === 'subject' ? 'subjectName' : 'topicName'] || id || 'অজানা';
  };
  const breakdown = (result, kind) => {
    const groups = new Map();
    snapshot(result).forEach((row) => {
      const live = questionById(row?.questionId);
      const id = kind === 'subject' ? (live?.subjectId || row?.subjectId || '') : (live?.topicId || row?.topicId || '');
      const key = String(id || `${kind}-unknown`);
      const group = groups.get(key) || { id: id || key, name: labelFor(kind, id, row), total: 0, correct: 0, wrong: 0, skipped: 0 };
      group.total += 1;
      if (row?.status === 'correct') group.correct += 1;
      else if (row?.status === 'wrong') group.wrong += 1;
      else group.skipped += 1;
      groups.set(key, group);
    });
    return [...groups.values()].map((row) => ({
      ...row,
      attempted: row.correct + row.wrong,
      accuracy: row.correct + row.wrong ? round(row.correct / (row.correct + row.wrong) * 100, 1) : 0
    }));
  };
  const historyOf = (result) => (cache().examResults || [])
    .filter((item) => String(item?.id || '') !== resultId(result) && item?.status !== 'running' && item?.status !== 'incomplete' && item?.status !== 'abandoned')
    .sort((a, b) => dateOf(b) - dateOf(a))
    .slice(0, 8)
    .reverse()
    .map((item) => ({
      id: resultId(item),
      date: new Date(dateOf(item)).toISOString(),
      score: metricsOf(item).score,
      accuracy: metricsOf(item).accuracy,
      total: metricsOf(item).total
    }));
  function buildPayload(result) {
    const metrics = metricsOf(result);
    return {
      schemaVersion: 'admission-hub-result-analysis-v1',
      result: {
        id: resultId(result),
        title: result?.title || result?.name || 'Admission Hub পরীক্ষা',
        examType: result?.testType || result?.examType || 'প্র্যাকটিস পরীক্ষা',
        completedAt: new Date(dateOf(result)).toISOString(),
        ...metrics
      },
      previousResults: historyOf(result),
      subjectPerformance: breakdown(result, 'subject').sort((a, b) => b.total - a.total).slice(0, 12),
      topicPerformance: breakdown(result, 'topic').sort((a, b) => (b.wrong + b.skipped) - (a.wrong + a.skipped)).slice(0, 20),
      constraints: {
        dailyAiAnalysisLimit: 3,
        explanationStyle: 'সহজ, সরাসরি, স্বাভাবিক, শিক্ষকের মতো বাংলা; কোনো guarantee নয়',
        doNotInventNumbers: true,
        apiKeyInFrontend: false
      }
    };
  }
  window.AdmissionHubResultAI = { buildPayload };

  const style = document.createElement('style');
  style.id = 'result-ai-foundation-style';
  style.textContent = `
    .result-ai-entry{position:relative;display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;padding:12px 13px;border:1px solid #b9dfd0;border-radius:16px;background:linear-gradient(135deg,#effbf5,#f8fffc);box-shadow:0 6px 18px rgba(15,107,79,.06)}
    .result-ai-entry-copy{min-width:0}.result-ai-entry-copy strong{display:block;color:#145b47;font-size:13px;line-height:1.3}.result-ai-entry-copy span{display:block;margin-top:3px;color:#64867b;font-size:10px;line-height:1.45}
    .result-ai-button{flex:0 0 auto;border:0;border-radius:11px;padding:10px 12px;background:#0b765a;color:#fff;font:800 11px inherit;box-shadow:0 5px 12px rgba(11,118,90,.18);cursor:pointer;transition:transform .16s ease,filter .16s ease}.result-ai-button:active{transform:scale(.97)}.result-ai-button:hover{filter:brightness(1.05)}
    .result-ai-overlay{position:fixed;inset:0;z-index:9999;display:grid;place-items:center;padding:16px;background:rgba(11,33,27,.42);backdrop-filter:blur(5px)}.result-ai-modal{width:min(680px,100%);max-height:min(760px,92vh);overflow:auto;border:1px solid #b9dfd0;border-radius:22px;background:#f7fcf9;box-shadow:0 24px 80px rgba(0,0,0,.25);padding:18px;color:#173d31}.result-ai-modal-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px}.result-ai-modal-head span{display:block;color:#157457;font-size:10px;font-weight:900;letter-spacing:.11em}.result-ai-modal h2{margin:5px 0 0;color:#153e34;font-size:22px;line-height:1.25}.result-ai-close{width:34px;height:34px;border:1px solid #c9e2d8;border-radius:10px;background:#fff;color:#426b5d;font-size:20px;cursor:pointer}.result-ai-status{margin-top:14px;padding:12px;border-radius:14px;background:#eaf8f0;border:1px solid #c5e4d5;color:#3d6d5e;font-size:12px;line-height:1.6}.result-ai-status b{color:#126b51}.result-ai-metric-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:7px;margin-top:12px}.result-ai-metric{padding:10px 7px;border-radius:12px;background:#fff;border:1px solid #d9ebe2;text-align:center}.result-ai-metric b{display:block;color:#155740;font-size:17px;line-height:1.2}.result-ai-metric span{display:block;margin-top:3px;color:#779389;font-size:9px}.result-ai-actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:14px}.result-ai-actions button{border:1px solid #badbcc;border-radius:11px;padding:10px 12px;background:#0b765a;color:#fff;font:800 11px inherit;cursor:pointer}.result-ai-actions button.secondary{background:#fff;color:#176b54}.result-ai-payload{display:none;margin-top:12px;padding:10px;border-radius:12px;background:#13231e;color:#d8f3e7;font:11px/1.55 ui-monospace,SFMono-Regular,Menlo,monospace;white-space:pre-wrap;overflow:auto;max-height:250px}.result-ai-payload.open{display:block}.result-ai-note{margin-top:13px;color:#78948a;font-size:10px;line-height:1.55}.result-ai-live-result{display:none;margin-top:14px;padding:13px;border-radius:14px;background:#fff;border:1px solid #cde5d9;color:#2f5c4e;font-size:13px;line-height:1.7;white-space:pre-wrap}.result-ai-live-result.open{display:block}.result-ai-turnstile{margin-top:14px;min-height:65px;color:#6c8c80;font-size:11px;line-height:1.5}
    @media(max-width:460px){.result-ai-entry{align-items:stretch;flex-direction:column}.result-ai-button{width:100%}.result-ai-metric-grid{grid-template-columns:repeat(2,1fr)}.result-ai-modal{padding:15px;border-radius:18px}.result-ai-modal h2{font-size:20px}}
    @media(prefers-reduced-motion:reduce){.result-ai-button{transition:none}}
  `;
  document.head.appendChild(style);

  function closeModal(node) { node?.remove(); }
  const analysisCacheKey = (payload) => `admission-hub-ai-analysis:${payload?.result?.id || 'unknown'}:${payload?.result?.score}:${payload?.result?.accuracy}:${payload?.previousResults?.length || 0}`;
  const readCachedAnalysis = (key) => { try { return localStorage.getItem(key) || ''; } catch (_) { return ''; } };
  const writeCachedAnalysis = (key, text) => { try { localStorage.setItem(key, text); } catch (_) {} };
  async function waitForRun(endpoint, runId, onProgress) {
    const url = `${endpoint.replace(/\/$/, '')}/${encodeURIComponent(runId)}`;
    const deadline = Date.now() + 120000;
    while (Date.now() < deadline) {
      const response = await fetch(url, { headers: { Accept: 'application/json' } });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const status = String(data.status || '').toLowerCase();
      if (status === 'completed') return String(data.analysis || data.result || data.text || 'Analysis response পাওয়া যায়নি।');
      if (['failed', 'cancelled'].includes(status)) throw new Error('AI run সম্পন্ন হয়নি');
      onProgress?.(status || 'running');
      await new Promise(resolve => setTimeout(resolve, 2500));
    }
    throw new Error('Analysis timeout');
  }
  let turnstileScriptPromise;
  function ensureTurnstile() {
    if (window.turnstile) return Promise.resolve(window.turnstile);
    if (turnstileScriptPromise) return turnstileScriptPromise;
    turnstileScriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector('script[data-admission-hub-turnstile]');
      if (existing) {
        existing.addEventListener('load', () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable')), { once: true });
        existing.addEventListener('error', () => reject(new Error('Turnstile script failed')), { once: true });
        return;
      }
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      script.dataset.admissionHubTurnstile = 'true';
      script.onload = () => window.turnstile ? resolve(window.turnstile) : reject(new Error('Turnstile unavailable'));
      script.onerror = () => reject(new Error('Turnstile script failed'));
      document.head.appendChild(script);
    });
    return turnstileScriptPromise;
  }
  function openModal(result) {
    const payload = buildPayload(result);
    const m = payload.result;
    const endpoint = String(window.ADMISSION_HUB_AI_ENDPOINT || '').trim();
    const cacheKey = analysisCacheKey(payload);
    const cachedAnalysis = readCachedAnalysis(cacheKey);
    const overlay = document.createElement('div');
    overlay.className = 'result-ai-overlay';
    overlay.innerHTML = `<section class="result-ai-modal" role="dialog" aria-modal="true" aria-label="AI Result Analysis"><div class="result-ai-modal-head"><div><span>ON-DEMAND AI ANALYSIS</span><h2>তোমার ফলাফল বিশ্লেষণ</h2></div><button class="result-ai-close" type="button" aria-label="বন্ধ করুন">×</button></div><div class="result-ai-status"><b>${endpoint ? 'AI connection ready' : 'প্রথম ধাপ প্রস্তুত'}</b><br>${endpoint ? 'Analysis button চাপলে secure endpoint-এ শুধু verified result summary যাবে।' : 'App তোমার result-এর verified summary তৈরি করেছে। এখন secure backend বসলে এখান থেকেই AI analysis নেওয়া যাবে।'}</div><div class="result-ai-metric-grid"><div class="result-ai-metric"><b>${m.score.toFixed(2)}</b><span>নেট স্কোর</span></div><div class="result-ai-metric"><b>${m.accuracy}%</b><span>নির্ভুলতা</span></div><div class="result-ai-metric"><b>${m.correct}/${m.total}</b><span>সঠিক</span></div><div class="result-ai-metric"><b>${m.wrong}</b><span>ভুল</span></div></div><div class="result-ai-turnstile" data-ai-turnstile></div><div class="result-ai-actions"><button type="button" data-ai-generate>${endpoint ? 'AI Analysis তৈরি করুন' : 'Secure setup pending'}</button><button type="button" class="secondary" data-ai-payload>Data summary দেখুন</button></div><pre class="result-ai-payload" data-ai-payload-box></pre><div class="result-ai-live-result" data-ai-live-result></div><p class="result-ai-note">API key কখনো frontend-এ থাকবে না। দিনে সর্বোচ্চ ৩টি request এবং একই result-এর cached response রাখা হবে।</p></section>`;
    document.body.appendChild(overlay);
    const close = () => closeModal(overlay);
    overlay.querySelector('.result-ai-close').addEventListener('click', close);
    overlay.addEventListener('click', (event) => { if (event.target === overlay) close(); });
    overlay.querySelector('[data-ai-payload]').addEventListener('click', () => {
      const box = overlay.querySelector('[data-ai-payload-box]');
      box.textContent = JSON.stringify(payload, null, 2);
      box.classList.toggle('open');
    });
    const live = overlay.querySelector('[data-ai-live-result]');
    const generateButton = overlay.querySelector('[data-ai-generate]');
    const turnstileBox = overlay.querySelector('[data-ai-turnstile]');
    const turnstileSiteKey = String(window.ADMISSION_HUB_TURNSTILE_SITEKEY || '').trim();
    let turnstileToken = '';
    let turnstileWidgetId = null;
    if (cachedAnalysis) { live.textContent = cachedAnalysis; live.classList.add('open'); }
    if (endpoint && !cachedAnalysis) {
      if (!turnstileSiteKey) {
        turnstileBox.textContent = 'Human verification setup pending.';
        generateButton.disabled = true;
      } else {
        turnstileBox.textContent = 'Human verification চালু হচ্ছে…';
        ensureTurnstile().then((api) => {
          if (!overlay.isConnected) return;
          turnstileBox.textContent = '';
          turnstileWidgetId = api.render(turnstileBox, {
            sitekey: turnstileSiteKey,
            action: 'result_analysis',
            callback: (token) => { turnstileToken = String(token || ''); generateButton.disabled = !turnstileToken; },
            'expired-callback': () => { turnstileToken = ''; generateButton.disabled = true; },
            'error-callback': () => { turnstileToken = ''; generateButton.disabled = true; turnstileBox.textContent = 'Human verification পাওয়া যায়নি। আবার চেষ্টা করো।'; }
          });
          generateButton.disabled = true;
        }).catch(() => {
          turnstileBox.textContent = 'Human verification লোড হয়নি। পরে আবার চেষ্টা করো।';
          generateButton.disabled = true;
        });
      }
    }
    generateButton.addEventListener('click', async (event) => {
      const button = event.currentTarget;
      if (cachedAnalysis) { live.textContent = cachedAnalysis; live.classList.add('open'); return; }
      if (!endpoint) {
        live.textContent = 'AI Analysis চালু করার আগে secure backend endpoint সেট করতে হবে। এই ধাপে কোনো API key app-এ রাখা হয়নি।';
        live.classList.add('open');
        return;
      }
      if (!turnstileToken) {
        live.textContent = 'Analysis চালানোর আগে human verification সম্পন্ন করো।';
        live.classList.add('open');
        return;
      }
      button.disabled = true;
      button.textContent = 'Analysis তৈরি হচ্ছে…';
      try {
        const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...payload, turnstileToken }) });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(data.error || `HTTP ${response.status}`);
        const text = data.analysis || data.result || data.text || (data.runId ? await waitForRun(endpoint, data.runId, (status) => { button.textContent = status === 'queued' ? 'Queue-তে আছে…' : 'Analysis তৈরি হচ্ছে…'; }) : 'Analysis response পাওয়া যায়নি।');
        live.textContent = String(text);
        live.classList.add('open');
        writeCachedAnalysis(cacheKey, String(text));
      } catch (error) {
        live.textContent = `AI Analysis পাওয়া যায়নি। Local result ঠিক আছে। পরে আবার চেষ্টা করো। (${error.message})`;
        live.classList.add('open');
      } finally {
        turnstileToken = '';
        if (window.turnstile && turnstileWidgetId !== null) window.turnstile.reset(turnstileWidgetId);
        button.disabled = !cachedAnalysis;
        button.textContent = 'AI Analysis তৈরি করুন';
      }
    });
  }

  function install() {
    const base = window.renderResultView;
    if (typeof base !== 'function' || base.__ahResultAI) return;
    const wrapped = function resultAIWrapped(result) {
      const out = base.apply(this, arguments);
      window.setTimeout(() => {
        const story = document.querySelector('.result-report-story');
        if (!story || story.querySelector('.result-ai-entry')) return;
        const entry = document.createElement('div');
        entry.className = 'result-ai-entry';
        entry.innerHTML = '<div class="result-ai-entry-copy"><strong>আরও বিস্তারিত AI Analysis</strong><span>বর্তমান ফল, আগের trend ও topic performance দেখে বন্ধুর মতো পরামর্শ</span></div><button class="result-ai-button" type="button">✦ Analysis</button>';
        entry.querySelector('button').addEventListener('click', () => openModal(result));
        story.appendChild(entry);
      }, 0);
      return out;
    };
    wrapped.__ahResultAI = true;
    wrapped.__ahOriginal = base;
    window.renderResultView = wrapped;
  }

  install();
  window.setTimeout(install, 0);
  window.setTimeout(install, 250);
})();
