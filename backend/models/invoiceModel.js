const pool = require('../config/database');

const invoiceModel = {

    getInvoiceDetails: async (order_id) => {
        const [rows] = await pool.query(`
            SELECT i.*, o.customer_id, o.status as order_status, u.name as customer_name, u.email as customer_email
            FROM invoices i
            JOIN orders o ON i.order_id = o.id
            JOIN users u ON o.customer_id = u.id
            WHERE i.order_id = ?
        `, [order_id]);

        if (rows.length === 0) return null;

        const invoice = rows[0];

        // Fetch detailed Item bounds spanning dynamically across Order Items calculating explicit Invoice structure mapped seamlessly intuitively safely cleanly correctly
        const [itemRows] = await pool.query(`
            SELECT oi.quantity, oi.price, oi.subtotal, v.size, v.unit, p.name as product_name
            FROM order_items oi
            JOIN product_variants v ON oi.variant_id = v.id
            JOIN products p ON v.product_id = p.id
            WHERE oi.order_id = ?
        `, [order_id]);

        invoice.items = itemRows;
        return invoice;
    }
};

module.exports = invoiceModel;
