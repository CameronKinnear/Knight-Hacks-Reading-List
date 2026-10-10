# Knight Hacks Marvel Movie Timeline

A movie-only, in-universe chronological list of Marvel Studios films. Movie data is synced from TMDB and served by this app's read-only API.

## Run the app

```text
cd server
npm install
npm start
```

Open http://localhost:3000.

## Rebuild movie data

From the repository root, copy `server/.env.example` to `server/.env`, add your TMDB v3 API key, then run:

```text
cd server
npm run sync
```

The sync downloads Marvel Studios movies from TMDB and writes `server/data/movies.json`. The key stays on the server and is never used by browser code. Commit the generated JSON so deployment does not require a TMDB key.

## Edit the timeline

Edit the ordered title array in `server/timeline.js`. Titles are matched to TMDB after lowercasing and removing punctuation. Run `npm run sync` again to rebuild the data and see titles that did not match or TMDB titles that were skipped.

## API routes

- `GET /api/movies` returns movies in in-universe timeline order.
- `GET /api/movies?order=release` sorts by release date.
- `GET /api/movies/:id` returns one movie by TMDB ID.

Invalid order values return 400, missing movies return 404, and missing generated data returns 503.

## Hosting

For an Express deployment, Render offers a free web service that sleeps after 15 minutes idle and can take about a minute to wake. DigitalOcean App Platform is about $5/month and may be covered by GitHub Student Developer Pack credit; verify current terms. Use build command `cd server && npm install` and start command `cd server && npm start`. Commit `server/data/movies.json` first.

For free always-on static hosting, skip the server, publish `movies.json` as a static file, and sort it in the browser from `scripts/api.js`. GitHub Pages, Netlify, or Vercel can host the static app.
