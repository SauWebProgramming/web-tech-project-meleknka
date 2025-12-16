import { fetchData, getFavorites } from './data.js';
import { renderGrid, closeModal, populateFilterPanel, toggleFilterPanel } from './ui.js';

let currentData = [];
let currentTab = 'all';

// Theme Logic
const themeToggleBtn = document.getElementById('themeToggle');
const body = document.body;
const icon = themeToggleBtn.querySelector('i');

// Check Local Storage
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    icon.classList.remove('fa-moon');
    icon.classList.add('fa-sun');
}

document.addEventListener('DOMContentLoaded', async () => {
    // Initial Load
    await loadData('all');

    // Event Listeners
    setupNavigation();
    setupThemeToggle();

    setupSearchAndFilter();
    setupModal();

    // Listen for favorite updates to refresh grid if in favorites tab
    document.addEventListener('favoritesUpdated', () => {
        if (currentTab === 'favorites') {
            loadData('favorites');
        }
    });

    // Close panel on resize if screen becomes large (optional, but good for UX)
    // Actually our panel is useful on all screens, so no need to auto-close.
});

async function loadData(type) {
    currentTab = type;

    if (type === 'favorites') {
        currentData = getFavorites();
    } else {
        currentData = await fetchData(type);
    }

    // Reset search
    document.getElementById('searchInput').value = '';

    // Populate Side Panel
    populateFilterPanel(currentData);

    // Initial Render
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

function setupThemeToggle() {
    themeToggleBtn.addEventListener('click', () => {
        body.classList.toggle('light-mode');

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

function setupSearchAndFilter() {
    const searchInput = document.getElementById('searchInput');
    const filterToggleBtn = document.getElementById('filterToggleBtn');
    const closeFilterBtn = document.getElementById('closeFilterBtn');
    const overlay = document.getElementById('overlay');
    const applyFiltersBtn = document.getElementById('applyFiltersBtn');
    const clearFiltersBtn = document.getElementById('clearFiltersBtn');

    // Toggle Panel
    filterToggleBtn.addEventListener('click', () => toggleFilterPanel(true));
    closeFilterBtn.addEventListener('click', () => toggleFilterPanel(false));
    overlay.addEventListener('click', () => {
        toggleFilterPanel(false);
        // Also close modal if open? Overlay is shared? 
        // Current HTML puts overlay separately. 
        // Modal has its own backdrop logic usually, but let's check style. 
        // css line 356: .modal { ... background-color: rgba(0,0,0,0.85) } 
        // Modal covers everything including overlay.
        // So this overlay is just for the side panel.
    });

    // Sorting Logic
    const sortSelect = document.getElementById('sortSelect');

    // Combine filtering and sorting
    const processData = () => {
        const query = searchInput.value.toLowerCase();

        // Get checked values from panel
        const getCheckedValues = (name) => {
            return Array.from(document.querySelectorAll(`input[name="${name}"]:checked`)).map(cb => cb.value);
        };

        const categories = getCheckedValues('category');
        const years = getCheckedValues('year');
        const directors = getCheckedValues('director');
        const ratings = getCheckedValues('rating').map(Number);

        // 1. Filter
        let processed = currentData.filter(item => {
            // Search Text
            const matchesSearch = item.title.toLowerCase().includes(query);

            // Categories
            const matchesCategory = categories.length === 0 || categories.includes(item.category);

            // Years
            const matchesYear = years.length === 0 || years.includes(item.year.toString());

            // Directors
            const matchesDirector = directors.length === 0 || directors.includes(item.director);

            // Rating
            let matchesRating = true;
            if (ratings.length > 0) {
                const minSelectedRating = Math.min(...ratings);
                matchesRating = item.rating >= minSelectedRating;
            }

            return matchesSearch && matchesCategory && matchesYear && matchesDirector && matchesRating;
        });

        // 2. Sort
        const sortValue = sortSelect.value;
        if (sortValue !== 'default') {
            processed.sort((a, b) => {
                if (sortValue === 'year_desc') return b.year - a.year;
                if (sortValue === 'year_asc') return a.year - b.year;
                if (sortValue === 'rating_desc') return b.rating - a.rating;
                if (sortValue === 'rating_asc') return a.rating - b.rating;
                if (sortValue === 'az') return a.title.localeCompare(b.title, 'tr');
                if (sortValue === 'za') return b.title.localeCompare(a.title, 'tr');
                return 0;
            });
        }

        renderGrid(processed);
    };

    // Apply Button
    applyFiltersBtn.addEventListener('click', () => {
        processData();
        toggleFilterPanel(false);
    });

    // Clear Button
    clearFiltersBtn.addEventListener('click', () => {
        // Uncheck all
        document.querySelectorAll('.filter-panel input[type="checkbox"]').forEach(cb => cb.checked = false);
        processData();
        // toggleFilterPanel(false); 
    });

    // Live search
    searchInput.addEventListener('input', () => {
        processData();
    });

    // Sort Change
    sortSelect.addEventListener('change', () => {
        processData();
    });
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
            toggleFilterPanel(false); // Also close panel if ESC pressed?
        }
    });
}
