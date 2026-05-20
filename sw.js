const CACHE_NAME = 'kairos-v4';

// La liste des fichiers indispensables à sauvegarder sur le téléphone
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon.png',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css',
  'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
];

// 1. INSTALLATION : Le téléphone télécharge le coffre-fort
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('Service Worker: Mise en cache des fichiers');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// 2. ACTIVATION : Nettoyage si on met à jour l'application
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Nettoyage de l\'ancien cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTION : Le téléphone demande une page
self.addEventListener('fetch', (event) => {
  // On ne bloque pas les requêtes vers Firebase ou Cloudinary
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si le fichier est dans le cache, on le donne instantanément (Mode Hors-Ligne)
      if (cachedResponse) {
        return cachedResponse;
      }
      // Sinon, on va le chercher sur internet normalement
      return fetch(event.request);
    }).catch(() => {
      // En cas de coupure réseau brutale sur une nouvelle page, on renvoie l'accueil
      if (event.request.mode === 'navigate') {
        return caches.match('./index.html');
      }
    })
  );
});