const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @route   POST /api/auth/forgot-password
// @desc    Send OTP for password reset
router.post('/forgot-password', authController.forgotPassword);

// @route   POST /api/auth/verify-otp
// @desc    Verify OTP for password reset
router.post('/verify-otp', authController.verifyOTP);

// @route   POST /api/auth/reset-password
// @desc    Reset password using OTP
router.post('/reset-password', authController.resetPassword);

// @route   POST /api/auth/register
// @desc    Admin creates new user (teacher or admin)
router.post('/register', auth, adminOnly, authController.register);

router.get('/users', auth, adminOnly, authController.getUsersActivity);

router.delete('/users/:id', auth, adminOnly, authController.deleteUser);

module.exports = router;

