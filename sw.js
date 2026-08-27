/* Service worker: juego 100% offline una vez cargado.
   Importante en la calle, donde la cobertura falla. */
const CACHE = "testamento-v8";
const ASSETS = [
  "./img/home_madrid.jpg",
  "./img/historiador.jpg",
  "./img/historiador_retrato.jpg",
  "./img/prologo.jpg",
  "./img/etapa1.jpg",
  "./img/etapa2.jpg",
  "./img/etapa3.jpg",
  "./img/etapa4.jpg",
  "./img/etapa5.jpg",
  "./img/etapa6.jpg",
  "./",
  "./index.html",
  "./css/styles.css",
  "./js/i18n.js",
  "./js/data.js",
  "./js/art.js",
  "./js/license.js",
  "./js/engine.js",
  "./js/app.js",
  "./manifest.webmanifest",
  "./icons/icon.svg",
];

self.addEventListener("install", (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (e) => {
  if (e.request.method !== "GET") return;
  e.respondWith(
    caches.match(e.request).then(
      (cached) =>
        cached ||
        fetch(e.request).then((res) => {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(e.request, copy));
          return res;
        })
    )
  );
});
