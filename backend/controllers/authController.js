const User = require('../models/User');
const HomeVerification = require('../models/HomeVerification');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendOTP } = require('../config/email');

// Generate 6-digit OTP
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

exports.forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Forgot password request for:', email);

        const user = await User.findOne({ email: email?.toLowerCase().trim() });
        if (!user) {
            console.log('User not found:', email);
            return res.status(404).json({ error: 'User not found' });
        }

        // --- Rate Limiting for OTP ---
        const cooldown = 2 * 60 * 1000; // 2 minutes
        if (user.lastOTPGenerated && (Date.now() - user.lastOTPGenerated.getTime() < cooldown)) {
            const remaining = Math.ceil((cooldown - (Date.now() - user.lastOTPGenerated.getTime())) / 1000);
            return res.status(429).json({ 
                error: `Please wait ${remaining} seconds before requesting another OTP.` 
            });
        }

        const otp = generateOTP();
        const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        user.resetPasswordOTP = otp;
        user.resetPasswordExpires = otpExpires;
        user.lastOTPGenerated = new Date();
        
        console.log('Saving user with OTP...');
        await user.save();
        console.log('User saved successfully');

        console.log('Sending OTP to:', user.email);
        await sendOTP(user.email, otp);
        console.log('OTP sent successfully');

        res.json({ message: 'OTP sent to your email' });
    } catch (err) {
        console.error('Forgot password error details:', err);
        res.status(500).json({ error: 'Server error: ' + err.message });
    }
};

exports.verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;
        const user = await User.findOne({
            email: email?.toLowerCase().trim(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        res.json({ message: 'OTP verified successfully' });
    } catch (err) {
        console.error('Verify OTP error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.resetPassword = async (req, res) => {
    try {
        const { email, otp, newPassword } = req.body;
        const user = await User.findOne({
            email: email?.toLowerCase().trim(),
            resetPasswordOTP: otp,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP' });
        }

        const hashedPassword = await bcrypt.hash(String(newPassword), 10);
        user.password = hashedPassword;
        user.resetPasswordOTP = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Reset password error:', err);
        res.status(500).json({ error: 'Server error' });
    }
};

exports.getUsersActivity = async (req, res) => {
    try {
        const users = await User.find({ role: 'teacher' }).select('-password');
        
        // Parallel fetch for each teacher count
        const teacherActivity = await Promise.all(users.map(async (u) => {
            const count = await HomeVerification.countDocuments({ verifierId: u._id });
            return {
                id: u._id,
                name: u.name,
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

        // --- Brute Force Protection ---
        if (user.lockUntil && user.lockUntil > Date.now()) {
            const remaining = Math.ceil((user.lockUntil - Date.now()) / (60 * 1000));
            return res.status(403).json({ 
                error: `Account temporarily locked due to too many failed attempts. Try again in ${remaining} minutes.` 
            });
        }

        const isMatch = await bcrypt.compare(String(password), user.password);
        console.log(`[Auth Debug] User: ${email}, Match: ${isMatch}, Prev Attempts: ${user.loginAttempts}`);
        
        if (!isMatch) {
            // Increment failed attempts in DB directly
            const updatedUser = await User.findOneAndUpdate(
                { _id: user._id },
                { $inc: { loginAttempts: 1 } },
                { new: true }
            );
            
            console.log(`[Auth Debug] New Attempts count: ${updatedUser.loginAttempts}`);

            if (updatedUser.loginAttempts >= 5) {
                const lockTime = new Date(Date.now() + 10 * 60 * 1000);
                await User.updateOne(
                    { _id: user._id },
                    { $set: { lockUntil: lockTime, loginAttempts: 0 } }
                );
                console.log(`[Auth Debug] ACCOUNT LOCKED until: ${lockTime}`);
                return res.status(403).json({ 
                    error: 'Account locked for 10 minutes due to 5 failed attempts.' 
                });
            }
            
            const remaining = 5 - updatedUser.loginAttempts;
            return res.status(401).json({ 
                error: `Invalid email or password. ${remaining} attempts remaining.` 
            });
        }

        // Reset protection on successful login
        user.loginAttempts = 0;
        user.lockUntil = undefined;
        await user.save();

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

