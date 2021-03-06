const STATIC_CACHE = "static-cache-v1";
const RUNTIME_CACHE = "runtime-cache";
const FILES_TO_CACHE = [
    "/",
    "/db.js",
    "/index.html",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png",
    
];

// install
self.addEventListener("install", function (evt) {
    // pre cache image data
    //   evt.waitUntil(
    //     caches.open(DATA_CACHE_NAME).then((cache) => cache.add("/api/icons"))
    //   );
    // pre cache all static assets
    evt.waitUntil(
        caches.open(STATIC_CACHE).
        then(cache => cache.addAll(FILES_TO_CACHE))
        
             
    );
    // tell the browser to activate this service worker immediately once it
    // has finished installing
      self.skipWaiting();
});

// self.addEventListener("activate", function(evt) {
//   evt.waitUntil(
//     caches.keys().then(keyList => {
//       return Promise.all(
//         keyList.map(key => {
//           if (key !== STATIC_CACHE && key !== RUNTIME_CACHE) {
//             console.log("Removing old cache data", key);
//             return caches.delete(key);
//           }
//         })
//       );
//     })
//   );

//   self.clients.claim();
// });

// fetch
self.addEventListener("fetch", function (evt) {
    if (evt.request.url.includes("/api/")) {
        evt.respondWith(
            caches.open(RUNTIME_CACHE).then(cache => {
                return fetch(evt.request)
                    .then(response => {
                        // If the response was good, clone it and store it in the cache.
                        if (response.status === 200) {
                            cache.put(evt.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err => {
                        // Network request failed, try to get it from the cache.
                        return cache.match(evt.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    evt.respondWith(
        fetch(evt.request).catch(function () {
            return caches.match(evt.request).then(function (response) {
                if (response) {
                    return response;
                } else if (evt.request.headers.get("accept").includes("text/html")) {
                    // return the cached home page for all requests for html pages
                    return caches.match("/");
                }
            });
        })
    )
});
