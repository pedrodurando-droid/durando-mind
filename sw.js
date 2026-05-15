// ============================================================
// Durando Mind — Service Worker
// Estratégia: Cache First para arquivos do app (funciona offline)
//             Network First para APIs externas (Google, Groq, etc.)
// ============================================================

const CACHE_NAME = 'durando-mind-v6';

// Firebase Cloud Messaging usa o mesmo service worker do PWA para receber
// notificacoes push quando o app esta fechado.
try {
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
  importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

  firebase.initializeApp({
    apiKey: 'AIzaSyAyc1gGcLFbDmCw2szpZUkIynndA93F46w',
    authDomain: 'durando-mind.firebaseapp.com',
    projectId: 'durando-mind',
    storageBucket: 'durando-mind.firebasestorage.app',
    messagingSenderId: '345353224358',
    appId: '1:345353224358:web:679533d0a587c760efb467'
  });

  const messaging = firebase.messaging();
  messaging.onBackgroundMessage(payload => {
    const title = payload.notification?.title || payload.data?.title || 'Jornal Durando Mind';
    const options = {
      body: payload.notification?.body || payload.data?.body || 'Abra o Jornal para ler o destaque do dia.',
      icon: payload.notification?.icon || './icon-192.png',
      badge: './icon-192.png',
      data: payload.data || {}
    };
    self.registration.showNotification(title, options);
  });
} catch (error) {
  console.warn('[SW] Firebase Messaging indisponivel:', error);
}

self.addEventListener('notificationclick', event => {
  event.notification.close();
  // Dados do artigo enviados pelo backend (sendJournalPush)
  const data = event.notification.data || {};
  const targetUrl = (self.registration.scope || './') + 'durando-mind.html#jornal';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
      // Se já tem uma janela aberta, foca e navega para #jornal
      for (const client of clientList) {
        if (client.url && client.url.includes('durando-mind')) {
          return client.focus().then(focused => {
            // Envia mensagem para o app abrir a aba Jornal
            focused.postMessage({ type: 'JOURNAL_NOTIFICATION_CLICK', data });
            return focused;
          });
        }
      }
      // Nenhuma janela aberta: abre o app na aba Jornal
      if (clients.openWindow) return clients.openWindow(targetUrl);
      return null;
    })
  );
});

// Arquivos que ficam em cache para funcionar offline
const ASSETS_TO_CACHE = [
  './durando-mind.html',
  './journal.css',
  './journal.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Domínios de API — sempre vão pela rede (nunca do cache)
const NETWORK_ONLY_DOMAINS = [
  'api.groq.com',
  'api.openai.com',
  'api.anthropic.com',
  'api.rss2json.com',
  'gnews.io',
  'news.google.com',
  'googleapis.com',
  'accounts.google.com',
  'oauth2.googleapis.com',
  'firebaseinstallations.googleapis.com',
  'fcmregistrations.googleapis.com',
  'fcm.googleapis.com'
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

  // HTML principal: Network First para evitar que o PWA mostre uma versao antiga
  // depois de atualizacoes grandes como a aba Jornal.
  const isAppShell =
    event.request.mode === 'navigate' ||
    url.pathname.endsWith('/durando-mind.html') ||
    url.pathname.endsWith('/');

  if (isAppShell) {
    event.respondWith(
      fetch(event.request)
        .then(response => {
          if (response && response.status === 200) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put('./durando-mind.html', copy));
          }
          return response;
        })
        .catch(() => caches.match('./durando-mind.html'))
    );
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
