const express = require('express');
const router = express.Router();
const { getAllUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// Step 5: User Management (Owner Only)
// @route   GET /api/users
router.get('/', protect, checkRole('owner'), getAllUsers);

// @route   PUT /api/users/:id
router.put('/:id', protect, checkRole('owner'), updateUserRole);

// @route   DELETE /api/users/:id
router.delete('/:id', protect, checkRole('owner'), deleteUser);

module.exports = router;
