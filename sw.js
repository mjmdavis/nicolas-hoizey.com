---
---

// https://remysharp.com/2016/03/22/the-copy--paste-guide-to-your-first-service-worker
// https://jakearchibald.com/2014/offline-cookbook/#network-falling-back-to-cache

const CACHE = 'v1::static';

var urlsToCache = [
      '/',
      '/a-propos/de-moi.html',
      '/a-propos/du-site.html',
      {% for post in site.posts limit:7 %}
      '{{ post.url }}',
      {% endfor %}
      '{% asset_path "non-critical-styles" %}',
      '/offline.html',
    ];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => {
      return cache.addAll(urlsToCache).then(() => self.skipWaiting());
    })
  );
});

self.addEventListener('activate', event => {
  // https://davidwalsh.name/service-worker-claim
  return self.clients.claim();
});

self.addEventListener('fetch', event => {
  var requestURL = new URL(event.request.url);
  // local URL
  if (requestURL.origin == location.origin) {
  }

  // Cloudinary images
  if (requestURL.hostname == 'res.cloudinary.com') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request).then(response => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    );
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match(event.request);
    })
  );
});