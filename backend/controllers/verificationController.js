const HomeVerification = require('../models/HomeVerification');

// Create / Save a new verification (draft)
exports.saveVerification = async (req, res) => {
  try {
    console.log('Save Verification received body:', JSON.stringify(req.body, null, 2));
    const { studentId } = req.body;

    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required.' });
    }

    const data = { ...req.body, status: 'draft' };

    // Sanitize empty strings for enum fields
    ['scholarshipType', 'houseType', 'houseBuilder', 'landType'].forEach(k => {
      if (data[k] === '') delete data[k];
    });

    // Use findOneAndUpdate with upsert: true to ensure "Update or Create" behavior
    const verification = await HomeVerification.findOneAndUpdate(
      { studentId },
      data,
      { returnDocument: 'after', upsert: true, runValidators: true, setDefaultsOnInsert: true }
    );

    console.log('Verification saved/updated (upsert):', verification._id);
    res.status(200).json({ 
      message: 'Verification saved successfully', 
      verification 
    });
    
  } catch (err) {
    console.error('Save error:', err.message);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Duplicate data: a record for this student already exists.' });
    }
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation failed: ${messages}` });
    }
    res.status(500).json({ error: 'Failed to save verification: ' + err.message });
  }
};

// Check if verification exists for a student
exports.checkByStudentId = async (req, res) => {
  try {
    const { studentId } = req.params;
    const verification = await HomeVerification.findOne({ studentId });
    if (!verification) return res.status(404).json({ message: 'No verification found for this student' });
    res.json({ verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to check verification' });
  }
};

// Submit verification (draft → submitted)
exports.submitVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const targetStatus = req.body.status || 'submitted';
    const verification = await HomeVerification.findByIdAndUpdate(
      id,
      { ...req.body, status: 'submitted' },
      { returnDocument: 'after', runValidators: true }
    );
    if (!verification) {
      console.warn('Verification not found for submit, ID:', id);
      return res.status(404).json({ error: 'Verification not found' });
    }
    console.log('Verification submitted successfully:', verification._id);
    res.json({ message: 'Verification submitted successfully', verification });
  } catch (err) {
    console.error('Submit error:', err);
    res.status(500).json({ error: 'Failed to submit verification' });
  }
};

// Approve verification
exports.approveVerification = async (req, res) => {
  try {
    const verification = await HomeVerification.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', supervisorRemarks: req.body.remarks },
      { returnDocument: 'after' }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Verification approved', verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve' });
  }
};

// Reject verification (by Admin — sets status to 'rejected')
exports.rejectVerification = async (req, res) => {
  try {
    const verification = await HomeVerification.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', supervisorRemarks: req.body.remarks },
      { returnDocument: 'after' }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Verification rejected', verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject' });
  }
};

// Admin moves a teacher_rejected record to submitted (for final review)
exports.submitForReview = async (req, res) => {
  try {
    const verification = await HomeVerification.findByIdAndUpdate(
      req.params.id,
      { status: 'submitted', supervisorRemarks: req.body.remarks },
      { new: true }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Moved to submitted for admin review', verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit for review' });
  }
};

// Get all verifications (with optional status filter)
exports.getAllVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const verifications = await HomeVerification.find(filter)
      .sort({ createdAt: -1 })
      .select('studentName studentId scholarshipType status verificationDate verifierName village district mobile');
    res.json({ count: verifications.length, verifications });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verifications' });
  }
};

// Get single verification by ID
exports.getVerificationById = async (req, res) => {
  try {
    const verification = await HomeVerification.findById(req.params.id);
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification' });
  }
};

// Get single verification by studentId
exports.getVerificationByStudentId = async (req, res) => {
  try {
    const verification = await HomeVerification.findOne({ studentId: req.params.studentId }).sort({ createdAt: -1 });
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch verification' });
  }
};
