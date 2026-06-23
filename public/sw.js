const CACHE_NAME = "aura-meteo-static-v2";

self.addEventListener("install", (event) => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  const url = new URL(event.request.url);

  // Ne pas mettre en cache les requêtes API ou RSC (React Server Components)
  if (
    url.pathname.startsWith("/api/") ||
    event.request.headers.get("RSC") === "1" ||
    url.pathname === "/_next/webpack-hmr"
  ) {
    return;
  }

  // Cache-first pour les assets statiques (_next/static, images)
  if (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.match(/\.(png|jpg|jpeg|svg|webp|woff2|css)$/)
  ) {
    event.respondWith(
      caches.match(event.request).then((cachedResponse) => {
        return cachedResponse || fetch(event.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
    );
    return;
  }

  // Network-first pour la navigation HTML (évite les boucles de rechargement)
  if (event.request.mode === "navigate" || event.request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(event.request).then((cached) => cached || new Response("Hors ligne", { status: 503, statusText: "Service Unavailable" }));
      })
    );
    return;
  }
});
