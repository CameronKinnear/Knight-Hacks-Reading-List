class HttpError extends Error { constructor(status, code, message, details = {}) { super(message); this.status = status; this.code = code; this.details = details; } }
function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  if (error.type === 'entity.parse.failed') return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Request body must contain valid JSON.', details: {} } });
  const status = error.status || 500;
  if (error.code === 11000 && error.keyPattern?.email) return res.status(409).json({ error: { code: 'EMAIL_ALREADY_REGISTERED', message: 'An account with this email already exists.', details: {} } });
  if (error.code === 11000 && error.keyPattern?.movieId) return res.status(409).json({ error: { code: 'DUPLICATE_WATCHLIST_ENTRY', message: 'This movie is already in your Watchlist.', details: {} } });
  return res.status(status).json({ error: { code: error.code || 'INTERNAL_SERVER_ERROR', message: status >= 500 ? 'An unexpected error occurred.' : error.message, details: error.details || {} } });
}
function notFound(req, res) { res.status(404).json({ error: { code: 'ROUTE_NOT_FOUND', message: 'API route not found.', details: {} } }); }
module.exports = { HttpError, errorHandler, notFound };
