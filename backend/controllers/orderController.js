const { Order } = require('../models/orderModel');

// @desc    Get all orders (Admin only)
// @route   GET /api/orders
// @access  Private/Admin
const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.getAll();
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching orders' });
    }
};

// @desc    Get orders for current customer
// @route   GET /api/orders/my
// @access  Private
const getMyOrders = async (req, res) => {
    try {
        const orders = await Order.getByCustomer(req.user.id);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching your orders' });
    }
};

// @desc    Get order by ID
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
    try {
        const order = await Order.getById(req.params.id);
        if (!order) return res.status(404).json({ message: 'Order not found' });
        
        // Only admin or the owner can view
        if (req.user.role !== 'admin' && order.customer_id !== req.user.id) {
            return res.status(401).json({ message: 'Not authorized' });
        }
        res.json(order);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching order' });
    }
};

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
    try {
        const { items, notes, subtotal } = req.body;
        
        if (!items || items.length === 0) {
            return res.status(400).json({ message: 'No items in order' });
        }

        const timestamp = Date.now().toString().slice(-6);
        const order_number = `ORD-${new Date().getFullYear()}-${timestamp}`;
        const orderData = { order_number, subtotal, notes };
        
        const id = await Order.create(orderData, items, req.user.id);
        res.status(201).json({ message: 'Order created', id, order_number });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating order' });
    }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const updated = await Order.updateStatus(req.params.id, status);
        if (!updated) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order status updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating order' });
    }
};

// @desc    Delete order
// @route   DELETE /api/orders/:id
// @access  Private/Admin
const deleteOrder = async (req, res) => {
    try {
        const deleted = await Order.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Order not found' });
        res.json({ message: 'Order deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting order' });
    }
};

module.exports = {
    getAllOrders,
    getMyOrders,
    getOrderById,
    createOrder,
    updateOrderStatus,
    deleteOrder
};
