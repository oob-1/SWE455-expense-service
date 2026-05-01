const { Pool } = require('pg');
const { Connector } = require('@google-cloud/cloud-sql-connector');
const config = require('../config');
const logger = require('../lib/logger');

let pool;

async function getPool() {
  if (pool) return pool;

  if (config.db.cloudSqlInstance) {
    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: config.db.cloudSqlInstance,
      ipType: 'PUBLIC',
    });
    pool = new Pool({
      ...clientOpts,
      database: config.db.name,
      user:     config.db.user,
      password: config.db.password,
      max: 10,
    });
    logger.info('PG pool created via Cloud SQL connector');
  } else {
    pool = new Pool({
      host:     config.db.host,
      port:     config.db.port,
      database: config.db.name,
      user:     config.db.user,
      password: config.db.password,
      max: 10,
    });
    logger.info({ host: config.db.host }, 'PG pool created via TCP');
  }

  return pool;
}

async function closePool() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = { getPool, closePool };
