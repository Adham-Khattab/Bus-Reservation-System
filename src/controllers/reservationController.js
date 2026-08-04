const pool = require("../db");

// ==========================================
// CREATE RESERVATION
// ==========================================

const createReservation = async (req, res) => {
  const client = await pool.connect();

  try {
    const {
      employees,
      passengers,
      station,
      date,
      time,
      direction,
      seats,
      bus_number,
    } = req.body;

    // ==========================================
    // BASIC VALIDATION
    // ==========================================

    if (!Array.isArray(employees) || employees.length === 0) {
      return res.status(400).json({
        success: false,

        message: "At least one employee is required",
      });
    }

    if (!Array.isArray(seats) || seats.length === 0) {
      return res.status(400).json({
        success: false,

        message: "At least one seat is required",
      });
    }

    if (employees.length !== seats.length) {
      return res.status(400).json({
        success: false,

        message: "Number of employees must equal number of seats",
      });
    }

    if (Number(passengers) !== employees.length) {
      return res.status(400).json({
        success: false,

        message: "Passenger count does not match employees",
      });
    }

    if (!station) {
      return res.status(400).json({
        success: false,

        message: "Station is required",
      });
    }

    if (!date) {
      return res.status(400).json({
        success: false,

        message: "Travel date is required",
      });
    }

    if (!time) {
      return res.status(400).json({
        success: false,

        message: "Pickup time is required",
      });
    }

    if (direction !== "To Office" && direction !== "From Office") {
      return res.status(400).json({
        success: false,

        message: "Invalid direction",
      });
    }

    if (!bus_number) {
      return res.status(400).json({
        success: false,

        message: "Bus number is required",
      });
    }

    // ==========================================
    // START TRANSACTION
    // ==========================================

    await client.query("BEGIN");

    // ==========================================
    // CHECK BUS
    // ==========================================

    const busResult = await client.query(
      `
                SELECT
                    bus_number,
                    capacity

                FROM buses

                WHERE bus_number = $1

                FOR UPDATE
                `,

      [bus_number],
    );

    if (busResult.rows.length === 0) {
      throw new Error("Bus not found");
    }

    const totalSeats = busResult.rows[0].capacity;

    // ==========================================
    // CHECK STATION
    // ==========================================

    const stationResult = await client.query(
      `
                SELECT
                    station_id

                FROM stations

                WHERE LOWER(station_name)
                = LOWER($1)
                `,

      [station],
    );

    if (stationResult.rows.length === 0) {
      throw new Error("Station not found");
    }

    const stationId = stationResult.rows[0].station_id;

    // ==========================================
    // CHECK SEATS
    // ==========================================

    const seatNumbers = seats.map(Number);

    const invalidSeats = seatNumbers.filter(
      (seat) => !Number.isInteger(seat) || seat < 1 || seat > totalSeats,
    );

    if (invalidSeats.length > 0) {
      throw new Error(`Invalid seat number: ${invalidSeats.join(", ")}`);
    }

    // ==========================================
    // DUPLICATE SEATS
    // ==========================================

    if (new Set(seatNumbers).size !== seatNumbers.length) {
      throw new Error("The same seat cannot be assigned twice");
    }

    // ==========================================
    // CHECK EMPLOYEES
    // ==========================================

    const employeeIds = [];

    for (const employee of employees) {
      const result = await client.query(
        `
    SELECT employee_id
    FROM employees
    WHERE LOWER(CONCAT(F_name, ' ', L_name)) = LOWER($1)
    `,
        [employee],
      );

      if (result.rows.length === 0) {
        throw new Error(`Employee not found: ${employee}`);
      }

      if (result.rows.length > 1) {
        throw new Error(`Multiple employees found with the name: ${employee}`);
      }

      employeeIds.push(result.rows[0].employee_id);
    }
    // ==========================================
    // CHECK OCCUPIED SEATS
    // ==========================================

    const occupiedResult = await client.query(
      `
                SELECT
                    seat_number
                FROM reservations
                WHERE bus_number = $1
                AND travel_date = $2
                AND pickup_time = $3
                AND direction = $4
                AND seat_number =
                    ANY($5::int[])
                `,

      [bus_number, date, time, direction, seatNumbers],
    );

    if (occupiedResult.rows.length > 0) {
      const occupied = occupiedResult.rows.map((row) => row.seat_number);

      throw new Error(
        `These seats are already occupied: ${occupied.join(", ")}`,
      );
    }

    // ==========================================
    // INSERT RESERVATIONS
    // ==========================================

    const reservationIds = [];

    for (let i = 0; i < employeeIds.length; i++) {
      const result = await client.query(
        `
                    INSERT INTO reservations (
                        employee_id,
                        bus_number,
                        station_id,
                        travel_date,
                        pickup_time,
                        direction,
                        seat_number
                    )
                    VALUES (

                        $1,
                        $2,
                        $3,
                        $4,
                        $5,
                        $6,
                        $7
                    )
                    RETURNING reservation_id
                    `,
        [
          employeeIds[i],
          bus_number,
          stationId,
          date,
          time,
          direction,
          seatNumbers[i],
        ],
      );

      reservationIds.push(result.rows[0].reservation_id);
    }
    // ==========================================
    // COMMIT
    // ==========================================

    await client.query("COMMIT");

    res.status(201).json({
      success: true,

      message: "Reservation created successfully",

      reservationIds,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    res.status(400).json({
      success: false,

      message: error.message,
    });
  } finally {
    client.release();
  }
};

// ==========================================
// GET RESERVATION
// ==========================================

const getReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    const result = await pool.query(
      `
                SELECT

                    r.reservation_id,
                    e.employee_id,
                    e.F_name,
                    e.L_name,
                    b.bus_number,
                    b.license_plate,
                    b.driver_name,
                    b.driver_phone,
                    s.station_name,
                    r.travel_date,
                    r.pickup_time,
                    r.direction,
                    r.seat_number,
                    r.reservation_date
                FROM reservations r
                JOIN employees e
                    ON r.employee_id =
                       e.employee_id
                JOIN buses b
                    ON r.bus_number =
                       b.bus_number

                JOIN stations s
                    ON r.station_id =
                       s.station_id

                WHERE
                    r.reservation_id = $1
                `,

      [reservationId],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }
    res.json({
      success: true,
      reservation: result.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to get reservation",
    });
  }
};
// ==========================================
// GET MY RESERVATIONS (for the calendar)
// ==========================================
// NOTE: this currently reads the employee via ?employee_id= in the query
// string. If you have JWT auth middleware that sets req.user, swap
// req.query.employee_id below for req.user.id instead so it can't be
// spoofed by changing the URL.

