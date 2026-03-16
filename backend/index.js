const express = require('express');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./config/db');
const passedStudentsRoutes = require('./routes/passedStudents');

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

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is listening on port ${PORT}`);
});
