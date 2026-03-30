const express = require('express');
const router = express.Router();
const { getAllEmployees, createEmployee, updateEmployee, deleteEmployee } = require('../controllers/employeeController');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');

router.get('/', protect, authorizeRoles('admin', 'employee'), getAllEmployees);
router.post('/', protect, authorizeRoles('admin'), createEmployee);
router.put('/:id', protect, authorizeRoles('admin'), updateEmployee);
router.delete('/:id', protect, authorizeRoles('admin'), deleteEmployee);

module.exports = router;
