require('dotenv').config();
const fs = require('fs/promises');
const path = require('path');
const { timeline, titleAliases, NormalizeTitle } = require('./timeline');
const API_BASE = 'https://api.themoviedb.org/3';
const API_KEY = process.env.TMDB_API_KEY;

/*
Requests one TMDB API endpoint.
:endpoint - API path and query string
:returns - Parsed JSON
*/
async function FetchTmdb(endpoint) {
    const separator = endpoint.includes('?') ? '&' : '?';
    const response = await fetch(`${API_BASE}${endpoint}${separator}api_key=${encodeURIComponent(API_KEY)}`);
    if (!response.ok) throw new Error(`TMDB request failed (${response.status}) for ${endpoint}`);
    return response.json();
}

/*
Fetches all pages of Marvel Studios movie discovery.
:returns - All discovered movie records
*/
async function FetchAllMarvelMovies() {
    const movies = [];
    let totalPages = 1;
    for (let page = 1; page <= totalPages; page += 1) {
        const data = await FetchTmdb(`/discover/movie?with_companies=420&sort_by=primary_release_date.asc&page=${page}`);
        movies.push(...data.results);
        totalPages = data.total_pages;
    }
    return movies;
}

/*
Synchronizes the configured timeline to server/data/movies.json.
:returns - Resolves when data and diagnostic reports are written
*/
async function SyncMovies() {
    if (!API_KEY) throw new Error('TMDB_API_KEY is missing. Copy .env.example to .env and add your TMDB v3 API key.');
    const discovered = await FetchAllMarvelMovies();
    const byTitle = new Map(discovered.map((movie) => [NormalizeTitle(movie.title), movie]));
    const matched = new Set();
    const output = [];
    for (const title of timeline) {
        const normalizedTitle = NormalizeTitle(title);
        const movie = byTitle.get(normalizedTitle) || byTitle.get(titleAliases[normalizedTitle]);
        if (!movie) continue;
        matched.add(NormalizeTitle(movie.title));
        const details = await FetchTmdb(`/movie/${movie.id}?append_to_response=credits`);
        output.push({
            id: details.id, title: details.title, release_date: details.release_date,
            timeline_order: output.length + 1, runtime: details.runtime, overview: details.overview,
            tagline: details.tagline,
            poster_url: details.poster_path ? `https://image.tmdb.org/t/p/w500${details.poster_path}` : null,
            director: details.credits.crew.find((person) => person.job === 'Director')?.name ?? null,
            cast: details.credits.cast.slice(0, 10).map((person) => ({ name: person.name, character: person.character }))
        });
    }
    const missing = timeline.filter((title) => {
        const normalizedTitle = NormalizeTitle(title);
        return !byTitle.has(normalizedTitle) && !byTitle.has(titleAliases[normalizedTitle]);
    });
    const skipped = discovered.filter((movie) => !matched.has(NormalizeTitle(movie.title)));
    const outputPath = path.join(__dirname, 'data', 'movies.json');
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    await fs.writeFile(outputPath, `${JSON.stringify(output, null, 4)}\n`, 'utf8');
    console.log('Timeline titles not found on TMDB:', missing.length ? `\n${missing.join('\n')}` : 'None');
    console.log('TMDB Marvel Studios movies skipped:', skipped.length ? `\n${skipped.map((movie) => movie.title).join('\n')}` : 'None');
}

SyncMovies().catch((error) => { console.error(`Movie sync failed: ${error.message}`); process.exitCode = 1; });
