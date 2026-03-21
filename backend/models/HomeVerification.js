const mongoose = require('mongoose');

const familyMemberSchema = new mongoose.Schema({
  name: { type: String, trim: true },
  relation: { type: String, trim: true },
  occupation: { type: String, trim: true },
  income: { type: Number, default: 0 },
  mobile: { type: String, trim: true }
});

const photoSchema = new mongoose.Schema({
  label: { type: String },
  url: { type: String }  // Will store file path or cloud URL
});

const homeVerificationSchema = new mongoose.Schema({

  // --- Metadata ---
  verifierId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  verifierName: { type: String, trim: true },
  verificationDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['draft', 'teacher_rejected', 'submitted', 'approved', 'rejected'],
    default: 'draft'
  },
  gpsLat: { type: Number },
  gpsLng: { type: Number },
  gpsAddress: { type: String, trim: true },

  // --- Verification Info ---
  scholarshipType: {
    type: String,
    enum: ['SNS', 'SVS', null, ''],
  },
  studentId: { type: String, trim: true, unique: true, required: true },

  // --- Academic Details ---
  marks10: { type: Number },
  marks11: { type: Number },
  marks12: { type: Number },
  collegeExamMarks: { type: Number },
  homeVisitMarks: { type: Number },
  attendance12: { type: Number },
  totalMarks: { type: Number },

  // --- Personal Information ---
  studentName: { type: String, trim: true },
  fatherName: { type: String, trim: true },
  mobile: { type: String, trim: true },
  schoolName: { type: String, trim: true },
  classFees12: { type: Number },
  subject12: { type: String },
  address: { type: String },
  village: { type: String },
  tehsil: { type: String },
  district: { type: String },
  pincode: { type: String },
  track: { type: String },
  futureGoal: { type: String },

  // --- Achievements ---
  achievements: { type: String, trim: true },

  // --- Health Information ---
  hasIllness: { type: Boolean, default: false },
  illnessName: { type: String },
  symptoms: { type: String },

  // --- Family Members (nested array) ---
  familyMembers: [familyMemberSchema],

  // --- Family Income ---
  totalAnnualIncome: { type: Number },
  incomeSources: [{ type: String }],
  incomeOther: { type: String },
  familyChallenges: { type: String },

  // --- Housing Condition ---
  houseType: {
    type: String,
    enum: ['Pucca', 'Kaccha', 'Semi Pucca', null, ''],
  },
  numRooms: { type: Number },
  houseBuilder: {
    type: String,
    enum: ['Self', 'Government Scheme', null, ''],
  },
  houseSchemeName: { type: String, trim: true },

  // --- Household Resources ---
  appliances: [{ type: String }],
  numVehicles: { type: Number, default: 0 },
  vehicleTypes: [{ type: String }],

  // --- Land & Farming ---
  totalLand: { type: Number },
  landUnit: { type: String, enum: ['Bigha', 'Acre', null, ''], default: 'Acre' },
  landOwnership: { type: String },
  landType: { type: String, enum: ['Irrigated', 'Non Irrigated', null, ''] },
  irrigationSource: { type: String },
  livestock: [{ type: String }],

  // --- Photos ---
  photos: [photoSchema],

  // --- Declaration ---
  studentSignatureUrl: { type: String },
  fatherSignatureUrl: { type: String },
  motherSignatureUrl: { type: String },
  supervisorSignatureUrl: { type: String },

  // --- Supervisor ---
  supervisorRemarks: { type: String },

}, { timestamps: true });

// Auto-calculate totalMarks and sanitize enums before saving
homeVerificationSchema.pre('save', function () {
  console.log('Pre-save hook for studentId:', this.studentId);
  const vals = [this.marks10, this.marks11, this.marks12, this.collegeExamMarks, this.homeVisitMarks];
  this.totalMarks = vals.reduce((sum, v) => sum + (parseFloat(v) || 0), 0);
  console.log('Calculated totalMarks:', this.totalMarks);

  // Clean up empty string enum fields
  if (this.scholarshipType === '') this.scholarshipType = undefined;
  if (this.houseType === '') this.houseType = undefined;
  if (this.houseBuilder === '') this.houseBuilder = undefined;
  if (this.landType === '') this.landType = undefined;
  if (this.landUnit === '') this.landUnit = 'Bigha';
});

// Also handle updates
homeVerificationSchema.pre(['update', 'findOneAndUpdate', 'findByIdAndUpdate'], function() {
  const update = this.getUpdate();
  if (!update) return;

  const m10 = update.marks10;
  const m11 = update.marks11;
  const m12 = update.marks12;
  const cem = update.collegeExamMarks;
  const hvm = update.homeVisitMarks;

  if (m10 !== undefined || m11 !== undefined || m12 !== undefined || cem !== undefined || hvm !== undefined) {
    const val = (v) => parseFloat(v) || 0;
    update.totalMarks = val(m10) + val(m11) + val(m12) + val(cem) + val(hvm);
    console.log('Update: Calculated totalMarks:', update.totalMarks);
  }
});

// Indexes for faster filtering and sorting
homeVerificationSchema.index({ status: 1 });
homeVerificationSchema.index({ verifierId: 1 });
homeVerificationSchema.index({ verificationDate: -1 });

module.exports = mongoose.model('HomeVerification', homeVerificationSchema);
