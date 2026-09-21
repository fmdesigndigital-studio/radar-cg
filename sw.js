const CACHE_NAME = 'radar-cg-v3'; // VAŽNO: Pri svakoj sljedećoj izmjeni koda u index.html, promijeni ovaj broj (npr. u v4)
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg' // Ako koristiš SVG ikonicu
];

// 1. Faza instalacije: Keširanje fajlova za offline rad
self.addEventListener('install', event => {
  // Forsira Service Worker da se odmah instalira i ne čeka zatvaranje starog taba
  self.skipWaiting(); 
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Fajlovi uspješno keširani za verziju:', CACHE_NAME);
        return cache.addAll(urlsToCache);
      })
  );
});

// 2. Faza aktivacije: Brisanje starih verzija koda
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          // Ako se ime keša ne poklapa sa trenutnom verzijom, obriši ga
          if (cacheName !== CACHE_NAME) {
            console.log('Brisanje stare verzije keša:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Odmah primjenjuje novu verziju na sve otvorene tabove
      return self.clients.claim();
    })
  );
});

// 3. Faza presretanja (Mreža): Serviranje aplikacije sa uređaja (Offline rad)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Ako fajl postoji u kešu (nema interneta ili štedimo mrežu), vrati ga iz keša. 
        // Ako ne postoji, povuci ga redovno sa interneta.
        return response || fetch(event.request);
      }).catch(() => {
        console.error('Zahtjev nije uspio, a fajl nije u kešu:', event.request.url);
      })
  );
});
