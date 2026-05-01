require('dotenv').config();
const { buildApp } = require('./app');
const { getPool, closePool } = require('./db/pool');
const config = require('./config');
const logger = require('./lib/logger');

(async () => {
  await getPool();                 // verify DB connectivity at boot
  const app = buildApp();
  const server = app.listen(config.port, () =>
    logger.info({ port: config.port }, 'expense-service listening'));

  const shutdown = async (signal) => {
    logger.info({ signal }, 'shutting down');
    server.close(async () => { await closePool(); process.exit(0); });
    setTimeout(() => process.exit(1), 10_000).unref();
  };
  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT',  () => shutdown('SIGINT'));
})().catch(err => { logger.error(err); process.exit(1); });
