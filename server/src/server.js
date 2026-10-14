// const http = require('http');
// const app = require('./app');
// require('dotenv').config();

// const server = http.createServer(app);
// const PORT = process.env.PORT || 5000;

// server.listen(PORT, () => {
//   console.log(`✅ Server running on http://localhost:${PORT}`);
// });

// src/server.js
require('dotenv').config();

console.log('=== Server Starting ===');
console.log('PORT:', process.env.PORT);
console.log('Mode:', process.env.NODE_ENV);

const pool = require('./config/db');

(async () => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log(' Database connected successfully');
    console.log('   Database:', result.rows[0].db);
    console.log('   Server time:', result.rows[0].now);

    const postgis = await pool.query('SELECT postgis_version() as v');
    console.log(' PostGIS version:', postgis.rows[0].v);

    const tables = await pool.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log(' Tables found:', tables.rows[0].count);

    console.log(' Server running on http://localhost:5000');
  } catch (err) {
    console.error(' Error:', err.message);
    console.error('   Full error:', err);
    process.exit(1);
  }
})();