# Secure Telegram relay

GitHub Pages serves the Admission Hub frontend as static HTML, CSS, and JavaScript. It must not contain a Telegram bot token. Deploy `worker.js` to a small HTTPS serverless worker or equivalent endpoint, set `TELEGRAM_BOT_TOKEN` and an optional `RELAY_KEY` as server-side secrets, and configure the deployed `/notify` URL plus the chat ID in the app's Telegram screen.

The endpoint validates the request, deduplicates by chat and `dedupeKey`, escapes message content, and calls Telegram's `sendMessage` method server-side. Add authentication, rate limiting, and a strict allowed-origin policy before production use. Never paste the bot token into frontend code, localStorage, GitHub Pages files, or commit history.
