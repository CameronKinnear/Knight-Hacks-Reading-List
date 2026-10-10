/*
Fetches a JSON response from this app's own API.
:path - Same-origin API path
:returns - Parsed JSON, or null if the request fails
*/
async function ApiFetch(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`API request failed (${response.status}) for ${path}`);
        return await response.json();
    }
    catch (error) {
        ErrorLog(error.message);
        return null;
    }
}

/*
Fetches Marvel movies sorted by timeline or release date.
:order - Either 'timeline' or 'release'
:returns - Movie array, or an empty array on failure
*/
async function GetMarvelMovies(order = 'timeline') {
    const movies = await ApiFetch(`/api/movies?order=${encodeURIComponent(order)}`);
    return Array.isArray(movies) ? movies : [];
}

/*
Fetches details for one movie.
:movieId - TMDB movie ID
:returns - Movie object, or null on failure
*/
async function GetMovieDetails(movieId) {
    return ApiFetch(`/api/movies/${encodeURIComponent(movieId)}`);
}
