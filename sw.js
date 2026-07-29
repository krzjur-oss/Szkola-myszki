const CACHE = 'szkola-myszki-v8';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './js/main.js',
  './js/state.js',
  './js/router.js',
  './js/engine.js',
  './js/sound.js',
  './js/helpers.js',
  './js/tutorials.js',
  './js/vconsole.js',
  './js/fireworks.js',
  './js/games/click_basic.js',
  './js/games/click_precision.js',
  './js/games/double_click.js',
  './js/games/drag.js',
  './js/games/maze.js',
  './js/games/mixed.js'
];

self.addEventListener('install', e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      try {
        await cache.addAll(LOCAL_ASSETS);
      } catch (err) {}
    })
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Always prefer network for navigation/html to get fresh app updates immediately
  if (e.request.mode === 'navigate' || (e.request.headers.get('accept') && e.request.headers.get('accept').includes('text/html'))) {
    e.respondWith(
      fetch(e.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE).then(cache => cache.put(e.request, copy));
          }
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(e.request);
          if (cached) return cached;
          return (await caches.match('./index.html')) || (await caches.match('./'));
        })
    );
    return;
  }

  // Network-first for all other assets with cache fallback
  e.respondWith(
    fetch(e.request)
      .then(response => {
        if (response && (response.status === 200 || response.type === 'opaque') && e.request.url.startsWith('http')) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(e.request, copy));
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(e.request, { ignoreSearch: true });
        if (cached) return cached;
        return new Response('', { status: 404, statusText: 'Not Found' });
      })
  );
});

