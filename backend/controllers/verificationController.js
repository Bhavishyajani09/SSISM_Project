const HomeVerification = require('../models/HomeVerification');

// Create / Save a new verification (draft)
exports.saveVerification = async (req, res) => {
  try {
    const data = { ...req.body, status: 'draft' };

    // Sanitize empty strings for enum fields
    ['scholarshipType', 'houseType', 'houseBuilder', 'landType'].forEach(k => {
      if (data[k] === '') delete data[k];
    });

    const verification = new HomeVerification(data);
    await verification.save();
    res.status(201).json({ message: 'Verification saved as draft', verification });
  } catch (err) {
    console.error('Save error:', err.message);
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message).join(', ');
      return res.status(400).json({ error: `Validation failed: ${messages}` });
    }
    res.status(500).json({ error: 'Failed to save verification: ' + err.message });
  }
};

// Submit verification (draft → submitted)
exports.submitVerification = async (req, res) => {
  try {
    const { id } = req.params;
    const verification = await HomeVerification.findByIdAndUpdate(
      id,
      { ...req.body, status: 'submitted' },
      { new: true, runValidators: true }
    );
    if (!verification) return res.status(404).json({ error: 'Verification not found' });
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
      { new: true }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Verification approved', verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to approve' });
  }
};

// Reject verification
exports.rejectVerification = async (req, res) => {
  try {
    const verification = await HomeVerification.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', supervisorRemarks: req.body.remarks },
      { new: true }
    );
    if (!verification) return res.status(404).json({ error: 'Not found' });
    res.json({ message: 'Verification rejected', verification });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reject' });
  }
};

// Get all verifications (with optional status filter)
exports.getAllVerifications = async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};
    const verifications = await HomeVerification.find(filter)
      .sort({ createdAt: -1 })
      .select('studentName scholarshipType status verificationDate verifierName');
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
