const express = require('express');
const router = express.Router();
const multer = require('multer');
const XLSX = require('xlsx');
const PassedStudent = require('../models/PassedStudent');
const HomeVerification = require('../models/HomeVerification');

// Multer config — store file in memory for processing
const upload = multer({ storage: multer.memoryStorage() });

// Expected Excel column headers (case-insensitive matching)
const EXPECTED_COLUMNS = [
    'Serial Number',
    'Student Name',
    'Father Name',
    'Bus Track',
    'Mobile Number',
    'Whatsapp Number',
    'Subject in 12th',
    'Village / Town',
    'District',
    'Roll Number',
    'Scholarship Exam Marks',
];

// Map Excel column names to DB field names
const COLUMN_MAP = {
    'serial number': 'serialNumber',
    'student name': 'studentName',
    'father name': 'fatherName',
    'bus track': 'busTrack',
    'mobile number': 'mobileNumber',
    'whatsapp number': 'whatsappNumber',
    'subject in 12th': 'subjectIn12th',
    'village / town': 'villageTown',
    'village/town': 'villageTown',
    'district': 'district',
    'roll number': 'rollNumber',
    'scholarship exam marks (out of 50)': 'scholarshipExamMarks',
    'scholarship exam marks': 'scholarshipExamMarks',
};

const { auth, adminOnly } = require('../middleware/auth');

// ─── GET all passed students ────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const students = await PassedStudent.find().sort({ serialNumber: 1 });
        res.json({ success: true, data: students, count: students.length });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching students.' });
    }
});

// ─── POST manual entry (single or multiple) ────────────────────────────────
router.post('/manual', auth, async (req, res) => {
    try {
        const { students } = req.body; // expects { students: [ {...}, {...} ] }

        if (!students || !Array.isArray(students) || students.length === 0) {
            return res.status(400).json({ success: false, message: 'Please provide at least one student.' });
        }

        // Validate required fields
        const errors = [];
        students.forEach((s, i) => {
            if (!s.studentName) errors.push(`Row ${i + 1}: Student Name is required.`);
            if (!s.fatherName) errors.push(`Row ${i + 1}: Father Name is required.`);
            if (!s.mobileNumber) errors.push(`Row ${i + 1}: Mobile Number is required.`);
        });

        if (errors.length > 0) {
            return res.status(400).json({ success: false, message: 'Validation errors', errors });
        }

        // Auto-increment serialNumber and generate rollNumber
        const lastStudent = await PassedStudent.findOne().sort({ serialNumber: -1 });
        let nextSerial = lastStudent && lastStudent.serialNumber ? lastStudent.serialNumber + 1 : 1;
        const currentYear = new Date().getFullYear();
        
        const studentsWithSerial = students.map(s => {
            const serial = nextSerial++;
            return {
                ...s,
                serialNumber: serial,
                rollNumber: s.rollNumber || `SCH${currentYear}${String(serial).padStart(3, '0')}`
            };
        });

        const savedStudents = await PassedStudent.insertMany(studentsWithSerial);
        res.status(201).json({
            success: true,
            message: `${savedStudents.length} student(s) added successfully.`,
            data: savedStudents,
        });
    } catch (error) {
        console.error('Error adding students:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error while adding students.' });
    }
});

