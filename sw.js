const CACHE_NAME = 'supermarket-v1.6';
const IMG_FULL_CACHE = 'supermarket-img-full-v1';
const IMG_THUMB_CACHE = 'supermarket-img-thumb-v1';

// Detecta automaticamente se está no GitHub Pages ou local e calcula subpasta dinâmica
const isGitHubPages = self.location.hostname.includes('github.io');
// Ex.: em https://usuario.github.io/RepoName/ => pathname começa com /RepoName/
let BASE_URL = '/';
if (isGitHubPages) {
  const parts = self.location.pathname.split('/').filter(Boolean); // [ 'RepoName', 'sw.js' ]
  if (parts.length > 0) {
    BASE_URL = `/${parts[0]}/`;
  }
}

const urlsToCache = [
  BASE_URL,
  BASE_URL + 'index.html',
  BASE_URL + 'manifest.json',
  // Logos e imagens principais (adicione aqui conforme necessidade offline)
  BASE_URL + 'logo.SuperMarket.jpg',
  BASE_URL + 'FachadaSuperMarket.jpg',
  BASE_URL + 'SabaoBrilhante.jpg',
  BASE_URL + 'CafePILAO.png',
  BASE_URL + 'PapelHigFoFinho.jpg',
  BASE_URL + 'MolhoTomatePomodoro.jpg',
  BASE_URL + 'LeiteJussara.jpg',
  BASE_URL + 'Ovos20.jpg'
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
  const req = event.request;
  const url = new URL(req.url);

  // Estratégia para imagens de ofertas
  if (req.destination === 'image') {
    const isThumb = /\/thumbs\//.test(url.pathname) || /-300w\.(avif|webp|jpe?g|png)$/i.test(url.pathname);
    // Thumbnails: cache-first
    if (isThumb) {
      event.respondWith(
        caches.open(IMG_THUMB_CACHE).then(cache =>
          cache.match(req).then(cached => {
            if (cached) return cached;
            return fetch(req).then(netRes => {
              if (netRes.status === 200) cache.put(req, netRes.clone());
              return netRes;
            }).catch(()=> cached);
          })
        )
      );
      return;
    }
    // Imagens full: stale-while-revalidate
    event.respondWith(
      caches.open(IMG_FULL_CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(netRes => {
            if (netRes.status === 200) cache.put(req, netRes.clone());
            return netRes;
          }).catch(()=> cached);
          return cached || fetchPromise;
        })
      )
    );
    return;
  }

  // Demais requisições: network-first (como antes)
  event.respondWith(
    fetch(req)
      .then(response => {
        if (response.status === 200) {
          const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(req, clone));
        }
        return response;
      })
      .catch(()=> caches.match(req).then(match => {
        if (match) return match;
        if (req.destination === 'document') {
          return caches.match(BASE_URL + 'index.html');
        }
      }))
  );
});

// Escuta mensagens do cliente para forçar atualização
self.addEventListener('message', function(event) {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
