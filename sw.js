let cacheName = 'what-can-i-rig-v1';
let cacheableContent = [
  '/what-can-I-rig/',
  '/what-can-I-rig/index.html',
  '/what-can-I-rig/icons/favicon.png',
  '/what-can-I-rig/script.js',
  '/what-can-I-rig/sw.js',
  '/what-can-I-rig/css/style.css',
  '/what-can-I-rig/pitchlengths/yorkshire.txt',
  '/what-can-I-rig/pitchlengths/derbyshire.txt',
  '/what-can-I-rig/pitchlengths/scotland.txt',
];

// On install cache required assets
self.addEventListener('install', (e) => {
    e.waitUntil((async () => {
        let cache = await caches.open(cacheName);
        await cache.addAll(cacheableContent);
    })());
});

// Clear old caches when cacheName is updated (i.e. pitchlengths.txt is update)
self.addEventListener('activate', (e) => {
    e.waitUntil(caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key === cacheName) { return; }
        return caches.delete(key);
      }));
    }));
  });

// On fetch serve files from cache (if available)
self.addEventListener('fetch', (e) => {
    e.respondWith((async () => {
        let r = await caches.match(e.request, {ignoreSearch: true});
        // Serve cached file
        if (r) { return r; }
        // Else fetch remote, cache, and serve
        let response = await fetch(e.request);
        // Don't cache map tiles
        if (!e.request.url.includes('openstreetmap')) {
          let cache = await caches.open(cacheName)
          cache.put(e.request, response.clone());
        }
        return response;
    })());
});