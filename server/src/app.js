const express = require('express');
const rateLimit = require('express-rate-limit');
const { createAuth, authRoutes } = require('./auth');
const { movieRoutes } = require('./routes/movies');
const { watchlistRoutes } = require('./routes/watchlist');
const { errorHandler, notFound } = require('./errors');
function createApp({ repositories, frontendPath, secureCookie }) {
  const app = express(); app.disable('x-powered-by');
  app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : false);
  app.use(express.json({ limit: '20kb' }));
  app.use((req, res, next) => { req.cookies = {}; for (const part of (req.headers.cookie || '').split(';')) { const i = part.indexOf('='); if (i > 0) req.cookies[part.slice(0, i).trim()] = decodeURIComponent(part.slice(i + 1).trim()); } res.cookie = (name, value, opts) => { const parts = [`${name}=${encodeURIComponent(value)}`, `Path=${opts.path}`, 'HttpOnly', 'SameSite=Lax']; if (opts.secure) parts.push('Secure'); if (opts.maxAge) parts.push(`Max-Age=${Math.floor(opts.maxAge / 1000)}`); res.append('Set-Cookie', parts.join('; ')); }; res.clearCookie = (name, opts) => res.append('Set-Cookie', `${name}=; Path=${opts.path}; HttpOnly; SameSite=Lax${opts.secure ? '; Secure' : ''}; Max-Age=0`); next(); });
  const auth = createAuth(repositories, { secureCookie });
  app.get('/health', (req, res) => res.json({ status: 'ok' }));
  app.use('/api/movies', movieRoutes(repositories));
  app.use('/api/auth', authRoutes(express, repositories, auth, require('./validation'), rateLimit));
  app.use('/api/watchlist', watchlistRoutes(repositories, auth.authenticate));
  app.use('/api', notFound);
  app.use('/styles', express.static(require('path').join(frontendPath, 'styles'), { index: false }));
  app.use('/scripts', express.static(require('path').join(frontendPath, 'scripts'), { index: false }));
  app.get('/', (req, res) => res.sendFile(require('path').join(frontendPath, 'index.html')));
  app.use((req, res) => res.status(404).type('text').send('Not found.'));
  app.use(errorHandler);
  return app;
}
module.exports = { createApp };
