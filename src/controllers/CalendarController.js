// controllers/calendarController.js
const pool = require('../db');

// GET /api/calendar?employee_id=1
// Used by calendar.js (FullCalendar events source)
exports.getCalendarEvents = async (req, res) => {
    try {
        const { employee_id } = req.query;

        if (!employee_id) {
            return res.status(400).json({ error: 'employee_id is required' });
        }

        const result = await pool.query(
            `SELECT r.reservation_id,
                    r.travel_date,
                    r.pickup_time,
                    b.bus_number
             FROM reservations r
             JOIN buses b ON b.bus_id = r.bus_id
             WHERE r.employee_id = $1`,
            [employee_id]
        );

        const events = result.rows.map(row => {
            const dateStr = row.travel_date.toISOString().split('T')[0];
            const start = new Date(`${dateStr}T${row.pickup_time}`);
            const end = new Date(start.getTime() + 60 * 60 * 1000); // assume 1-hour trip

            return {
                id: row.reservation_id,
                title: `Bus ${row.bus_number} booked`,
                start: start.toISOString(),
                end: end.toISOString()
            };
        });

        res.json(events);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch calendar events' });
    }
};