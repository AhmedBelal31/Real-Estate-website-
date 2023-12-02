'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';

const RESOURCES = {"assets/AssetManifest.bin": "05cc10f418a73d7c5a7fb0df93fd6c3e",
"assets/AssetManifest.bin.json": "fcb10bb34579970a720032ee66ae1f69",
"assets/AssetManifest.json": "e0727e9e36e65172cb1349ca81ee47af",
"assets/assets/icons/check.svg": "bd55b254d4d7dd63b5d4ba8305f27f86",
"assets/assets/icons/download.svg": "1bf3a840ce8a813ca7dbdbc51bf40784",
"assets/assets/icons/dribble.svg": "171806084338c49230406459937592d5",
"assets/assets/icons/github.svg": "db3aea25cc4ed83f9f4d2c9bfb23519d",
"assets/assets/icons/linkedin.svg": "fbddffa7a3158f789f28787fd7781f93",
"assets/assets/icons/twitter.svg": "ddf090dc55602c2b82eca70de69ea058",
"assets/assets/images/background.jpg": "6c30401cffa8c55fcb28461ad9871eae",
"assets/assets/images/client-01.jpg": "a8cf784c0b156eca9abc445bda2b60ce",
"assets/assets/images/client-02.jpg": "e25622d13030aae60d54843c38588c04",
"assets/assets/images/client-03.jpg": "1c40bab606aefabf545df0f535107dcd",
"assets/assets/images/logo.png": "85f483b926b14da6a87ed097761ae50f",
"assets/assets/images/project-01.jpg": "9732f3ae219a179802313b0c6d592d52",
"assets/assets/images/project-02.jpg": "dc60d019ee7f5546d8b815ce9ca837fa",
"assets/assets/images/project-03.jpg": "ad46b01c47af2cd3d1431e06494caffc",
"assets/assets/images/project-04.jpg": "54d3c3cacbe54c6acf176e6bc0ef0e9c",
"assets/assets/images/project-05.jpg": "3b8a778a22ef08e5bab2ed9c41749be1",
"assets/assets/images/project-06.jpg": "69c1835b11602d73f02f10a2238ca881",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/fonts/MaterialIcons-Regular.otf": "c0e361a7ccac7b0f1b5ac1aa6505eb7f",
"assets/NOTICES": "f466628ffe0c7dd02bbe4ca44512d5c9",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "89ed8f4e49bcdfc0b5bfc9b24591e347",
"assets/shaders/ink_sparkle.frag": "4096b5150bac93c41cbc9b45276bd90f",
"canvaskit/canvaskit.js": "321aa0c874f6112cabafc27a74a784b4",
"canvaskit/canvaskit.js.symbols": "34eb740000df15c03210028f34bc9cf5",
"canvaskit/canvaskit.wasm": "2778fe4a13eac805b37df04590085ba3",
"canvaskit/chromium/canvaskit.js": "bc979fce6b4b3cc75d54b0d162cafaa7",
"canvaskit/chromium/canvaskit.js.symbols": "afe994e4d3d6d23db1d643573c9839ce",
"canvaskit/chromium/canvaskit.wasm": "1ec8ac7ed8ea5906c2e03fc14cb2c22a",
"canvaskit/skwasm.js": "411f776c9a5204d1e466141767f5a8fa",
"canvaskit/skwasm.js.symbols": "36607a151127e3736083d241f6e7356b",
"canvaskit/skwasm.wasm": "045364c77c9eedecbd12d2c77fe8fa0a",
"canvaskit/skwasm.worker.js": "bfb704a6c714a75da9ef320991e88b03",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"flutter.js": "5aee128657b91f4e3e1eeec85c7ee066",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"icons/Icon-maskable-192.png": "c457ef57daa1d16f64b27b786ec2ea3c",
"icons/Icon-maskable-512.png": "301a7604d45b3e739efc881eb04896ea",
"index.html": "34c324f3fe8b10098d40d05ab4fe94fa",
"/": "34c324f3fe8b10098d40d05ab4fe94fa",
"main.dart.js": "0968073036944b4e992366087a4bc547",
"manifest.json": "7348cfaacbbbab1e1b32c6469dd28b78",
"version.json": "a7c8c16d726467472e019fead389906e"};
// The application shell files that are downloaded before a service worker can
// start.
const CORE = ["main.dart.js",
"index.html",
"assets/AssetManifest.bin.json",
"assets/FontManifest.json"];

// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value, {'cache': 'reload'})));
    })
  );
});
// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        // Claim client to enable caching on first launch
        self.clients.claim();
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      // Claim client to enable caching on first launch
      self.clients.claim();
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});
// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache only if the resource was successfully fetched.
        return response || fetch(event.request).then((response) => {
          if (response && Boolean(response.ok)) {
            cache.put(event.request, response.clone());
          }
          return response;
        });
      })
    })
  );
});
self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});
// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey of Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}
// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
