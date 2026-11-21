const pool = require('../config/db');

// ==========================================
// BUS MANAGEMENT
// ==========================================

exports.createBus = async (req, res) => {
  try {
    const { bus_number, registration_number, driver_id, capacity, route_id, is_active } = req.body;
    const result = await pool.query(
      `INSERT INTO buses (bus_number, registration_number, driver_id, capacity, route_id, is_active)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [bus_number, registration_number, driver_id || null, capacity, route_id || null, is_active !== false]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create bus' });
  }
};

exports.listBuses = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT b.*, u.name AS driver_name, r.name AS route_name
      FROM buses b
      LEFT JOIN users u ON b.driver_id = u.id
      LEFT JOIN routes r ON b.route_id = r.id
      ORDER BY b.created_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch buses' });
  }
};

exports.updateBus = async (req, res) => {
  try {
    const { id } = req.params;
    const { bus_number, registration_number, driver_id, capacity, route_id, is_active } = req.body;
    const result = await pool.query(
      `UPDATE buses 
       SET bus_number = $1, registration_number = $2, driver_id = $3, capacity = $4, route_id = $5, is_active = $6
       WHERE id = $7 RETURNING *`,
      [bus_number, registration_number, driver_id || null, capacity, route_id || null, is_active, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Bus not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to update bus' });
  }
};

exports.deleteBus = async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM buses WHERE id = $1', [id]);
    res.json({ message: 'Bus deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete bus' });
  }
};

exports.assignDriver = async (req, res) => {
  try {
    const { busId } = req.params;
    const { driver_id } = req.body;
    const result = await pool.query(
      `UPDATE buses SET driver_id = $1 WHERE id = $2 RETURNING *`,
      [driver_id, busId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to assign driver' });
  }
};

// ==========================================
// LIVE TRACKING
// ==========================================

exports.getLiveBuses = async (req, res) => {
  try {
    // Get the most recent location for each active bus
    const result = await pool.query(`
      SELECT DISTINCT ON (b.id) 
        b.id as bus_id, b.bus_number, b.driver_id, 
        u.name AS driver_name,
        ST_Y(lh.location::geometry) AS lat, 
        ST_X(lh.location::geometry) AS lng,
        lh.speed, lh.accuracy, lh.recorded_at
      FROM buses b
      LEFT JOIN users u ON b.driver_id = u.id
      LEFT JOIN location_history lh ON b.id = lh.bus_id
      WHERE b.is_active = true
      ORDER BY b.id, lh.recorded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch live buses' });
  }
};

exports.getBusLastLocation = async (req, res) => {
  try {
    const { busId } = req.params;
    const result = await pool.query(`
      SELECT 
        ST_Y(location::geometry) AS lat, 
        ST_X(location::geometry) AS lng,
        recorded_at
      FROM location_history
      WHERE bus_id = $1
      ORDER BY recorded_at DESC
      LIMIT 1
    `, [busId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No location history found for this bus' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching location' });
  }
};

// ==========================================
// STOPS & ROUTES
// ==========================================

exports.createStop = async (req, res) => {
  try {
    const { name, lat, lng, radius_meters, route_id } = req.body;
    const result = await pool.query(
      `INSERT INTO stops (name, location, radius_meters, route_id)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4, $5) RETURNING *`,
      [name, lng, lat, radius_meters || 500, route_id || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create stop' });
  }
};

exports.listStops = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT id, name, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, radius_meters, route_id 
      FROM stops
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stops' });
  }
};

// ==========================================
// ETA & ANALYTICS
// ==========================================

exports.getETA = async (req, res) => {
  try {
    const { busId, stopId } = req.params;
    
    // 1. Get last bus location
    const busRes = await pool.query(`
      SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
      FROM location_history
      WHERE bus_id = $1
      ORDER BY recorded_at DESC LIMIT 1
    `, [busId]);

    // 2. Get stop location
    const stopRes = await pool.query(`
      SELECT ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng
      FROM stops WHERE id = $1
    `, [stopId]);

    if (busRes.rows.length === 0 || stopRes.rows.length === 0) {
      return res.status(404).json({ message: 'Location data missing' });
    }

    const bus = busRes.rows[0];
    const stop = stopRes.rows[0];

    // 3. Call OSRM API
    const osrmUrl = `http://router.project-osrm.org/route/v1/driving/${bus.lng},${bus.lat};${stop.lng},${stop.lat}?overview=false`;
    
    const response = await fetch(osrmUrl);
    const data = await response.json();

    if (data.code !== 'Ok' || data.routes.length === 0) {
      return res.status(500).json({ message: 'Could not calculate route' });
    }

    // 4. Return duration in minutes
    const durationInSeconds = data.routes[0].duration;
    const durationInMinutes = Math.ceil(durationInSeconds / 60);

    res.json({ eta_minutes: durationInMinutes });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error calculating ETA' });
  }
};

exports.getAnalytics = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        TO_CHAR(timestamp, 'YYYY-MM-DD') as date,
        COUNT(*) as count
      FROM boarding_logs
      WHERE type = 'board'
      GROUP BY TO_CHAR(timestamp, 'YYYY-MM-DD')
      ORDER BY date ASC
      LIMIT 7
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch analytics' });
  }
};