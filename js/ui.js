import { isFavorite, addToFavorites, removeFromFavorites } from './data.js';

const mediaGrid = document.getElementById('mediaGrid');
const detailModal = document.getElementById('detailModal');

export function renderGrid(data) {
    mediaGrid.innerHTML = '';

    if (data.length === 0) {
        mediaGrid.innerHTML = '<p style="grid-column: 1/-1; text-align: center; font-size: 1.2rem; color: var(--text-secondary);">Sonuç bulunamadı.</p>';
        return;
    }

    data.forEach(item => {
        const card = document.createElement('div');
        card.className = 'card';

        // Translate type for display
        let typeDisplay = item.type;
        if (item.type === 'movie') typeDisplay = 'Film';
        if (item.type === 'series') typeDisplay = 'Dizi';
        if (item.type === 'book') typeDisplay = 'Kitap';

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

        // Add event listener to the whole card, but we can also just target the button if preferred.
        // User asked for "button after clicking card" or "button on card". 
        // The current implementation puts a button on the card. Clicking the button opens modal.
        // Clicking the card image/body also opens it for better UX.
        card.addEventListener('click', () => openModal(item));

        mediaGrid.appendChild(card);
    });
}

export function openModal(item) {
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
    document.getElementById('modalDirector').innerText = item.director;
    document.getElementById('modalCast').innerText = item.cast.join(', ');

    const favBtn = document.getElementById('modalFavBtn');
    updateFavBtnState(favBtn, item.id);

    // Clone button to remove old event listeners
    const newFavBtn = favBtn.cloneNode(true);
    favBtn.parentNode.replaceChild(newFavBtn, favBtn);

    newFavBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        if (isFavorite(item.id)) {
            removeFromFavorites(item.id);
            newFavBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorilere Ekle';
            newFavBtn.classList.remove('active');
        } else {
            addToFavorites(item);
            newFavBtn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorilerden Çıkar';
            newFavBtn.classList.add('active');
        }
        document.dispatchEvent(new CustomEvent('favoritesUpdated'));
    });

    detailModal.classList.add('show');

    // BONUS: A11y - Focus Management
    // Set tabindex to make it focusable, then focus
    detailModal.setAttribute('tabindex', '-1');
    detailModal.focus();
}

function updateFavBtnState(btn, itemId) {
    if (isFavorite(itemId)) {
        btn.innerHTML = '<i class="fa-solid fa-heart"></i> Favorilerden Çıkar';
        btn.classList.add('active');
    } else {
        btn.innerHTML = '<i class="fa-regular fa-heart"></i> Favorilere Ekle';
        btn.classList.remove('active');
    }
}

export function closeModal() {
    detailModal.classList.remove('show');
}

// Side Panel Logic
export function toggleFilterPanel(show) {
    const panel = document.getElementById('filterPanel');
    const overlay = document.getElementById('overlay');
    if (show) {
        panel.classList.add('open');
        overlay.classList.add('active');
    } else {
        panel.classList.remove('open');
        overlay.classList.remove('active');
    }
}

export function populateFilterPanel(data) {
    const categoryContainer = document.getElementById('filterCategories');
    const yearContainer = document.getElementById('filterYears');
    const directorContainer = document.getElementById('filterDirectors');
    const directorLabel = document.getElementById('directorLabel');

    // Clear existing
    categoryContainer.innerHTML = '';
    yearContainer.innerHTML = '';
    directorContainer.innerHTML = '';

    if (!data || data.length === 0) return;

    // Determine Director vs Author label
    const isBook = data[0].type === 'book';
    directorLabel.innerText = isBook ? 'Yazar' : 'Yönetmen';

    // Extract unique values
    const categories = [...new Set(data.map(item => item.category))].sort();
    const years = [...new Set(data.map(item => item.year))].sort((a, b) => b - a);

    // Director field is sometimes 'author' conceptually but stored as 'director' in JSON based on my analysis of books.json
    // Actually books.json uses 'director' field for author.
    const directors = [...new Set(data.map(item => item.director))].sort();

    // Helper to create checkbox
    const createCheckbox = (value, container, name) => {
        const label = document.createElement('label');
        label.innerHTML = `
            <input type="checkbox" name="${name}" value="${value}">
            ${value}
        `;
        container.appendChild(label);
    };

    categories.forEach(cat => createCheckbox(cat, categoryContainer, 'category'));
    years.forEach(year => createCheckbox(year, yearContainer, 'year'));
    directors.forEach(director => createCheckbox(director, directorContainer, 'director'));
}

