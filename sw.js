self.addEventListener("install", e => {
  self.skipWaiting();
  e.waitUntil(
    caches.open("notes-v2").then(c =>
      c.addAll([
        "./",
        "index.html",
        "app.js",
        "manifest.json"
      ])
    )
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== "notes-v2" && caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});