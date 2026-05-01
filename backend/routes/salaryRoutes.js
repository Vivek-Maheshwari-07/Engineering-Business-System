const express  = require('express');
const router   = express.Router();
const salaryController = require('../controllers/salaryController');
const { protect }   = require('../middleware/authMiddleware');
const { checkRole } = require('../middleware/roleMiddleware');

// ── Owner-only routes ────────────────────────────────────────────────────────

// GET  /api/salary/employees       → list all employee users with profile status
router.get('/employees',    protect, checkRole('owner'), salaryController.getEmployees);

// POST /api/salary/profiles        → create or update a salary profile
router.post('/profiles',    protect, checkRole('owner'), salaryController.upsertProfile);

// GET  /api/salary/records         → all salary records (supports ?month=&year=)
router.get('/records',      protect, checkRole('owner'), salaryController.getAllRecords);

// POST /api/salary/generate        → generate monthly salary for one employee
router.post('/generate',    protect, checkRole('owner'), salaryController.generateSalary);

// GET  /api/salary/history/:user_id → salary history for a specific employee
router.get('/history/:user_id', protect, checkRole('owner'), salaryController.getEmployeeSalaryHistory);

// ── Employee-only routes ─────────────────────────────────────────────────────

// GET  /api/salary/my-salary       → logged-in employee views own payslip history
router.get('/my-salary',    protect, checkRole('employee'), salaryController.getMySalary);

module.exports = router;
