const pool = require("../db");

// ==========================================
// GET EMPLOYEES
// ==========================================

const getEmployees = async (req, res) => {
  try {
    const search = req.query.search || "";

    const result = await pool.query(
      `
            SELECT
                employee_id,
                CONCAT(F_name, ' ', L_name) AS full_name

            FROM employees

            WHERE LOWER(CONCAT(F_name, ' ', L_name))
            LIKE LOWER($1)

            ORDER BY F_name, L_name

            LIMIT 20
            `,
      [`%${search}%`],
    );

    res.json({
      success: true,
      employees: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load employees",
    });
  }
};

// ==========================================
// GET STATIONS
// ==========================================

const getStations = async (req, res) => {
  try {
    const result = await pool.query(
      `
            SELECT
                station_id,
                station_name

            FROM stations

            ORDER BY station_name
            `,
    );

    res.json({
      success: true,
      stations: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load stations",
    });
  }
};

// ==========================================
// GET BUSES
// ==========================================

const getBuses = async (req, res) => {
  try {
    const result = await pool.query(
      `
            SELECT
                bus_id,
                bus_number,
                license_plate,
                driver_name ,
                driver_phone ,
                capacity,
                pickup_time,
                direction

            FROM buses

            ORDER BY bus_id
            `,
    );

    res.json({
      success: true,
      buses: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load buses",
    });
  }
};

// ==========================================
// GET SEATS
// ==========================================

const getSeats = async (req, res) => {
  try {
    const busId = Number(req.query.bus_id);

    if (!busId) {
      return res.status(400).json({
        success: false,
        message: "bus_id is required",
      });
    }

    const busResult = await pool.query(
      `
            SELECT capacity

            FROM buses

            WHERE bus_id = $1
            `,
      [busId],
    );

    if (busResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    const totalSeats = busResult.rows[0].capacity;

    const seats = [];

    for (let i = 1; i <= totalSeats; i++) {
      seats.push(i);
    }

    res.json({
      success: true,
      seats,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: "Failed to load seats",
    });
  }
};

// ==========================================
// GET OCCUPIED SEATS
// ==========================================

const getOccupiedSeats = async (req, res) => {
  try {
    const { bus_id, travel_date, pickup_time, direction } = req.query;

    if (!bus_id || !travel_date || !pickup_time || !direction) {
      return res.status(400).json({
        success: false,

        message: "bus_id, travel_date, pickup_time and direction are required",
      });
    }

    const result = await pool.query(
      `
            SELECT seat_number

            FROM reservations
            WHERE bus_id = $1
            AND travel_date = $2
            AND pickup_time = $3
            AND direction = $4
            ORDER BY seat_number
            `,
      [bus_id, travel_date, pickup_time, direction],
    );

    res.json({
      success: true,

      occupiedSeats: result.rows.map((row) => row.seat_number),
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,

      message: "Failed to load occupied seats",
    });
  }
};

module.exports = {
  getEmployees,
  getStations,
  getBuses,
  getSeats,
  getOccupiedSeats,
};