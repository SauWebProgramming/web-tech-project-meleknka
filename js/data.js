
export async function fetchData(type) {
    try {
        console.log(`Fetching data for type: ${type}...`);
        let data = [];
        if (type === 'all') {
            try {
                const responses = await Promise.all([
                    fetch('./data/movies.json'),
                    fetch('./data/series.json'),
                    fetch('./data/books.json')
                ]);

                // Check for 404s
                for (const res of responses) {
                    if (!res.ok) console.error(`Failed to fetch ${res.url}: ${res.status}`);
                }

                const [movies, series, books] = await Promise.all(
                    responses.map(res => res.ok ? res.json() : [])
                );

                if (movies) console.log(`Loaded ${movies.length} movies.`);
                if (series) console.log(`Loaded ${series.length} series.`);
                if (books) console.log(`Loaded ${books.length} books.`);

                data = [...(movies || []), ...(series || []), ...(books || [])];
            } catch (err) {
                console.error("Error in Promise.all for 'all' data:", err);
            }
        } else {
            const filename = type === 'series' ? 'series.json' : `${type}s.json`;
            console.log(`Fetching ./data/${filename}...`);
            const response = await fetch(`./data/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to fetch ${type} from ./data/${filename} (${response.status})`);
            }
            data = await response.json();
        }
        console.log(`Total data loaded for ${type}: ${data.length}`);
        return data;
    } catch (error) {
        console.error("CRITICAL Error fetching data:", error);
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
