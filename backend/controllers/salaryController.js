const salaryModel = require('../models/salaryModel');

const salaryController = {
    // @desc   List all employees with/without profiles (owner setup dashboard)
    // @route  GET /api/salary/employees
    // @access Owner only
    getEmployees: async (req, res) => {
        try {
            const employees = await salaryModel.getEmployeeUsers();
            res.status(200).json({ success: true, data: employees });
        } catch (err) {
            console.error('[salaryController.getEmployees]', err);
            res.status(500).json({ success: false, message: 'Failed to fetch employees.' });
        }
    },

    // @desc   Create or update an employee profile (base salary, join date)
    // @route  POST /api/salary/profiles
    // @access Owner only
    upsertProfile: async (req, res) => {
        try {
            const { user_id, base_salary, join_date } = req.body;

            if (!user_id || base_salary === undefined) {
                return res.status(400).json({ success: false, message: 'user_id and base_salary are required.' });
            }
            const salary = parseFloat(base_salary);
            if (isNaN(salary) || salary <= 0) {
                return res.status(400).json({ success: false, message: 'base_salary must be a positive number.' });
            }

            // Check if profile already exists → update, else create
            const existing = await salaryModel.getProfileByUserId(user_id);

            if (existing) {
                await salaryModel.updateProfile(user_id, salary);
                return res.status(200).json({ success: true, message: 'Employee profile updated.', data: { user_id, base_salary: salary } });
            } else {
                const profileId = await salaryModel.createProfile(user_id, salary, join_date);
                return res.status(201).json({ success: true, message: 'Employee profile created.', data: { profile_id: profileId, user_id, base_salary: salary } });
            }
        } catch (err) {
            console.error('[salaryController.upsertProfile]', err);
            res.status(500).json({ success: false, message: 'Failed to save employee profile.' });
        }
    },

    // @desc   Get all salary records (optionally filter by month/year)
    // @route  GET /api/salary/records
    // @access Owner only
    getAllRecords: async (req, res) => {
        try {
            const { month, year } = req.query;
            const records = await salaryModel.getAllSalaryRecords(
                month ? Number(month) : null,
                year  ? Number(year)  : null
            );
            res.status(200).json({ success: true, data: records });
        } catch (err) {
            console.error('[salaryController.getAllRecords]', err);
            res.status(500).json({ success: false, message: 'Failed to fetch salary records.' });
        }
    },

    // @desc   Generate (or regenerate) a monthly salary for one employee
    // @route  POST /api/salary/generate
    // @access Owner only
    generateSalary: async (req, res) => {
        try {
            const { user_id, month, year, deductions = 0, notes = '' } = req.body;

            if (!user_id || !month || !year) {
                return res.status(400).json({ success: false, message: 'user_id, month, and year are required.' });
            }
            if (month < 1 || month > 12) {
                return res.status(400).json({ success: false, message: 'month must be between 1 and 12.' });
            }
            const deductionAmt = parseFloat(deductions) || 0;
            if (deductionAmt < 0) {
                return res.status(400).json({ success: false, message: 'deductions cannot be negative.' });
            }

            const record = await salaryModel.generateSalary(user_id, month, year, deductionAmt, notes);

            res.status(201).json({
                success: true,
                message: `Salary generated for month ${month}/${year}. Net: ₹${record.net_salary.toFixed(2)}.`,
                data: record
            });
        } catch (err) {
            if (err.message.includes('not found')) {
                return res.status(404).json({ success: false, message: err.message });
            }
            console.error('[salaryController.generateSalary]', err);
            res.status(500).json({ success: false, message: 'Failed to generate salary.' });
        }
    },

    // @desc   Get salary history for the currently logged-in employee
    // @route  GET /api/salary/my-salary
    // @access Employee (views own), Owner (views all — use getAllRecords instead)
    getMySalary: async (req, res) => {
        try {
            const user_id = req.user.id;
            const history = await salaryModel.getSalaryHistory(user_id);
            res.status(200).json({ success: true, data: history });
        } catch (err) {
            console.error('[salaryController.getMySalary]', err);
            res.status(500).json({ success: false, message: 'Failed to fetch your salary history.' });
        }
    },

    // @desc   Get salary history for a specific employee (owner can view any)
    // @route  GET /api/salary/history/:user_id
    // @access Owner only
    getEmployeeSalaryHistory: async (req, res) => {
        try {
            const { user_id } = req.params;
            const history = await salaryModel.getSalaryHistory(Number(user_id));
            res.status(200).json({ success: true, data: history });
        } catch (err) {
            console.error('[salaryController.getEmployeeSalaryHistory]', err);
            res.status(500).json({ success: false, message: 'Failed to fetch salary history.' });
        }
    }
};

module.exports = salaryController;
