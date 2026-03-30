const express = require('express');
const router = express.Router();
const { getAdminStats, getCustomerStats } = require('../controllers/dashboardController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/admin', protect, authorizeRoles('admin'), getAdminStats);
router.get('/customer', protect, getCustomerStats);

module.exports = router;
