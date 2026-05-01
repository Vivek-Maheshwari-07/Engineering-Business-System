const express = require('express');
const router = express.Router();
const { register, verifyOTP, resendOTP, login, testEmail } = require('../controllers/authController');

// @route   POST /api/auth/register
// @desc    Register a new user and trigger OTP email
// @access  Public
router.post('/register', register);

// @route   POST /api/auth/verify-otp
// @desc    Verify the 6-digit OTP
// @access  Public
router.post('/verify-otp', verifyOTP);

// @route   POST /api/auth/resend-otp
// @desc    Resend a 6-digit OTP to unverified email
// @access  Public
router.post('/resend-otp', resendOTP);

// @route   POST /api/auth/login
// @desc    Login and receive a JWT token
// @access  Public
router.post('/login', login);

// @route   GET /api/auth/test-email
// @desc    Independently send a fake OTP email directly to the .env EMAIL_USER
// @access  Public
router.get('/test-email', testEmail);

module.exports = router;
