const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// All report routes require authentication + Owner or Employee role only
const reportAccess = [protect, checkRole('owner', 'employee')];

// GET /api/reports/summary          → Dashboard KPI cards
router.get('/summary', ...reportAccess, reportController.getSummary);

// GET /api/reports/monthly-revenue  → Revenue grouped by month (current year)
router.get('/monthly-revenue', ...reportAccess, reportController.getMonthlyRevenue);

// GET /api/reports/top-products     → Top products by total quantity sold
// Optional query: ?limit=10 (default 10, max 50)
router.get('/top-products', ...reportAccess, reportController.getTopProducts);

// GET /api/reports/gst              → Aggregated GST totals from all invoices
router.get('/gst', ...reportAccess, reportController.getGSTReport);

// GET /api/reports/inventory        → All variants with stock level + status flag
router.get('/inventory', ...reportAccess, reportController.getInventoryReport);

// GET /api/reports/order-status     → Order count and value per status
router.get('/order-status', ...reportAccess, reportController.getOrderStatusBreakdown);

module.exports = router;
