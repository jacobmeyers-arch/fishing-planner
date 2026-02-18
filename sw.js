/*
  sw.js — Service worker for Field Planner PWA

  Purpose: Cache-first strategy. When a trip HTML loads, the service worker
           caches it. On subsequent visits (even offline), serves from cache.
           Perfect for trip data that doesn't change once generated.

  Created: 2026-02-16
*/

const CACHE_NAME = 'field-planner-v2';

/* Skip waiting — activate immediately on install */
self.addEventListener('install', () => self.skipWaiting());

/* Claim clients + purge old cache versions on activation */
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => clients.claim())
  );
});

/* Stale-while-revalidate fetch strategy:
   1. Serve cached version immediately (fast, works offline)
   2. Fetch fresh copy from network in background
   3. Update cache with fresh copy for next visit
   This ensures updates propagate within one extra page load.
*/
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.open(CACHE_NAME).then(cache =>
      cache.match(e.request).then(cached => {
        const fetchPromise = fetch(e.request).then(response => {
          if (response.ok) cache.put(e.request, response.clone());
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    )
  );
});
