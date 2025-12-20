import { isFavorite, addToFavorites, removeFromFavorites } from './data.js';

const mediaGrid = document.getElementById('mediaGrid');
const detailModal = document.getElementById('detailModal');

// Ekrana kartları basan fonksiyon (Grid yapısı)
export function renderGrid(data) {
    mediaGrid.innerHTML = ''; // Önce ekranı temizle

    // Eğer hiç veri yoksa mesaj göster
    if (data.length === 0) {
        mediaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: var(--text-secondary);">Şuan burada gösterilecek bir şey yok :(</p>';
        return;
    }

    // Her bir öğe için kart oluştur
    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        // Türü Türkçeye çeviriyoruz (görüntü için)
        let typeDisplay = item.type;
        if (item.type === 'movie') typeDisplay = 'Film';
        if (item.type === 'series') typeDisplay = 'Dizi';
        if (item.type === 'book') typeDisplay = 'Kitap';

        // Kartın HTML içeriğini oluştur
        // Resim yüklenemezse yedek bir resim gösteriyoruz (onerror kısmı)
        card.innerHTML = `
            <img src="${item.image}" alt="${item.title}" class="card-img" onerror="this.onerror=null; this.src='https://placehold.co/600x900?text=${encodeURIComponent(item.title)}'">
            <div class="card-content">
                <h3 class="card-title">${item.title}</h3>
                <div class="card-meta">
                    <span>${item.year}</span>
                    <span class="card-rating"><i class="fa-solid fa-star"></i> ${item.rating}</span>
                </div>
                <div class="card-meta">
                    <span>${item.category}</span>
                    <span style="text-transform: capitalize;">${typeDisplay}</span>
                </div>
                <button class="detail-btn" aria-label="${item.title} detaylarını gör">Detaylar</button>
            </div>
        `;

        // Karta tıklandığında detay modalını aç
        card.addEventListener('click', () => openModal(item));

        mediaGrid.appendChild(card); // Kartı sayfaya ekle
    });
}

// Detay penceresini (Modal) açan fonksiyon
export function openModal(item) {
    // Bilgileri yerlerine yerleştir
    document.getElementById('modalImg').src = item.image;
    document.getElementById('modalTitle').innerText = item.title;
    document.getElementById('modalYear').innerText = item.year;
    document.getElementById('modalCategory').innerText = item.category;

    let typeDisplay = item.type;
    if (item.type === 'movie') typeDisplay = 'Film';
    if (item.type === 'series') typeDisplay = 'Dizi';
    if (item.type === 'book') typeDisplay = 'Kitap';
    document.getElementById('modalType').innerText = typeDisplay.toUpperCase();

    document.getElementById('modalRating').innerText = item.rating;
    document.getElementById('modalSummary').innerText = item.summary;

    // Kitaplar için Yazar, Filmler için Yönetmen gösterimi
    const directorLabel = document.getElementById('modalDirector').previousElementSibling;
    const castContainer = document.getElementById('modalCast').parentElement;

    if (item.type === 'book') {
        // Eğer kitap ise "Yönetmen" yerine "Yazar" yazsın
        if (directorLabel) directorLabel.innerText = 'Yazar:';
        document.getElementById('modalDirector').innerText = item.author || '';
        // Oyuncular kısmını gizle (kitapta oyuncu olmaz)
        if (castContainer) castContainer.style.display = 'none';
    } else {
        // Film veya dizi ise normal göster
        if (directorLabel) directorLabel.innerText = 'Yönetmen:';
        document.getElementById('modalDirector').innerText = item.director || '';

        if (castContainer) {
            castContainer.style.display = 'block';
            document.getElementById('modalCast').innerText = item.cast ? item.cast.join(', ') : '-';
        }
    }

    // Favori butonunu ayarla (kalp dolu mu boş mu?)
    const favBtn = document.getElementById('modalFavBtn');
    updateFavBtnState(favBtn, item.id);

    // Butonu kopyalayarak eski tıklama olaylarını temizle (yoksa üst üste biner)
    const newFavBtn = favBtn.cloneNode(true);
    favBtn.parentNode.replaceChild(newFavBtn, favBtn);

    // Yeni tıklama olayı ekle
    newFavBtn.addEventListener('click', (e) => {
        e.stopPropagation(); // Arka plandaki tıklamaları engelle
        if (isFavorite(item.id)) {
            removeFromFavorites(item.id); // Favoriden çıkar
            newFavBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorilere Ekle';
            newFavBtn.classList.remove('active');
        } else {
            addToFavorites(item); // Favoriye ekle
            newFavBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorilerden Çıkar';
            newFavBtn.classList.add('active');
        }
        // Diğer taraflara haber ver (favoriler değişti diye)
        document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    });

    detailModal.classList.add('show'); // Modalı görünür yap

    // Erişilebilirlik için (klavye odağını modala taşı)
    detailModal.setAttribute('tabindex', '-1');
    detailModal.focus();
}

// Favori butonunun durumunu güncelleyen yardımcı fonksiyon
function updateFavBtnState(btn, itemId) {
    if (isFavorite(itemId)) {
        btn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorilerden Çıkar';
        btn.classList.add('active');
    } else {
        btn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorilere Ekle';
        btn.classList.remove('active');
    }
}

// Modalı kapatan fonksiyon
export function closeModal() {
    detailModal.classList.remove('show');
}

// Yan filtre panelini açıp kapatma
export function toggleFilterPanel(show) {
    const panel = document.getElementById('filterPanel');
    const overlay = document.getElementById('overlay'); // Arka plan karartması
    if (show) {
        panel.classList.add('open');
        overlay.classList.add('active');
    } else {
        panel.classList.remove('open');
        overlay.classList.remove('active');
    }
}

// Filtre panelindeki seçenekleri (yıl, kategori vb.) doldurur
export function populateFilterPanel(data) {
    const categoryContainer = document.getElementById('filterCategories');
    const yearContainer = document.getElementById('filterYears');
    const directorContainer = document.getElementById('filterDirectors');
    const directorLabel = document.getElementById('directorLabel');

    // Öncekileri temizle
    categoryContainer.innerHTML = '';
    yearContainer.innerHTML = '';
    directorContainer.innerHTML = '';

    if (!data || data.length === 0) return;

    // Başlığı sabit yap: Yönetmen - Yazar
    // const isBook = data[0].type === 'book'; // Artık gerek yok
    directorLabel.innerText = 'Yönetmen - Yazar';

    // Benzersiz (tekrarsız) kategori ve yılları bul
    const categories = [...new Set(data.map(item => item.category))].sort();
    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);
    const directors = [...new Set(data.map(item => item.director || item.author))].sort(); // Yazar veya yönetmen

    // Checkbox (işaret kutusu) oluşturan yardımcı fonksiyon
    const createCheckbox = (value, container, name) => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="${name}" value="${value}">
            ${value}
        `;
        container.appendChild(label);
    };

    // Kutucukları oluştur
    categories.forEach(cat => createCheckbox(cat, categoryContainer, 'category'));
    years.forEach(year => createCheckbox(year, yearContainer, 'year'));
    directors.forEach(director => {
        if (director) createCheckbox(director, directorContainer, 'director');
    });
}
