// const { Pool } = require('pg');
// require('dotenv').config();

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
// });

// pool.on('connect', () => console.log('✅ PostgreSQL connected'));
// pool.on('error', (err) => console.error('❌ DB error:', err));

// module.exports = pool;

const { Pool } = require('pg');
require('dotenv').config();

const connectionString = process.env.DATABASE_URL;

// Strip sslmode param — we'll handle SSL explicitly below
const cleanUrl = connectionString?.replace(/[?&]sslmode=[^&]*/g, '')
                                 .replace(/[?&]channel_binding=[^&]*/g, '');

// Neon & most cloud Postgres providers require SSL
const needsSSL =
  connectionString &&
  !connectionString.includes('localhost') &&
  !connectionString.includes('127.0.0.1');

const pool = new Pool({
  connectionString: cleanUrl,
  ssl: needsSSL ? { rejectUnauthorized: false } : false,
});

pool.on('connect', () => console.log(' PostgreSQL connected'));
pool.on('error', (err) => console.error(' DB error:', err));

module.exports = pool;