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
    '12th School Name',
    '12th Stream',
    '12th Class Fees',
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
    'subject (12th)': 'subjectIn12th',
    '12 subject': 'subjectIn12th',
    '12th subject': 'subjectIn12th',
    '12th school name': 'schoolName12th',
    'school name 12th': 'schoolName12th',
    '12th school': 'schoolName12th',
    '12th stream': 'stream12th',
    'stream 12th': 'stream12th',
    '12th class fees': 'classFees12th',
    '12th class fees (₹)': 'classFees12th',
    '12th school fee': 'classFees12th',
    '12th school fees': 'classFees12th',
    '12th class fee': 'classFees12th',
    'fees 12th': 'classFees12th',
    '10th mark': 'marks10',
    '10th marks': 'marks10',
    '10th percentage (max 100)': 'marks10',
    '10th percentage': 'marks10',
    '10th %': 'marks10',
    '11th mark': 'marks11',
    '11th marks': 'marks11',
    '11th percentage (max 100)': 'marks11',
    '11th percentage': 'marks11',
    '11th %': 'marks11',
    'village / town': 'villageTown',
    'village/town': 'villageTown',
    'district': 'district',
    'roll number': 'rollNumber',
    'scholarship exam marks (out of 50)': 'scholarshipExamMarks',
    'scholarship exam marks': 'scholarshipExamMarks',
    'exam mark': 'scholarshipExamMarks',
    'exam marks': 'scholarshipExamMarks',
};

const { auth, adminOnly } = require('../middleware/auth');

// ─── GET dashboard stats ──────────────────────────────────────────────────
router.get('/stats', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const userRole = req.user.role;

        // 1. Total Students
        const total = await PassedStudent.countDocuments();
        console.log(`[Stats Debug] User: ${userId}, Role: ${userRole}, Total Students DB: ${total}`);

        // 2. Status counts (Aggregation)
        const statusAggregation = await PassedStudent.aggregate([
            {
                $lookup: {
                    from: 'homeverifications',
                    localField: 'rollNumber',
                    foreignField: 'studentId',
                    as: 'verification'
                }
            },
            { $addFields: { verification: { $arrayElemAt: ['$verification', 0] } } },
            { $addFields: { currentStatus: { $ifNull: ['$verification.status', 'pending'] } } },
            { $group: { _id: '$currentStatus', count: { $sum: 1 } } }
        ]);

        const statusCounts = {};
        statusAggregation.forEach(item => { statusCounts[item._id] = item.count; });

        // 3. Submitted By Me (for teachers)
        let submittedByMe = 0;
        if (userRole === 'teacher') {
            submittedByMe = await HomeVerification.countDocuments({
                verifierId: userId,
                status: 'submitted'
            });
        } else {
            submittedByMe = statusCounts['submitted'] || 0;
        }

        // 4. District stats (top 5 for charts)
        const locationStats = await PassedStudent.aggregate([
            { $group: { _id: '$district', count: { $sum: 1 } } },
            { $match: { _id: { $ne: null, $ne: '' } } },
            { $sort: { count: -1 } },
            { $limit: 8 }
        ]);

        // 5. Recent Activity (last 10 updates)
        const recentActivity = await HomeVerification.find()
            .sort({ updatedAt: -1 })
            .limit(10)
            .select('studentName status updatedAt studentId');

        // 6. Attention Needed metrics
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const drafts = statusCounts['draft'] || 0;
        const rejected = (statusCounts['rejected'] || 0) + (statusCounts['teacher_rejected'] || 0) + (statusCounts['student_rejected'] || 0);

        // Calculate pending older than 5 days (no verification record + older than 5 days)
        // Note: addedAt is the field in PassedStudent
        const olderThan5DaysRes = await PassedStudent.aggregate([
            {
                $lookup: {
                    from: 'homeverifications',
                    localField: 'rollNumber',
                    foreignField: 'studentId',
                    as: 'verification'
                }
            },
            { $match: { verification: { $size: 0 }, addedAt: { $lt: fiveDaysAgo } } },
            { $count: 'count' }
        ]);

        const approvedCount = statusCounts['approved'] || 0;
        const submittedCount = statusCounts['submitted'] || 0;
        const pendingCount = statusCounts['pending'] || 0;

        console.log(`[Stats Debug] Returning stats - Total: ${total}, Approved: ${approvedCount}, Pending: ${pendingCount}`);

        res.json({
            success: true,
            stats: {
                total,
                submittedByMe,
                approved: approvedCount,
                pending: pendingCount,
                rejected,
                drafts,
                olderThan5Days: (olderThan5DaysRes[0]?.count || 0),
                completionRate: total ? Math.round(((total - pendingCount - drafts) / total) * 100) : 0,
                approvalRate: (submittedCount + approvedCount) > 0 
                  ? Math.round((approvedCount / (submittedCount + approvedCount)) * 100) 
                  : 0
            },
            locationStats: locationStats.map(loc => [loc._id, loc.count]),
            recentActivity
        });

    } catch (error) {
        console.error('Dashboard stats error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching dashboard metrics.' });
    }
});


