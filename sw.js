// Tên cache
const CACHE_NAME = 'game-ban-nhau-v3';

// File cần cache để offline
const urlsToCache = [
  '/game-ban-nhau/',                    // Trang chính
  '/game-ban-nhau/index.html',          // File HTML
  '/game-ban-nhau/background.jpg',      // Hình nền (đúng tên file)
  '/game-ban-nhau/sw.js'                // Chính file này
];

// Cài đặt - cache các file
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urllsToCache))
      .then(() => self.skipWaiting())
  );
});

// Kích hoạt - xóa cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Chặn các request và trả về bản cache nếu có
self.addEventListener('fetch', event => {
  // Chỉ xử lý request GET
  if (event.request.method !== 'GET') return;
  
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Nếu có trong cache, trả về
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // Nếu không có, fetch từ mạng
        return fetch(event.request)
          .then(networkResponse => {
            // Cache response mới cho lần sau
            return caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, networkResponse.clone());
                return networkResponse;
              });
          })
          .catch(() => {
            // Nếu offline và không có trong cache
            // Có thể trả về trang dự phòng nếu cần
            return new Response('Offline mode', {
              status: 503,
              statusText: 'Service Unavailable'
            });
          });
      })
  );
});
