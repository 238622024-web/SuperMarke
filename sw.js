// Service Worker para PWA - SuperMarket
const CACHE_NAME = 'supermarket-v1.0.0';
const urlsToCache = [
  '/SuperMarke/',
  '/SuperMarke/index.html',
  '/SuperMarke/manifest.json',
  '/SuperMarke/logo.SuperMarket.jpg',
  '/SuperMarke/FachadaSuperMarket.jpg',
  '/SuperMarke/MacarraoDonaBenta.jpg',
  '/SuperMarke/MioloAcem.jpeg',
  '/SuperMarke/MolhoTomatePomodoro.jpg',
  '/SuperMarke/PapelHigFoFinho.jpg',
  '/SuperMarke/Pernil.jpeg',
  '/SuperMarke/PontaAgulha.png',
  '/SuperMarke/PontaAlcatra.jpeg',
  '/SuperMarke/QueijoMussarela.jpeg',
  '/SuperMarke/VinagreVitalia.jpg',
  'https://cdn.tailwindcss.com/3.3.6/tailwind.min.css'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('SW: Instalando Service Worker');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache aberto');
        return cache.addAll(urlsToCache);
      })
      .catch(error => {
        console.error('SW: Erro ao fazer cache:', error);
      })
  );
});

// Ativação do Service Worker
self.addEventListener('activate', event => {
  console.log('SW: Ativando Service Worker');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('SW: Removendo cache antigo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }
        
        // Senão, busca na rede
        return fetch(event.request)
          .then(response => {
            // Verifica se a resposta é válida
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Clona a resposta para adicionar ao cache
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
              
            return response;
          })
          .catch(() => {
            // Em caso de erro na rede, retorna página offline personalizada
            if (event.request.destination === 'document') {
              return caches.match('/SuperMarke/index.html');
            }
          });
      })
  );
});

// Notificações Push (preparado para futuro)
self.addEventListener('push', event => {
  if (event.data) {
    const options = {
      body: event.data.text(),
      icon: '/SuperMarke/logo.SuperMarket.jpg',
      badge: '/SuperMarke/logo.SuperMarket.jpg',
      vibrate: [200, 100, 200],
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
      self.registration.showNotification('SuperMarket - Nova Oferta!', options)
    );
  }
});

// Cliques em notificações
self.addEventListener('notificationclick', event => {
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/SuperMarke/#ofertas')
    );
  }
});

// Background Sync (para futuras funcionalidades)
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  return new Promise((resolve) => {
    console.log('SW: Executando sincronização em segundo plano');
    // Aqui seria implementada a lógica de sincronização
    resolve();
  });
}