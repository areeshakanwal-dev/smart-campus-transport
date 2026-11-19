const pool = require('../config/db');

const ALERT_RADIUS_METERS = 500;

async function checkGeofence(busId, lat, lng) {
  try {
    // Find stops within 500m
    const { rows } = await pool.query(`
      SELECT s.id, s.name,
             ST_Distance(
               s.location::geography,
               ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography
             ) AS distance
      FROM stops s
      WHERE ST_DWithin(
        s.location::geography,
        ST_SetSRID(ST_MakePoint($2, $3), 4326)::geography,
        $1
      )
    `, [ALERT_RADIUS_METERS, lng, lat]);

    for (const stop of rows) {
      // Skip if an alert was sent for this stop in the last 5 minutes
      const recent = await pool.query(`
        SELECT 1 FROM alerts
        WHERE bus_id = $1 AND stop_id = $2
          AND triggered_at > NOW() - INTERVAL '5 minutes'
      `, [busId, stop.id]);

      if (recent.rows.length > 0) continue;

      await pool.query(
        `INSERT INTO alerts (bus_id, stop_id) VALUES ($1, $2)`,
        [busId, stop.id]
      );

      return { stopId: stop.id, stopName: stop.name, distance: stop.distance };
    }
    return null;
  } catch (err) {
    console.error('Geofence error:', err);
    return null;
  }
}

module.exports = { checkGeofence };