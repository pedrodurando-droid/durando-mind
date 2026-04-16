// ============================================================
// Durando Mind — Service Worker
// Estratégia: Cache First para arquivos do app (funciona offline)
//             Network First para APIs externas (Google, Groq, etc.)
// ============================================================

const CACHE_NAME = 'durando-mind-v1';

// Arquivos que ficam em cache para funcionar offline
const ASSETS_TO_CACHE = [
  './durando-mind.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Domínios de API — sempre vão pela rede (nunca do cache)
const NETWORK_ONLY_DOMAINS = [
  'api.groq.com',
  'api.openai.com',
  'api.anthropic.com',
  'googleapis.com',
  'accounts.google.com',
  'oauth2.googleapis.com'
];

// ============================================================
// INSTALL — faz cache dos arquivos do app
// ============================================================
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Fazendo cache dos arquivos do app...');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================================
// ACTIVATE — remove caches antigos
// ============================================================
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] Removendo cache antigo:', key);
            return caches.delete(key);
          })
      )
    ).then(() => self.clients.claim())
  );
});

// ============================================================
// FETCH — decide se vai na rede ou no cache
// ============================================================
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  // APIs externas: sempre vai pela rede
  const isNetworkOnly = NETWORK_ONLY_DOMAINS.some(domain =>
    url.hostname.includes(domain)
  );

  if (isNetworkOnly) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Arquivos do app: Cache First (funciona offline)
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) {
        // Atualiza o cache em background (stale-while-revalidate)
        fetch(event.request)
          .then(response => {
            if (response && response.status === 200) {
              caches.open(CACHE_NAME).then(cache => {
                cache.put(event.request, response.clone());
              });
            }
          })
          .catch(() => {}); // ignora erros offline
        return cached;
      }

      // Não está no cache: vai buscar na rede
      return fetch(event.request).then(response => {
        if (!response || response.status !== 200 || response.type === 'opaque') {
          return response;
        }
        // Salva no cache para uso futuro
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseToCache);
        });
        return response;
      }).catch(() => {
        // Offline e não está em cache: retorna o HTML principal como fallback
        return caches.match('./durando-mind.html');
      });
    })
  );
});
