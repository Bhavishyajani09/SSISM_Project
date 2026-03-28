const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const passedStudentsRoutes = require('./routes/passedStudents');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(compression());
app.use(express.json({ limit: '10mb' }));

// --- Safety & Security: Rate Limiting ---
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this IP, please try again after 15 minutes' }
});

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // Limit each IP to 50 login/OTP requests per 10 mins (generous for shared IPs)
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many login attempts from this connection. Please wait 10 minutes and try again.' }
});

// Main Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/verifications', apiLimiter, require('./routes/verificationRoutes'));
app.use('/api/upload', apiLimiter, require('./routes/uploadRoutes'));
app.use('/api/passed-students', apiLimiter, passedStudentsRoutes);

app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});
