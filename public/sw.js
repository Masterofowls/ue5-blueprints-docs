const VERSION = "v1";
const STATIC_CACHE = `ue5-blueprints-static-${VERSION}`;
const RUNTIME_CACHE = `ue5-blueprints-runtime-${VERSION}`;

function getBasePath() {
  const scope = new URL(self.registration.scope).pathname;

  if (scope === "/") {
    return "";
  }

  return scope.endsWith("/") ? scope.slice(0, -1) : scope;
}

function withBasePath(pathname) {
  const basePath = getBasePath();
  return `${basePath}${pathname}`;
}

self.addEventListener("install", (event) => {
  const coreAssets = [
    withBasePath("/"),
    withBasePath("/blueprints/"),
    withBasePath("/categories/"),
    withBasePath("/search/"),
    withBasePath("/offline/"),
    withBasePath("/manifest.webmanifest"),
    withBasePath("/pwa-icon.svg"),
    withBasePath("/pwa-maskable.svg"),
  ];

  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => cache.addAll(coreAssets)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== STATIC_CACHE && key !== RUNTIME_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(request.url);

  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          void caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseClone));

          return response;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(request);

          if (cachedResponse) {
            return cachedResponse;
          }

          return (
            (await caches.match(withBasePath("/offline/"))) || Response.error()
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      const networkFetch = fetch(request)
        .then((response) => {
          const responseClone = response.clone();
          void caches
            .open(RUNTIME_CACHE)
            .then((cache) => cache.put(request, responseClone));

          return response;
        })
        .catch(() => cachedResponse || Response.error());

      return cachedResponse || networkFetch;
    }),
  );
});
