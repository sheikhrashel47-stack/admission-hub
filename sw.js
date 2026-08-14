const CACHE_NAME = 'admission-hub-shell-v3';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './manifest.webmanifest',
  './mcq_final.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL).catch(() => undefined))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('admission-hub-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) return;
  event.respondWith(
    fetch(event.request)
      .then(response => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy)).catch(() => undefined);
        }
        return response;
      })
      .catch(() => caches.match(event.request).then(cached => {
      if (cached) return cached;
      // Only document navigations may fall back to the app shell. Returning
      // index.html for JS/CSS/JSON requests makes iOS standalone mode parse
      // HTML as a script and silently drops Question Bank/Exam/History code.
      if (event.request.mode === 'navigate' || event.request.destination === 'document') {
        return caches.match('./index.html');
      }
      return Response.error();
    }))
  );
});