const getMyReservations = async (req, res) => {
  try {
    const employeeId = Number(req.query.employee_id);

    if (!employeeId) {
      return res.status(400).json({
        success: false,
        message: "employee_id is required",
      });
    }

    const result = await pool.query(
      `
                SELECT
                    r.reservation_id,
                    r.bus_number,
                    s.station_name,
                    r.travel_date,
                    r.pickup_time,
                    r.direction,
                    r.seat_number,
                    r.reservation_date
                FROM reservations r
                JOIN stations s
                    ON r.station_id = s.station_id
                WHERE r.employee_id = $1
                ORDER BY r.travel_date, r.pickup_time
                `,
      [employeeId],
    );

    res.json({
      success: true,
      reservations: result.rows,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to load reservations",
    });
  }
};

// ==========================================
// CANCEL RESERVATION
// ==========================================

const cancelReservation = async (req, res) => {
  try {
    const reservationId = Number(req.params.id);

    const result = await pool.query(
      `DELETE FROM reservations WHERE reservation_id = $1 RETURNING *`,
      [reservationId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.json({
      success: true,
      message: "Reservation cancelled successfully",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to cancel reservation",
    });
  }
};

const controllerExports = {
  createReservation,
  getReservation,
  getMyReservations,
  cancelReservation,
};

// ==========================================
// SAFETY CHECK
// If this file (or a require path pointing at a *different* copy of
// this file elsewhere in the project) ever ends up missing one of the
// four handlers below, this will throw a clear error immediately on
// startup instead of the vague Express "argument handler must be a
// function" error.
// ==========================================
for (const [name, fn] of Object.entries(controllerExports)) {
  if (typeof fn !== "function") {
    throw new Error(
      `reservationController.js: "${name}" is not a function (got ${typeof fn}). ` +
        `Check that it is defined above and spelled correctly in module.exports.`,
    );
  }
}

module.exports = controllerExports;
