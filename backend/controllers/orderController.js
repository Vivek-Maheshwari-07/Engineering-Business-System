const orderModel = require('../models/orderModel');
const {
    sendOrderConfirmationEmail,
    sendOwnerOrderAlert,
    sendOrderStatusUpdateEmail,
} = require('../utils/emailService');

const orderController = {

    // ── Create Order ──────────────────────────────────────────────────────────
    createOrder: async (req, res) => {
        try {
            const { items } = req.body;
            const customer_id = req.user.id;

            if (!items || !Array.isArray(items) || items.length === 0) {
                return res.status(400).json({ message: 'Order must contain at least one item.' });
            }

            // 1. Atomic order creation (inventory deduction + invoice generation inside transaction)
            const activeOrder = await orderModel.createOrder(customer_id, items);

            // 2. Respond immediately — don't wait for emails
            res.status(201).json({
                message: 'Order placed successfully.',
                order: activeOrder,
            });

            // 3. Fire emails AFTER response (non-blocking)
            //    Fetch full order details so templates have all data (items, invoice, customer info)
            setImmediate(async () => {
                try {
                    const fullOrder = await orderModel.getOrderDetails(activeOrder.order_id);
                    if (!fullOrder) return;

                    const customerEmail = req.user.email;

                    // Send both emails concurrently — failures are caught inside emailService
                    await Promise.allSettled([
                        sendOrderConfirmationEmail(
                            { ...fullOrder, order_id: activeOrder.order_id },
                            customerEmail
                        ),
                        sendOwnerOrderAlert(
                            { ...fullOrder, order_id: activeOrder.order_id },
                            customerEmail
                        ),
                    ]);
                } catch (emailErr) {
                    // Absolutely must not crash the process
                    console.error('[ORDER EMAIL] Background email job failed:', emailErr.message);
                }
            });

        } catch (error) {
            // Pass domain-level stock/variant errors back as 400
            if (
                error.message.includes('breached bounds') ||
                error.message.includes('unfound entirely') ||
                error.message.includes('Mathematical mapping')
            ) {
                return res.status(400).json({ message: error.message });
            }
            res.status(500).json({ message: 'Failed to create order.', error: error.message });
        }
    },

    // ── Get All Orders (RBAC-filtered) ────────────────────────────────────────
    getAllOrders: async (req, res) => {
        try {
            const { role, id } = req.user;
            const orders = (role === 'owner' || role === 'employee')
                ? await orderModel.getAllOrders(null)
                : await orderModel.getAllOrders(id);

            res.status(200).json(orders);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch orders.', error: error.message });
        }
    },

    // ── Get Single Order ──────────────────────────────────────────────────────
    getOrderById: async (req, res) => {
        try {
            const order_id     = req.params.id;
            const { role, id } = req.user;

            const targetOrder = await orderModel.getOrderDetails(order_id);

            if (!targetOrder) {
                return res.status(404).json({ message: 'Order not found.' });
            }

            // Customers can only view their own orders
            if (role === 'customer' && targetOrder.customer_id !== id) {
                return res.status(403).json({ message: 'Access denied.' });
            }

            res.status(200).json(targetOrder);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch order.', error: error.message });
        }
    },

    // ── Update Order Status ───────────────────────────────────────────────────
    updateOrderStatus: async (req, res) => {
        try {
            const order_id = req.params.id;
            const { status } = req.body;

            const VALID_STATUSES = ['pending', 'partially_paid', 'completed', 'cancelled'];
            if (!VALID_STATUSES.includes(status)) {
                return res.status(400).json({ message: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` });
            }

            // Fetch order BEFORE update so we have customer info for email
            const orderBefore = await orderModel.getOrderDetails(order_id);
            if (!orderBefore) {
                return res.status(404).json({ message: 'Order not found.' });
            }

            const success = await orderModel.updateOrderStatus(order_id, status);
            if (!success) {
                return res.status(404).json({ message: 'Order not found or no changes made.' });
            }

            res.status(200).json({ message: `Order status updated to: ${status}` });

            // Send status update email to customer (non-blocking)
            setImmediate(async () => {
                try {
                    await sendOrderStatusUpdateEmail(
                        orderBefore,
                        orderBefore.customer_email,
                        status
                    );
                } catch (emailErr) {
                    console.error('[STATUS EMAIL] Background email job failed:', emailErr.message);
                }
            });

        } catch (error) {
            res.status(500).json({ message: 'Failed to update order status.', error: error.message });
        }
    },
};

module.exports = orderController;
