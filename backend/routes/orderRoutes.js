const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Execute Order structurally validating inventory natively (Customers solely)
router.post('/', protect, checkRole('customer'), orderController.createOrder);

// Fetch Matrices spanning globally dynamically assessing user contexts securely
router.get('/', protect, orderController.getAllOrders);

// Trace explicit Parent bounds dynamically verifying ID matches cleanly
router.get('/:id', protect, orderController.getOrderById);

// Update explicit Status mapping (pending, completed, cancelled) scaling natively
router.put('/:id', protect, checkRole('owner', 'employee'), orderController.updateOrderStatus);

module.exports = router;
