const db = require('../config/db');

const createInventoryTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS inventory (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      category VARCHAR(100),
      sku VARCHAR(100) UNIQUE,
      hsn_code VARCHAR(20),
      quantity INT DEFAULT 0,
      unit VARCHAR(50) DEFAULT 'pcs',
      price DECIMAL(10,2) DEFAULT 0.00,
      min_stock INT DEFAULT 5,
      supplier VARCHAR(255),
      description TEXT,
      status ENUM('in_stock', 'low_stock', 'out_of_stock') DEFAULT 'in_stock',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`;
    try {
        await db.query(query);
        // Check if hsn_code column exists, add it if not (for existing tables)
        try {
            await db.query("ALTER TABLE inventory ADD COLUMN IF NOT EXISTS hsn_code VARCHAR(20) AFTER sku");
        } catch (e) { /* Column might already exist */ }
        console.log('Inventory table initialized.');
    } catch (error) {
        console.error('Error creating inventory table:', error.message);
    }
};

const Inventory = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM inventory ORDER BY created_at DESC');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM inventory WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description } = data;
        const status = quantity <= 0 ? 'out_of_stock' : quantity <= min_stock ? 'low_stock' : 'in_stock';
        const [result] = await db.query(
            'INSERT INTO inventory (name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description, status]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description } = data;
        const status = quantity <= 0 ? 'out_of_stock' : quantity <= min_stock ? 'low_stock' : 'in_stock';
        const [result] = await db.query(
            'UPDATE inventory SET name=?, category=?, sku=?, hsn_code=?, quantity=?, unit=?, price=?, min_stock=?, supplier=?, description=?, status=? WHERE id=?',
            [name, category, sku, hsn_code, quantity, unit, price, min_stock, supplier, description, status, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM inventory WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    getLowStock: async () => {
        const [rows] = await db.query('SELECT * FROM inventory WHERE status != "in_stock"');
        return rows;
    },
    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM inventory');
        return rows[0].total;
    }
};

module.exports = { Inventory, createInventoryTable };
