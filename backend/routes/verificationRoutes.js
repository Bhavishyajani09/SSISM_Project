const express = require('express');
const router = express.Router();
const vc = require('../controllers/verificationController');

// @route   POST   /api/verifications          - Save new (draft)
// @route   PUT    /api/verifications/:id      - Submit existing
// @route   PATCH  /api/verifications/:id/approve - Approve
// @route   PATCH  /api/verifications/:id/reject  - Reject
// @route   GET    /api/verifications          - Get all (filter by status)
// @route   GET    /api/verifications/:id      - Get single

router.post('/', vc.saveVerification);
router.get('/check/:studentId', vc.checkByStudentId);
router.put('/:id', vc.submitVerification);
router.patch('/:id/approve', vc.approveVerification);
router.patch('/:id/reject', vc.rejectVerification);
router.patch('/:id/submit-for-review', vc.submitForReview);
router.get('/', vc.getAllVerifications);
router.get('/student/:studentId', vc.getVerificationByStudentId);
router.get('/:id', vc.getVerificationById);

module.exports = router;
