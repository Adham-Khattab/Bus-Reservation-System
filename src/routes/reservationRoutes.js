const express = require("express");

const {
  createReservation,
  getReservation,
  getMyReservations,
} = require("../controllers/reservationController");

const router = express.Router();

// ==========================================
// CREATE RESERVATION
// ==========================================

router.post("/", createReservation);

// ==========================================
// MY RESERVATIONS (for the calendar)
// Note: this must come before "/:id" below, otherwise Express will
// try to treat "mine" as a reservation id.
// ==========================================

router.get("/mine", getMyReservations);

// ==========================================
// GET SINGLE RESERVATION (trip details)
// ==========================================

router.get("/:id", getReservation);

module.exports = router;