// ─── POST upload Excel ──────────────────────────────────────────────────────
router.post('/upload-excel', auth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'Please upload an Excel file.' });
        }

        // Parse the Excel file from buffer
        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (rawData.length === 0) {
            return res.status(400).json({ success: false, message: 'The Excel file is empty.' });
        }

        // Validate headers (Roll Number is optional)
        const fileHeaders = Object.keys(rawData[0]).map(h => h.trim().toLowerCase());
        const requiredHeaders = ['student name', 'father name', 'mobile number'];
        const missingHeaders = requiredHeaders.filter(h => !fileHeaders.some(fh => fh === h));

        if (missingHeaders.length > 0) {
            return res.status(400).json({
                success: false,
                message: `Wrong format. Missing required columns: ${missingHeaders.join(', ')}`,
            });
        }

        // Map rows to student objects
        const students = rawData.map((row) => {
            const student = {};
            Object.entries(row).forEach(([key, value]) => {
                const normalizedKey = key.trim().toLowerCase();
                const dbField = COLUMN_MAP[normalizedKey];
                if (dbField) {
                    student[dbField] = typeof value === 'string' ? value.trim() : value;
                }
            });
            return student;
        });

        // Filter out empty rows (Roll Number is now auto-generated if missing)
        const validStudents = students.filter(s => s.studentName);

        if (validStudents.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid student records found in the file.' });
        }

        // Auto-increment missing serial numbers in Excel if they aren't provided
        const lastStudent = await PassedStudent.findOne().sort({ serialNumber: -1 });
        let nextSerial = lastStudent && lastStudent.serialNumber ? lastStudent.serialNumber + 1 : 1;
        const currentYear = new Date().getFullYear();

        const studentsWithSerial = validStudents.map(s => {
            if (!s.serialNumber) {
                s.serialNumber = nextSerial++;
            } else {
                // If serialNumber is provided, ensure nextSerial stays above it to avoid collisions next time
                const sn = parseInt(s.serialNumber, 10);
                if (!isNaN(sn) && sn >= nextSerial) {
                    nextSerial = sn + 1;
                }
            }
            // Generate Roll Number if not in Excel
            if (!s.rollNumber) {
                s.rollNumber = `SCH${currentYear}${String(s.serialNumber).padStart(3, '0')}`;
            }
            return s;
        });

        const savedStudents = await PassedStudent.insertMany(studentsWithSerial);
        res.status(201).json({
            success: true,
            message: `${savedStudents.length} student(s) uploaded successfully.`,
            data: savedStudents,
        });
    } catch (error) {
        console.error('Error uploading Excel:', error);
        res.status(500).json({ success: false, message: 'Server error while processing the Excel file.' });
    }
});

// ─── DELETE a student by ID ─────────────────────────────────────────────────
router.delete('/:id', auth, adminOnly, async (req, res) => {
    try {
        // 1. Find the student first to get their rollNumber
        const student = await PassedStudent.findById(req.params.id);
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }

        const rollNumber = student.rollNumber;

        // 2. Delete the student record
        await PassedStudent.findByIdAndDelete(req.params.id);

        // 3. Cascaded Delete: Remove associated home verification if it exists
        if (rollNumber) {
            await HomeVerification.deleteMany({ studentId: rollNumber });
            console.log(`Cascaded Delete: Removed verifications for studentId: ${rollNumber}`);
        }

        res.json({ success: true, message: 'Student and associated verifications deleted successfully.' });
    } catch (error) {
        console.error('Error deleting student:', error);
        res.status(500).json({ success: false, message: 'Server error while deleting student.' });
    }
});

// ─── UPDATE a student by ID ──────────────────────────────────────────────────
router.put('/:id', auth, adminOnly, async (req, res) => {

    try {
        const student = await PassedStudent.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true, runValidators: true }
        );
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.json({ success: true, message: 'Student updated successfully.', data: student });
    } catch (error) {
        console.error('Error updating student:', error);
        if (error.name === 'ValidationError') {
            return res.status(400).json({ success: false, message: error.message });
        }
        res.status(500).json({ success: false, message: 'Server error while updating student.' });
    }
});

// ─── GET a student by Roll Number ──────────────────────────────────────────
router.get('/roll/:rollNumber', async (req, res) => {
    try {
        const student = await PassedStudent.findOne({ rollNumber: req.params.rollNumber });
        if (!student) {
            return res.status(404).json({ success: false, message: 'Student not found.' });
        }
        res.json({ success: true, data: student });
    } catch (error) {
        console.error('Error fetching student by roll number:', error);
        res.status(500).json({ success: false, message: 'Server error while fetching student.' });
    }
});

module.exports = router;
