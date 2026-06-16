const { Pool } = require('pg');
const { getPostgreSQLConfig } = require('./database');

let pool = null;

async function connectPostgreSQL() {
  if (pool) return pool;

  const config = getPostgreSQLConfig();
  if (!config) {
    throw new Error('PostgreSQL is not enabled. Set DB_PROFILE=local or DB_PROFILE=online in backend/.env');
  }

  pool = new Pool({
    ...config,
    max: 10,
  });

  await pool.query('SELECT 1');
  return pool;
}

function getPool() {
  if (!pool) {
    throw new Error('Database not connected. Call connectPostgreSQL() first.');
  }
  return pool;
}

async function withTransaction(callback) {
  const client = await getPool().connect();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { connectPostgreSQL, getPool, withTransaction };
