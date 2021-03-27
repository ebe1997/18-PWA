const FILES_TO_CACHE = [
  "/",
  "/index.html",
  "db.js",
  "index.js",
  "styles.css",
  "manifest.json",
  "service-worker.js"
];


const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";
const CACHE_NAME = "static-cache-v1"
const DATA_CACHE_NAME = "data-cache-v1"
self.addEventListener("install", function (evt) {
  evt.waitUntil(
    caches
      .open(STATIC_CACHE)
      .then(cache => cache.addAll(FILES_TO_CACHE))
      .then(() => self.skipWaiting())
  );
});

// The activate handler takes care of cleaning up old caches.
self.addEventListener("activate", function (evt) {
  // const currentCaches = [STATIC_CACHE, RUNTIME_CACHE];
  evt.waitUntil(
    caches
      .keys()
      .then((keyList) => {
        return Promise.all(
          keyList.map((key) => {
            if (key !== CACHE_NAME && key !== DATA_CACHE_NAME) {
              console.log("Removing old cache data", key);
              return caches.delete(key);
           
        // return array of cache names that are old to delete
      //   return keyList.filter(
      //     cacheName => !currentCaches.includes(cacheName)
      //   );
      // })
      // .then(cachesToDelete => {
      //   return Promise.all(
      //     cachesToDelete.map(cacheToDelete => {
      //       return caches.delete(cacheToDelete);
      //     })
      //   );
      // })
                }
              })
            )}
          ))
     self.clients.claim()
   
})    
self.addEventListener("fetch", function (evt) {
  if (evt.request.url.includes("/api/")) {
    evt.respondWith(
      caches
        .open(DATA_CACHE_NAME)
        .then((cache) => {
          return fetch(evt.request)
            .then((response) => {
              // If the response was good, clone it and store it in the cache.
              if (response.status === 200) {
                cache.put(evt.request.url, response.clone());
              }

              return response;
            })
            .catch((err) => {
              // Network request failed, try to get it from the cache.
              return cache.match(evt.request);
            });
        })
        .catch((err) => console.log(err))
    );

    return;
  }
// self.addEventListener("fetch", event => {
//   // non GET requests are not cached and requests to other origins are not cached
//   if (
//     event.request.method !== "GET" ||
//     !event.request.url.startsWith(self.location.origin)
//   ) {
//     event.respondWith(fetch(event.request));
//     return;
//   }

  // handle runtime GET requests for data from /api routes
  if (evt.request.url.includes("/api/")) {
    // make network request and fallback to cache if network request fails (offline)
    evt.respondWith(
      caches.open(RUNTIME_CACHE).then(cache => {
        return fetch(evt.request)
          .then(response => {
            cache.put(evt.request, response.clone());
            return response;
          })
          .catch(() => caches.match(evt.request));
      })
    );
    return;
  }
evt.respondWith(
  caches.open(
    CACHE_NAME
  )
  .then((cache)=> {
    return cache.match(evt.request).then((
      response
    )=>{
      return response || fetch(evt.request)
    })
  })
)
  // use cache first for all other requests for performance
  // evt.respondWith(
  //   caches.match(evt.request).then(cachedResponse => {
  //     if (cachedResponse) {
  //       return cachedResponse;
  //     }

  //     // request is not in cache. make network request and cache the response
  //     return caches.open(RUNTIME_CACHE).then(cache => {
  //       return fetch(evt.request).then(response => {
  //         return cache.put(evt.request, response.clone()).then(() => {
  //           return response;
  //         });
  //       });
  //     });
    })
