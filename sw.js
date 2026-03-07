/* ============================================================
   MYNTRA CLONE — sw.js (Service Worker)
   Caches all assets for offline use
   ============================================================ */

const CACHE_NAME = 'myntra-cache-v1';

const ASSETS_TO_CACHE = [
    '/Myntra_Clone_Professional/',
    '/Myntra_Clone_Professional/index.html',
    '/Myntra_Clone_Professional/bag.html',
    '/Myntra_Clone_Professional/wishlist.html',
    '/Myntra_Clone_Professional/index.css',
    '/Myntra_Clone_Professional/bag.css',
    '/Myntra_Clone_Professional/wishlist.css',
    '/Myntra_Clone_Professional/auth.css',
    '/Myntra_Clone_Professional/index.js',
    '/Myntra_Clone_Professional/bag.js',
    '/Myntra_Clone_Professional/wishlist.js',
    '/Myntra_Clone_Professional/items.js',
    '/Myntra_Clone_Professional/myntra_logo.webp',
    '/Myntra_Clone_Professional/1.jpg',
    '/Myntra_Clone_Professional/2.jpg',
    '/Myntra_Clone_Professional/3.jpg',
    '/Myntra_Clone_Professional/4.jpg',
    '/Myntra_Clone_Professional/5.jpg',
    '/Myntra_Clone_Professional/6.jpg',
    '/Myntra_Clone_Professional/7.jpg',
    '/Myntra_Clone_Professional/8.jpg'
];

/* ── Install: cache all assets ── */
self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            console.log('✅ Caching assets');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

/* ── Activate: clean old caches ── */
self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key) { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

/* ── Fetch: serve from cache first, fallback to network ── */
self.addEventListener('fetch', function(e) {
    // Skip Firebase and Google API requests — always fetch live
    if (e.request.url.includes('firebase') ||
        e.request.url.includes('googleapis') ||
        e.request.url.includes('gstatic')) {
        return;
    }

    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) return cached;
            return fetch(e.request).then(function(response) {
                // Cache new requests dynamically
                if (response && response.status === 200) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) {
                        cache.put(e.request, copy);
                    });
                }
                return response;
            }).catch(function() {
                // Offline fallback — return homepage
                if (e.request.destination === 'document') {
                    return caches.match('/Myntra_Clone_Professional/index.html');
                }
            });
        })
    );
});
