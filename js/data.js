
export async function fetchData(type) {
    try {
        let data = [];
        if (type === 'all') {
            const [movies, series, books] = await Promise.all([
                fetch('data/movies.json').then(res => res.json()),
                fetch('data/series.json').then(res => res.json()),
                fetch('data/books.json').then(res => res.json())
            ]);
            data = [...movies, ...series, ...books];
        } else {
            const filename = type === 'series' ? 'series.json' : `${type}s.json`;
            const response = await fetch(`data/${filename}`);
            if (!response.ok) throw new Error(`Failed to fetch ${type}`);
            data = await response.json();
        }
        return data;
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
}

export function getFavorites() {
    const favs = localStorage.getItem('favorites');
    return favs ? JSON.parse(favs) : [];
}

export function addToFavorites(item) {
    const favs = getFavorites();
    if (!favs.some(fav => fav.id === item.id)) {
        favs.push(item);
        localStorage.setItem('favorites', JSON.stringify(favs));
        return true; // Added
    }
    return false; // Already exists
}

export function removeFromFavorites(itemId) {
    let favs = getFavorites();
    favs = favs.filter(item => item.id !== itemId);
    localStorage.setItem('favorites', JSON.stringify(favs));
}

export function isFavorite(itemId) {
    const favs = getFavorites();
    return favs.some(item => item.id === itemId);
}
