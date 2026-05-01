const pool = require('../config/database');

const orderModel = {
    // Execute a strict transaction generating orders dynamically whilst validating internal stock arrays natively and instantly generating Billing INVOICES!
    createOrder: async (customer_id, items) => {
        const connection = await pool.getConnection();

        try {
            await connection.beginTransaction();

            let total_taxable_amount = 0;
            const validItems = [];

            // 1. Process explicit array mapping over items bounds validating natively
            for (const item of items) {
                const { variant_id, quantity } = item;

                if (!variant_id || quantity <= 0) {
                    throw new Error("Mathematical mapping dictates positive integers per explicit item metrics.");
                }

                // Verify the Product bounds and Native Price cleanly
                const [vRows] = await connection.query(
                    `SELECT v.price, i.quantity_available 
                     FROM product_variants v 
                     LEFT JOIN inventory i ON v.id = i.variant_id 
                     WHERE v.id = ? FOR UPDATE`,
                    [variant_id]
                );

                if (vRows.length === 0) {
                    throw new Error(`Variant mapping [ID: ${variant_id}] inherently unfound entirely.`);
                }

                const varStruct = vRows[0];
                const available = Number(varStruct.quantity_available) || 0;

                if (available < quantity) {
                    throw new Error(`Inventory mathematically breached bounds resolving Variant ID [${variant_id}].`);
                }

                const price = Number(varStruct.price);
                const subtotal = price * quantity;
                
                total_taxable_amount += subtotal;
                
                validItems.push({ variant_id, quantity, price, subtotal });
            }

            // 2. GST Logic Calculation strictly mapping generic limits securely!
            const cgst = total_taxable_amount * 0.09;
            const sgst = total_taxable_amount * 0.09;
            const total_tax = cgst + sgst;
            const final_amount = total_taxable_amount + total_tax;

            // 3. Construct implicit Parent Order Object inherently first to acquire explicit tracking Node
            const [orderRes] = await connection.query(
                `INSERT INTO orders (customer_id, total_amount, status) VALUES (?, ?, 'pending')`,
                [customer_id, final_amount]
            );

            const order_id = orderRes.insertId;

            // 4. Systematically lock bounds deducting variants & generating Sub-Items securely mapping reference logs inherently
            for (const vItem of validItems) {
                // Generate core Order Item Sub-Nodes including Subtotal
                await connection.query(
                    `INSERT INTO order_items (order_id, variant_id, quantity, price, subtotal) VALUES (?, ?, ?, ?, ?)`,
                    [order_id, vItem.variant_id, vItem.quantity, vItem.price, vItem.subtotal]
                );

                // Deduct actively held explicit Inventory
                await connection.query(
                    `UPDATE inventory SET quantity_available = quantity_available - ? WHERE variant_id = ?`,
                    [vItem.quantity, vItem.variant_id]
                );

                // Systematically log explicitly securely referencing mapped Order ID generically natively seamlessly
                await connection.query(
                    `INSERT INTO inventory_logs (variant_id, change_type, quantity, reference_type, reference_id) VALUES (?, 'OUT', ?, 'ORDER', ?)`,
                    [vItem.variant_id, vItem.quantity, order_id]
                );
            }

            // 5. Instantly map atomic Invoice explicitly structurally correctly securely!
            await connection.query(
                `INSERT INTO invoices (order_id, taxable_amount, cgst, sgst, total_tax, final_amount) VALUES (?, ?, ?, ?, ?, ?)`,
                [order_id, total_taxable_amount, cgst, sgst, total_tax, final_amount]
            );

            await connection.commit();
            
            return {
                order_id,
                total_amount: final_amount,
                status: 'pending'
            };

        } catch (error) {
            await connection.rollback();
            throw error; // Explicit bounds catch controller inherently
        } finally {
            connection.release();
        }
    },

    getAllOrders: async (customer_id = null) => {
        // Single aggregated query — avoids N+1 (one query per order) performance issue
        let query = `
            SELECT
                o.id, o.total_amount, o.status, o.created_at,
                u.name  AS customer_name,
                u.email AS customer_email,
                COUNT(oi.id) AS item_count
            FROM orders o
            JOIN users u ON o.customer_id = u.id
            LEFT JOIN order_items oi ON oi.order_id = o.id
        `;
        const params = [];

        if (customer_id) {
            query += ` WHERE o.customer_id = ?`;
            params.push(customer_id);
        }

        query += ` GROUP BY o.id, o.total_amount, o.status, o.created_at, u.name, u.email`;
        query += ` ORDER BY o.created_at DESC`;

        const [rows] = await pool.query(query, params);
        return rows;
    },

    getOrderDetails: async (order_id) => {
        // Retrieve internal Order Meta implicitly
        const [oRows] = await pool.query(`
            SELECT o.*, u.name as customer_name, u.email as customer_email
            FROM orders o JOIN users u ON o.customer_id = u.id 
            WHERE o.id = ?`, 
        [order_id]);

        if (oRows.length === 0) return null;

        const order = oRows[0];

        // Process explicit mappings pulling complex Array structures building Children objects cleanly
        const [iRows] = await pool.query(`
            SELECT oi.id as item_id, oi.quantity, oi.price, oi.subtotal, v.size, v.unit, p.name as product_name, p.category
            FROM order_items oi
            JOIN product_variants v ON oi.variant_id = v.id
            JOIN products p ON v.product_id = p.id
            WHERE oi.order_id = ?
        `, [order_id]);

        order.items = iRows;

        // Auto-extract explicitly mapped atomic Invoices natively reliably confidently accurately naturally cleanly
        const [invRows] = await pool.query(`SELECT * FROM invoices WHERE order_id = ?`, [order_id]);
        order.invoice = invRows.length > 0 ? invRows[0] : null;

        return order;
    },

    updateOrderStatus: async (order_id, status) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            const [result] = await connection.query(
                `UPDATE orders SET status = ? WHERE id = ?`,
                [status, order_id]
            );

            // BUG 3 FIX: When cancelling, restore deducted inventory stock
            if (status === 'cancelled' && result.affectedRows > 0) {
                const [items] = await connection.query(
                    `SELECT variant_id, quantity FROM order_items WHERE order_id = ?`,
                    [order_id]
                );
                for (const item of items) {
                    await connection.query(
                        `UPDATE inventory SET quantity_available = quantity_available + ? WHERE variant_id = ?`,
                        [item.quantity, item.variant_id]
                    );
                    await connection.query(
                        `INSERT INTO inventory_logs (variant_id, change_type, quantity, reference_type, reference_id)
                         VALUES (?, 'IN', ?, 'CANCELLATION', ?)`,
                        [item.variant_id, item.quantity, order_id]
                    );
                }
            }

            await connection.commit();
            return result.affectedRows > 0;
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    }
};

module.exports = orderModel;
