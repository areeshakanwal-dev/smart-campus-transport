const pool = require('../config/db');
const jwt = require('jsonwebtoken');

module.exports = (io) => {
  // Authenticate the socket connection using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('No token'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 ${socket.user.role} connected: ${socket.user.id}`);

    // Driver sends location
    socket.on('driver:location', async (data) => {
      if (socket.user.role !== 'driver') return;
      const { busId, lat, lng, speed, accuracy } = data;

      try {
        await pool.query(
          `INSERT INTO location_history (bus_id, location, speed, accuracy)
           VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5)`,
          [busId, lng, lat, speed, accuracy]
        );

        // Broadcast to parents watching this bus
        io.to(`bus:${busId}`).emit('bus:location', {
          busId, lat, lng, speed, accuracy, timestamp: Date.now(),
        });
      } catch (err) {
        console.error('Location save error:', err);
      }
    });

    // Parent subscribes to a specific bus
    socket.on('parent:subscribe', ({ busId }) => {
      if (socket.user.role !== 'parent') return;
      socket.join(`bus:${busId}`);
      console.log(`👨‍👩‍👧 Parent subscribed to bus ${busId}`);
    });

    // Parent unsubscribes
    socket.on('parent:unsubscribe', ({ busId }) => {
      socket.leave(`bus:${busId}`);
    });

    socket.on('disconnect', () => {
      console.log(`❌ Disconnected: ${socket.user.id}`);
    });
  });
};