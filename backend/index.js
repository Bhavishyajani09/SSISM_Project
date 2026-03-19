const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const compression = require('compression');
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

// Main Routes
app.use('/api/auth', authRoutes);
app.use('/api/verifications', require('./routes/verificationRoutes'));
app.use('/api/upload', require('./routes/uploadRoutes'));
app.use('/api/passed-students', passedStudentsRoutes);

app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});
