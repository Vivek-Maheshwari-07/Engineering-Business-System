const paymentModel = require('../models/paymentModel');

const paymentController = {
    // @desc   Record a payment (partial or full) for an order
    // @route  POST /api/payments
    // @access Private (Owner, Employee)
    addPayment: async (req, res) => {
        try {
            const { order_id, amount_paid, payment_method } = req.body;

            // ── Validation ──────────────────────────────────────────────
            if (!order_id || amount_paid === undefined || !payment_method) {
                return res.status(400).json({
                    success: false,
                    message: 'order_id, amount_paid, and payment_method are all required.'
                });
            }

            const VALID_METHODS = ['cash', 'upi', 'bank_transfer', 'cheque', 'card'];
            if (!VALID_METHODS.includes(payment_method.toLowerCase())) {
                return res.status(400).json({
                    success: false,
                    message: `Invalid payment method. Allowed: ${VALID_METHODS.join(', ')}.`
                });
            }

            const amount = parseFloat(amount_paid);
            if (isNaN(amount) || amount <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'amount_paid must be a positive number.'
                });
            }

            // ── Business logic in model ──────────────────────────────────
            const result = await paymentModel.addPayment(order_id, amount, payment_method.toLowerCase());

            res.status(201).json({
                success: true,
                message: `Payment of ₹${amount.toFixed(2)} recorded. Order is now: ${result.status}.`,
                data: result
            });

        } catch (error) {
            // Business-logic errors (not enough balance, cancelled order, etc.)
            const clientErrors = [
                'not found', 'cancelled', 'already fully paid',
                'exceeds remaining', 'must be greater'
            ];
            if (clientErrors.some(s => error.message.toLowerCase().includes(s))) {
                return res.status(400).json({ success: false, message: error.message });
            }
            console.error('[paymentController.addPayment ERROR]', error);
            res.status(500).json({ success: false, message: 'Internal server error recording payment.' });
        }
    },

    // @desc   Get payment history + live summary for an order
    // @route  GET /api/payments/:order_id
    // @access Private (Owner, Employee, Customer — customer check is in route)
    getPaymentsByOrder: async (req, res) => {
        try {
            const { order_id } = req.params;
            if (!order_id || isNaN(Number(order_id))) {
                return res.status(400).json({ success: false, message: 'Valid order_id is required.' });
            }

            const data = await paymentModel.getPaymentsByOrderId(Number(order_id));

            res.status(200).json({ success: true, data });
        } catch (error) {
            console.error('[paymentController.getPayments ERROR]', error);
            res.status(500).json({ success: false, message: 'Failed to retrieve payment history.' });
        }
    }
};

module.exports = paymentController;
