const CACHE_VERSION = "v3";
const STATIC_CACHE = `finarg-static-${CACHE_VERSION}`;
const DYNAMIC_CACHE = `finarg-dynamic-${CACHE_VERSION}`;
const API_CACHE = `finarg-api-${CACHE_VERSION}`;
const CHUNKS_CACHE = `finarg-chunks-${CACHE_VERSION}`;

const STATIC_ASSETS = [
  "/",
  "/cotizaciones",
  "/calculadora-sueldo-neto",
  "/inflacion",
  "/reservas-bcra",
  "/comparador-tasas",
  "/bandas-cambiarias",
  "/login",
  "/register",
  "/manifest.json",
  "/icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return name !== STATIC_CACHE && name !== DYNAMIC_CACHE && name !== API_CACHE && name !== CHUNKS_CACHE;
          })
          .map((name) => {
            return caches.delete(name);
          }),
      );
    }),
  );
  self.clients.claim();
});

const cacheStrategies = {
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && request.method === "GET") {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response("Offline", { status: 503 });
    }
  },

  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok && request.method === "GET") {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      return new Response("Offline", { status: 503 });
    }
  },

  staleWhileRevalidate: async (request) => {
    if (request.method !== "GET") {
      return fetch(request);
    }
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok && request.method === "GET") {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => {
        if (cached) {
          return cached;
        }
        return new Response(JSON.stringify({ error: "Network error" }), {
          status: 503,
          headers: { "Content-Type": "application/json" },
        });
      });

    return cached || fetchPromise;
  },
};

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.protocol === "chrome-extension:") {
    return;
  }

  if (request.method !== "GET") {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    event.respondWith(cacheStrategies.staleWhileRevalidate(request));
    return;
  }

  if (
    request.destination === "image" ||
    request.destination === "font" ||
    request.destination === "style"
  ) {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }

  if (request.destination === "script" && (url.pathname.includes("/_next/static/") || url.pathname.includes("/_next/chunks/"))) {
    event.respondWith(
      caches.open(CHUNKS_CACHE).then((cache) => {
        return cache.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        });
      })
    );
    return;
  }

  if (request.destination === "script") {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }

  event.respondWith(cacheStrategies.networkFirst(request));
});

self.addEventListener("sync", (event) => {
  if (event.tag === "sync-simulations") {
    event.waitUntil(syncSimulations());
  }
});

self.addEventListener("push", (event) => {
  let data = { title: "FinArg", body: "Nueva actualización" };

  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: "/icons/icon-192x192.png",
    badge: "/icons/badge-72x72.png",
    vibrate: [100, 50, 100],
    data: {
      url: data.url || "/",
    },
    actions: [
      { action: "open", title: "Ver" },
      { action: "close", title: "Cerrar" },
    ],
  };

  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "close") {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && "focus" in client) {
          return client.focus();
        }
      }

      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    }),
  );
});
