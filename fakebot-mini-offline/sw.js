const CACHE_NAME = "fakebot-mini-offline-20260729-infinite-harmony";
const APP_FILES = [
  "./",
  "./index.html",
  "./app.html",
  "./fakebot-source/offline-harmony-v2-01.js",
  "./fakebot-source/offline-harmony-v2-02.js",
  "./fakebot-source/offline-harmony-v2-03.js",
  "./shell.css",
  "./shell.js",
  "./mini-frame.css",
  "./mini-ui.js",
  "./miditar-midi.js",
  "./offline-engine.js",
  "./manifest.webmanifest",
  "./fakebot-mini-offline-icon-180.png",
  "./fakebot-mini-offline-icon.svg"
];

self.addEventListener("install",event=>{
  event.waitUntil(caches.open(CACHE_NAME).then(cache=>cache.addAll(APP_FILES)));
  self.skipWaiting();
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(key=>key.startsWith("fakebot-mini-offline-") && key !== CACHE_NAME).map(key=>caches.delete(key))))
      .then(()=>self.clients.claim())
  );
});

self.addEventListener("fetch",event=>{
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request,{ignoreSearch:true})
      .then(cached=>cached || fetch(event.request).then(response=>{
        if (response.ok){
          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache=>cache.put(event.request,copy));
        }
        return response;
      }))
      .catch(()=>caches.match("./index.html"))
  );
});
