/* ============================================================
   MYNTRA CLONE — sw.js
   Service Worker: Caching + Firebase Cloud Messaging (FCM)
   ============================================================ */

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

/* ── YOUR FIREBASE CONFIG — same values as firebase.js ── */
firebase.initializeApp({
    apiKey:            "YOUR_API_KEY",
    authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
    projectId:         "YOUR_PROJECT_ID",
    storageBucket:     "YOUR_PROJECT_ID.appspot.com",
    messagingSenderId: "YOUR_SENDER_ID",
    appId:             "YOUR_APP_ID"
});

const messaging = firebase.messaging();

/* ── Background push notifications ── */
messaging.onBackgroundMessage(function(payload) {
    console.log('📬 Background message received:', payload);

    const title = payload.notification?.title || '🛍️ Myntra';
    const body  = payload.notification?.body  || 'You have a new update!';
    const url   = payload.data?.url || '/Myntra_Clone_Professional/index.html';

    self.registration.showNotification(title, {
        body   : body,
        icon   : '/Myntra_Clone_Professional/myntra_logo.webp',
        badge  : '/Myntra_Clone_Professional/myntra_logo.webp',
        image  : payload.notification?.image || null,
        vibrate: [200, 100, 200],
        tag    : 'myntra-notification',
        renotify: true,
        actions: [
            { action: 'open',    title: '🛍️ Shop Now' },
            { action: 'dismiss', title: '✕ Dismiss'   }
        ],
        data: { url }
    });
});

/* ── Notification click handler ── */
self.addEventListener('notificationclick', function(e) {
    e.notification.close();

    if (e.action === 'dismiss') return;

    const url = e.notification.data?.url || '/Myntra_Clone_Professional/index.html';

    e.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then(function(clientList) {
                // If app already open, focus it
                for (var c of clientList) {
                    if (c.url.includes('Myntra_Clone_Professional') && 'focus' in c) {
                        c.focus();
                        c.navigate(url);
                        return;
                    }
                }
                // Otherwise open new tab
                if (clients.openWindow) return clients.openWindow(url);
            })
    );
});

/* ══════════════════════════════════════
   CACHING
══════════════════════════════════════ */
const CACHE_NAME = 'myntra-cache-v6';

const ASSETS_TO_CACHE = [
    '/Myntra_Clone_Professional/',
    '/Myntra_Clone_Professional/index.html',
    '/Myntra_Clone_Professional/bag.html',
    '/Myntra_Clone_Professional/wishlist.html',
    '/Myntra_Clone_Professional/product.html',
    '/Myntra_Clone_Professional/orders.html',
    '/Myntra_Clone_Professional/index.css',
    '/Myntra_Clone_Professional/bag.css',
    '/Myntra_Clone_Professional/wishlist.css',
    '/Myntra_Clone_Professional/auth.css',
    '/Myntra_Clone_Professional/bottomnav.css',
    '/Myntra_Clone_Professional/uifeatures.css',
    '/Myntra_Clone_Professional/product.css',
    '/Myntra_Clone_Professional/orders.css',
    '/Myntra_Clone_Professional/ai-assistant.css',
    '/Myntra_Clone_Professional/index.js',
    '/Myntra_Clone_Professional/bag.js',
    '/Myntra_Clone_Professional/wishlist.js',
    '/Myntra_Clone_Professional/product.js',
    '/Myntra_Clone_Professional/orders.js',
    '/Myntra_Clone_Professional/uifeatures.js',
    '/Myntra_Clone_Professional/ai-assistant.js',
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

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function(cache) {
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function(e) {
    e.waitUntil(
        caches.keys().then(function(keys) {
            return Promise.all(
                keys.filter(function(key) { return key !== CACHE_NAME; })
                    .map(function(key)    { return caches.delete(key); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function(e) {
    if (e.request.url.includes('firebase') ||
        e.request.url.includes('googleapis') ||
        e.request.url.includes('gstatic') ||
        e.request.url.includes('api.anthropic')) return;

    e.respondWith(
        caches.match(e.request).then(function(cached) {
            if (cached) return cached;
            return fetch(e.request).then(function(response) {
                if (response && response.status === 200) {
                    var copy = response.clone();
                    caches.open(CACHE_NAME).then(function(cache) { cache.put(e.request, copy); });
                }
                return response;
            }).catch(function() {
                if (e.request.destination === 'document') {
                    return caches.match('/Myntra_Clone_Professional/index.html');
                }
            });
        })
    );
});
