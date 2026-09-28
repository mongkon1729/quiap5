// Service worker: lets the site open and run quizzes without internet.
// Pages, scripts and styles: try the network first (so the teacher's updates show up),
// fall back to the saved copy when offline. Pictures and fonts: saved copy first.
// Google Apps Script requests are never touched (scores have their own outbox).
var CACHE = 'quiap5-v1';

var CORE = [
  './',
  'index.html',
  'css/style.css',
  'js/theme.js',
  'js/config.js',
  'js/art.js',
  'js/storage.js',
  'js/sync.js',
  'js/account.js',
  'js/examsource.js',
  'js/app.js',
  'data/questions.json',
  'manifest.webmanifest',
  'img/icon-192.png',
  'img/3d/school.png',
  'img/3d/memo.png',
  'img/3d/trophy.png',
  'img/3d/backpack.png',
  'img/3d/books.png',
  'img/3d/graduation_cap.png',
  'img/3d/pencil.png',
  'img/3d/glowing_star.png',
  'img/3d/light_bulb.png',
  'img/3d/party_popper.png',
  'img/3d/sports_medal.png',
  'img/3d/seedling.png',
  'img/3d/sun.png',
  'img/3d/abacus.png',
  'img/3d/microscope.png',
  'img/3d/open_book.png',
  'img/3d/globe.png',
  'img/3d/input_latin_letters.png',
  'img/3d/soccer_ball.png',
  'img/3d/artist_palette.png',
  'img/3d/hammer_and_wrench.png'
];

var NETWORK_TIMEOUT_MS = 4000;

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      // one missing file must not stop the rest from being saved
      return Promise.all(CORE.map(function (url) {
        return cache.add(url).catch(function () {});
      }));
    }).then(function () { return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

function save(request, response, allowOpaque) {
  var ok = response && ((response.ok && (response.type === 'basic' || response.type === 'cors')) || (allowOpaque && response.type === 'opaque'));
  if (ok) {
    var copy = response.clone();
    caches.open(CACHE).then(function (cache) { cache.put(request, copy); });
  }
  return response;
}

// saved copy of this request, or the start page for page loads; null when nothing is saved
function fromCache(request) {
  return caches.match(request, { ignoreSearch: true }).then(function (hit) {
    if (hit || request.mode !== 'navigate') return hit || null;
    return caches.match('index.html').then(function (page) { return page || null; });
  });
}

function networkFirst(request) {
  return new Promise(function (resolve) {
    var settled = false;
    function finish(res) { if (!settled) { settled = true; resolve(res); } }
    // slow network: answer from the saved copy, but keep updating it in the background
    var timer = setTimeout(function () {
      fromCache(request).then(function (hit) { if (hit) finish(hit); });
    }, NETWORK_TIMEOUT_MS);
    fetch(request).then(function (res) {
      clearTimeout(timer);
      save(request, res);
      finish(res);
    }, function () {
      clearTimeout(timer);
      fromCache(request).then(function (hit) { finish(hit || Response.error()); });
    });
  });
}

function cacheFirst(request, allowOpaque) {
  return caches.match(request).then(function (hit) {
    return hit || fetch(request).then(function (res) { return save(request, res, allowOpaque); });
  });
}

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);

  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    event.respondWith(cacheFirst(req, true));
    return;
  }
  if (url.origin !== self.location.origin) return;

  if (/\.(png|jpe?g|gif|webp|svg)$/i.test(url.pathname)) {
    event.respondWith(cacheFirst(req));
    return;
  }
  event.respondWith(networkFirst(req));
});
