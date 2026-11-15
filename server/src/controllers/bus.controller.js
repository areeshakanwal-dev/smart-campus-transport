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