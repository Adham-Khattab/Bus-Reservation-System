// routes/tripRoutes.js
const express = require('express');
const router = express.Router();
const tripController = require('../controllers/TripController');

console.log("tripRoutes.js loaded");

// NOTE: /history must be declared before /:id so it doesn't get swallowed by the param route
router.get('/history', tripController.getTripHistory);
router.get('/:id', tripController.getTripDetail);
router.delete('/:id', tripController.cancelTrip);
router.put('/:id/reschedule', tripController.rescheduleTrip);

module.exports = router;