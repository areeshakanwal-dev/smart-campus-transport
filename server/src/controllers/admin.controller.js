const pool = require('../config/db');

exports.getDashboardStats = async (req, res) => {
  try {
    const [buses, drivers, students, parents, activeBuses] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM buses'),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'driver'"),
      pool.query('SELECT COUNT(*) FROM students'),
      pool.query("SELECT COUNT(*) FROM users WHERE role = 'parent'"),
      pool.query(`
        SELECT COUNT(DISTINCT bus_id) FROM location_history 
        WHERE recorded_at > NOW() - INTERVAL '2 minutes'
      `),
    ]);

    res.json({
      totalBuses: parseInt(buses.rows[0].count),
      totalDrivers: parseInt(drivers.rows[0].count),
      totalStudents: parseInt(students.rows[0].count),
      totalParents: parseInt(parents.rows[0].count),
      activeBuses: parseInt(activeBuses.rows[0].count),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch stats' });
  }
};

exports.getRecentActivities = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      (SELECT 'bus_created' AS type, bus_number AS detail, created_at FROM buses ORDER BY created_at DESC LIMIT 5)
      UNION ALL
      (SELECT 'boarding' AS type, 
        (SELECT name FROM students WHERE id = bl.student_id) || ' boarded ' AS detail, 
        timestamp AS created_at 
       FROM boarding_logs bl ORDER BY timestamp DESC LIMIT 5)
      UNION ALL
      (SELECT 'alert' AS type, 
        'Bus approaching stop ' || (SELECT name FROM stops WHERE id = a.stop_id) AS detail,
        triggered_at AS created_at
       FROM alerts a ORDER BY triggered_at DESC LIMIT 5)
      ORDER BY created_at DESC LIMIT 10
    `);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch activities' });
  }
};