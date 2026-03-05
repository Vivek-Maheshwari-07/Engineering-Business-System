// 1️⃣ Import dependencies
const express = require("express");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const { createUsersTable } = require("./models/userModel");

// Load env vars
dotenv.config();

// Initialize DB tables
createUsersTable();

// 2️⃣ Create express app
const app = express();

// Middleware: parse JSON bodies
app.use(express.json());

// 3️⃣ Define PORT
const PORT = process.env.PORT || 5000;

// API Routes
app.use("/api/auth", authRoutes);

// 4️⃣ Basic test route
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// 5️⃣ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});