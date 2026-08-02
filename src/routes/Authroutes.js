const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

console.log("✅ authRoutes.js loaded");

router.post('/login', authController.Login);

module.exports = router;