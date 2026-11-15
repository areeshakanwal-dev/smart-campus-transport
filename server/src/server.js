// // src/server.js
// require('dotenv').config();

// console.log('=== Server Starting ===');
// console.log('PORT:', process.env.PORT);
// console.log('Mode:', process.env.NODE_ENV);

// const pool = require('./config/db');

// (async () => {
//   try {
//     const result = await pool.query('SELECT NOW() as now, current_database() as db');
//     console.log(' Database connected successfully');
//     console.log('   Database:', result.rows[0].db);
//     console.log('   Server time:', result.rows[0].now);

//     const postgis = await pool.query('SELECT postgis_version() as v');
//     console.log(' PostGIS version:', postgis.rows[0].v);

//     const tables = await pool.query(
//       "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
//     );
//     console.log(' Tables found:', tables.rows[0].count);

//     console.log(' Server running on http://localhost:5000');
//   } catch (err) {
//     console.error(' Error:', err.message);
//     console.error('   Full error:', err);
//     process.exit(1);
//   }
// })();

// src/server.js
require('dotenv').config();

console.log('=== Server Starting ===');
console.log('PORT:', process.env.PORT);
console.log('Mode:', process.env.NODE_ENV);

const http = require('http');
const { Server } = require('socket.io'); // <-- Added Socket.io
const app = require('./app');
const pool = require('./config/db');
const socketHandler = require('./sockets/socketHandler'); // <-- Added our handler

const PORT = process.env.PORT || 5000;

// Create HTTP server from Express app
const server = http.createServer(app);

// Attach Socket.io
const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL, credentials: true },
});

// Initialize Socket Handler
socketHandler(io);

server.listen(PORT, () => {
  console.log('');
  console.log('🚀 Server running on http://localhost:' + PORT);
  console.log('   Health check: http://localhost:' + PORT + '/api/health');
  console.log('   Press Ctrl + C to stop');
  console.log('');
});

// Test DB connection (runs once at startup)
(async () => {
  try {
    const result = await pool.query('SELECT NOW() as now, current_database() as db');
    console.log('✅ Database connected');
    console.log('   Database:', result.rows[0].db);
    console.log('   Server time:', result.rows[0].now);

    const postgis = await pool.query('SELECT postgis_version() as v');
    console.log('✅ PostGIS version:', postgis.rows[0].v);

    const tables = await pool.query(
      "SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public'"
    );
    console.log('✅ Tables found:', tables.rows[0].count);
  } catch (err) {
    console.error('⚠️  Database connection failed:', err.message);
    console.error('   Server is still running, but DB features will not work');
  }
})();