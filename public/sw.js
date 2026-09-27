const CACHE_NAME = 'amerigam-v2';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(['/']);
    }).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Only handle GET requests from the same origin
  if (event.request.method !== 'GET' || !event.request.url.startsWith(self.location.origin)) {
    return;
  }

  const url = new URL(event.request.url);

  // Skip API routes, Next.js server actions, dynamic RSC queries
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname.startsWith('/_next/data/') ||
    url.searchParams.has('_rsc')
  ) {
    return;
  }

  // Network-first with safe fallback to cache; guaranteed to return a valid Response
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Cache static assets only
        if (response && response.status === 200 && response.type === 'basic') {
          if (
            url.pathname.startsWith('/_next/static/') ||
            url.pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|woff2?)$/)
          ) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            }).catch(() => {});
          }
        }
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(event.request);
        if (cached) {
          return cached;
        }
        if (event.request.mode === 'navigate') {
          const rootCached = await caches.match('/');
          if (rootCached) return rootCached;
        }
        // Always return a valid Response object so respondWith never throws TypeError
        return new Response('Network unavailable. Please reconnect to the internet.', {
          status: 503,
          statusText: 'Service Unavailable',
          headers: new Headers({ 'Content-Type': 'text/plain' })
        });
      })
  );
});

self.addEventListener('push', function (event) {
  if (event.data) {
    try {
      const data = event.data.json();
      const options = {
        body: data.body,
        icon: data.icon || '/icon.png',
        badge: '/icon.png',
        vibrate: [100, 50, 100],
        data: {
          dateOfArrival: Date.now(),
          primaryKey: '2',
          url: data.url
        },
      };
      event.waitUntil(self.registration.showNotification(data.title, options));
    } catch (e) {}
  }
});

self.addEventListener('notificationclick', function (event) {
  event.notification.close();
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});
