// Service worker do Ju Pet.
// Objetivo: o app abrir e funcionar SEM internet (ela usa no salão, no celular).
// Estratégia: network-first para o HTML (pega a versão nova quando há sinal),
// cache-first para os ícones. Os DADOS não passam por aqui — vivem no
// localStorage do navegador; quem cuida deles é o backup dentro do app.

const CACHE = 'jupet-v1';
const ARQUIVOS = [
  './',
  './index.html',
  './manual.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll falha inteiro se um item falhar; tolera ausências
      .then(c => Promise.allSettled(ARQUIVOS.map(a => c.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;

  // HTML: tenta a rede primeiro, cai no cache quando estiver offline.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(req)
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Resto (ícones, manifest): cache primeiro.
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
      return res;
    }))
  );
});
