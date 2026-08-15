const CACHE_PREFIX = 'admission-hub-shell-';
const BUILD_ID = 'v5';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './manifest.webmanifest',
  './mcq_final.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

const isDocumentRequest = request => request.mode === 'navigate' || request.destination === 'document';

async function cacheNetworkResponse(request, response) {
  if (!response || !response.ok) return response;
  try {
    const cache = await caches.open(CACHE_NAME);
    await cache.put(request, response.clone());
  } catch (_) {
    // A cache write failure must never prevent the current network response.
  }
  return response;
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async asset => {
      try {
        const request = new Request(asset, {cache: 'reload'});
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response);
      } catch (_) {
        // The worker can still activate when one optional shell asset is offline.
      }
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith('admission-hub-') && key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      // Always ask the network for the current deployed same-origin asset.
      // The cached response is used only when the device is offline.
      const response = await fetch(request, {cache: 'no-store'});
      return cacheNetworkResponse(request, response);
    } catch (_) {
      const cached = await caches.match(request);
      if (cached) return cached;
      if (isDocumentRequest(request)) {
        return (await caches.match('./index.html')) || Response.error();
      }
      return Response.error();
    }
  })());
});
