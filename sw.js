const CACHE = 'chokin-v7';
const CORE = ['./', './index.html', './manifest.webmanifest', './icon-192.png'];
self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('chokin-') && k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
// ネット優先、つながらない時はキャッシュ（オフラインでも開ける）
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  // 自分磨きログ（/beauty/）は別アプリなので貯金アプリでは扱わない
  if (new URL(e.request.url).pathname.includes('/beauty/')) return;
  e.respondWith(
    fetch(e.request).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
