const CACHE_NAME = 'finarg-v2';
const STATIC_CACHE = 'finarg-static-v2';
const DYNAMIC_CACHE = 'finarg-dynamic-v2';
const API_CACHE = 'finarg-api-v2';

// Archivos estáticos para cachear
const STATIC_ASSETS = [
  '/',
  '/cotizaciones',
  '/calculadora-sueldo-neto',
  '/simulador-de-inversiones',
  '/arbitraje',
  '/inflacion',
  '/reservas-bcra',
  '/comparador-tasas',
  '/cauciones',
  '/login',
  '/register',
  '/manifest.json',
];

// Rutas de API para cachear con estrategia stale-while-revalidate
const API_ROUTES = [
  '/api/v1/cotizaciones',
  '/api/v1/cotizaciones/brecha',
  '/api/v1/inflacion/actual',
  '/api/v1/reservas',
];

// Instalar Service Worker
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('[SW] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activar y limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== STATIC_CACHE &&
              name !== DYNAMIC_CACHE &&
              name !== API_CACHE
            );
          })
          .map((name) => {
            console.log('[SW] Deleting old cache:', name);
            return caches.delete(name);
          })
      );
    })
  );
  self.clients.claim();
});

// Estrategias de cache
const cacheStrategies = {
  // Cache first, fallback to network
  cacheFirst: async (request) => {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    try {
      const response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(STATIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      return new Response('Offline', { status: 503 });
    }
  },

  // Network first, fallback to cache
  networkFirst: async (request) => {
    try {
      const response = await fetch(request);
      if (response.ok && request.method === 'GET') {
        const cache = await caches.open(DYNAMIC_CACHE);
        cache.put(request, response.clone());
      }
      return response;
    } catch (error) {
      const cached = await caches.match(request);
      if (cached) {
        return cached;
      }
      return new Response('Offline', { status: 503 });
    }
  },

  // Stale while revalidate (ideal para APIs)
  staleWhileRevalidate: async (request) => {
    if (request.method !== 'GET') {
      return fetch(request);
    }
    const cache = await caches.open(API_CACHE);
    const cached = await cache.match(request);

    const fetchPromise = fetch(request)
      .then((response) => {
        if (response.ok && request.method === 'GET') {
          cache.put(request, response.clone());
        }
        return response;
      })
      .catch(() => cached);

    return cached || fetchPromise;
  },
};

// Interceptar requests
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  if (url.protocol === 'chrome-extension:') {
    return;
  }

  if (request.method !== 'GET') {
    return;
  }

  // API requests - stale while revalidate
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(cacheStrategies.staleWhileRevalidate(request));
    return;
  }

  // Static assets - cache first (except scripts which use network-first to avoid HMR issues)
  if (
    request.destination === 'image' ||
    request.destination === 'font' ||
    request.destination === 'style'
  ) {
    event.respondWith(cacheStrategies.cacheFirst(request));
    return;
  }

  // Scripts use network-first to avoid caching corrupted HMR modules
  if (request.destination === 'script') {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }

  // HTML pages - network first
  if (request.mode === 'navigate') {
    event.respondWith(cacheStrategies.networkFirst(request));
    return;
  }

  // Default - network first
  event.respondWith(cacheStrategies.networkFirst(request));
});

// Background sync para guardar datos offline
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-simulations') {
    event.waitUntil(syncSimulations());
  }
});

async function syncSimulations() {
  // Implementar sincronización de simulaciones guardadas offline
  console.log('[SW] Syncing offline simulations...');
}

// Push notifications
self.addEventListener('push', (event) => {
  console.log('[SW] Push received:', event);
  
  let data = { title: 'FinArg', body: 'Nueva actualización' };
  
  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/',
    },
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'close', title: 'Cerrar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Click en notificación
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification click:', event.action);
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      // Si ya hay una ventana abierta, enfocarla
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      // Si no, abrir una nueva
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});
