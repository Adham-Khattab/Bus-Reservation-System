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
    } = req.body;
    // Note: bus_id is no longer accepted from the client — the server
    // looks up whichever bus is dedicated to the requested pickup_time
    // and direction (see "FIND THE BUS ASSIGNED TO THIS TIME SLOT" below).

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

    // ==========================================
    // FIND THE BUS ASSIGNED TO THIS TIME SLOT
    // Each bus is now dedicated to exactly one pickup_time + direction,
    // so there's only ever one candidate bus per booking request.
    // ==========================================

    await client.query("BEGIN");

    const busResult = await client.query(
      `
                SELECT
                    bus_id,
                    capacity

                FROM buses

                WHERE pickup_time = $1
                AND direction = $2

                FOR UPDATE
                `,
      [time, direction],
    );

    if (busResult.rows.length === 0) {
      throw new Error(
        "No bus is assigned to this pickup time and direction",
      );
    }

    const selectedBusId = busResult.rows[0].bus_id;
    const totalSeats = busResult.rows[0].capacity;

    const occupiedCountResult = await client.query(
      `
                SELECT COUNT(*)

                FROM reservations

                WHERE bus_id = $1
                AND travel_date = $2
                AND pickup_time = $3
                AND direction = $4
                `,
      [selectedBusId, date, time, direction],
    );

    const occupiedCount = Number(occupiedCountResult.rows[0].count);
    const freeSeats = totalSeats - occupiedCount;

    if (freeSeats < employees.length) {
      throw new Error(
        "This bus is full for the selected date, time and direction",
      );
    }

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
                WHERE bus_id = $1
                AND travel_date = $2
                AND pickup_time = $3
                AND direction = $4
                AND seat_number =
                    ANY($5::int[])
                `,

      [selectedBusId, date, time, direction, seatNumbers],
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
                        bus_id,
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
          selectedBusId,
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

      busId: selectedBusId,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error(error);

    // Postgres error code 23505 = unique_violation. This happens when two
    // people book the same seat at almost the same moment — one wins the
    // race, and the loser hits the database's own safety net.
    const message =
      error.code === "23505"
        ? "That seat was just booked by someone else. Please pick another seat."
        : error.message;

    res.status(400).json({
      success: false,

      message,
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
                    b.bus_id,
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
                    ON r.bus_id =
                       b.bus_id

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
                    r.travel_date,
                    r.pickup_time,
                    r.direction,
                    r.seat_number,
                    s.station_name,
                    b.bus_id,
                    b.bus_number

                FROM reservations r
                JOIN stations s ON r.station_id = s.station_id
                JOIN buses b ON r.bus_id = b.bus_id

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

module.exports = {
  createReservation,
  getReservation,
  getMyReservations,
};