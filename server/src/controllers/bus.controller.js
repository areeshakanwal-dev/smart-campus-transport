const pool = require('../config/db');

exports.createBus = async (req, res) => {
  const { bus_number, driver_id, capacity } = req.body;
  const result = await pool.query(
    `INSERT INTO buses (bus_number, driver_id, capacity)
     VALUES ($1, $2, $3) RETURNING *`,
    [bus_number, driver_id, capacity]
  );
  res.status(201).json(result.rows[0]);
};

exports.listBuses = async (req, res) => {
  const result = await pool.query(`
    SELECT b.*, u.name AS driver_name
    FROM buses b
    LEFT JOIN users u ON b.driver_id = u.id
    ORDER BY b.created_at DESC
  `);
  res.json(result.rows);
};

exports.assignDriver = async (req, res) => {
  const { busId } = req.params;
  const { driver_id } = req.body;
  const result = await pool.query(
    `UPDATE buses SET driver_id = $1 WHERE id = $2 RETURNING *`,
    [driver_id, busId]
  );
  res.json(result.rows[0]);
};

exports.getLiveBuses = async (req, res) => {
  try {
    // Get the most recent location for each bus
    const result = await pool.query(`
      SELECT DISTINCT ON (b.id) 
        b.id, b.bus_number, b.driver_id, 
        u.name AS driver_name,
        ST_Y(lh.location::geometry) AS lat, 
        ST_X(lh.location::geometry) AS lng,
        lh.recorded_at
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
  const { busId } = req.params;
  try {
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
    res.status(500).json({ message: 'Error fetching location' });
  }
};

exports.createStop = async (req, res) => {
  const { name, lat, lng, radius_meters } = req.body;
  try {
    const result = await pool.query(
      `INSERT INTO stops (name, location, radius_meters)
       VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326), $4) RETURNING *`,
      [name, lng, lat, radius_meters || 500]
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
      SELECT id, name, ST_Y(location::geometry) as lat, ST_X(location::geometry) as lng, radius_meters 
      FROM stops
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch stops' });
  }
};