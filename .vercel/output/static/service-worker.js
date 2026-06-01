// JerseyBasket Service Worker v1.0
// Provides offline support and fast loading via caching

const CACHE_NAME = 'jerseybasket-v1';
const STATIC_CACHE = 'jerseybasket-static-v1';

// Assets to cache immediately on install
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/static/js/main.chunk.js',
  '/static/js/bundle.js',
  '/static/css/main.chunk.css',
  '/manifest.json',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// ── Install: pre-cache all static assets ──────────────────────────────────
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then(cache => {
      console.log('[SW] Pre-caching static assets');
      // Use individual adds so one failure doesn't block all
      return Promise.allSettled(
        PRECACHE_URLS.map(url => cache.add(url).catch(err => {
          console.warn('[SW] Failed to cache:', url, err);
        }))
      );
    }).then(() => self.skipWaiting())
  );
});

// ── Activate: clean up old caches ─────────────────────────────────────────
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME && name !== STATIC_CACHE)
          .map(name => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ── Fetch: Cache-first for static, Network-first for API ──────────────────
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and browser extensions
  if (request.method !== 'GET') return;
  if (!url.protocol.startsWith('http')) return;

  // Network-first strategy for navigation (always fresh HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return response;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Cache-first for static assets (JS, CSS, fonts, images)
  if (
    url.pathname.startsWith('/static/') ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.woff2')
  ) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then(cache => cache.put(request, clone));
          return response;
        });
      })
    );
    return;
  }

  // Default: network with cache fallback
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request))
  );
});

// ── Background sync for price reports ─────────────────────────────────────
self.addEventListener('sync', event => {
  if (event.tag === 'price-report-sync') {
    event.waitUntil(syncPriceReports());
  }
});

async function syncPriceReports() {
  // When user submits a price correction offline,
  // this syncs it when connectivity is restored
  try {
    const cache = await caches.open(CACHE_NAME);
    const pendingReports = await cache.match('pending-price-reports');
    if (!pendingReports) return;
    const reports = await pendingReports.json();
    // POST to your backend when it exists
    // await fetch('/api/price-reports', { method: 'POST', body: JSON.stringify(reports) });
    await cache.delete('pending-price-reports');
    console.log('[SW] Synced', reports.length, 'price reports');
  } catch (err) {
    console.error('[SW] Sync failed:', err);
  }
}

// ── Push notifications (for price drop alerts) ────────────────────────────
self.addEventListener('push', event => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || 'JerseyBasket', {
      body: data.body || 'Price update available',
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-96.png',
      tag: data.tag || 'price-alert',
      data: { url: data.url || '/' },
      actions: [
        { action: 'view', title: 'View Deal' },
        { action: 'dismiss', title: 'Dismiss' }
      ]
    })
  );
});

self.addEventListener('notificationclick', event => {
  event.notification.close();
  if (event.action === 'view') {
    event.waitUntil(
      clients.openWindow(event.notification.data.url || '/')
    );
  }
});
