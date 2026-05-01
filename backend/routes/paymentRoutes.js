const express  = require('express');
const router   = express.Router();
const paymentController = require('../controllers/paymentController');
const { protect }    = require('../middleware/authMiddleware');
const { checkRole }  = require('../middleware/roleMiddleware');

// POST /api/payments — record a payment (Owner & Employee only)
router.post(
    '/',
    protect,
    checkRole('owner', 'employee'),
    paymentController.addPayment
);

// GET /api/payments/:order_id — view payment history
// All roles can view (customer ownership check happens in model via order lookup)
router.get(
    '/:order_id',
    protect,
    checkRole('owner', 'employee', 'customer'),
    paymentController.getPaymentsByOrder
);

module.exports = router;