// ─── GET all passed students ────────────────────────────────────────────────
router.get('/', auth, async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '', district = '', status = 'all' } = req.query;
        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Build Match Object for PassedStudent
        const matchQuery = {};
        if (search) {
            matchQuery.$or = [
                { studentName: { $regex: search, $options: 'i' } },
                { rollNumber: { $regex: search, $options: 'i' } },
            ];
        }
        if (district) {
            matchQuery.district = district;
        }

        const pipeline = [
            { $match: matchQuery },
            {
                $lookup: {
                    from: 'homeverifications', // MongoDB collection name
                    localField: 'rollNumber',
                    foreignField: 'studentId',
                    as: 'verification'
                }
            },
            { $addFields: { verification: { $arrayElemAt: ['$verification', 0] } } },
            { $addFields: { currentStatus: { $ifNull: ['$verification.status', 'pending'] } } }
        ];

        // Filter by Status if not 'all'
        if (status !== 'all') {
            if (status === 'rejected') {
                pipeline.push({ $match: { currentStatus: { $in: ['rejected', 'teacher_rejected', 'student_rejected'] } } });
            } else {
                pipeline.push({ $match: { currentStatus: status } });
            }
        }

        // Count total matching records
        const countPipeline = [...pipeline, { $count: 'total' }];
        const countResult = await PassedStudent.aggregate(countPipeline);
        const total = countResult.length > 0 ? countResult[0].total : 0;

        // Final Pagination & Sorting
        pipeline.push({ $sort: { serialNumber: 1 } });
        pipeline.push({ $skip: (pageNum - 1) * limitNum });
        pipeline.push({ $limit: limitNum });

        const students = await PassedStudent.aggregate(pipeline);

        res.json({
            success: true,
            data: students,
            total,
            page: pageNum,
            totalPages: Math.ceil(total / limitNum),
            count: students.length
        });
    } catch (error) {
        console.error('Error fetching students with aggregate:', error);
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
router.delete('/:id', auth, async (req, res) => {
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
router.put('/:id', auth, async (req, res) => {

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

// ─── GET export all students (Excel) ──────────────────────────────────────
router.get('/export', auth, async (req, res) => {
    try {
        const pipeline = [
            {
                $lookup: {
                    from: 'homeverifications',
                    localField: 'rollNumber',
                    foreignField: 'studentId',
                    as: 'verification'
                }
            },
            { $addFields: { verification: { $arrayElemAt: ['$verification', 0] } } },
            { $addFields: { currentStatus: { $ifNull: ['$verification.status', 'pending'] } } },
            { $sort: { serialNumber: 1 } }
        ];

        const students = await PassedStudent.aggregate(pipeline);

        // Format ALL data for Excel (except photos)
        const exportData = students.map(s => {
            const v = s.verification || {};
            return {
                // --- Basic Registry (PassedStudent) ---
                'S.No': s.serialNumber,
                'Roll No': s.rollNumber,
                'Student Name': s.studentName,
                'Father Name': s.fatherName,
                'Mobile (Reg)': s.mobileNumber,
                'WhatsApp (Reg)': s.whatsappNumber || '',
                'Subject (12th)': s.subjectIn12th || '',
                'School Name (12th)': s.schoolName12th || '',
                'Stream (12th)': s.stream12th || '',
                'Class Fees (12th)': s.classFees12th || 0,
                'Bus Track': s.busTrack || '',
                'Village (Reg)': s.villageTown || '',
                'District (Reg)': s.district || '',
                'Marks (Scholarship)': s.scholarshipExamMarks || 0,
                '10th % (Reg)': s.marks10 || 0,
                '11th % (Reg)': s.marks11 || 0,

                // --- Verification Metadata ---
                'Status': s.currentStatus.toUpperCase(),
                'Verifier Name': v.verifierName || '',
                'Verification Date': v.verificationDate ? new Date(v.verificationDate).toLocaleDateString() : '',
                'Hold Reason': v.holdReason || '',
                'GPS Address': v.gpsAddress || '',
                'GPS Lat': v.gpsLat || '',
                'GPS Lng': v.gpsLng || '',

                // --- Academic Verification ---
                'Scholarship Type': v.scholarshipType || '',
                '10th %': v.marks10 || '',
                '11th %': v.marks11 || '',
                'College Exam Marks': v.collegeExamMarks || '',
                '12th Attendance %': v.attendance12 || '',
                'Home Visit Marks': v.homeVisitMarks || '',
                'School Name': v.schoolName || '',
                '12th Class Fees': v.classFees12 || '',

                // --- Personal & Address ---
                'Current Address': v.address || '',
                'Village': v.village || '',
                'Tehsil': v.tehsil || '',
                'District': v.district || '',
                'Pincode': v.pincode || '',
                'Track Used': v.track === 'Other' ? v.trackCustom : v.track,
                'Future Goal': v.futureGoal || '',

                // --- Health ---
                'Has Illness?': v.hasIllness ? 'Yes' : 'No',
                'Illness Name': v.illnessName || '',
                'Symptoms': v.symptoms || '',

                // --- Family & Income ---
                'Total Annual Income': v.totalAnnualIncome || '',
                'Income Sources': (v.incomeSources || []).join(', '),
                'Other Income Info': v.incomeOther || '',
                'Family Challenges': v.familyChallenges || '',
                'Family Members Count': (v.familyMembers || []).length,

                // --- Housing ---
                'House Type': v.houseType || '',
                'Num Rooms': v.numRooms || '',
                'Who Built?': v.houseBuilder || '',
                'Scheme Name': v.houseSchemeName || '',
                'Appliances': (v.appliances || []).join(', '),
                'Vehicles Count': v.numVehicles || 0,
                'Vehicle Types': (v.vehicleTypes || []).join(', '),

                // --- Land & Farming ---
                'Total Land': v.totalLand || '',
                'Land Unit': v.landUnit || '',
                'Ownership': v.landOwnership || '',
                'Land Type': v.landType || '',
                'Irrigation Source': v.irrigationSource || '',
                'Livestock': (v.livestock || []).join(', '),

                // --- Evaluation ---
                'Supervisor Remarks': v.supervisorRemarks || ''
            };
        });

        res.json({ success: true, data: exportData });
    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({ success: false, message: 'Server error during export.' });
    }
});

module.exports = router;
