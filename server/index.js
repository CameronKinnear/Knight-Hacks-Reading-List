require('dotenv').config();
const express = require('express');
const fs = require('fs/promises');
const path = require('path');
const app = express();
const port = process.env.PORT || 3000;
const dataPath = path.join(__dirname, 'data', 'movies.json');
const frontendPath = path.join(__dirname, '..');

/*
Reads the latest movie data from disk.
:returns - Movie array, or null when the file is missing
*/
async function ReadMovies() {
    try { return JSON.parse(await fs.readFile(dataPath, 'utf8')); }
    catch (error) { if (error.code === 'ENOENT') return null; throw error; }
}

/*
Sends the missing-data response.
:response - Express response object
:returns - Sent response
*/
function SendDataUnavailable(response) {
    return response.status(503).json({ error: 'Movie data is missing. Run "npm run sync" in the server directory to generate server/data/movies.json.' });
}

app.get('/api/movies', async (request, response) => {
    const order = request.query.order ?? 'timeline';
    if (order !== 'timeline' && order !== 'release') return response.status(400).json({ error: 'Invalid order. Use "timeline" or "release".' });
    const movies = await ReadMovies();
    if (!movies) return SendDataUnavailable(response);
    movies.sort((a, b) => order === 'timeline'
        ? a.timeline_order - b.timeline_order
        : (a.release_date || '').localeCompare(b.release_date || '') || a.timeline_order - b.timeline_order);
    return response.json(movies);
});

app.get('/api/movies/:id', async (request, response) => {
    const movies = await ReadMovies();
    if (!movies) return SendDataUnavailable(response);
    const movie = movies.find((entry) => String(entry.id) === request.params.id);
    return movie ? response.json(movie) : response.status(404).json({ error: 'Movie not found.' });
});

app.use('/api', (request, response) => response.status(404).json({ error: 'API route not found.' }));
app.get('/', (request, response) => response.sendFile(path.join(frontendPath, 'index.html')));
app.use('/styles', express.static(path.join(frontendPath, 'styles'), { index: false }));
app.use('/scripts', express.static(path.join(frontendPath, 'scripts'), { index: false }));
app.use((request, response) => response.status(404).type('text').send('Not found.'));
app.listen(port, () => console.log(`Knight Hacks Reading List server listening on port ${port}`));
