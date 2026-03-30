const { User } = require("../models/userModel");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../services/emailService");
const bcrypt = require("bcrypt");

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { name, email, password, role } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: "Please enter all fields" });
        }

        // Check if user exists
        const userExists = await User.findByEmail(email);
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Create user in DB
        const insertId = await User.create(
            name,
            email,
            hashedPassword,
            role || "customer",
            otp,
            otpExpiry
        );

        console.log(`🔑 Registration OTP for ${email}: ${otp}`);

        // Send OTP via email
        const message = `Welcome ${name}! Your OTP for registration is: ${otp}. It is valid for 5 minutes.`;

        try {
            await sendEmail({
                email,
                subject: "Account Verification OTP",
                message,
            });
        } catch (emailError) {
            console.error("Failed to send OTP email, but user was created.");
            // We can still proceed, but user won't receive email. For prod, might want to rollback.
        }

        res.status(201).json({
            message: "User registered. Please check email for OTP verification.",
            userId: insertId,
        });
    } catch (error) {
        console.error("Register Error:", error);
        res.status(500).json({ message: "Server error during registration" });
    }
};

// @desc    Verify OTP
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOTP = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: "Please provide email and OTP" });
        }

        // Find User
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Check OTP constraints
        if (user.otp !== otp) {
            return res.status(400).json({ message: "Invalid OTP" });
        }

        if (new Date() > new Date(user.otp_expiry)) {
            return res.status(400).json({ message: "OTP has expired" });
        }

        // Verify User
        await User.verifyAccount(user.id);

        // Generate Token
        const token = generateToken(user.id);

        res.status(200).json({
            message: "Account verified successfully",
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error("OTP Verification Error:", error);
        res.status(500).json({ message: "Server error during verification" });
    }
};

// @desc    Resend OTP
// @route   POST /api/auth/resend-otp
// @access  Public
const resendOTP = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: "Please provide email" });
        }

        // Find user
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (user.is_verified) {
            return res.status(400).json({ message: "User already verified" });
        }

        // Generate new 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

        // Update User in DB with new OTP
        await User.updateOTP(user.id, otp, otpExpiry);

        console.log(`🔑 Resent OTP for ${email}: ${otp}`);

        // Send OTP via email
        const message = `Your new verification OTP is: ${otp}. It is valid for 5 minutes.`;

        await sendEmail({
            email: user.email,
            subject: "Resend OTP Verification",
            message,
        });

        res.status(200).json({ message: "A new OTP has been sent to your email." });
    } catch (error) {
        console.error("Resend OTP Error:", error);
        res.status(500).json({ message: "Server error during OTP resend" });
    }
};

// @desc    Auth user & get token (Login)
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Please provide email and password" });
        }

        // Check for user
        const user = await User.findByEmail(email);

        if (!user) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        if (!user.is_verified) {
            return res.status(403).json({ message: "Account not verified. Please verify your OTP first." });
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate token
        const token = generateToken(user.id);

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token,
        });
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Server error during login" });
    }
};

module.exports = {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
};
