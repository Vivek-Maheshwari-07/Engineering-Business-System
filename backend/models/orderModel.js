const db = require('../config/db');

// Function to create orders tables if they don't exist
const createOrdersTable = async () => {
    const ordersTableQuery = `
    CREATE TABLE IF NOT EXISTS orders (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_number VARCHAR(50) UNIQUE NOT NULL,
      customer_id INT,
      subtotal DECIMAL(10,2) NOT NULL,
      status ENUM('pending', 'approved', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
      notes TEXT,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES users(id) ON DELETE SET NULL
    )
  `;

    const orderItemsTableQuery = `
    CREATE TABLE IF NOT EXISTS order_items (
      id INT AUTO_INCREMENT PRIMARY KEY,
      order_id INT,
      inventory_id INT,
      quantity INT NOT NULL,
      price DECIMAL(10,2) NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
      FOREIGN KEY (inventory_id) REFERENCES inventory(id) ON DELETE SET NULL
    )
  `;

    try {
        await db.query(ordersTableQuery);
        await db.query(orderItemsTableQuery);
        console.log('Orders & Order Items tables initialized.');
    } catch (error) {
        console.error('Error creating orders tables:', error.message);
    }
};

const Order = {
    // Get all orders (Admin)
    getAll: async () => {
        const query = `
            SELECT o.*, u.name as customer_name, u.email as customer_email 
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            ORDER BY o.created_at DESC
        `;
        const [rows] = await db.query(query);
        return rows;
    },

    // Get orders for a specific customer
    getByCustomer: async (customerId) => {
        const query = `SELECT * FROM orders WHERE customer_id = ? ORDER BY created_at DESC`;
        const [rows] = await db.query(query, [customerId]);
        return rows;
    },

    // Get single order with items
    getById: async (id) => {
        const [order] = await db.query('SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.customer_id = u.id WHERE o.id = ?', [id]);
        if (order.length === 0) return null;
        const [items] = await db.query('SELECT oi.*, i.name as product_name FROM order_items oi JOIN inventory i ON oi.inventory_id = i.id WHERE oi.order_id = ?', [id]);
        return { ...order[0], items };
    },

    // Create a new order
    create: async (orderData, items, customerId) => {
        const { order_number, subtotal, notes } = orderData;
        const [result] = await db.query(
            'INSERT INTO orders (order_number, customer_id, subtotal, status, notes) VALUES (?, ?, ?, ?, ?)',
            [order_number, customerId, subtotal, 'pending', notes]
        );
        const orderId = result.insertId;

        for (const item of items) {
            const amount = item.quantity * item.price;
            await db.query(
                'INSERT INTO order_items (order_id, inventory_id, quantity, price, amount) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.id, item.quantity, item.price, amount]
            );
        }
        return orderId;
    },

    // Update order status
    updateStatus: async (id, status) => {
        const [result] = await db.query('UPDATE orders SET status = ? WHERE id = ?', [status, id]);
        return result.affectedRows > 0;
    },

    // Delete order
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM orders WHERE id = ?', [id]);
        return result.affectedRows > 0;
    }
};

module.exports = { Order, createOrdersTable };
