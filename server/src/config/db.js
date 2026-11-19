const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : { rejectUnauthorized: false },
  // These settings fix the Neon connection dropping issue:
  max: 10, 
  idleTimeoutMillis: 30000, 
  connectionTimeoutMillis: 2000, 
});

pool.on('connect', () => console.log('✅ PostgreSQL connected'));
pool.on('error', (err) => {
  console.error('❌ Unexpected error on idle client', err);
  // Don't crash the process, just log it!
});

module.exports = pool;