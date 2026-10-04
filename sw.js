// sw.js — Pocket Winnie Service Worker
// Provides offline caching for the PWA

const CACHE_NAME = 'pocket-winnie-v5';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.js',
  './styles.css',
  './icon.svg',
  './manifest.json'
];

// Install: pre-cache core app shell
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function putInCache(request, response) {
  // Only successful (or opaque CDN) responses are worth keeping
  if (response && (response.ok || response.type === 'opaque')) {
    const clone = response.clone();
    caches.open(CACHE_NAME).then(cache => cache.put(request, clone)).catch(() => {});
  }
}

// Fetch: network-first for API and CDN, cache-first for app shell
self.addEventListener('fetch', event => {
  const request = event.request;

  // Cache API only supports GET; let the browser handle everything else
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Never cache API calls or local state
  if (url.origin === location.origin && url.pathname.startsWith('/api/')) {
    return;
  }

  // For CDN resources (fonts, jspdf), use network-first with cache fallback
  if (url.origin !== location.origin) {
    event.respondWith(
      fetch(request)
        .then(response => {
          putInCache(request, response);
          return response;
        })
        .catch(() => caches.match(request, { ignoreSearch: true }))
    );
    return;
  }

  // For same-origin assets, use cache-first with background refresh
  event.respondWith(
    caches.match(request, { ignoreSearch: true }).then(cached => {
      if (cached) {
        // Update cache in background for next load
        fetch(request)
          .then(response => putInCache(request, response))
          .catch(() => {});
        return cached;
      }
      return fetch(request)
        .then(response => {
          putInCache(request, response);
          return response;
        })
        .catch(() => {
          // Offline and not cached: fall back to the app shell for page loads
          if (request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          return Response.error();
        });
    })
  );
});
