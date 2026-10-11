const { MongoClient } = require('mongodb');
let client; let database;
async function connectDatabase(env = process.env) {
  if (database) return database;
  if (!env.MONGODB_URI) throw new Error('MONGODB_URI is required.');
  client = new MongoClient(env.MONGODB_URI); await client.connect();
  database = client.db(env.MONGODB_DB || 'Knighthacksmarvel');
  await Promise.all([
    database.collection('users').createIndex({ email: 1 }, { unique: true }),
    database.collection('sessions').createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    database.collection('watchlistEntries').createIndex({ userId: 1, movieId: 1 }, { unique: true }),
    database.collection('watchlistEntries').createIndex({ userId: 1 })
  ]);
  return database;
}
async function closeDatabase() { if (client) await client.close(); client = undefined; database = undefined; }
module.exports = { connectDatabase, closeDatabase };
