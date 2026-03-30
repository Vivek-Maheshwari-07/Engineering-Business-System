const express = require('express');
const router = express.Router();
const { getAllInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } = require('../controllers/inventoryController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, getAllInventory);
router.post('/', protect, authorizeRoles('admin'), createInventoryItem);
router.put('/:id', protect, authorizeRoles('admin', 'employee'), updateInventoryItem);
router.delete('/:id', protect, authorizeRoles('admin'), deleteInventoryItem);

module.exports = router;
