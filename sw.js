const CACHE_NAME = 'gis-cr-cache-v6.6.3-final';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css',
  'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js',
  'https://cdnjs.cloudflare.com/ajax/libs/proj4js/2.9.2/proj4.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jsts/2.9.3/jsts.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/shpjs/4.0.4/shp.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/togeojson/0.16.0/togeojson.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      console.log('Instalando caché de PWA...');
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (error) {
          console.warn('Caché ignorado para:', url);
        }
      }
    })
  );
  self.skipWaiting();
});

self.addEventListener('fetch', event => {
  const urlString = event.request.url.toLowerCase();
  
  // EXCLUSIÓN ESTRICTA DE CACHÉ PARA APIS Y WORKERS
  if (
    event.request.method !== 'GET' || 
    urlString.includes('wfs') || 
    urlString.includes('wms') ||
    urlString.includes('workers.dev') ||
    urlString.includes('sirefor') ||
    urlString.includes('allorigins') ||
    urlString.includes('corsproxy')
  ) {
    return; // Pasa la petición a la red (Network Only)
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});
