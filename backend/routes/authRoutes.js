const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { auth, adminOnly } = require('../middleware/auth');

// @route   POST /api/auth/login
// @desc    Authenticate user & get token
router.post('/login', authController.login);

// @route   POST /api/auth/register
// @desc    Admin creates new user (teacher or admin)
router.post('/register', auth, adminOnly, authController.register);

router.get('/users', auth, adminOnly, authController.getUsersActivity);

router.delete('/users/:id', auth, adminOnly, authController.deleteUser);

module.exports = router;

