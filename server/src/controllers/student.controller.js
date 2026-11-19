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

exports.logBoarding = async (req, res) => {
  const { student_id, bus_id, type } = req.body;
  
  if (!['board', 'drop'].includes(type)) {
    return res.status(400).json({ message: 'Invalid type' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO boarding_logs (student_id, bus_id, type)
       VALUES ($1, $2, $3) RETURNING *`,
      [student_id, bus_id, type]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to log boarding' });
  }
};

exports.getBusStudents = async (req, res) => {
  const { busId } = req.params;
  try {
    const result = await pool.query(
      `SELECT id, name, grade FROM students WHERE bus_id = $1`,
      [busId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: 'Failed to fetch students' });
  }
};

exports.getBoardingStatus = async (req, res) => {
  const { studentId } = req.params;
  try {
    const result = await pool.query(`
      SELECT type, timestamp 
      FROM boarding_logs 
      WHERE student_id = $1 
      ORDER BY timestamp DESC LIMIT 1
    `, [studentId]);

    if (result.rows.length === 0) {
      return res.json({ status: 'not_boarded' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching status' });
  }
};