const express = require("express");

const {
  getEmployees,

  getStations,

  getBuses,

  getSeats,

  getOccupiedSeats,
} = require("../controllers/dashboardController");

const router = express.Router();

// ==========================================
// EMPLOYEES
// ==========================================

router.get("/employees", getEmployees);

// ==========================================
// STATIONS
// ==========================================

router.get("/stations", getStations);

// ==========================================
// BUSES
// ==========================================

router.get("/buses", getBuses);

// ==========================================
// SEATS
// ==========================================

router.get("/seats", getSeats);

// ==========================================
// OCCUPIED SEATS
// ==========================================

router.get("/occupied-seats", getOccupiedSeats);

module.exports = router;
