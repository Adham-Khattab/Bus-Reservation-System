// controllers/tripController.js
// Adjust the require path below to match wherever your pg Pool is exported from.
const pool = require('../db');

// GET /api/trips/history?employee_id=1
// Used by trip-history.js
exports.getTripHistory = async (req, res) => {
    try {
        const { employee_id } = req.query;

        if (!employee_id) {
            return res.status(400).json({ error: 'employee_id is required' });
        }

        const result = await pool.query(
            `SELECT r.reservation_id,
                    r.travel_date,
                    r.pickup_time,
                    r.seat_number,
                    b.bus_number
             FROM reservations r
             JOIN buses b ON b.bus_id = r.bus_id
             WHERE r.employee_id = $1
             ORDER BY r.travel_date DESC, r.pickup_time DESC`,
            [employee_id]
        );

        const trips = result.rows.map(row => ({
            reservationId: row.reservation_id,
            date: row.travel_date,
            busNo: row.bus_number
        }));

        res.json(trips);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trip history' });
    }
};

// GET /api/trips/:id
// Used by trip-detail.js
exports.getTripDetail = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `SELECT r.reservation_id,
                    r.travel_date,
                    r.pickup_time,
                    r.seat_number,
                    b.bus_number,
                    b.driver_name,
                    b.driver_phone,
                    s.station_name
             FROM reservations r
             JOIN buses b ON b.bus_id = r.bus_id
             JOIN stations s ON s.station_id = r.station_id
             WHERE r.reservation_id = $1`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        const trip = result.rows[0];

        res.json({
            reservationId: trip.reservation_id,
            date: trip.travel_date,
            time: trip.pickup_time,
            pickup: trip.station_name,
            dropoff: 'Office', // schema has no dropoff column yet — hardcoded for now
            driverName: trip.driver_name,
            driverPhone: trip.driver_phone,
            busNumber: trip.bus_number,
            seatNumber: trip.seat_number
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trip detail' });
    }
};

// DELETE /api/trips/:id
// Used by trip-detail.js "Cancel Trip" button
exports.cancelTrip = async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            `DELETE FROM reservations WHERE reservation_id = $1 RETURNING *`,
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip cancelled successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to cancel trip' });
    }
};

// PUT /api/trips/:id/reschedule
// Used by trip-detail.js "Reschedule" button
// Body: { travel_date: 'YYYY-MM-DD', pickup_time: 'HH:MM' }
exports.rescheduleTrip = async (req, res) => {
    try {
        const { id } = req.params;
        const { travel_date, pickup_time } = req.body;

        if (!travel_date || !pickup_time) {
            return res.status(400).json({ error: 'travel_date and pickup_time are required' });
        }

        const result = await pool.query(
            `UPDATE reservations
             SET travel_date = $1, pickup_time = $2
             WHERE reservation_id = $3
             RETURNING *`,
            [travel_date, pickup_time, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.json({ message: 'Trip rescheduled successfully', trip: result.rows[0] });
    } catch (err) {
        console.error(err);
        // unique_seat_per_trip constraint violation (bus_id, travel_date, seat_number)
        if (err.code === '23505') {
            return res.status(409).json({ error: 'That seat is already booked on this bus for the selected date' });
        }
        res.status(500).json({ error: 'Failed to reschedule trip' });
    }
};