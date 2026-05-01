const reportModel = require('../models/reportModel');

const reportController = {

    // GET /api/reports/summary
    getSummary: async (req, res) => {
        try {
            const summary = await reportModel.getSummary();
            res.status(200).json(summary);
        } catch (error) {
            console.error('[REPORT] getSummary error:', error.message);
            res.status(500).json({ message: 'Failed to generate dashboard summary.', error: error.message });
        }
    },

    // GET /api/reports/monthly-revenue
    getMonthlyRevenue: async (req, res) => {
        try {
            const data = await reportModel.getMonthlyRevenue();
            res.status(200).json(data);
        } catch (error) {
            console.error('[REPORT] getMonthlyRevenue error:', error.message);
            res.status(500).json({ message: 'Failed to generate monthly revenue report.', error: error.message });
        }
    },

    // GET /api/reports/top-products?limit=10
    getTopProducts: async (req, res) => {
        try {
            const limit = Math.min(parseInt(req.query.limit) || 10, 50); // Cap at 50
            if (isNaN(limit) || limit < 1) {
                return res.status(400).json({ message: 'Invalid limit query parameter.' });
            }
            const data = await reportModel.getTopProducts(limit);
            res.status(200).json(data);
        } catch (error) {
            console.error('[REPORT] getTopProducts error:', error.message);
            res.status(500).json({ message: 'Failed to generate top products report.', error: error.message });
        }
    },

    // GET /api/reports/gst
    getGSTReport: async (req, res) => {
        try {
            const data = await reportModel.getGSTReport();
            res.status(200).json(data);
        } catch (error) {
            console.error('[REPORT] getGSTReport error:', error.message);
            res.status(500).json({ message: 'Failed to generate GST report.', error: error.message });
        }
    },

    // GET /api/reports/inventory
    getInventoryReport: async (req, res) => {
        try {
            const data = await reportModel.getInventoryReport();
            res.status(200).json(data);
        } catch (error) {
            console.error('[REPORT] getInventoryReport error:', error.message);
            res.status(500).json({ message: 'Failed to generate inventory report.', error: error.message });
        }
    },

    // GET /api/reports/order-status
    getOrderStatusBreakdown: async (req, res) => {
        try {
            const data = await reportModel.getOrderStatusBreakdown();
            res.status(200).json(data);
        } catch (error) {
            console.error('[REPORT] getOrderStatusBreakdown error:', error.message);
            res.status(500).json({ message: 'Failed to generate order status breakdown.', error: error.message });
        }
    },
};

module.exports = reportController;
