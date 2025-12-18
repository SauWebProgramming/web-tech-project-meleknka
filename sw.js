// BONUS: PWA - Çevrimdışı (Offline) Çalışma Desteği (Service Worker)
const CACHE_NAME = 'media-lib-v8'; // Tarayıcı hafızasının ismi (versiyon değiştikçe burayı değiştiririz)
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './css/style.css',
    './js/main.js',
    './js/ui.js',
    './js/data.js',
    './js/suggestion.js',
    './data/movies.json',
    './data/series.json',
    './data/books.json',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css',
    'https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;600;700&display=swap'
];

// 1. Kurulum (Install) Olayı
self.addEventListener('install', (event) => {
    // Beklemeden hemen aktif ol
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Önbellek (Cache) açıldı');
                console.log('Dosyalar hafızaya alınıyor...');
                return cache.addAll(ASSETS_TO_CACHE);
            })
    );
});

// 2. İstek Yakalama (Fetch) Olayı
// Kullanıcı bir dosya istediğinde araya girip "bende var mı?" diye bakar
self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Eğer hafızada varsa onu döndür (İnternet olmasa bile çalışır!)
                if (response) {
                    return response;
                }
                // Yoksa internetten çek
                return fetch(event.request);
            })
    );
});

// 3. Etkinleştirme (Activate) Olayı
// Eski versiyon hafızaları temizler
self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    // Eğer listede olmayan eski bir cache varsa sil
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Tüm sayfaların kontrolünü ele al
    );
});
