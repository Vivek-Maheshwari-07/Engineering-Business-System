const express = require("express");
const router = express.Router();
const {
    registerUser,
    verifyOTP,
    resendOTP,
    loginUser,
} = require("../controllers/authController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

// Public routes for Authentication
router.post("/register", registerUser);
router.post("/verify-otp", verifyOTP);
router.post("/resend-otp", resendOTP);
router.post("/login", loginUser);

// Protected route to get user profile
router.get("/me", protect, (req, res) => {
    res.status(200).json(req.user);
});

// Protected route for Owners only
router.get("/owner-dashboard", protect, authorizeRoles("owner"), (req, res) => {
    res.status(200).json({ message: `Access granted for owner: ${req.user.name}` });
});

module.exports = router;
