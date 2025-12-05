import { fetchData, getFavorites } from './data.js';
import { renderGrid, closeModal, populateFilters } from './ui.js';

let currentData = [];
let currentTab = 'all';

document.addEventListener('DOMContentLoaded', async () => {
    // Initial Load
    await loadData('all');

    // Event Listeners
    setupNavigation();
    setupSearchAndFilter();
    setupModal();

    // Listen for favorite updates to refresh grid if in favorites tab
    document.addEventListener('favoritesUpdated', () => {
        if (currentTab === 'favorites') {
            loadData('favorites');
        }
    });
});

async function loadData(type) {
    currentTab = type;

    if (type === 'favorites') {
        currentData = getFavorites();
    } else {
        currentData = await fetchData(type);
    }

    // Reset filters when switching tabs
    document.getElementById('searchInput').value = '';
    populateFilters(currentData);
    renderGrid(currentData);
}

function setupNavigation() {
    // Main Nav Buttons (All, Movies, Series, Books)
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            navBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            // Remove active state from heart icon if it was active
            document.querySelector('.fav-icon-btn').classList.remove('active');

            const tab = e.target.dataset.tab;
            loadData(tab);
        });
    });

    // Favorites Icon Button
    const favBtn = document.querySelector('.fav-icon-btn');
    favBtn.addEventListener('click', () => {
        // Remove active from text nav buttons
        navBtns.forEach(b => b.classList.remove('active'));

        // Add active to heart icon
        favBtn.classList.add('active');

        loadData('favorites');
    });
}

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const categoryFilter = document.getElementById('categoryFilter');
    const yearFilter = document.getElementById('yearFilter');

    const filterData = () => {
        const query = searchInput.value.toLowerCase();
        const category = categoryFilter.value;
        const year = yearFilter.value;

        const filtered = currentData.filter(item => {
            const matchesSearch = item.title.toLowerCase().includes(query);
            const matchesCategory = category === 'all' || item.category === category;
            const matchesYear = year === 'all' || item.year.toString() === year;

            return matchesSearch && matchesCategory && matchesYear;
        });

        renderGrid(filtered);
    };

    searchInput.addEventListener('input', filterData);
    categoryFilter.addEventListener('change', filterData);
    yearFilter.addEventListener('change', filterData);
}

function setupModal() {
    const closeBtn = document.querySelector('.close-btn');
    const modal = document.getElementById('detailModal');

    closeBtn.addEventListener('click', closeModal);

    // Close on click outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Close on Escape key
    window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}
