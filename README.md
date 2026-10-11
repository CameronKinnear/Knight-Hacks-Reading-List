# Knight Hacks Marvel Movie Timeline API

Express serves the existing frontend and a MongoDB Atlas backed API. The shared catalog contains the project-owned canonical chronology of Marvel Studios theatrical films. Ordinary users can browse it; registered users can manage only their own Watchlist.

## Local setup

Use Node.js 18 or newer. From `server/`, install dependencies and create `.env` based on `.env.example`. Set `MONGODB_URI` to an Atlas connection string and optionally `MONGODB_DB` (defaults to `Knighthacksmarvel`). Set `TMDB_API_KEY` only when running sync. Never commit `.env` or paste secrets into logs.

```sh
cd server
npm install
npm run sync   # maintainer action: fetch TMDB metadata following timeline.js
npm run seed   # maintainer action: idempotently import movies.json into MongoDB
npm start
```

The deployed Render web service uses root directory `server`, build command `npm install`, and start command `npm start`. Configure `MONGODB_URI` and `MONGODB_DB` in Render environment settings. Set the health check path to `/health`. Run sync and seed deliberately when updating the catalog; no TMDB key is needed at runtime.

## Responses and errors

Movie catalog responses preserve the existing JSON array/object and TMDB fields, including `id`, `title`, `release_date`, `timeline_order`, `runtime`, `overview`, `tagline`, `poster_url`, `director`, and `cast`. Dates in chronological order reflect project curation, not theatrical release order. Authenticated routes use the `kh_session` HttpOnly, SameSite=Lax cookie (Secure in production). Sessions expire after 14 days. Request errors use `{ "error": { "code": "...", "message": "...", "details": {} } }`.

## Endpoints

| Method | Path | Access | Behavior |
| --- | --- | --- | --- |
| GET | `/health` | Public | Deployment health check |
| GET | `/api/movies?order=timeline\|release&search=iron` | Public | Catalog search and ordering; defaults to timeline |
| GET | `/api/movies/:id` | Public | Movie by TMDB ID |
| POST | `/api/auth/register` | Public, rate limited | `{ "email", "password" }`; creates account and session |
| POST | `/api/auth/login` | Public, rate limited | `{ "email", "password" }`; starts session |
| GET | `/api/auth/me` | Signed in | Current user |
| POST | `/api/auth/logout` | Signed in | Revokes session and clears cookie |
| GET | `/api/watchlist` | Signed in | Current user's entries with movie details |
| POST | `/api/watchlist` | Signed in | `{ "movieId": 1771, "status": "planned", "note": "optional" }` |
| GET | `/api/watchlist/:id` | Signed in | One owned entry |
| PATCH | `/api/watchlist/:id` | Signed in | Update `status` and/or `note` |
| DELETE | `/api/watchlist/:id` | Signed in | Remove owned entry (204) |

Viewing progress is `planned`, `watching`, or `watched`. Each user can have one entry per movie. Another user's entry is reported as not found.

## Example flow

Register or log in and retain the cookie jar. Then add, update, and remove an entry:

```sh
curl -i -c cookies.txt -H 'Content-Type: application/json' -d '{"email":"reader@example.com","password":"correct-horse-123"}' http://localhost:3000/api/auth/register
curl -i -b cookies.txt -H 'Content-Type: application/json' -d '{"movieId":1771,"status":"planned","note":"Start here"}' http://localhost:3000/api/watchlist
curl -i -b cookies.txt http://localhost:3000/api/watchlist
curl -i 'http://localhost:3000/api/movies?search=Captain&order=release'
```

The Bruno collection in `server/bruno/` contains the same core demonstration flow.
