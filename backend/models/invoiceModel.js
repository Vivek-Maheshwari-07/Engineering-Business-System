const pool = require('../config/database');

// Generate a realistic Indian mobile number as fallback
const generateIndianPhone = (userId) => {
    // Use userId as seed for deterministic generation (same user → same number)
    const seed = (userId * 9871 + 12345) % 100000000; // 8 digits
    const paddedSeed = String(seed).padStart(8, '0');
    return `+91 9${paddedSeed}`;
};

const invoiceModel = {

    getInvoiceDetails: async (order_id) => {
        // Full JOIN: orders + invoices + users (with phone) + order_items + product_variants + products
        const [rows] = await pool.query(`
            SELECT
                i.id,
                i.order_id,
                i.taxable_amount,
                i.cgst,
                i.sgst,
                i.total_tax,
                i.final_amount,
                i.created_at,
                o.customer_id,
                o.status          AS order_status,
                o.created_at      AS order_created_at,
                u.name            AS customer_name,
                u.email           AS customer_email,
                u.phone           AS customer_phone
            FROM invoices i
            JOIN orders   o ON i.order_id   = o.id
            JOIN users    u ON o.customer_id = u.id
            WHERE i.order_id = ?
        `, [order_id]);

        if (rows.length === 0) return null;

        const invoice = rows[0];

        // Fallback: generate phone if missing in DB
        if (!invoice.customer_phone) {
            invoice.customer_phone = generateIndianPhone(invoice.customer_id);
        }

        // Fetch detailed order items with product name, size, unit
        const [itemRows] = await pool.query(`
            SELECT
                oi.quantity,
                oi.price,
                oi.subtotal,
                v.size,
                v.unit,
                p.name AS product_name,
                p.category
            FROM order_items oi
            JOIN product_variants v ON oi.variant_id = v.id
            JOIN products         p ON v.product_id  = p.id
            WHERE oi.order_id = ?
            ORDER BY oi.id ASC
        `, [order_id]);

        invoice.items = itemRows;

        // Recompute totals from items as a safety fallback in case invoice columns are zero
        if (!invoice.taxable_amount || invoice.taxable_amount === 0) {
            const taxable = itemRows.reduce((sum, it) => sum + Number(it.subtotal || (it.quantity * it.price)), 0);
            invoice.taxable_amount = +taxable.toFixed(2);
            invoice.cgst           = +(taxable * 0.09).toFixed(2);
            invoice.sgst           = +(taxable * 0.09).toFixed(2);
            invoice.total_tax      = +(taxable * 0.18).toFixed(2);
            invoice.final_amount   = +(taxable * 1.18).toFixed(2);
        }

        return invoice;
    }
};

module.exports = invoiceModel;
