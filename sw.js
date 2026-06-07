// sw.js
const CACHE_NAME = 'tareas-pwa-v1';
const urlsToCache = [
    './mobile.html',
    './css/mobile.css',
    './js/config.js',
    './js/cloud.js',
    './js/model.js',
    './js/engine.js',
    './js/ui-mobile.js',
    './js/app.js'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then(cache => {
            return cache.addAll(urlsToCache);
        })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
        .then(response => {
            // Retorna el recurso desde el caché si existe, caso contrario acude a la red
            return response || fetch(event.request);
        })
    );
});
