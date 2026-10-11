const { ObjectId } = require('mongodb');
function escapeRegex(value) { return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
function createRepositories(db) {
  const movies = db.collection('movies'), users = db.collection('users'), sessions = db.collection('sessions'), entries = db.collection('watchlistEntries');
  return {
    movies: {
      async list({ order = 'timeline', search = '' } = {}) { return movies.find(search ? { title: { $regex: escapeRegex(search), $options: 'i' } } : {}, { projection: { _id: 0 } }).sort(order === 'release' ? { release_date: 1, timeline_order: 1 } : { timeline_order: 1 }).toArray(); },
      async get(id) { return movies.findOne({ id: Number(id) }, { projection: { _id: 0 } }); },
      async has(id) { return Boolean(await movies.findOne({ id: Number(id) }, { projection: { _id: 1 } })); },
      async upsertMany(records) { if (records.length) await movies.bulkWrite(records.map((movie) => ({ updateOne: { filter: { id: movie.id }, update: { $set: movie }, upsert: true } })), { ordered: false }); }
    },
    users: {
      async create(user) { const r = await users.insertOne(user); return { ...user, _id: r.insertedId }; },
      async byEmail(email) { return users.findOne({ email }); },
      async byId(id) { return ObjectId.isValid(id) ? users.findOne({ _id: new ObjectId(id) }) : null; }
    },
    sessions: {
      async create(session) { await sessions.insertOne(session); },
      async get(tokenHash) { return sessions.findOne({ tokenHash, expiresAt: { $gt: new Date() } }); },
      async remove(tokenHash) { await sessions.deleteOne({ tokenHash }); }
    },
    watchlist: {
      async list(userId) { return entries.find({ userId: new ObjectId(userId) }).sort({ createdAt: 1 }).toArray(); },
      async get(userId, id) { return ObjectId.isValid(id) ? entries.findOne({ _id: new ObjectId(id), userId: new ObjectId(userId) }) : null; },
      async create(entry) { const r = await entries.insertOne({ ...entry, userId: new ObjectId(entry.userId) }); return entries.findOne({ _id: r.insertedId }); },
      async update(userId, id, changes) { if (!ObjectId.isValid(id)) return null; const r = await entries.findOneAndUpdate({ _id: new ObjectId(id), userId: new ObjectId(userId) }, { $set: changes }, { returnDocument: 'after' }); return r.value; },
      async remove(userId, id) { if (!ObjectId.isValid(id)) return false; return (await entries.deleteOne({ _id: new ObjectId(id), userId: new ObjectId(userId) })).deletedCount === 1; }
    }
  };
}
module.exports = { createRepositories };
