// controllers/tripHistoryController.js
// Dedicated controller for the Trip History page only.
// Trip Details, Cancel, and Reschedule logic live in their own
// reservation controller/routes and are untouched by this file.

const pool = require("../db");

// GET /api/trip-history?employee_id=1
// Used by trip-history.js
exports.getTripHistory = async (req, res) => {
  try {
    const { employee_id } = req.query;

    if (!employee_id) {
      return res.status(400).json({ error: "employee_id is required" });
    }

    const result = await pool.query(
      `SELECT r.reservation_id,
                    r.travel_date,
                    r.pickup_time,
                    r.seat_number,
                    b.bus_number
             FROM reservations r
             JOIN buses b ON b.bus_number = r.bus_number
             WHERE r.employee_id = $1
             AND r.travel_date < CURRENT_DATE
             ORDER BY r.travel_date DESC, r.pickup_time DESC`,
      [employee_id],
    );

    const trips = result.rows.map((row) => ({
      reservationId: row.reservation_id,
      travel_date: row.travel_date,
      pickup_time: row.pickup_time,
      seat_number: row.seat_number,
      bus_number: row.bus_number,
    }));

    res.json(trips);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch trip history" });
  }
};