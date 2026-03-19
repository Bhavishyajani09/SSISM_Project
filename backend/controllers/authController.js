const User = require('../models/User');
const HomeVerification = require('../models/HomeVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

exports.getUsersActivity = async (req, res) => {
    try {
        const users = await User.find({ role: 'teacher' }).select('-password');
        
        // Parallel fetch for each teacher count
        const teacherActivity = await Promise.all(users.map(async (u) => {
            const count = await HomeVerification.countDocuments({ verifierId: u._id });
            return {
                id: u._id,
                email: u.email,
                role: u.role,
                verificationCount: count,
                lastActive: (await HomeVerification.findOne({ verifierId: u._id }).sort({ updatedAt: -1 }))?.updatedAt || null
            };
        }));

        res.json({ users: teacherActivity });
    } catch (err) {
        console.error('Fetch users error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Prevent deleting self
        if (id === req.user.id) {
            return res.status(400).json({ error: 'You cannot delete yourself' });
        }

        const user = await User.findByIdAndDelete(id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error('Delete user error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email: email?.toLowerCase().trim() });
        if (!user) return res.status(401).json({ error: 'Invalid email or password' });

        const isMatch = await bcrypt.compare(String(password), user.password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }

        // Generate JWT Token
        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role,
                name: user.name || ''
            }
        });

    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ error: 'Server error during login' });
    }
};

exports.register = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        const userExists = await User.findOne({ email: email?.toLowerCase().trim() });
        if (userExists) {
            return res.status(400).json({ error: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(String(password), 10);

        const newUser = await User.create({
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            role: role || 'teacher'
        });

        res.status(201).json({
            message: 'User registered successfully',
            user: {
                id: newUser._id,
                email: newUser.email,
                role: newUser.role
            }
        });

    } catch (err) {
        console.error('Registration error:', err);
        res.status(500).json({ error: 'Server error during registration' });
    }
};

