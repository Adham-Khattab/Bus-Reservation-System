const express = require('express');
const router = express.Router();
const controller = require('../controllers/reportController');

console.log("reportRoutes.js loaded");

router.post('/', controller.postReport);
router.get('/', controller.getReports);

module.exports = router;