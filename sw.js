var CACHE_NAME = 'jw-shell-v1';
var SHELL_FILES = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(SHELL_FILES);
    }).then(function() {
      return self.skipWaiting();
    })
  );
});

self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(names) {
      return Promise.all(names.filter(function(n) {
        return n !== CACHE_NAME;
      }).map(function(n) {
        return caches.delete(n);
      }));
    }).then(function() {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function(event) {
  var url = new URL(event.request.url);
  var isShellRequest = event.request.method === 'GET' && url.origin === self.location.origin;
  if (!isShellRequest) return; // laisse passer les appels réseau externes (WOL, Dropbox, Groq, Pollinations...) sans mise en cache

  event.respondWith(
    caches.match(event.request).then(function(cached) {
      var network = fetch(event.request).then(function(res) {
        if (res && res.ok) {
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(event.request, res.clone());
          });
        }
        return res;
      }).catch(function() {
        return cached;
      });
      return cached || network;
    })
  );
});
