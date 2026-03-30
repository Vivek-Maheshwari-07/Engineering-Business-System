// 1️⃣ Import dependencies
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const employeeRoutes = require("./routes/employeeRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const invoiceRoutes = require("./routes/invoiceRoutes");
const orderRoutes = require("./routes/orderRoutes");
const { createUsersTable } = require("./models/userModel");
const { createEmployeesTable } = require("./models/employeeModel");
const { createInventoryTable } = require("./models/inventoryModel");
const { createInvoiceTables } = require("./models/invoiceModel");
const { createOrdersTable } = require("./models/orderModel");

// Load env vars
dotenv.config();

// Initialize DB tables
const initDB = async () => {
    await createUsersTable();
    await createEmployeesTable();
    await createInventoryTable();
    await createInvoiceTables();
    await createOrdersTable();
};
initDB();

// 2️⃣ Create express app
const app = express();

// Middleware: Enable CORS for the React frontend
app.use(cors({
    origin: function (origin, callback) {
        callback(null, true);
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'ngrok-skip-browser-warning'],
}));

// Middleware: parse JSON bodies
app.use(express.json());

// 3️⃣ Define PORT
const PORT = process.env.PORT || 5000;

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/employees", employeeRoutes);
app.use("/api/inventory", inventoryRoutes);
app.use("/api/invoices", invoiceRoutes);
app.use("/api/orders", orderRoutes);

// 4️⃣ Basic test route
app.get("/", (req, res) => {
  res.send("Server running successfully 🚀");
});

// 5️⃣ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});