const CACHE_NAME = "calex-shell-v72";
const SQLITE_ENGINE_URL = "https://cdn.jsdelivr.net/npm/sql.js@1.15.1/dist/sql-wasm-inline.js";
const APP_SHELL = [
  "./",
  "./index.html",
  "./privacy.html",
  "./terms.html",
  "./styles.css?v=72",
  "./workspace.css?v=72",
  "./calendar.css?v=72",
  "./productivity.css?v=72",
  "./productivity-advanced.css?v=72",
  "./workspace.js?v=72",
  "./productivity.js?v=72",
  "./productivity-advanced.js?v=72",
  "./productivity-sync.js?v=72",
  "./icons.js?v=72",
  "./sync.js?v=72",
  "./ics.js?v=72",
  "./app.js?v=72",
  "./i18n.js?v=72",
  "./sqlite-store.js?v=72",
  "./gmail-config.js?v=72",
  "./gmail.js?v=72",
  "./manifest.webmanifest",
  "./icon.svg",
  "./icon-192.png",
  "./icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter(
              (key) => key.startsWith("calex-shell-") && key !== CACHE_NAME,
            )
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  if (request.url === SQLITE_ENGINE_URL) {
    event.respondWith(
      caches.open(CACHE_NAME).then(async (cache) => {
        const cached = await cache.match(request);
        if (cached) return cached;
        const response = await fetch(request);
        if (response.ok) cache.put(request, response.clone()).catch(() => {});
        return response;
      }),
    );
    return;
  }

  if (new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches
              .open(CACHE_NAME)
              .then((cache) => cache.put("./index.html", copy));
          }
          return response;
        })
        .catch(
          async () =>
            (await caches.match(request)) ||
            (await caches.match("./index.html")),
        ),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
