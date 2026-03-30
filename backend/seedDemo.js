const mysql = require('mysql2/promise');
require('dotenv').config({ path: './backend/.env' });

async function seed() {
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME
    });

    try {
        console.log('🌱 Seeding database for demo...');

        // 1. Seed Employees
        const employees = [
            ['Deep Patel', 'Admin', 'Design', '9876543210', 'Active'],
            ['Sanjay Shah', 'Manager', 'Production', '9876543211', 'Active'],
            ['Meera Iyer', 'Executive', 'Sales', '9876543212', 'Active'],
            ['Rahul Verma', 'Operator', 'Manufacturing', '9876543213', 'On Leave'],
            ['Ananya Rao', 'Technician', 'Quality', '9876543214', 'Active']
        ];
        
        // Clear old demo employees if needed
        await connection.query('DELETE FROM employees WHERE status = "Active" OR status = "On Leave"');
        
        for (const emp of employees) {
            await connection.query(
                'INSERT INTO employees (name, role, department, phone, status) VALUES (?, ?, ?, ?, ?)',
                emp
            );
        }

        // 2. Seed Invoices (one paid, one sent)
        const invoices = [
            ['INV-2026-001', 'Infini Mould Tech LLP', 15500, 2790, 18290, 'paid', '2026-03-01'],
            ['INV-2026-002', 'Precision Engineering Co.', 45000, 8100, 53100, 'sent', '2026-03-15'],
            ['INV-2026-003', 'Apex Tooling Systems', 12000, 2160, 14160, 'paid', '2026-03-20']
        ];
        
        await connection.query('DELETE FROM invoices WHERE invoice_number LIKE "INV-2026-%"');
        
        for (const inv of invoices) {
            await connection.query(
                'INSERT INTO invoices (invoice_number, customer_name, subtotal, gst_amount, total, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
                inv
            );
        }

        console.log('✅ Demo data seeded successfully!');

    } catch (err) {
        console.error('❌ Seeding failed:', err.message);
    } finally {
        await connection.end();
        process.exit();
    }
}

seed();
