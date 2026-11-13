// const express = require('express');
// const cors = require('cors');
// require('dotenv').config();
// app.use('/api/auth', require('./routes/auth.routes'));
// const pool = require('./config/db');

// const app = express();

// app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
// app.use(express.json());

// // Health check
// app.get('/api/health', (req, res) => {
//   res.json({ status: 'ok', timestamp: new Date().toISOString() });
// });

// // Routes will be added here later
// // app.use('/api/auth', require('./routes/auth.routes'));

// // Error handler
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(err.status || 500).json({ message: err.message || 'Server error' });
// });

// module.exports = app;



// src/app.js
// Express app setup — middleware, routes, error handling
// Does NOT start the server — that's server.js's job

const express = require('express');
const cors = require('cors');

// ⭐ 1. Create the Express app FIRST
const app = express();

// ⭐ 2. Then apply middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ⭐ 3. Then mount routes
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'smart-campus-transport-api',
  });
});

app.get('/', (req, res) => {
  res.json({
    message: '🚌 Smart Campus Transport API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      auth: '/api/auth',
    },
  });
});

app.use('/api/auth', require('./routes/auth.routes'));

// ⭐ 4. 404 handler (goes AFTER all routes)
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ⭐ 5. Global error handler (4 parameters — Express detects it)
app.use((err, req, res, next) => {
  console.error('❌ Error:', err.message);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
  });
});

module.exports = app;