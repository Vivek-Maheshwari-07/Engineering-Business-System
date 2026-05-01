const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Base mapping structural paths securely bound locally to Internal Logic rules 
// Owner and Employee dictates tracking stock. Customers intentionally blocked globally.
router.get('/', protect, checkRole('owner', 'employee'), inventoryController.getAll);

// Auditing historical logs specifically bound to system supervisors
router.get('/logs', protect, checkRole('owner', 'employee'), inventoryController.getLogs);

// Mutating mappings adding configurations explicitly via POST mappings
router.post('/add', protect, checkRole('owner', 'employee'), inventoryController.addStock);


module.exports = router;
