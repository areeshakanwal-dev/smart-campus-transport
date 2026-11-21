const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// ==========================================
// 1. DASHBOARD STATS
// ==========================================
exports.getDashboardStats = async (req, res) => {
  try {
    const buses = await pool.query('SELECT COUNT(*) FROM buses');
    const drivers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'driver'");
    const students = await pool.query('SELECT COUNT(*) FROM students');
    const activeBuses = await pool.query('SELECT COUNT(*) FROM buses WHERE is_active = true');
    // Parent count optional hai, agar table ready hai toh chalega
    const parents = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'parent'");

    res.json({
      totalBuses: parseInt(buses.rows[0].count),
      totalDrivers: parseInt(drivers.rows[0].count),
      totalStudents: parseInt(students.rows[0].count),
      activeBuses: parseInt(activeBuses.rows[0].count),
      totalParents: parseInt(parents.rows[0].count)
    });
  } catch (err) {
    console.error("Dashboard Stats Error:", err);
    res.status(500).json({ message: 'Error fetching stats' });
  }
};

// ==========================================
// 2. DRIVER MANAGEMENT
// ==========================================
exports.getDrivers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, created_at 
       FROM users 
       WHERE role = 'driver' 
       ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Drivers Error:", err);
    res.status(500).json({ message: 'Failed to fetch drivers' });
  }
};

exports.createDriver = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Insert driver
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'driver', $4) 
       RETURNING id, name, email, phone`,
      [name, email, hash, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Driver Error:", err);
    res.status(500).json({ message: 'Failed to register driver' });
  }
};

exports.deleteDriver = async (req, res) => {
  try {
    const { id } = req.params;
    // Make sure we only delete a user if their role is driver
    await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'driver']);
    res.json({ message: 'Driver removed successfully' });
  } catch (err) {
    console.error("Delete Driver Error:", err);
    res.status(500).json({ message: 'Failed to delete driver' });
  }
};

// ==========================================
// 3. PARENT MANAGEMENT
// ==========================================
exports.getParents = async (req, res) => {
  try {
    // This query gets parents and aggregates the names of their children
    const result = await pool.query(
      `SELECT u.id, u.name, u.email, u.phone, u.created_at,
       (SELECT string_agg(s.name, ', ') FROM students s WHERE s.parent_id = u.id) as children_names
       FROM users u 
       WHERE u.role = 'parent' 
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Get Parents Error:", err);
    res.status(500).json({ message: 'Failed to fetch parents' });
  }
};

exports.createParent = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Check if email exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hash = await bcrypt.hash(password, 10);
    
    // Insert parent
    const result = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, 'parent', $4) 
       RETURNING id, name, email, phone`,
      [name, email, hash, phone]
    );

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("Create Parent Error:", err);
    res.status(500).json({ message: 'Failed to register parent' });
  }
};

exports.deleteParent = async (req, res) => {
  try {
    const { id } = req.params;
    // Only delete if role is parent
    await pool.query('DELETE FROM users WHERE id = $1 AND role = $2', [id, 'parent']);
    res.json({ message: 'Parent removed successfully' });
  } catch (err) {
    console.error("Delete Parent Error:", err);
    res.status(500).json({ message: 'Failed to delete parent' });
  }
};