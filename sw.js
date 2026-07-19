// Service worker do Ju Pet.
// Objetivo: o app abrir e funcionar SEM internet (ela usa no salao, no celular).
// Estrategia: network-first para o HTML (pega a versao nova quando ha sinal),
// cache-first para os icones. Os DADOS nao passam por aqui: vivem no
// localStorage do navegador, e quem cuida deles e o backup dentro do app.
//
// Sem acentos de proposito: o deploy.ps1 reescreve este arquivo a cada
// publicacao, e o Windows PowerShell ja corrompeu os acentos uma vez.

// VERSAO e reescrita automaticamente pelo deploy.ps1 a cada publicacao.
// Isso e o que faz o navegador perceber que ha versao nova: se o sw.js nao muda
// nenhum byte, o browser nem verifica, e a Ju fica presa no app antigo para sempre.
// NAO editar a mao: o deploy cuida disso.
const VERSAO = '2026-07-19-181558';
const CACHE = 'jupet-' + VERSAO;
const ARQUIVOS = [
  './',
  './index.html',
  './manual.html',
  './agendar.html',
  './racas.js',
  './foto.js',
  './cofre.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png',
  './apple-touch-icon.png',
  './logo-marca.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      // addAll falha inteiro se um item falhar; tolera ausencias
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
  // cache:'no-store' impede que o cache HTTP do navegador devolva uma copia
  // velha por baixo do service worker.
  if (req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html')) {
    e.respondWith(
      fetch(new Request(req, { cache: 'no-store' }))
        .then(res => {
          const copia = res.clone();
          caches.open(CACHE).then(c => c.put(req, copia));
          return res;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('./index.html')))
    );
    return;
  }

  // Resto (icones, manifest): cache primeiro.
  e.respondWith(
    caches.match(req).then(r => r || fetch(req).then(res => {
      const copia = res.clone();
      caches.open(CACHE).then(c => c.put(req, copia));
      return res;
    }))
  );
});
