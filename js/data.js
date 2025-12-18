// Verileri JSON dosyalarından çeken ana fonksiyon
export async function fetchData(type) {
    try {
        console.log(`Veri çekiliyor: ${type}...`); // Konsola bilgi yazdır
        let data = [];

        // Eğer 'tümü' seçildiyse hepsini tek seferde çek
        if (type === 'all') {
            try {
                // Promise.all ile tüm istekleri aynı anda yapıyoruz (daha hızlı olsun diye)
                // Cache (önbellek) sorununu çözmek için sonuna saat bilgisini ekliyoruz (?t=...)
                const responses = await Promise.all([
                    fetch('./data/movies.json?t=' + new Date().getTime()),
                    fetch('./data/series.json?t=' + new Date().getTime()),
                    fetch('./data/books.json?t=' + new Date().getTime())
                ]);

                // Herhangi biri bulunamazsa hata ver
                for (const res of responses) {
                    if (!res.ok) console.error(`Dosya bulunamadı: ${res.url}`);
                }

                // Gelen yanıtları JSON formatına çevir
                const [movies, series, books] = await Promise.all(
                    responses.map(res => res.ok ? res.json() : [])
                );

                // Ne kadar veri geldiğini konsola yaz
                if (movies) console.log(`${movies.length} film yüklendi.`);
                if (series) console.log(`${series.length} dizi yüklendi.`);
                if (books) console.log(`${books.length} kitap yüklendi.`);

                // Hepsini tek bir listede birleştir
                data = [...(movies || []), ...(series || []), ...(books || [])];
            } catch (err) {
                console.error("Hata oluştu (hepsini çekerken):", err);
            }
        } else {
            // Sadece belirli bir tür seçildiyse (film, dizi veya kitap)
            // Dosya ismini ayarla (series.json veya movies.json gibi)
            const filename = type === 'series' ? 'series.json' : `${type}s.json`;
            console.log(`Şu dosya okunuyor: ./data/${filename}...`);

            // Yine cache olmasın diye zaman damgası ekliyoruz
            const response = await fetch(`./data/${filename}?t=` + new Date().getTime());

            if (!response.ok) {
                throw new Error(`Dosya açılamadı: ${filename}`);
            }
            data = await response.json();
        }
        console.log(`Toplam yüklenen öğe sayısı (${type}): ${data.length}`);
        return data; // Veriyi geri gönder
    } catch (error) {
        console.error("KRİTİK HATA: Veri çekilemedi!", error);
        return []; // Hata olursa boş liste döndür
    }
}

// Favorileri LocalStorage'dan (tarayıcı hafızasından) okur
export function getFavorites() {
    const favs = localStorage.getItem('favorites');
    // Eğer varsa JSON'a çevirip döndür, yoksa boş dizi döndür
    return favs ? JSON.parse(favs) : [];
}

// Favorilere ekleme işlemi
export function addToFavorites(item) {
    const favs = getFavorites();
    // Eğer listede zaten yoksa ekle
    if (!favs.some(fav => fav.id === item.id)) {
        favs.push(item);
        // Güncel listeyi tekrar hafızaya (LocalStorage) kaydet
        localStorage.setItem('favorites', JSON.stringify(favs));
        return true; // Eklendi
    }
    return false; // Zaten var
}

// Favorilerden çıkarma işlemi
export function removeFromFavorites(itemId) {
    let favs = getFavorites();
    // ID'si eşleşmeyenleri filtrele (yani eşleşeni at)
    favs = favs.filter(item => item.id !== itemId);
    // Yeni listeyi kaydet
    localStorage.setItem('favorites', JSON.stringify(favs));
}

// Bir öğenin favori olup olmadığını kontrol et
export function isFavorite(itemId) {
    const favs = getFavorites();
    return favs.some(item => item.id === itemId);
}
