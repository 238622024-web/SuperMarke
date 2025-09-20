const CACHE_NAME = 'supermarket-v1.1';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.SuperMarket.jpg',
  '/FachadaSuperMarket.jpg',
  '/AnaMaria.png',
  '/Coentro.jpeg',
  '/CouveManteiga.jpeg',
  '/Skol269ml.jpeg',
  '/sausa.jpg'
];

// Instalação do Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
  );
  // Força a ativação imediata
  self.skipWaiting();
});

// Ativação do Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          // Remove caches antigos
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  // Assume controle imediato de todas as páginas
  return self.clients.claim();
});

// Intercepta requisições de rede
self.addEventListener('fetch', function(event) {
  event.respondWith(
    // Sempre tenta buscar da rede primeiro para conteúdo atualizado
    fetch(event.request)
      .then(function(response) {
        // Se a resposta é válida, clona e salva no cache
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(function() {
        // Se falhar (offline), busca do cache
        return caches.match(event.request)
          .then(function(response) {
            if (response) {
              return response;
            }
            // Se não estiver no cache, retorna página offline básica
            if (event.request.destination === 'document') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Escuta mensagens do cliente para forçar atualização
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
