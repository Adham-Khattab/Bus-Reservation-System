const express = require('express');
const router = express.Router();
const controller = require('../controllers/feedbackController');

console.log("feedbackRoutes.js loaded");

router.post('/', controller.postFeedback);

router.get('/', controller.getFeedback);

module.exports = router;