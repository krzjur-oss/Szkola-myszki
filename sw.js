const CACHE_NAME = 'szkola-myszki-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  'https://fonts.googleapis.com/css2?family=Fredoka+One&family=Nunito:wght@400;600;700;800&display=swap',
];

// Instalacja – zapisz pliki w cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS).catch((err) => {
        // Jeśli czcionki Google nie są dostępne offline – ignoruj błąd
        console.warn('Cache partial fail (fonts?):', err);
      });
    })
  );
  self.skipWaiting();
});

// Aktywacja – usuń stare cache
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch – najpierw cache, potem sieć (cache-first)
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        // Zapisz nowe zasoby do cache (tylko GET)
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline i brak w cache – zwróć główną stronę
        return caches.match('./index.html');
      });
    })
  );
});
