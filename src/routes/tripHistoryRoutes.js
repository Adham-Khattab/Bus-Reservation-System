// routes/tripHistoryRoutes.js
// Dedicated route for the Trip History page only.
console.log("tripHistoryRoutes.js loaded");

const express = require("express");
const router = express.Router();
const tripHistoryController = require("../controllers/tripHistoryController");

router.get("/", tripHistoryController.getTripHistory);

module.exports = router;