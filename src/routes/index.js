const express = require("express");
const router = express.Router();

console.log("✅ routes/index.js loaded");

// Explicitly mount lostFoundRoutes.js at /lost-found
router.use("/lost-found", require("./lostFoundRoutes"));
router.use("/feedback", require("./feedbackRoutes"));

module.exports = router;