require('dotenv').config();
const path = require('path');
const { connectDatabase, closeDatabase } = require('./src/db');
const { createRepositories } = require('./src/repositories');
const { createApp } = require('./src/app');
const port = Number(process.env.PORT || 3000);
async function start() {
  const db = await connectDatabase();
  const app = createApp({ repositories: createRepositories(db), frontendPath: path.join(__dirname, '..') });
  const server = app.listen(port, () => console.log(`Knight Hacks Reading List server listening on port ${port}`));
  const shutdown = () => server.close(async () => { await closeDatabase(); process.exit(0); });
  process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
}
if (require.main === module) start().catch(() => { console.error('Server startup failed. Check the server configuration and database availability.'); process.exitCode = 1; });
module.exports = { start };
