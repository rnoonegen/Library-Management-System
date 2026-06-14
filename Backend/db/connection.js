const mysql = require('mysql2/promise');
const { getMySQLConfig } = require('../config/database');

let pool = null;

async function connectMySQL() {
  if (pool) return pool;

  const config = getMySQLConfig();
  if (!config) {
    throw new Error('MySQL is not enabled. Set DB_PROFILE=local or DB_PROFILE=online in backend/.env');
  }

  pool = mysql.createPool({
    ...config,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  });

  const connection = await pool.getConnection();
  connection.release();
  return pool;
}

function getPool() {
  return pool;
}

module.exports = { connectMySQL, getPool };
