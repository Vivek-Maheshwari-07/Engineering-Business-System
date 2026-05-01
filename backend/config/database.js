const mysql = require('mysql2/promise');
require('dotenv').config();

const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'engineering_erp',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
};

// Create the pool which routes/controllers will use
const pool = mysql.createPool(dbConfig);

// Auto Database Initialization function
const initializeDatabase = async () => {
    try {
        console.log(`[DB] Attempting MySQL server connection at ${dbConfig.host}...`);
        
        // 1. Connect without the database parameter to allow creation
        const connection = await mysql.createConnection({
            host: dbConfig.host,
            user: dbConfig.user,
            password: dbConfig.password
        });
        
        // 2. Create the Database safely
        console.log(`[DB] Checking if database '${dbConfig.database}' exists...`);
        await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\`;`);
        console.log(`[DB] Database '${dbConfig.database}' verified/created successfully.`);
        
        // 3. Select the database and verify the 'users' table exists 
        // This ensures the backend never crashes asking for a missing table on fresh setups!
        await connection.query(`USE \`${dbConfig.database}\`;`);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role ENUM('owner', 'employee', 'customer') DEFAULT 'customer',
                is_verified BOOLEAN DEFAULT false,
                otp VARCHAR(10),
                otp_expiry DATETIME,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(`[DB] Table schema 'users' verified successfully.`);

        // Append explicit creation of Products Table mapping
        await connection.query(`
            CREATE TABLE IF NOT EXISTS products (
                id INT PRIMARY KEY AUTO_INCREMENT,
                name VARCHAR(255) NOT NULL,
                category VARCHAR(255) NOT NULL,
                gst_percentage FLOAT DEFAULT 0,
                image_url VARCHAR(255),
                status ENUM('active', 'inactive') DEFAULT 'active',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log(`[DB] Table schema 'products' verified successfully.`);

        // Conditionally Append Column if the database historically exists natively
        const [productCols] = await connection.query(`SHOW COLUMNS FROM products LIKE 'status'`);
        if (productCols.length === 0) {
            await connection.query(`ALTER TABLE products ADD COLUMN status ENUM('active', 'inactive') DEFAULT 'active'`);
            console.log(`[DB] Appended 'status' native column successfully.`);
        }

        // Append explicit creation of Variants mapping ON DELETE CASCADE
        await connection.query(`
            CREATE TABLE IF NOT EXISTS product_variants (
                id INT PRIMARY KEY AUTO_INCREMENT,
                product_id INT NOT NULL,
                size VARCHAR(255) NOT NULL,
                quantity FLOAT NOT NULL DEFAULT 0,
                unit VARCHAR(50) NOT NULL,
                price FLOAT NOT NULL DEFAULT 0,
                FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'product_variants' verified successfully.`);

        // Append explicit creation of Inventory mapping
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventory (
                id INT PRIMARY KEY AUTO_INCREMENT,
                variant_id INT NOT NULL UNIQUE,
                quantity_available FLOAT NOT NULL DEFAULT 0,
                last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'inventory' verified successfully.`);

        // Append explicit creation of Inventory Logs
        await connection.query(`
            CREATE TABLE IF NOT EXISTS inventory_logs (
                id INT PRIMARY KEY AUTO_INCREMENT,
                variant_id INT NOT NULL,
                change_type ENUM('IN', 'OUT') NOT NULL,
                quantity FLOAT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'inventory_logs' verified successfully.`);

        // Conditionally Append reference_type and reference_id if historically missing natively
        const [logCols] = await connection.query(`SHOW COLUMNS FROM inventory_logs LIKE 'reference_type'`);
        if (logCols.length === 0) {
            await connection.query(`ALTER TABLE inventory_logs ADD COLUMN reference_type VARCHAR(50) DEFAULT 'MANUAL', ADD COLUMN reference_id INT DEFAULT NULL`);
            console.log(`[DB] Appended 'reference_type' and 'reference_id' columns correctly structurally tracking matrices.`);
        }

        // Append explicit creation of Orders
        await connection.query(`
            CREATE TABLE IF NOT EXISTS orders (
                id INT PRIMARY KEY AUTO_INCREMENT,
                customer_id INT NOT NULL,
                total_amount FLOAT NOT NULL DEFAULT 0,
                status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'orders' verified successfully.`);

        // Expand orders status ENUM to include 'partially_paid' for payment tracking
        await connection.query(`
            ALTER TABLE orders MODIFY COLUMN status 
            ENUM('pending', 'partially_paid', 'completed', 'cancelled') DEFAULT 'pending';
        `);
        console.log(`[DB] 'orders.status' ENUM expanded to include partially_paid.`);

        // Append explicit creation of Order Items
        await connection.query(`
            CREATE TABLE IF NOT EXISTS order_items (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL,
                variant_id INT NOT NULL,
                quantity FLOAT NOT NULL,
                price FLOAT NOT NULL,
                subtotal FLOAT NOT NULL DEFAULT 0,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
                FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'order_items' verified successfully.`);

        // Conditionally Append subtotal if historically missing natively
        const [ordItemCols] = await connection.query(`SHOW COLUMNS FROM order_items LIKE 'subtotal'`);
        if (ordItemCols.length === 0) {
            await connection.query(`ALTER TABLE order_items ADD COLUMN subtotal FLOAT NOT NULL DEFAULT 0`);
            console.log(`[DB] Appended 'subtotal' mappings structurally successfully.`);
        }

        // Append explicit creation of Invoices
        await connection.query(`
            CREATE TABLE IF NOT EXISTS invoices (
                id INT PRIMARY KEY AUTO_INCREMENT,
                order_id INT NOT NULL UNIQUE,
                taxable_amount FLOAT NOT NULL DEFAULT 0,
                cgst FLOAT NOT NULL DEFAULT 0,
                sgst FLOAT NOT NULL DEFAULT 0,
                total_tax FLOAT NOT NULL DEFAULT 0,
                final_amount FLOAT NOT NULL DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
            );
        `);
        console.log(`[DB] Table schema 'invoices' verified successfully.`);

        // Conditionally Alter Invoices schema explicitly replacing gst_total mappings generically efficiently smoothly strictly gracefully appropriately reliably realistically smartly intuitively seamlessly cleanly natively realistically proficiently
        const [invCols] = await connection.query(`SHOW COLUMNS FROM invoices LIKE 'gst_total'`);
        if (invCols.length > 0) {
            await connection.query(`
                ALTER TABLE invoices 
                DROP COLUMN gst_total, 
                ADD COLUMN taxable_amount FLOAT NOT NULL DEFAULT 0 AFTER order_id, 
                ADD COLUMN cgst FLOAT NOT NULL DEFAULT 0 AFTER taxable_amount, 
                ADD COLUMN sgst FLOAT NOT NULL DEFAULT 0 AFTER cgst, 
                ADD COLUMN total_tax FLOAT NOT NULL DEFAULT 0 AFTER sgst
            `);
            console.log(`[DB] Extracted explicit legacy Invoice definitions resolving explicit mathematical taxes smoothly.`);
        }

        await connection.end();

        // ── NEW MODULE TABLES ─────────────────────────────────────────────────

        // Use a fresh direct connection for new tables (pool is now available)
        const c2 = await pool.getConnection();
        try {
            // Payments table — supports partial payments per order
            await c2.query(`
                CREATE TABLE IF NOT EXISTS payments (
                    id             INT PRIMARY KEY AUTO_INCREMENT,
                    order_id       INT NOT NULL,
                    amount_paid    DECIMAL(12,2) NOT NULL,
                    payment_method ENUM('cash','upi','bank_transfer','cheque','card') NOT NULL DEFAULT 'cash',
                    payment_date   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
                );
            `);
            console.log(`[DB] Table schema 'payments' verified successfully.`);

            // Employee profiles — links a user to their salary configuration
            await c2.query(`
                CREATE TABLE IF NOT EXISTS employee_profiles (
                    id          INT PRIMARY KEY AUTO_INCREMENT,
                    user_id     INT NOT NULL UNIQUE,
                    base_salary DECIMAL(12,2) NOT NULL DEFAULT 0,
                    join_date   DATE,
                    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);
            console.log(`[DB] Table schema 'employee_profiles' verified successfully.`);

            // Salary records — one row per employee per month
            await c2.query(`
                CREATE TABLE IF NOT EXISTS salary_records (
                    id           INT PRIMARY KEY AUTO_INCREMENT,
                    employee_id  INT NOT NULL,
                    month        TINYINT NOT NULL,
                    year         SMALLINT NOT NULL,
                    base_salary  DECIMAL(12,2) NOT NULL,
                    deductions   DECIMAL(12,2) NOT NULL DEFAULT 0,
                    net_salary   DECIMAL(12,2) NOT NULL,
                    notes        TEXT,
                    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                    UNIQUE KEY uq_employee_month_year (employee_id, month, year),
                    FOREIGN KEY (employee_id) REFERENCES users(id) ON DELETE CASCADE
                );
            `);
            console.log(`[DB] Table schema 'salary_records' verified successfully.`);
        } finally {
            c2.release();
        }

        // 4. Test internal pool connection stability
        const poolConnection = await pool.getConnection();
        console.log(`[DB SUCCESS] MySQL Connected to '${dbConfig.database}' pool successfully.`);
        poolConnection.release();

    } catch (error) {
        // Logs the exact error string clearly but purposefully does NOT throw it,
        // allowing the Express server to continue running gracefully!
        console.error(`[DB ERROR] MySQL initialization failed:`, error.message);
    }
};

// Execute initialization logic on startup
initializeDatabase();

module.exports = pool;
