// routes/calendarRoutes.js
const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/CalendarController');

console.log("✅ calendarRoutes.js loaded");

router.get('/', calendarController.getCalendarEvents);

module.exports = router;