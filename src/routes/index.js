const express = require("express");
const router = express.Router();

console.log("✅ routes/index.js loaded");

router.get("/ping", (req, res) => res.json({ ok: true }));

// Explicitly mount lostFoundRoutes.js at /lost-found
router.use("/lost-found", require("./lostFoundRoutes"));
router.use("/feedback", require("./feedbackRoutes"));
router.use("/report", require("./reportRoutes"));
module.exports = router;