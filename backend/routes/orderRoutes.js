const express = require('express');
const router = express.Router();
const { getAllOrders, getMyOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder } = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('admin'), getAllOrders);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrderById);
router.post('/', protect, createOrder);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateOrderStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteOrder);

module.exports = router;
