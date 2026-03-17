const mongoose = require('mongoose');

const passedStudentSchema = new mongoose.Schema({
    serialNumber: {
        type: Number,
        required: true,
    },
    studentName: {
        type: String,
        required: true,
        trim: true,
    },
    fatherName: {
        type: String,
        required: true,
        trim: true,
    },
    busTrack: {
        type: String,
        trim: true,
        default: '',
    },
    mobileNumber: {
        type: String,
        required: true,
        trim: true,
        match: [/^\d{10}$/, 'Mobile number must be exactly 10 digits'],
    },
    whatsappNumber: {
        type: String,
        trim: true,
        default: '',
        match: [/^\d{10}$/, 'WhatsApp number must be exactly 10 digits'],
    },
    subjectIn12th: {
        type: String,
        trim: true,
        default: '',
    },
    villageTown: {
        type: String,
        trim: true,
        default: '',
    },
    district: {
        type: String,
        trim: true,
        default: '',
    },
    rollNumber: {
        type: String,
        required: true,
        trim: true,
    },
    scholarshipExamMarks: {
        type: Number,
        min: 0,
        max: 50,
        default: 0,
    },
    addedAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('PassedStudent', passedStudentSchema);
