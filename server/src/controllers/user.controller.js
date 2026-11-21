const pool = require('../config/db');
const bcrypt = require('bcryptjs');

exports.listByRole = async (req, res) => {
  const role = req.query.role;
  const { rows } = await pool.query(
    'SELECT id, name, email, phone, role, created_at FROM users WHERE role = $1 ORDER BY created_at DESC',
    [role]
  );
  res.json(rows);
};

exports.createUser = async (req, res) => {
  const { name, email, password, role, phone } = req.body;
  const hash = await bcrypt.hash(password, 10);
  try {
    const { rows } = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, phone)
       VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, role, phone`,
      [name, email, hash, role, phone]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.updateUser = async (req, res) => {
  const { name, email, phone } = req.body;
  const { rows } = await pool.query(
    `UPDATE users SET name=$1, email=$2, phone=$3 WHERE id=$4
     RETURNING id, name, email, phone, role`,
    [name, email, phone, req.params.id]
  );
  res.json(rows[0]);
};

exports.deleteUser = async (req, res) => {
  await pool.query('DELETE FROM users WHERE id = $1', [req.params.id]);
  res.json({ message: 'User removed' });
};