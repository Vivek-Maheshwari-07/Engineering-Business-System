const db = require('../config/db');

const getAdminStats = async (req, res) => {
    try {
        const queries = {
            totalEmployees: 'SELECT COUNT(*) as count FROM employees',
            totalInventory: 'SELECT COUNT(*) as count FROM inventory',
            pendingOrders: 'SELECT COUNT(*) as count FROM orders WHERE status = "pending"',
            totalRevenue: 'SELECT SUM(total) as revenue FROM invoices WHERE status = "paid"'
        };

        const results = {};
        for (const [key, sql] of Object.entries(queries)) {
            const [rows] = await db.query(sql);
            results[key] = rows[0].count || rows[0].revenue || 0;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching admin stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

const getCustomerStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const queries = {
            myOrders: 'SELECT COUNT(*) as count FROM orders WHERE user_id = ?',
            approvedOrders: 'SELECT COUNT(*) as count FROM orders WHERE user_id = ? AND status = "approved"',
            totalSpent: 'SELECT SUM(total) as total FROM invoices WHERE user_id = ? AND status = "paid"'
        };

        const results = {};
        for (const [key, sql] of Object.entries(queries)) {
            const [rows] = await db.query(sql, [userId]);
            results[key] = rows[0].count || rows[0].total || 0;
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching customer stats:', error);
        res.status(500).json({ message: 'Server error fetching stats' });
    }
};

module.exports = { getAdminStats, getCustomerStats };
