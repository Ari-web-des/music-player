const CACHE = 'bolly-player-shell-v1';
const ASSETS = [
  '/', '/index.html'
];

self.addEventListener('install', (ev) => {
  ev.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  ev.respondWith(
    caches.match(req).then(cached => cached || fetch(req).then(res => {
      // cache resources on the fly (optional)
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    })).catch(()=> caches.match('/index.html'))
  );
});
