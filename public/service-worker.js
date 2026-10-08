// JerseyBasket service worker — caches the app shell for fast/offline loads
// and exposes a proper update lifecycle so the client can prompt the user
// instead of silently sitting on a stale build (matters most for iOS
// "Add to Home Screen" installs, which otherwise can go a long time without
// ever re-fetching index.html).
//
// SW_VERSION and PRECACHE_URLS below are placeholders — they're stamped
// with the real build version and hashed asset filenames by
// scripts/inject-sw-version.js, which runs as the npm "postbuild" step.
// That's what guarantees this file's bytes actually change on every
// deploy, which is what lets the browser detect an update exists at all.

const SW_VERSION = "__SW_VERSION__";
const CACHE_NAME = `jerseybasket-${SW_VERSION}`;
const PRECACHE_URLS = __PRECACHE_URLS__;

// Bump this by hand only for changes worth interrupting the user for
// (visible layout/UX fixes, new features) — unlike SW_VERSION, this is
// NOT auto-generated per deploy. Routine content-only pushes (price
// updates etc.) should leave it unchanged: the new build still installs
// and takes over normally, it just does so silently on the next full
// close+reopen instead of showing the "Update now" banner. See the
// 'message' handler below and src/index.js for how the client reads it.
const NOTIFY_VERSION = 3;

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      Promise.allSettled(PRECACHE_URLS.map(url => cache.add(url)))
    )
    // No self.skipWaiting() here on purpose — the new worker sits in
    // "waiting" until the client explicitly asks for it (see the
    // 'message' handler below), so an update never yanks the page out
    // from under someone mid-interaction.
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(names => Promise.all(names.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('message', event => {
  if (event.data === 'SKIP_WAITING' || (event.data && event.data.type === 'SKIP_WAITING')) {
    self.skipWaiting();
    return;
  }
  if (event.data && event.data.type === 'GET_NOTIFY_VERSION' && event.ports[0]) {
    event.ports[0].postMessage(NOTIFY_VERSION);
  }
});

self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (!url.protocol.startsWith('http')) return;

  // Navigations always go to the network first so a new deploy's HTML
  // (and its references to the new hashed JS/CSS) is picked up as soon as
  // there's connectivity — cache is only a fallback for offline use.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(res => {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          return res;
        })
        .catch(() => caches.match('/index.html'))
    );
    return;
  }

  // Hashed static assets never change contents under the same URL, so
  // cache-first is safe and fast.
  if (url.pathname.startsWith('/static/')) {
    event.respondWith(
      caches.match(request).then(cached => cached || fetch(request).then(res => {
        const clone = res.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        return res;
      }))
    );
    return;
  }

  // Everything else (icons, manifest, images): network-first with a cache
  // fallback for offline use.
  event.respondWith(
    fetch(request)
      .then(res => {
        if (res.ok) {
          const clone = res.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return res;
      })
      .catch(() => caches.match(request))
  );
});
