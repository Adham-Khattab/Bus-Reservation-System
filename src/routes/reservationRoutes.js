const express = require("express");

const {
  createReservation,
  getReservation,
} = require("../controllers/reservationController");

const router = express.Router();

// Create reservation

router.post("/", createReservation);

// Get reservation

router.get("/:id", getReservation);

module.exports = router;
