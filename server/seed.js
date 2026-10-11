require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { connectDatabase, closeDatabase } = require('./src/db');
async function seed() {
  const records = JSON.parse(fs.readFileSync(path.join(__dirname, 'data', 'movies.json'), 'utf8'));
  if (!Array.isArray(records) || !records.length) throw new Error('Run npm run sync first; the catalog file is empty or invalid.');
  const ids = new Set();
  records.forEach((movie, i) => { if (!Number.isInteger(movie.id) || !movie.title || movie.timeline_order !== i + 1 || ids.has(movie.id)) throw new Error(`Invalid catalog record at timeline position ${i + 1}.`); ids.add(movie.id); });
  const db = await connectDatabase(), collection = db.collection('movies');
  await collection.bulkWrite(records.map((movie) => ({ updateOne: { filter: { id: movie.id }, update: { $set: movie }, upsert: true } })), { ordered: true });
  await collection.deleteMany({ id: { $nin: records.map((movie) => movie.id) } });
  console.log(`Imported ${records.length} movies into the catalog.`);
}
seed().catch((e) => { console.error(`Catalog import failed: ${e.message}`); process.exitCode = 1; }).finally(closeDatabase);
