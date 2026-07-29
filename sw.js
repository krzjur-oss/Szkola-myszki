const CACHE = 'szkola-myszki-v5';
const LOCAL_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
];
const FONT_URL = 'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap';

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(async cache => {
      await cache.addAll(LOCAL_ASSETS).catch(() => {});
      try {
        const fontRes = await fetch(FONT_URL, { mode: 'no-cors' });
        if (fontRes) {
          await cache.put(FONT_URL, fontRes);
        }
      } catch (err) {
        // Ignorujemy błąd pobierania czcionek – nie blokuje to instalacji Service Workera
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;

  // Obsługa nawigacji (strona główna / podstrony / PWA offline)
  if (e.request.mode === 'navigate') {
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

  // Pozostałe zasoby (obrazy, czcionki, skrypty)
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
        if (e.request.destination === 'image') {
          return caches.match('./icon-192.png');
        }
      })
  );
});

