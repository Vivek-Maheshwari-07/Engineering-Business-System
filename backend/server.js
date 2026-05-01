// Ensure dotenv is properly configured at the absolute top
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');


// Note: requiring the routes effectively requires database.js, 
// which triggers the new initialization logic automatically!

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const productRoutes = require('./routes/productRoutes');
const inventoryRoutes = require('./routes/inventoryRoutes');
const orderRoutes = require('./routes/orderRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const reportRoutes = require('./routes/reportRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const salaryRoutes  = require('./routes/salaryRoutes');


const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json()); // Parses incoming JSON
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets Native Configs
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Route Configurations

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/invoice', invoiceRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/salary',   salaryRoutes);


// Base route for health checking
app.get('/', (req, res) => {
    res.send('Engineering ERP Backend is heavily running');
});

// Set Port and start Express
// This will bind and start even if MySQL fails locally, ensuring server stability
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`[SERVER SUCCESS] Server is gracefully running on port ${PORT}`);
});
