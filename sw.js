const CACHE_NAME = 'supermarket-v1.3.0';
const urlsToCache = [
  '/SuperMarke/',
  '/SuperMarke/index.html',
  '/SuperMarke/manifest.json',
  '/SuperMarke/logo.SuperMarket.jpg',
  '/SuperMarke/FachadaSuperMarket.jpg',
  '/SuperMarke/QueijoMussarela.jpeg',
  '/SuperMarke/MolhoTomatePomodoro.jpg',
  '/SuperMarke/MacarraoDonaBenta.jpg',
  '/SuperMarke/VinagreVitalia.jpg',
  '/SuperMarke/PapelHigFoFinho.jpg',
  '/SuperMarke/PontaAgulha.png',
  '/SuperMarke/MioloAcem.jpeg',
  '/SuperMarke/Pernil.jpeg',
  '/SuperMarke/PontaAlcatra.jpeg',
  'https://cdn.tailwindcss.com',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.css',
  'https://cdn.jsdelivr.net/npm/swiper@11/swiper-bundle.min.js'
];

// Instalar o Service Worker
self.addEventListener('install', function(event) {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Service Worker: Cache aberto, adicionando recursos...');
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn('Service Worker: Falha ao cachear:', url, error);
              return Promise.resolve();
            });
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Recursos cacheados com sucesso!');
        return self.skipWaiting();
      })
      .catch(function(error) {
        console.log('Service Worker: Erro geral ao cachear:', error);
      })
  );
});

// Ativar o Service Worker
self.addEventListener('activate', function(event) {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (cacheName !== CACHE_NAME) {
            console.log('Service Worker: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker: Ativado!');
      return self.clients.claim();
    })
  );
});

// Interceptar requisições - Strategy otimizada para imagens
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const url = request.url;
  
  // Strategy: Cache First para imagens e recursos estáticos
  if (request.destination === 'image' || 
      url.includes('.jpg') || 
      url.includes('.jpeg') || 
      url.includes('.png') || 
      url.includes('.svg') ||
      url.includes('tailwindcss') ||
      url.includes('googleapis') ||
      url.includes('jsdelivr')) {
    
    event.respondWith(
      caches.match(request)
        .then(function(cachedResponse) {
          if (cachedResponse) {
            console.log('Service Worker: Imagem servida do cache:', url);
            return cachedResponse;
          }
          
          // Se não estiver no cache, busca da rede e adiciona ao cache
          console.log('Service Worker: Buscando imagem da rede:', url);
          return fetch(request)
            .then(function(networkResponse) {
              if (networkResponse && networkResponse.status === 200) {
                const responseToCache = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then(function(cache) {
                    cache.put(request, responseToCache);
                    console.log('Service Worker: Imagem adicionada ao cache:', url);
                  });
              }
              return networkResponse;
            })
            .catch(function(error) {
              console.error('Service Worker: Erro ao buscar imagem:', url, error);
              // Continua funcionando mesmo se uma imagem falhar
              return new Response('', {status: 200});
            });
        })
    );
  }
  // Strategy: Network First para HTML e outros recursos
  else {
    event.respondWith(
      fetch(request)
        .then(function(networkResponse) {
          if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(request, responseToCache);
              });
          }
          return networkResponse;
        })
        .catch(function() {
          console.log('Service Worker: Erro de rede, tentando cache:', url);
          return caches.match(request)
            .then(function(cachedResponse) {
              if (cachedResponse) {
                return cachedResponse;
              }
              
              // Fallback simples para documentos offline
              if (request.destination === 'document') {
                return caches.match('/SuperMarke/index.html');
              }
              
              return new Response('', {status: 200});
            });
        })
    );
  }
});

// Push notifications (para futuras promoções)
self.addEventListener('push', function(event) {
  console.log('Service Worker: Push recebido');
  
  const options = {
    body: event.data ? event.data.text() : 'Nova oferta disponível!',
    icon: '/SuperMarke/logo.SuperMarket.jpg',
    badge: '/SuperMarke/logo.SuperMarket.jpg',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore', 
        title: 'Ver Ofertas',
        icon: '/SuperMarke/logo.SuperMarket.jpg'
      },
      {
        action: 'close', 
        title: 'Fechar',
        icon: '/SuperMarke/logo.SuperMarket.jpg'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('🛒 SuperMarket', options)
  );
});

// Clique em notificação
self.addEventListener('notificationclick', function(event) {
  console.log('Service Worker: Clique em notificação');
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/SuperMarke/#ofertas')
    );
  }
});