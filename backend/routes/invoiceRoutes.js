const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { protect } = require('../middleware/authMiddleware');

// Trace explicit invoice bounds globally viewing metrics safely mapping explicitly via target Order parent node dynamically gracefully intelligently seamlessly!
router.get('/:order_id', protect, invoiceController.getInvoice);

module.exports = router;
