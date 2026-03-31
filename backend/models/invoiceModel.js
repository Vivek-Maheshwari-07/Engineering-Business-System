const db = require('../config/db');

const createInvoiceTables = async () => {
    const invoiceQuery = `
    CREATE TABLE IF NOT EXISTS invoices (
      id SERIAL PRIMARY KEY,
      invoice_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT,
      customer_name VARCHAR(255) NOT NULL,
      customer_email VARCHAR(255),
      customer_address TEXT,
      customer_gstin VARCHAR(20),
      subtotal DECIMAL(10,2) DEFAULT 0.00,
      gst_rate DECIMAL(5,2) DEFAULT 18.00,
      gst_amount DECIMAL(10,2) DEFAULT 0.00,
      total DECIMAL(10,2) DEFAULT 0.00,
      status VARCHAR(20) DEFAULT 'draft',
      due_date DATE,
      notes TEXT,
      created_by INT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    )`;

    const itemsQuery = `
    CREATE TABLE IF NOT EXISTS invoice_items (
      id SERIAL PRIMARY KEY,
      invoice_id INT NOT NULL,
      description VARCHAR(255) NOT NULL,
      hsn_code VARCHAR(20),
      quantity INT DEFAULT 1,
      unit_price DECIMAL(10,2) DEFAULT 0.00,
      amount DECIMAL(10,2) DEFAULT 0.00,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
    )`;

    try {
        await db.query(invoiceQuery);
        await db.query(itemsQuery);
        // Add hsn_code if missing
        try { await db.query("ALTER TABLE invoice_items ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20) AFTER description"); } catch (e) {}
        console.log('Invoice tables initialized.');
    } catch (error) {
        console.error('Error creating invoice tables:', error.message);
    }
};

const Invoice = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM invoices ORDER BY created_at DESC');
        return rows;
    },
    getByCustomer: async (customerId) => {
        const [rows] = await db.query('SELECT * FROM invoices WHERE customer_id = ? ORDER BY created_at DESC', [customerId]);
        return rows;
    },
    getById: async (id) => {
        const [invoice] = await db.query('SELECT * FROM invoices WHERE id = ?', [id]);
        const [items] = await db.query('SELECT * FROM invoice_items WHERE invoice_id = ?', [id]);
        return { ...invoice[0], items };
    },
    create: async (invoiceData, items, createdBy) => {
        const { invoice_number, customer_id, customer_name, customer_email, customer_address, customer_gstin, subtotal, gst_rate, gst_amount, total, status, due_date, notes } = invoiceData;
        const [result] = await db.query(
            'INSERT INTO invoices (invoice_number, customer_id, customer_name, customer_email, customer_address, customer_gstin, subtotal, gst_rate, gst_amount, total, status, due_date, notes, created_by) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id',
            [invoice_number, customer_id, customer_name, customer_email, customer_address, customer_gstin, subtotal, gst_rate, gst_amount, total, status, due_date, notes, createdBy]
        );
        const invoiceId = result.insertId;
        for (const item of items) {
            await db.query(
                'INSERT INTO invoice_items (invoice_id, description, hsn_code, quantity, unit_price, amount) VALUES (?,?,?,?,?,?)',
                [invoiceId, item.description, item.hsn_code, item.quantity, item.unit_price, item.amount]
            );
        }
        return invoiceId;
    },
    getReportData: async () => {
        const query = `
            SELECT 
                DATE_FORMAT(created_at, '%Y-%m') as month,
                COUNT(*) as invoice_count,
                SUM(total) as revenue,
                SUM(gst_amount) as tax_collected
            FROM invoices 
            WHERE status != 'cancelled'
            GROUP BY month
            ORDER BY month DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },
    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE invoices SET status=? WHERE id=?', [status, id]);
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM invoices WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    getMonthlyRevenue: async () => {
        const [rows] = await db.query(
            'SELECT SUM(total) as revenue FROM invoices WHERE status="paid" AND MONTH(created_at)=MONTH(CURRENT_DATE()) AND YEAR(created_at)=YEAR(CURRENT_DATE())'
        );
        return rows[0].revenue || 0;
    },
    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM invoices');
        return rows[0].total;
    }
};

module.exports = { Invoice, createInvoiceTables };
