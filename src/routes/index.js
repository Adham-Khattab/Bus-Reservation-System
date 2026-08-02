const express = require("express");
const router = express.Router();

console.log("routes/index.js loaded");

router.get("/ping", (req, res) => res.json({ ok: true }));

// Dashboard routes
router.use("/dashboard", require("./dashboardRoutes"));

// Reservation routes
router.use("/reservations", require("./reservationRoutes"));

// Explicitly mount lostFoundRoutes.js at /lost-found
router.use("/lost-found", require("./lostFoundRoutes"));
router.use("/feedback", require("./feedbackRoutes"));
router.use("/report", require("./reportRoutes"));
router.use("/trips", require("./tripRoutes"));
router.use("/calendar", require("./calendarRoutes"));
module.exports = router;