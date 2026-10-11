const crypto = require('crypto');
const bcrypt = require('bcrypt');
const { HttpError } = require('./errors');
const COOKIE = 'kh_session';
const SESSION_DAYS = 14;
function hashToken(token) { return crypto.createHash('sha256').update(token).digest('hex'); }
function cookieOptions(secure) { return { httpOnly: true, secure, sameSite: 'lax', path: '/', maxAge: SESSION_DAYS * 86400000 }; }
function createAuth(repositories, { secureCookie = process.env.NODE_ENV === 'production' } = {}) {
  async function issueSession(user, res) {
    const token = crypto.randomBytes(32).toString('base64url');
    await repositories.sessions.create({ userId: user._id, tokenHash: hashToken(token), createdAt: new Date(), expiresAt: new Date(Date.now() + SESSION_DAYS * 86400000) });
    res.cookie(COOKIE, token, cookieOptions(secureCookie));
  }
  async function authenticate(req, res, next) {
    try {
      const token = req.cookies?.[COOKIE];
      if (!token) throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Sign in to access this resource.');
      const session = await repositories.sessions.get(hashToken(token));
      if (!session) throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Your session is invalid or expired.');
      const user = await repositories.users.byId(String(session.userId));
      if (!user) throw new HttpError(401, 'AUTHENTICATION_REQUIRED', 'Your session is invalid or expired.');
      req.user = user; req.sessionTokenHash = hashToken(token); next();
    } catch (error) { next(error); }
  }
  return { issueSession, authenticate, cookie: COOKIE, cookieOptions: cookieOptions(secureCookie) };
}
function publicUser(user) { return { id: String(user._id), email: user.email, createdAt: user.createdAt }; }
function authRoutes(express, repositories, auth, validation, rateLimit) {
  const router = express.Router();
  const authLimit = rateLimit({ windowMs: 15 * 60 * 1000, limit: 10, standardHeaders: true, legacyHeaders: false, message: { error: { code: 'RATE_LIMITED', message: 'Too many authentication attempts. Try again later.', details: {} } } });
  router.post('/register', authLimit, validation.validate(validation.schemas.register), async (req, res, next) => {
    try {
      if (await repositories.users.byEmail(req.validated.email)) throw new HttpError(409, 'EMAIL_ALREADY_REGISTERED', 'An account with this email already exists.');
      const user = await repositories.users.create({ email: req.validated.email, passwordHash: await bcrypt.hash(req.validated.password, 12), createdAt: new Date() });
      await auth.issueSession(user, res); res.status(201).json({ user: publicUser(user) });
    } catch (e) { next(e); }
  });
  router.post('/login', authLimit, validation.validate(validation.schemas.login), async (req, res, next) => {
    try {
      const user = await repositories.users.byEmail(req.validated.email);
      if (!user || !(await bcrypt.compare(req.validated.password, user.passwordHash))) throw new HttpError(401, 'INVALID_CREDENTIALS', 'Email or password is incorrect.');
      await auth.issueSession(user, res); res.json({ user: publicUser(user) });
    } catch (e) { next(e); }
  });
  router.get('/me', auth.authenticate, (req, res) => res.json({ user: publicUser(req.user) }));
  router.post('/logout', auth.authenticate, async (req, res, next) => {
    try { await repositories.sessions.remove(req.sessionTokenHash); res.clearCookie(auth.cookie, { ...auth.cookieOptions, maxAge: undefined }); res.status(204).end(); } catch (e) { next(e); }
  });
  return router;
}
module.exports = { createAuth, authRoutes, publicUser };
