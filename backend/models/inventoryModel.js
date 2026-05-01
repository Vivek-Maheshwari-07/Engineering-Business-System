const pool = require('../config/database');

const inventoryModel = {
    // Advanced transactional logging structure ensuring quantity bounds natively
    updateStock: async (variant_id, quantity, change_type, reference_type = 'MANUAL', reference_id = null) => {
        const connection = await pool.getConnection();
        
        try {
            await connection.beginTransaction();

            // 1. Log the explicit mapping explicitly linking Order Reference IDs logically
            await connection.query(
                `INSERT INTO inventory_logs (variant_id, change_type, quantity, reference_type, reference_id) VALUES (?, ?, ?, ?, ?)`,
                [variant_id, change_type, quantity, reference_type, reference_id]
            );

            // 2. Adjust mapping scaling directly
            if (change_type === 'IN') {
                await connection.query(
                    `INSERT INTO inventory (variant_id, quantity_available) VALUES (?, ?) 
                     ON DUPLICATE KEY UPDATE quantity_available = quantity_available + ?`,
                    [variant_id, quantity, quantity]
                );
            } else if (change_type === 'OUT') {
                // Determine raw current value mapping first ensuring no negative overflows
                const [rows] = await connection.query(
                    `SELECT quantity_available FROM inventory WHERE variant_id = ? FOR UPDATE`,
                    [variant_id]
                );

                if (rows.length === 0 || rows[0].quantity_available < quantity) {
                    throw new Error("Insufficient stock structurally mapped for this variant");
                }

                await connection.query(
                    `UPDATE inventory SET quantity_available = quantity_available - ? WHERE variant_id = ?`,
                    [quantity, variant_id]
                );
            }

            await connection.commit();
            return { success: true };

        } catch (error) {
            await connection.rollback();
            throw error;
        } finally {
            connection.release();
        }
    },

    getAllInventory: async () => {
        const [rows] = await pool.query(`
            SELECT 
                i.id as inventory_id,
                i.quantity_available,
                i.last_updated,
                v.id as variant_id,
                v.size,
                v.unit,
                p.name as product_name,
                p.category
            FROM product_variants v
            LEFT JOIN inventory i ON v.id = i.variant_id
            JOIN products p ON v.product_id = p.id
            ORDER BY p.name ASC
        `);
        return rows;
    },

    getInventoryLogs: async () => {
        const [rows] = await pool.query(`
            SELECT 
                il.id as log_id,
                il.change_type,
                il.quantity,
                il.reference_type,
                il.reference_id,
                il.created_at,
                v.size,
                v.unit,
                p.name as product_name
            FROM inventory_logs il
            JOIN product_variants v ON il.variant_id = v.id
            JOIN products p ON v.product_id = p.id
            ORDER BY il.created_at DESC
        `);
        return rows;
    }
};

module.exports = inventoryModel;
