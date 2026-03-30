const express = require('express');
const router = express.Router();
const { getAllInvoices, getMyInvoices, getInvoiceById, createInvoice, updateInvoiceStatus, deleteInvoice, getRevenueReport } = require('../controllers/invoiceController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/report', protect, authorizeRoles('admin'), getRevenueReport);
router.get('/', protect, authorizeRoles('admin'), getAllInvoices);
router.get('/my', protect, getMyInvoices);
router.get('/:id', protect, getInvoiceById);
router.post('/', protect, authorizeRoles('admin'), createInvoice);
router.patch('/:id/status', protect, authorizeRoles('admin'), updateInvoiceStatus);
router.delete('/:id', protect, authorizeRoles('admin'), deleteInvoice);

module.exports = router;
