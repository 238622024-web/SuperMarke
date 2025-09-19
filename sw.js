// Service Worker para PWA - SuperMarket
const CACHE_NAME = 'supermarket-v1.0.2';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './logo.SuperMarket.jpg',
  './FachadaSuperMarket.jpg',
  './MacarraoDonaBenta.jpg',
  './MioloAcem.jpeg',
  './MolhoTomatePomodoro.jpg',
  './PapelHigFoFinho.jpg',
  './Pernil.jpeg',
  './PontaAgulha.png',
  './PontaAlcatra.jpeg',
  './QueijoMussarela.jpeg',
  './VinagreVitalia.jpg',
  'https://cdn.tailwindcss.com',
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap'
];

// Instalação do Service Worker
self.addEventListener('install', event => {
  console.log('SW: Instalando Service Worker');
  self.skipWaiting(); // Força ativação imediata
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('SW: Cache aberto');
        // Adiciona recursos um por um para melhor controle
        return Promise.all(
          urlsToCache.map(url => {
            return cache.add(url).catch(error => {
              console.warn('SW: Erro ao fazer cache de:', url, error);
              return Promise.resolve(); // Continua mesmo com erro
            });
          })
        );
      })
      .then(() => {
        console.log('SW: Cache concluído');
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
    Promise.all([
      // Limpa caches antigos
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== CACHE_NAME) {
              console.log('SW: Removendo cache antigo:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Assume controle imediato
      self.clients.claim()
    ])
  );
});

// Interceptação de requisições
self.addEventListener('fetch', event => {
  // Ignora requisições não-HTTP
  if (!event.request.url.startsWith('http')) {
    return;
  }
  
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Se encontrou no cache, retorna
        if (response) {
          return response;
        }
        
        // Para imagens, tenta diferentes estratégias
        if (event.request.destination === 'image') {
          // Primeiro tenta buscar na rede
          return fetch(event.request)
            .then(response => {
              if (response && response.status === 200) {
                // Clona e adiciona ao cache
                const responseToCache = response.clone();
                caches.open(CACHE_NAME)
                  .then(cache => {
                    cache.put(event.request, responseToCache);
                  });
                return response;
              }
              // Se falhar, retorna uma imagem placeholder
              return new Response(
                '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Carregando...</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            })
            .catch(() => {
              // Fallback para placeholder
              return new Response(
                '<svg width="300" height="200" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f3f4f6"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#6b7280">Imagem indisponível</text></svg>',
                { headers: { 'Content-Type': 'image/svg+xml' } }
              );
            });
        }
        
        // Para outros recursos, busca na rede
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