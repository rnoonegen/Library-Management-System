const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { getDbMode, isMySQLEnabled, getMySQLConfig, getDbModeLabel } = require('../config/database');

async function runSchema(mode) {
  const config = getMySQLConfig();
  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

  // For local setup, connect without database so CREATE DATABASE can run first
  const connectionConfig =
    mode === 'local' ? { ...config, database: undefined } : config;

  const connection = await mysql.createConnection(connectionConfig);

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
    await connection.query(statement);
  }

  await connection.end();
}

async function main() {
  const mode = getDbMode();

  if (!isMySQLEnabled()) {
    console.error('Create backend/.env from .env.local.example (not .env.example).');
    console.error('Set DB_PROFILE=local and your MySQL password, then run again.');
    process.exit(1);
  }

  try {
    await runSchema(mode);
    console.log(`Database schema applied successfully (${getDbModeLabel()}).`);
  } catch (err) {
    console.error('Failed to apply schema:', err.message);
    process.exit(1);
  }
}

main();
