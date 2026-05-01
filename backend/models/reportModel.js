const pool = require('../config/database');

const reportModel = {

    // ── 1. Dashboard Summary ────────────────────────────────────────────────
    getSummary: async () => {
        const LOW_STOCK_THRESHOLD = 10;

        const [[{ totalOrders }]] = await pool.query(
            `SELECT COUNT(*) AS totalOrders FROM orders`
        );

        const [[{ totalRevenue }]] = await pool.query(
            `SELECT COALESCE(SUM(final_amount), 0) AS totalRevenue FROM invoices`
        );

        const [[{ totalProducts }]] = await pool.query(
            `SELECT COUNT(*) AS totalProducts FROM products WHERE status = 'active'`
        );

        const [[{ lowStockItems }]] = await pool.query(
            `SELECT COUNT(*) AS lowStockItems FROM inventory WHERE quantity_available < ?`,
            [LOW_STOCK_THRESHOLD]
        );

        return {
            totalOrders:   Number(totalOrders),
            totalRevenue:  Number(totalRevenue),
            totalProducts: Number(totalProducts),
            lowStockItems: Number(lowStockItems),
        };
    },

    // ── 2. Monthly Revenue (current year) ───────────────────────────────────
    getMonthlyRevenue: async () => {
        const [rows] = await pool.query(`
            SELECT
                DATE_FORMAT(i.created_at, '%b') AS month,
                MONTH(i.created_at)              AS month_num,
                YEAR(i.created_at)               AS year,
                COALESCE(SUM(i.final_amount), 0) AS revenue
            FROM invoices i
            WHERE YEAR(i.created_at) = YEAR(CURDATE())
            GROUP BY YEAR(i.created_at), MONTH(i.created_at), DATE_FORMAT(i.created_at, '%b')
            ORDER BY YEAR(i.created_at), MONTH(i.created_at) ASC
        `);

        return rows.map(r => ({
            month:   r.month,
            revenue: Number(r.revenue),
        }));
    },

    // ── 3. Top Selling Products (by total quantity sold) ─────────────────────
    getTopProducts: async (limit = 10) => {
        const [rows] = await pool.query(`
            SELECT
                p.name                           AS product_name,
                p.category,
                COALESCE(SUM(oi.quantity), 0)    AS total_sold,
                COALESCE(SUM(oi.subtotal), 0)    AS total_revenue
            FROM order_items oi
            JOIN product_variants pv ON oi.variant_id = pv.id
            JOIN products p          ON pv.product_id  = p.id
            GROUP BY p.id, p.name, p.category
            ORDER BY total_sold DESC
            LIMIT ?
        `, [limit]);

        return rows.map(r => ({
            product_name:   r.product_name,
            category:       r.category,
            total_sold:     Number(r.total_sold),
            total_revenue:  Number(r.total_revenue),
        }));
    },

    // ── 4. GST Report (aggregate totals from invoices) ───────────────────────
    getGSTReport: async () => {
        const [[row]] = await pool.query(`
            SELECT
                COALESCE(SUM(taxable_amount), 0) AS total_taxable,
                COALESCE(SUM(cgst),           0) AS total_cgst,
                COALESCE(SUM(sgst),           0) AS total_sgst,
                COALESCE(SUM(total_tax),      0) AS total_tax,
                COALESCE(SUM(final_amount),   0) AS total_final
            FROM invoices
        `);

        return {
            total_taxable: Number(row.total_taxable),
            total_cgst:    Number(row.total_cgst),
            total_sgst:    Number(row.total_sgst),
            total_tax:     Number(row.total_tax),
            total_final:   Number(row.total_final),
        };
    },

    // ── 5. Inventory Report ──────────────────────────────────────────────────
    getInventoryReport: async () => {
        const LOW_STOCK_THRESHOLD = 10;

        const [rows] = await pool.query(`
            SELECT
                p.name                          AS product_name,
                p.category,
                pv.size,
                pv.unit,
                pv.price,
                COALESCE(i.quantity_available, 0) AS stock,
                CASE
                    WHEN COALESCE(i.quantity_available, 0) = 0     THEN 'out_of_stock'
                    WHEN COALESCE(i.quantity_available, 0) < ?      THEN 'low'
                    ELSE 'ok'
                END AS stock_status
            FROM product_variants pv
            JOIN products p         ON pv.product_id = p.id
            LEFT JOIN inventory i   ON pv.id = i.variant_id
            WHERE p.status = 'active'
            ORDER BY stock ASC, p.name ASC
        `, [LOW_STOCK_THRESHOLD]);

        return rows.map(r => ({
            product_name:  r.product_name,
            category:      r.category,
            size:          r.size,
            unit:          r.unit,
            price:         Number(r.price),
            stock:         Number(r.stock),
            stock_status:  r.stock_status,
        }));
    },

    // ── 6. Order Status Breakdown ────────────────────────────────────────────
    getOrderStatusBreakdown: async () => {
        const [rows] = await pool.query(`
            SELECT
                status,
                COUNT(*)              AS count,
                COALESCE(SUM(total_amount), 0) AS total_value
            FROM orders
            GROUP BY status
        `);

        return rows.map(r => ({
            status:      r.status,
            count:       Number(r.count),
            total_value: Number(r.total_value),
        }));
    },
};

module.exports = reportModel;
