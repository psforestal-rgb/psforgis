const CACHE_NAME = 'gis-cr-cache-v7.1.0';
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
      console.log('Instalando caché PWA v7.0.1...');
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
  
  // EXCLUSIÓN TOTAL: APIs, Workers, geo-servicios → Network Only
  if (
    event.request.method !== 'GET' || 
    urlString.includes('wfs') || 
    urlString.includes('wms') ||
    urlString.includes('workers.dev') ||
    urlString.includes('sirefor') ||
    urlString.includes('snitcr') ||
    urlString.includes('allorigins') ||
    urlString.includes('corsproxy') ||
    urlString.includes('arcgisonline')
  ) {
    return; // Network Only
  }
  
  // Para archivos CDN (librerías): Cache-First
  if (urlString.includes('cdnjs.cloudflare.com') || urlString.includes('googleapis.com') || urlString.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(netResponse => {
          return caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, netResponse.clone());
            return netResponse;
          });
        });
      })
    );
    return;
  }
  
  // Para archivos propios (index.html, sw.js, manifest.json): Network-First
  // Así siempre carga la versión más reciente si hay conexión
  event.respondWith(
    fetch(event.request).then(netResponse => {
      return caches.open(CACHE_NAME).then(cache => {
        cache.put(event.request, netResponse.clone());
        return netResponse;
      });
    }).catch(() => {
      return caches.match(event.request);
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
