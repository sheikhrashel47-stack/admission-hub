const CACHE_PREFIX = 'admission-hub-shell-';
const BUILD_ID = 'v34-private-sync-20260824';
const CACHE_NAME = `${CACHE_PREFIX}${BUILD_ID}`;
const VERSION_HEADER = 'X-Admission-Hub-Build';
const isCurrentBuild = response => response && response.headers && response.headers.get(VERSION_HEADER) === BUILD_ID;
function markBuild(response) {
  if (!response || !response.ok) return response;
  const headers = new Headers(response.headers);
  headers.set(VERSION_HEADER, BUILD_ID);
  return response.clone().blob().then(blob => new Response(blob, {status: response.status, statusText: response.statusText, headers}));
}
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
    const versioned = await markBuild(response);
    await cache.put(request, versioned.clone());
  } catch (_) {
    // Cache failures must never block the fresh network response.
  }
  return response;
}

async function offlineFallback(request) {
  const cached = await caches.match(request);
  if (cached && isCurrentBuild(cached)) return cached;

  if (isDocumentRequest(request)) {
    const shell = await caches.match('./index.html');
    if (shell && isCurrentBuild(shell)) return shell;
    const shellUrl = new URL('./index.html', self.location.href).href;
    const fallback = await caches.match(shellUrl);
    return fallback || Response.error();
  }

  return Response.error();
}

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE_NAME);
    await Promise.all(APP_SHELL.map(async asset => {
      try {
        const url = new URL(asset, self.location.href).href;
        const request = new Request(url, {cache: 'reload'});
        const response = await fetch(request, {cache: 'no-store'});
        if (response.ok) await cacheNetworkResponse(request, response);
      } catch (_) {
        // The worker can still activate if an optional shell asset is unavailable.
      }
    }));

    // Activate this worker immediately; do not wait for old tabs to close.
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key !== CACHE_NAME)
        .map(key => caches.delete(key))
    );

    // Take control of existing PWA clients without requiring another launch.
    await self.clients.claim();
  })());
});

self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    event.waitUntil(self.skipWaiting());
    return;
  }
  if (event.data && event.data.type === 'VERSION_CHECK') {
    event.ports?.[0]?.postMessage({type:'VERSION_CHECK_RESULT', buildId:BUILD_ID, cacheName:CACHE_NAME});
  }
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const requestUrl = new URL(request.url);
  if (requestUrl.origin !== self.location.origin) return;

  event.respondWith((async () => {
    try {
      // Network-first for every same-origin HTML, JS, CSS, JSON, and asset request.
      const response = await fetch(request, {cache: 'no-store'});
      const contentType = response.headers.get('content-type') || '';
      if (isDocumentRequest(request) && !contentType.includes('text/html')) return offlineFallback(request);
      return cacheNetworkResponse(request, response);
    } catch (_) {
      // Cache is used only when the network is unavailable.
      return offlineFallback(request);
    }
  })());
});
