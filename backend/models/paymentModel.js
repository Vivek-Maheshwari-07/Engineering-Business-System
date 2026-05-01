const pool = require('../config/database');

// ── Helpers ───────────────────────────────────────────────────────────────────

// Recalculates how much has been paid on an order and updates its status.
// This is called after every payment insert so status is always accurate.
const syncOrderPaymentStatus = async (connection, order_id) => {
    // 1. Get the invoice's final_amount (the source of truth for what is owed)
    const [[inv]] = await connection.query(
        `SELECT final_amount FROM invoices WHERE order_id = ?`, [order_id]
    );
    if (!inv) throw new Error('Invoice not found for this order.');

    const finalAmount = Number(inv.final_amount);

    // 2. Sum all payments made so far
    const [[{ total_paid }]] = await connection.query(
        `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM payments WHERE order_id = ?`,
        [order_id]
    );
    const paid      = Number(total_paid);
    const remaining = Math.max(0, finalAmount - paid);

    // 3. Derive order status from payment ratio
    let newStatus = 'pending';
    if (paid >= finalAmount) {
        newStatus = 'completed';
    } else if (paid > 0) {
        newStatus = 'partially_paid';
    }

    // 4. Persist the new order status
    await connection.query(
        `UPDATE orders SET status = ? WHERE id = ?`, [newStatus, order_id]
    );

    return { total_paid: paid, remaining_amount: remaining, status: newStatus };
};

const paymentModel = {
    // ── Add a payment (partial or full) ────────────────────────────────────
    addPayment: async (order_id, amount_paid, payment_method) => {
        const connection = await pool.getConnection();
        try {
            await connection.beginTransaction();

            // Guard: order must exist
            const [[order]] = await connection.query(
                `SELECT id, status FROM orders WHERE id = ? FOR UPDATE`, [order_id]
            );
            if (!order) throw new Error('Order not found.');
            if (order.status === 'cancelled') throw new Error('Cannot record payment for a cancelled order.');
            if (order.status === 'completed') throw new Error('This order is already fully paid.');

            // Guard: amount must be positive and not exceed remaining balance
            const [[inv]] = await connection.query(
                `SELECT final_amount FROM invoices WHERE order_id = ?`, [order_id]
            );
            if (!inv) throw new Error('Invoice not found for this order.');

            const [[{ total_paid: alreadyPaid }]] = await connection.query(
                `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM payments WHERE order_id = ?`,
                [order_id]
            );
            const remaining = Number(inv.final_amount) - Number(alreadyPaid);
            if (amount_paid <= 0) throw new Error('Payment amount must be greater than zero.');
            if (amount_paid > remaining + 0.01) { // 0.01 tolerance for float rounding
                throw new Error(`Payment amount (₹${amount_paid}) exceeds remaining balance (₹${remaining.toFixed(2)}).`);
            }

            // Insert the payment record
            const [result] = await connection.query(
                `INSERT INTO payments (order_id, amount_paid, payment_method) VALUES (?, ?, ?)`,
                [order_id, amount_paid, payment_method]
            );
            const payment_id = result.insertId;

            // Sync order status to reflect this payment
            const summary = await syncOrderPaymentStatus(connection, order_id);

            await connection.commit();
            return { payment_id, ...summary };
        } catch (err) {
            await connection.rollback();
            throw err;
        } finally {
            connection.release();
        }
    },

    // ── Fetch all payments + summary for one order ──────────────────────
    getPaymentsByOrderId: async (order_id) => {
        // Payment history
        const [payments] = await pool.query(
            `SELECT id AS payment_id, order_id, amount_paid, payment_method,
                    payment_date, created_at
             FROM payments
             WHERE order_id = ?
             ORDER BY payment_date ASC`,
            [order_id]
        );

        // Summary: what was owed and what's been paid
        const [[inv]] = await pool.query(
            `SELECT final_amount FROM invoices WHERE order_id = ?`, [order_id]
        );
        const [[{ total_paid }]] = await pool.query(
            `SELECT COALESCE(SUM(amount_paid), 0) AS total_paid FROM payments WHERE order_id = ?`,
            [order_id]
        );

        const finalAmount    = Number(inv?.final_amount || 0);
        const paid           = Number(total_paid);
        const remaining      = Math.max(0, finalAmount - paid);
        const percentagePaid = finalAmount > 0 ? Math.min(100, (paid / finalAmount) * 100) : 0;

        return {
            summary: {
                total_amount:     finalAmount,
                total_paid:       paid,
                remaining_amount: remaining,
                percentage_paid:  Math.round(percentagePaid)
            },
            payments
        };
    }
};

module.exports = paymentModel;
