const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const generateOTP = require('../utils/generateOTP');
const { sendOTPEmail } = require('../utils/emailService');
const { generateToken } = require('../utils/tokenUtils');

const register = async (req, res) => {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
        return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    try {
        const [existingUsers] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        if (existingUsers.length > 0) {
            return res.status(400).json({ success: false, message: 'User already exists with this email' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const otp = generateOTP();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        console.log(`[AUTH] Generated Registration OTP for ${email}: ${otp}`);

        const [result] = await pool.execute(
            'INSERT INTO users (name, email, password, role, is_verified, otp, otp_expiry) VALUES (?, ?, ?, ?, false, ?, ?)',
            [name, email, hashedPassword, role, otp, otpExpiry]
        );

        // Attempt to dispatch email immediately
        const emailSent = await sendOTPEmail(email, otp);
        if (!emailSent) {
            // Delete the invalid user registration row safely via inserted ID so they aren't blocked from trying again
            await pool.execute('DELETE FROM users WHERE id = ?', [result.insertId]);
            return res.status(500).json({ success: false, message: 'Registration failed: Unable to send OTP email. Please verify Gmail SMTP configuration.' });
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please verify your email with the OTP sent.',
            userId: result.insertId
        });

    } catch (error) {
        console.error(`[ERROR] Registration failed for ${email}:`, error.message);
        res.status(500).json({ success: false, message: 'Server error during registration' });
    }
};

const verifyOTP = async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        return res.status(400).json({ success: false, message: 'Email and OTP are required' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        const currentTime = new Date();
        const otpExpiryTime = new Date(user.otp_expiry);

        if (user.otp !== otp) {
            return res.status(400).json({ success: false, message: 'Invalid OTP' });
        }

        if (currentTime > otpExpiryTime) {
            return res.status(400).json({ success: false, message: 'OTP has expired. Please request a new one.' });
        }

        console.log(`[AUTH] Successfully verified OTP for ${email}`);
        
        await pool.execute(
            'UPDATE users SET is_verified = true, otp = NULL, otp_expiry = NULL WHERE email = ?',
            [email]
        );

        res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' });

    } catch (error) {
        console.error(`[ERROR] OTP verification failed for ${email}:`, error.message);
        res.status(500).json({ success: false, message: 'Server error during verification' });
    }
};

const resendOTP = async (req, res) => {
    const { email } = req.body;

    if (!email) {
        return res.status(400).json({ success: false, message: 'Email is required' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        if (user.is_verified) {
            return res.status(400).json({ success: false, message: 'User is already verified' });
        }

        const newOtp = generateOTP();
        const newOtpExpiry = new Date(Date.now() + 5 * 60 * 1000);
        console.log(`[AUTH] Generated new Resend OTP for ${email}: ${newOtp}`);

        await pool.execute(
            'UPDATE users SET otp = ?, otp_expiry = ? WHERE email = ?',
            [newOtp, newOtpExpiry, email]
        );

        const emailSent = await sendOTPEmail(email, newOtp);
        if (!emailSent) {
            return res.status(500).json({ success: false, message: 'Resend failed: Unable to send OTP email. Please verify Gmail SMTP configuration.' });
        }

        res.status(200).json({ success: true, message: 'A new OTP has been sent to your email.' });

    } catch (error) {
        console.error(`[ERROR] Resend OTP failed for ${email}:`, error.message);
        res.status(500).json({ success: false, message: 'Server error during resending OTP' });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Please provide email and password' });
    }

    try {
        const [users] = await pool.execute('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        if (!user.is_verified) {
            return res.status(403).json({ success: false, message: 'Please verify your email before logging in.' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        const token = generateToken(user.id, user.role);

        
        console.log(`[AUTH] Successful login for ${email}`);

        res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user.id, name: user.name, email: user.email, role: user.role }
        });

    } catch (error) {
        console.error(`[ERROR] Login failed for ${email}:`, error.message);
        res.status(500).json({ success: false, message: 'Server error during login' });
    }
};

const testEmail = async (req, res) => {
    const testEmailAddress = process.env.EMAIL_USER;
    const sampleOtp = '123456';

    if (!testEmailAddress) {
        return res.status(400).json({ success: false, message: 'EMAIL_USER is not configured in .env' });
    }

    const emailSent = await sendOTPEmail(testEmailAddress, sampleOtp);
    
    if (emailSent) {
        return res.status(200).json({ success: true, message: `Test email sent successfully to ${testEmailAddress}` });
    } else {
        return res.status(500).json({ success: false, message: 'Test email failed. Please open the Node.js server terminal to view the detailed crash logs.' });
    }
};

module.exports = {
    register,
    verifyOTP,
    resendOTP,
    login,
    testEmail
};
