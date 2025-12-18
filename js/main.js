import { fetchData, getFavorites } from './data.js';
import { renderGrid, closeModal, populateFilterPanel, toggleFilterPanel, openModal } from './ui.js';
import { initSuggestionWidget } from './suggestion.js';

let currentData = [];
let currentTab = 'all';

// Tema ayarları (Koyu/Açık mod)
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggleBtn.querySelector('i');

// Daha önce seçilen temayı hatırla (LocalStorage'dan)
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

// Sayfa tamamen yüklendiğinde çalışacak kodlar
document.addEventListener('DOMContentLoaded', async () => {
    // İlk açılışta tüm verileri getir
    await loadData('all');

    // Öneri Widget'ını başlat
    const allGlobalData = await fetchData('all');
    initSuggestionWidget(allGlobalData);

    // Widget'tan gelen "Detay Aç" isteğini dinle
    window.addEventListener('openDetailModal', (e) => {
        openModal(e.detail);
    });

    // Buton tıklamalarını ve tema değişimini ayarla
    setupNavigation();
    setupThemeToggle();

    // Arama ve filtreleme özelliklerini ayarla
    setupSearchAndFilter();
    setupModal();

    // Favoriler güncellendiğinde ekranı yenile (eğer favoriler sekmesindeysek)
    document.addEventListener('favoritesUpdated', () => {
        if (currentTab === 'favorites') {
            loadData('favorites');
        }
    });
});

// Verileri yükleyip ekrana basan fonksiyon
async function loadData(type) {
    currentTab = type;

    if (type === 'favorites') {
        // Eğer favoriler seçildiyse hafızadan oku
        currentData = getFavorites();
    } else {
        // Yoksa dosyadan yeni veri çek
        currentData = await fetchData(type);
    }

    // Arama kutusunu temizle
    document.getElementById('searchInput').value = '';

    // Yan paneldeki filtre seçeneklerini doldur
    populateFilterPanel(currentData);

    // Kartları ekrana çiz
    renderGrid(currentData);
}

// Menü butonlarını (Tümü, Film, Dizi, Kitap) ayarlayan fonksiyon
function setupNavigation() {
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Önce hepsinden aktif sınıfını kaldır
            navBtns.forEach(b => b.classList.remove('active'));
            // Tıklanana ekle
            e.target.classList.add('active');

            // Kalp ikonunun aktifliğini kaldır
            document.querySelector('.fav-icon-btn').classList.remove('active');

            // Hangi butona tıklandıysa o veriyi yükle (data-tab özelliği)
            const tab = e.target.dataset.tab;
            loadData(tab);
        });
    });

    // Kalp butonuna (Favorilerim) tıklanınca
    const favBtn = document.querySelector('.fav-icon-btn');
    favBtn.addEventListener('click', () => {
        navBtns.forEach(b => b.classList.remove('active'));
        favBtn.classList.add('active');
        loadData('favorites');
    });
}

// Tema değiştirme butonunu ayarlayan fonksiyon
function setupThemeToggle() {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode'); // Sınıfı ekle veya çikar

        // Yeni durumu hafızaya kaydet
        if (body.classList.contains('light-mode')) {
            localStorage.setItem('theme', 'light');
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            localStorage.setItem('theme', 'dark');
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    });
}

// Arama, filtreleme ve sıralama işlemlerini ayarlayan fonksiyon
function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const overlay = document.getElementById('overlay');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Paneli aç/kapat olayları
    filterToggleBtn.addEventListener('click', () => toggleFilterPanel(true));
    closeFilterBtn.addEventListener('click', () => toggleFilterPanel(false));
    overlay.addEventListener('click', () => {
        toggleFilterPanel(false);
    });

    // Sıralama kutusu
    const sortSelect = document.getElementById('sortSelect');

    // Verileri hem filtreleyen hem sıralayan ana fonksiyon
    const processData = () => {
        const query = searchInput.value.toLowerCase(); // Arama metnini küçük harfe çevir

        // Seçili kutucukları (checkbox) bulup değerlerini alan yardımcı fonksiyon
        const getCheckedValues = (name) => {
            return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
        };

        const categories = getCheckedValues('category');
        const years = getCheckedValues('year');
        const directors = getCheckedValues('director');
        const ratings = getCheckedValues('rating').map(Number); // Puanları sayıya çevir

        // 1. ADIM: FİLTRELEME
        let processed = currentData.filter(item => {
            // Arama metni
            const matchesSearch = item.title.toLowerCase().includes(query);

            // Kategori (hiç seçilmediyse hepsi gelsin)
            const matchesCategory = categories.length === 0 || categories.includes(item.category);

            // Yıl
            const matchesYear = years.length === 0 || years.includes(item.year.toString());

            // Yönetmen/Yazar
            const matchesDirector = directors.length === 0 || directors.includes(item.director);

            // Puan (Örn: 8+ seçildiyse 8 ve üzeri olanları getir)
            let matchesRating = true;
            if (ratings.length > 0) {
                const minSelectedRating = Math.min(...ratings);
                matchesRating = item.rating >= minSelectedRating;
            }

            // Hepsi uyuyorsa true döner ve listeye eklenir
            return matchesSearch && matchesCategory && matchesYear && matchesDirector && matchesRating;
        });

        // 2. ADIM: SIRALAMA
        const sortValue = sortSelect.value;
        if (sortValue !== 'default') {
            processed.sort((a, b) => {
                if (sortValue === 'year_desc') return b.year - a.year; // Yıl: Yeni -> Eski
                if (sortValue === 'year_asc') return a.year - b.year; // Yıl: Eski -> Yeni
                if (sortValue === 'rating_desc') return b.rating - a.rating; // Puan: Yüksek -> Düşük
                if (sortValue === 'rating_asc') return a.rating - b.rating; // Puan: Düşük -> Yüksek
                if (sortValue === 'az') return a.title.localeCompare(b.title, 'tr'); // A -> Z
                if (sortValue === 'za') return b.title.localeCompare(a.title, 'tr'); // Z -> A
                return 0;
            });
        }

        renderGrid(processed); // Sonuçları ekrana bas
    };

    // Uygula butonuna basılınca
    applyFiltersBtn.addEventListener('click', () => {
        processData();
        toggleFilterPanel(false); // Paneli kapat
    });

    // Temizle butonuna basılınca
    clearFiltersBtn.addEventListener('click', () => {
        // Tüm kutucukların işaretini kaldır
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => cb.checked = false);
        processData();
    });

    // Arama kutusuna her harf yazıldığında canlı filtrele
    searchInput.addEventListener('input', () => {
        processData();
    });

    // Sıralama değiştiğinde
    sortSelect.addEventListener('change', () => {
        processData();
    });
}

// Detay penceresi (Modal) kapatma işlemlerini ayarlayan fonksiyon
function setupModal() {
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('detailModal');

    closeBtn.addEventListener('click', closeModal);

    // Pencere dışına tıklanırsa kapat
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // ESC tuşuna basılırsa kapat
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
            toggleFilterPanel(false); // Paneli de kapat
        }
    });
}
