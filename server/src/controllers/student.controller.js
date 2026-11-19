const pool = require('../config/db');

exports.getMyStudent = async (req, res) => {
  try {
    // Find the student linked to this parent's ID
    const result = await pool.query(
      `SELECT id, name, grade, bus_id, stop_id 
       FROM students 
       WHERE parent_id = $1`,
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'No student linked to this parent' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};