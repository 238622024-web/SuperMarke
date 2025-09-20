const CACHE_NAME = 'supermarket-v1.4';

// Detecta automaticamente se está no GitHub Pages ou local
const isGitHubPages = self.location.hostname.includes('github.io');
const BASE_URL = isGitHubPages ? '/SuperMarke/' : '/';

const urlsToCache = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.json',
  BASE_URL + 'logo.SuperMarket.jpg',
  BASE_URL + 'FachadaSuperMarket.jpg',
  BASE_URL + 'AnaMaria.png',
  BASE_URL + 'Coentro.jpeg',
  BASE_URL + 'CouveManteiga.jpeg',
  BASE_URL + 'Skol269ml.jpeg',
  BASE_URL + 'sausa.jpg'
];

console.log('SW: Ambiente detectado:', isGitHubPages ? 'GitHub Pages' : 'Local');
console.log('SW: BASE_URL:', BASE_URL);

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
              return caches.match(BASE_URL + 'index.html');
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
