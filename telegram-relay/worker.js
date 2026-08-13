export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: corsHeaders() });
    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'admission-hub-telegram-relay' });
    }
    if (request.method !== 'POST' || url.pathname !== '/notify') {
      return json({ ok: false, error: 'Not found' }, 404);
    }
    if (env.RELAY_KEY && request.headers.get('X-Relay-Key') !== env.RELAY_KEY) {
      return json({ ok: false, error: 'Unauthorized' }, 401);
    }
    let payload;
    try { payload = await request.json(); } catch (_) { return json({ ok: false, error: 'Invalid JSON' }, 400); }
    const { chatId, category, title, body, dedupeKey } = payload || {};
    if (!chatId || !title || !body || !dedupeKey) return json({ ok: false, error: 'Missing fields' }, 400);
    // The frontend also deduplicates, but this server-side cache is the final guard.
    const cacheKey = new Request(`${url.origin}/dedupe/${encodeURIComponent(chatId)}/${encodeURIComponent(dedupeKey)}`);
    const cache = caches.default;
    if (await cache.match(cacheKey)) return json({ ok: true, duplicate: true });
    const text = `<b>${escapeHtml(title)}</b>\n${escapeHtml(body)}\n\n#${escapeHtml(category || 'system')}`;
    const telegram = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: 'HTML', disable_web_page_preview: true })
    });
    if (!telegram.ok) return json({ ok: false, error: 'Telegram API error' }, 502);
    await cache.put(cacheKey, new Response('1', { headers: { 'Cache-Control': 'max-age=86400' } }));
    return json({ ok: true });
  }
};
function escapeHtml(value) { return String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function corsHeaders() { return { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type,x-relay-key' }; }
function json(value, status = 200) { return new Response(JSON.stringify(value), { status, headers: { 'content-type': 'application/json', ...corsHeaders() } }); }
