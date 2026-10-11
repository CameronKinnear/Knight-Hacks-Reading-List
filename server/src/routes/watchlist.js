const express = require('express');
const { HttpError } = require('../errors');
const { schemas, validate } = require('../validation');
function present(entry, movie) {
  return { id: String(entry._id), movieId: entry.movieId, status: entry.status, ...(entry.note !== undefined ? { note: entry.note } : {}), createdAt: entry.createdAt, updatedAt: entry.updatedAt, movie };
}
function watchlistRoutes(repositories, authenticate) {
  const router = express.Router();
  router.use(authenticate);
  router.get('/', async (req, res, next) => {
    try { const entries = await repositories.watchlist.list(req.user._id); res.json(await Promise.all(entries.map(async (entry) => present(entry, await repositories.movies.get(entry.movieId))))); } catch (e) { next(e); }
  });
  router.post('/', validate(schemas.entryCreate), async (req, res, next) => {
    try {
      if (!(await repositories.movies.has(req.validated.movieId))) throw new HttpError(404, 'MOVIE_NOT_FOUND', 'Movie not found.');
      const entry = await repositories.watchlist.create({ userId: String(req.user._id), movieId: req.validated.movieId, status: req.validated.status, ...(req.validated.note !== undefined ? { note: req.validated.note } : {}), createdAt: new Date(), updatedAt: new Date() });
      res.status(201).json(present(entry, await repositories.movies.get(entry.movieId)));
    } catch (e) { next(e); }
  });
  router.get('/:id', async (req, res, next) => {
    try { const entry = await repositories.watchlist.get(req.user._id, req.params.id); if (!entry) throw new HttpError(404, 'WATCHLIST_ENTRY_NOT_FOUND', 'Watchlist entry not found.'); res.json(present(entry, await repositories.movies.get(entry.movieId))); } catch (e) { next(e); }
  });
  router.patch('/:id', validate(schemas.entryUpdate), async (req, res, next) => {
    try { const entry = await repositories.watchlist.update(req.user._id, req.params.id, { ...req.validated, updatedAt: new Date() }); if (!entry) throw new HttpError(404, 'WATCHLIST_ENTRY_NOT_FOUND', 'Watchlist entry not found.'); res.json(present(entry, await repositories.movies.get(entry.movieId))); } catch (e) { next(e); }
  });
  router.delete('/:id', async (req, res, next) => {
    try { if (!(await repositories.watchlist.remove(req.user._id, req.params.id))) throw new HttpError(404, 'WATCHLIST_ENTRY_NOT_FOUND', 'Watchlist entry not found.'); res.status(204).end(); } catch (e) { next(e); }
  });
  return router;
}
module.exports = { watchlistRoutes, present };
