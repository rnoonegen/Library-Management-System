const path = require('path');
const fs = require('fs');
const mysql = require('mysql2/promise');
require('dotenv').config();

const { getDbMode, isMySQLEnabled, getMySQLConfig } = require('../config/database');
const seedBooks = require('../db/seed-books');

async function resetAndSeed() {
  const mode = getDbMode();
  if (!isMySQLEnabled()) {
    console.error('Set DB_PROFILE=local in backend/.env first.');
    process.exit(1);
  }

  const config = getMySQLConfig();
  const connectionConfig = mode === 'local' ? { ...config, database: undefined } : config;
  const connection = await mysql.createConnection(connectionConfig);

  const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf8');

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
    if (statement.toUpperCase().includes('CREATE TABLE IF NOT EXISTS BOOKS')) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 0');
      await connection.query('DROP TABLE IF EXISTS transactions');
      await connection.query('DROP TABLE IF EXISTS books');
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    await connection.query(statement);
  }

  for (const book of seedBooks) {
    await connection.query(
      'INSERT INTO books (isbn, title, publisher, author, qty) VALUES (?, ?, ?, ?, ?)',
      [book.isbn, book.title, book.publisher, book.author, book.qty]
    );
  }

  const [count] = await connection.query('SELECT COUNT(*) AS total FROM books');
  console.log(`Seeded ${count[0].total} books into ${mode} MySQL database.`);
  await connection.end();
}

resetAndSeed().catch((err) => {
  console.error('Seed failed:', err.message);
  process.exit(1);
});
