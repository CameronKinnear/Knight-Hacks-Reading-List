const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');
const request = require('supertest');
const { createApp } = require('../src/app');

function harness() {
  const movies = [
    { id: 1, title: 'Captain America', release_date: '2011-07-22', timeline_order: 1, overview: 'First' },
    { id: 2, title: 'Iron Man', release_date: '2008-05-02', timeline_order: 2, overview: 'Second' }
  ];
  const users = new Map(), sessions = new Map(), entries = new Map(); let nextEntry = 0;
  const repo = {
    movies: { list: async ({ order = 'timeline', search = '' } = {}) => movies.filter((m) => m.title.toLowerCase().includes(search.toLowerCase())).sort((a, b) => order === 'release' ? a.release_date.localeCompare(b.release_date) : a.timeline_order - b.timeline_order), get: async (id) => movies.find((m) => m.id === Number(id)) || null, has: async (id) => movies.some((m) => m.id === Number(id)) },
    users: { create: async (u) => { const user = { ...u, _id: String(users.size + 1) }; users.set(user.email, user); return user; }, byEmail: async (e) => users.get(e) || null, byId: async (id) => [...users.values()].find((u) => u._id === id) || null },
    sessions: { create: async (s) => sessions.set(s.tokenHash, s), get: async (hash) => { const s = sessions.get(hash); return s && s.expiresAt > new Date() ? s : null; }, remove: async (hash) => sessions.delete(hash) },
    watchlist: { list: async (userId) => [...entries.values()].filter((e) => e.userId === userId), get: async (userId, id) => { const e = entries.get(id); return e?.userId === userId ? e : null; }, create: async (e) => { if ([...entries.values()].some((x) => x.userId === e.userId && x.movieId === e.movieId)) { const err = new Error('duplicate'); err.code = 11000; err.keyPattern = { movieId: 1 }; throw err; } const value = { ...e, _id: String(++nextEntry) }; entries.set(value._id, value); return value; }, update: async (userId, id, changes) => { const e = entries.get(id); if (!e || e.userId !== userId) return null; Object.assign(e, changes); return e; }, remove: async (userId, id) => { const e = entries.get(id); return e?.userId === userId ? entries.delete(id) : false; } }
  };
  return { app: createApp({ repositories: repo, secureCookie: false, frontendPath: path.join(__dirname, '..', '..') }), repo };
}
const credentials = (email = 'reader@example.com') => ({ email, password: 'correct-horse-123' });

test('public catalog preserves fields and supports order, search, and detail lookup', async () => {
  const { app } = harness();
  const timeline = await request(app).get('/api/movies'); assert.equal(timeline.status, 200); assert.equal(timeline.body[0].id, 1); assert.equal(timeline.body[0].overview, 'First');
  const release = await request(app).get('/api/movies?order=release'); assert.equal(release.body[0].id, 2);
  assert.equal((await request(app).get('/api/movies?search=iron')).body.length, 1);
  assert.equal((await request(app).get('/api/movies/1')).body.title, 'Captain America');
  assert.equal((await request(app).get('/api/movies/999')).body.error.code, 'MOVIE_NOT_FOUND');
  assert.equal((await request(app).get('/api/movies?order=bad')).body.error.code, 'VALIDATION_ERROR');
});

test('registration, current user, login, logout, and invalid credentials', async () => {
  const { app } = harness(), agent = request.agent(app);
  const registered = await agent.post('/api/auth/register').send(credentials()); assert.equal(registered.status, 201); assert.equal(registered.body.user.email, 'reader@example.com'); assert.equal(JSON.stringify(registered.body).includes('passwordHash'), false); assert.match(registered.headers['set-cookie'][0], /HttpOnly/);
  assert.equal((await agent.get('/api/auth/me')).status, 200);
  assert.equal((await agent.post('/api/auth/register').send(credentials())).body.error.code, 'EMAIL_ALREADY_REGISTERED');
  assert.equal((await request(app).post('/api/auth/login').send(credentials('missing@example.com'))).body.error.code, 'INVALID_CREDENTIALS');
  const other = request.agent(app); assert.equal((await other.post('/api/auth/login').send(credentials())).status, 200); assert.equal((await other.get('/api/auth/me')).status, 200);
  assert.equal((await agent.post('/api/auth/logout')).status, 204); assert.equal((await agent.get('/api/auth/me')).status, 401);
});

test('Watchlist requires authentication, is owner scoped, and supports CRUD with duplicate prevention', async () => {
  const { app } = harness(); assert.equal((await request(app).get('/api/watchlist')).status, 401);
  const a = request.agent(app), b = request.agent(app);
  await a.post('/api/auth/register').send(credentials('a@example.com')); await b.post('/api/auth/register').send(credentials('b@example.com'));
  const created = await a.post('/api/watchlist').send({ movieId: 1 }); assert.equal(created.status, 201); assert.equal(created.body.status, 'planned'); assert.equal(created.body.movie.title, 'Captain America');
  assert.equal((await a.post('/api/watchlist').send({ movieId: 999 })).body.error.code, 'MOVIE_NOT_FOUND');
  assert.equal((await a.post('/api/watchlist').send({ movieId: 1 })).body.error.code, 'DUPLICATE_WATCHLIST_ENTRY');
  const id = created.body.id; assert.equal((await b.get(`/api/watchlist/${id}`)).status, 404); assert.equal((await b.patch(`/api/watchlist/${id}`).send({ status: 'watched' })).status, 404);
  const updated = await a.patch(`/api/watchlist/${id}`).send({ status: 'watching', note: 'Rewatch soon' }); assert.equal(updated.body.status, 'watching'); assert.equal(updated.body.note, 'Rewatch soon');
  assert.equal((await a.get('/api/watchlist')).body.length, 1); assert.equal((await a.delete(`/api/watchlist/${id}`)).status, 204); assert.equal((await a.get('/api/watchlist')).body.length, 0);
});

test('validation and API errors use the standard envelope', async () => {
  const { app } = harness();
  const bad = await request(app).post('/api/auth/register').send({ email: 'bad', password: 'x' }); assert.equal(bad.status, 400); assert.deepEqual(Object.keys(bad.body), ['error']); assert.equal(bad.body.error.code, 'VALIDATION_ERROR'); assert.equal(typeof bad.body.error.details, 'object');
  const missing = await request(app).get('/api/unknown'); assert.equal(missing.status, 404); assert.equal(missing.body.error.code, 'ROUTE_NOT_FOUND');
  assert.equal((await request(app).get('/health')).body.status, 'ok');
});
