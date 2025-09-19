const CACHE_NAME = 'supermarket-v1.0.0';
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
        console.log('Service Worker: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(function(error) {
        console.log('Service Worker: Erro ao cachear:', error);
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
    })
  );
});

// Interceptar requisições
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Retorna do cache se encontrado
        if (response) {
          console.log('Service Worker: Servindo do cache:', event.request.url);
          return response;
        }

        // Senão, busca na rede
        console.log('Service Worker: Buscando na rede:', event.request.url);
        return fetch(event.request).then(function(response) {
          // Verifica se é uma resposta válida
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }

          // Clona a resposta
          var responseToCache = response.clone();

          caches.open(CACHE_NAME)
            .then(function(cache) {
              cache.put(event.request, responseToCache);
            });

          return response;
        }).catch(function() {
          // Fallback para offline - página de erro personalizada
          if (event.request.destination === 'document') {
            return new Response(`
              <!DOCTYPE html>
              <html>
              <head>
                <title>SuperMarket - Offline</title>
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { 
                    font-family: Arial, sans-serif; 
                    text-align: center; 
                    padding: 50px; 
                    background: linear-gradient(135deg, #22c55e, #16a34a);
                    color: white;
                    min-height: 100vh;
                    margin: 0;
                    display: flex;
                    flex-direction: column;
                    justify-content: center;
                  }
                  .offline-container {
                    background: rgba(255,255,255,0.1);
                    padding: 2rem;
                    border-radius: 1rem;
                    backdrop-blur: 10px;
                  }
                  h1 { color: #fff; margin-bottom: 1rem; }
                  p { margin-bottom: 1.5rem; }
                  .retry-btn {
                    background: #fff;
                    color: #22c55e;
                    padding: 0.75rem 1.5rem;
                    border: none;
                    border-radius: 0.5rem;
                    font-weight: bold;
                    cursor: pointer;
                  }
                </style>
              </head>
              <body>
                <div class="offline-container">
                  <h1>🛒 SuperMarket</h1>
                  <h2>📱 Você está offline</h2>
                  <p>Não foi possível conectar à internet.<br>Verifique sua conexão e tente novamente.</p>
                  <button class="retry-btn" onclick="window.location.reload()">🔄 Tentar Novamente</button>
                </div>
              </body>
              </html>
            `, {
              headers: {'Content-Type': 'text/html'}
            });
          }
        });
      })
  );
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