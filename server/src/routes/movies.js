const express = require('express');
const { HttpError } = require('../errors');
const { schemas, validate, validateQuery } = require('../validation');
function movieRoutes(repositories) {
  const router = express.Router();
  router.get('/', validateQuery(schemas.movieQuery), async (req, res, next) => {
    try { res.json(await repositories.movies.list(req.validated)); } catch (e) { next(e); }
  });
  router.get('/:id', async (req, res, next) => {
    try { if (!/^\d+$/.test(req.params.id)) throw new HttpError(404, 'MOVIE_NOT_FOUND', 'Movie not found.'); const movie = await repositories.movies.get(req.params.id); if (!movie) throw new HttpError(404, 'MOVIE_NOT_FOUND', 'Movie not found.'); res.json(movie); } catch (e) { next(e); }
  });
  return router;
}
module.exports = { movieRoutes };
