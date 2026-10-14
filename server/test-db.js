const pool = require('./src/config/db');

(async () => {
  try {
    const res = await pool.query('SELECT NOW() AS now, PostGIS_Version() AS postgis');
    console.log('DB Connected!');
    console.log('Time:', res.rows[0].now);
    console.log('PostGIS:', res.rows[0].postgis);
    process.exit(0);
  } catch (err) {
    console.error('DB Connection Failed:');
    console.error(err.message);
    process.exit(1);
  }
})();