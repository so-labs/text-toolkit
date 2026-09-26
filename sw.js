/**
 * キャッシュバージョンの命名規則:
 * text-toolkit-YYYY.MM-rN
 *
 * YYYY = 西暦
 * MM   = 月（01〜12）
 * rN   = その月のリリース回数
 */
const CACHE_NAME = 'text-toolkit-2026.09-r7';
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './script.js',
  './modules/ai-service.js',
  './modules/toast.js',
  './modules/theme.js',
  './modules/utils.js',
  './modules/converters.js',
  './modules/i18n.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

// インストール時に静的キャッシュを取得
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// 有効化時に古いキャッシュを整理
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
    })
  );
  self.clients.claim();
});

// フェッチ戦略:
// - ナビゲーション (HTML): network-first。新しい index.html と古い JS の
//   バージョンスキュー (新HTML+旧JSで翻訳キーが生表示になる問題) を防ぐため。
//   ネットワーク失敗時のみキャッシュにフォールバックする。
// - その他のアセット (JS/CSS/画像): stale-while-revalidate。
//   キャッシュを即返しつつ、裏で取得してキャッシュを更新する。
self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  // ナビゲーションリクエストは network-first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((networkResponse) => {
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return networkResponse;
        })
        .catch(() => caches.match(request).then((cached) => cached || caches.match('./index.html')))
    );
    return;
  }

  // 静的アセットは stale-while-revalidate
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((networkResponse) => {
          // 不正なレスポンスはキャッシュしない
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return networkResponse;
        })
        .catch(() => cachedResponse);
      return cachedResponse || networkFetch;
    })
  );
});
