/*
  sw.js — Service worker for Field Planner PWA

  Purpose: Cache-first strategy. When a trip HTML loads, the service worker
           caches it. On subsequent visits (even offline), serves from cache.
           Perfect for trip data that doesn't change once generated.

  Created: 2026-02-16
*/

const CACHE_NAME = 'field-planner-v1';

/* Skip waiting — activate immediately on install */
self.addEventListener('install', () => self.skipWaiting());

/* Claim all open clients on activation so SW takes effect immediately */
self.addEventListener('activate', e => e.waitUntil(clients.claim()));

/* Cache-first fetch strategy:
   1. Check cache for existing response
   2. If cached, return it (instant, works offline)
   3. If not cached, fetch from network
   4. Cache the network response for next time
*/
self.addEventListener('fetch', e => {
  e.respondWith(
    caches.match(e.request).then(cached => {
      if (cached) return cached;
      return fetch(e.request).then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(e.request, clone));
        }
        return response;
      });
    })
  );
});
