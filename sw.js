const CACHE_NAME = 'gis-cr-cache-v6.5';

// Lista de archivos exacta sin enlaces markdown
const urlsToCache = [
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
  'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Abriendo caché y guardando archivos...');
      return cache.addAll(urlsToCache);
    })
  );
});

self.addEventListener('fetch', event => {
  // Ignorar peticiones WFS/WMS para que siempre busque datos frescos
  if (event.request.method !== 'GET' || event.request.url.includes('wfs') || event.request.url.includes('wms')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request).then(response => {
      // Si el archivo está en caché, lo devuelve. Si no, lo descarga de internet.
      return response || fetch(event.request);
    })
  );
});

// Limpieza de cachés antiguas si actualizas la versión
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
});
