const express = require('express');
const router = express.Router();
const vc = require('../controllers/verificationController');
const { auth, adminOnly } = require('../middleware/auth');

// @route   POST   /api/verifications          - Save new (draft)
router.post('/', auth, vc.saveVerification);
router.get('/check/:studentId', auth, vc.checkByStudentId);
router.put('/:id', auth, vc.submitVerification);

// Admin-Only Routes
router.patch('/:id/approve', auth, adminOnly, vc.approveVerification);
router.patch('/:id/reject', auth, adminOnly, vc.rejectVerification);
router.patch('/:id/submit-for-review', auth, adminOnly, vc.submitForReview);

// General Querying
router.get('/', auth, vc.getAllVerifications);
router.get('/student/:studentId', auth, vc.getVerificationByStudentId);
router.get('/:id', auth, vc.getVerificationById);

module.exports = router;

