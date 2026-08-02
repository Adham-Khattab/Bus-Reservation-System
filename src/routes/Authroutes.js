const express = require('express');
const router = express.Router();
const authController = require('../controllers/Authcontroller');

console.log("✅ authRoutes.js loaded");

router.post('/login', authController.Login);
router.post('/sign-up', authController.Signup);
router.post('/forgot-password', authController.ForgotPassword);
router.post('/reset-password', authController.ResetPassword);

module.exports = router;