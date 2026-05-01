const fs = require('fs');
const path = require('path');
const { getPool } = require('./pool');
const logger = require('../lib/logger');

async function runMigrations() {
  const pool = await getPool();

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const dir = path.join(__dirname, 'migrations');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();

  for (const file of files) {
    const { rows } = await pool.query(
      'SELECT 1 FROM schema_migrations WHERE version = $1',
      [file]
    );

    if (rows.length) {
      logger.info({ file }, 'already applied');
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    const client = await pool.connect();

    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query(
        'INSERT INTO schema_migrations(version) VALUES ($1)',
        [file]
      );
      await client.query('COMMIT');
      logger.info({ file }, 'migration applied');
    } catch (e) {
      await client.query('ROLLBACK');
      logger.error({ file, err: e.message }, 'migration failed');
      throw e;
    } finally {
      client.release();
    }
  }
}

module.exports = runMigrations;