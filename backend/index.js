const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();
const connectDB = require('./config/db');
const passedStudentsRoutes = require('./routes/passedStudents');
const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
    res.send('Backend Server is Running!');
});

app.use('/api/passed-students', passedStudentsRoutes);
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});
