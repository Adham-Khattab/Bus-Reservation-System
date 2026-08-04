const pool = require("../db");

// ==========================================
// ADD BUS
// ==========================================

const addBus = async (req, res) => {
  try {
    const {
      bus_number,
      license_plate,
      driver_name,
      driver_phone,
      capacity,
      pickup_time,
      direction,
    } = req.body;

    if (!bus_number || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Bus number and capacity are required",
      });
    }

    const result = await pool.query(
      `INSERT INTO buses (bus_number, license_plate, driver_name, driver_phone, capacity, pickup_time, direction)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        bus_number,
        license_plate || null,
        driver_name || null,
        driver_phone || null,
        capacity,
        pickup_time || null,
        direction || null,
      ],
    );

    res.status(201).json({
      success: true,
      bus: result.rows[0],
    });
  } catch (error) {
    console.error("Add bus error:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        success: false,
        message:
          "A bus with these details already exists (duplicate bus number, license plate, or time slot).",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to add bus",
    });
  }
};

// ==========================================
// DELETE BUS
// ==========================================

const deleteBus = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const result = await pool.query(
      `DELETE FROM buses WHERE bus_number = $1 RETURNING *`,
      [busNumber],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.json({
      success: true,
      message: "Bus deleted successfully",
    });
  } catch (error) {
    console.error("Delete bus error:", error);

    if (error.code === "23503") {
      // foreign_key_violation — reservations still reference this bus
      return res.status(409).json({
        success: false,
        message:
          "Cannot delete this bus — it still has reservations linked to it.",
      });
    }

    res.status(500).json({
      success: false,
      message: "Failed to delete bus",
    });
  }
};

// ==========================================
// REMOVE DRIVER FROM BUS (clears driver fields, keeps the bus)
// ==========================================

const removeDriver = async (req, res) => {
  try {
    const { busNumber } = req.params;

    const result = await pool.query(
      `UPDATE buses
       SET driver_name = NULL, driver_phone = NULL
       WHERE bus_number = $1
       RETURNING *`,
      [busNumber],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Bus not found",
      });
    }

    res.json({
      success: true,
      message: "Driver removed from bus",
      bus: result.rows[0],
    });
  } catch (error) {
    console.error("Remove driver error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to remove driver",
    });
  }
};

// ==========================================
// GET ALL RESERVATIONS
// ==========================================

const getAllReservations = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT
        r.reservation_id,
        CONCAT(e.F_name, ' ', e.L_name) AS employee_name,
        r.bus_number,
        b.driver_name,
        s.station_name,
        r.travel_date,
        r.pickup_time,
        r.direction,
        r.seat_number,
        r.reservation_date
      FROM reservations r
      JOIN employees e ON r.employee_id = e.employee_id
      JOIN buses b ON r.bus_number = b.bus_number
      JOIN stations s ON r.station_id = s.station_id
      ORDER BY r.reservation_date DESC
    `);

    // Debug line — remove once you've confirmed data is flowing correctly
    console.log(`getAllReservations: found ${result.rows.length} row(s)`);

    res.json({
      success: true,
      reservations: result.rows,
    });
  } catch (error) {
    console.error("Get all reservations error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to load reservations",
    });
  }
};

module.exports = {
  addBus,
  deleteBus,
  removeDriver,
  getAllReservations,
};
