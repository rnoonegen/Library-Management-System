const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const { getDbMode, isMySQLEnabled, getDbModeLabel } = require('../config/database');
const { connectMySQL, getPool } = require('../db/connection');

async function runSchema() {
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  await connectMySQL();
  const pool = getPool();

  const statements = schema
    .split(';')
    .map((s) => s.trim())
    .filter((s) => s.length > 0 && !s.startsWith('--'))
    .filter((s) => {
      if (mode !== 'online') return true;
      const upper = s.toUpperCase();
      return !upper.startsWith('CREATE DATABASE') && !upper.startsWith('USE ');
    });

  for (const statement of statements) {
    await pool.query(statement);
  }
}

async function main() {
  const mode = getDbMode();

  if (!isMySQLEnabled()) {
    console.error('Set DB_PROFILE=local or DB_PROFILE=online in backend/.env before running this script.');
    process.exit(1);
  }

  try {
    await runSchema();
    console.log(`Database schema applied successfully (${getDbModeLabel()}).`);
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    process.exit(1);
  } finally {
    const pool = getPool();
    if (pool) await pool.end();
  }
}

main();
