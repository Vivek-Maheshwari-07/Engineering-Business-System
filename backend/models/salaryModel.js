const pool = require('../config/database');

const salaryModel = {
    // ── Employee profile CRUD ───────────────────────────────────────────

    // Create profile (called when owner sets up an employee's salary for the first time)
    createProfile: async (user_id, base_salary, join_date) => {
        const [result] = await pool.query(
            `INSERT INTO employee_profiles (user_id, base_salary, join_date) VALUES (?, ?, ?)`,
            [user_id, base_salary, join_date || new Date()]
        );
        return result.insertId;
    },

    // Update base salary
    updateProfile: async (user_id, base_salary) => {
        const [result] = await pool.query(
            `UPDATE employee_profiles SET base_salary = ? WHERE user_id = ?`,
            [base_salary, user_id]
        );
        return result.affectedRows > 0;
    },

    // Get a single profile (joins user info)
    getProfileByUserId: async (user_id) => {
        const [[row]] = await pool.query(
            `SELECT ep.id AS profile_id, ep.user_id, ep.base_salary, ep.join_date,
                    u.name, u.email
             FROM employee_profiles ep
             JOIN users u ON ep.user_id = u.id
             WHERE ep.user_id = ?`,
            [user_id]
        );
        return row || null;
    },

    // Get all profiles (owner dashboard)
    getAllProfiles: async () => {
        const [rows] = await pool.query(
            `SELECT ep.id AS profile_id, ep.user_id, ep.base_salary, ep.join_date,
                    u.name, u.email
             FROM employee_profiles ep
             JOIN users u ON ep.user_id = u.id
             ORDER BY u.name ASC`
        );
        return rows;
    },

    // ── Salary record generation ────────────────────────────────────────

    // Generate (or re-generate) a monthly salary record for one employee
    generateSalary: async (user_id, month, year, deductions = 0, notes = '') => {
        // Fetch base salary from profile
        const profile = await salaryModel.getProfileByUserId(user_id);
        if (!profile) throw new Error('Employee profile not found. Set up the profile first.');

        const base_salary = Number(profile.base_salary);
        const net_salary  = Math.max(0, base_salary - Number(deductions));

        // UPSERT — regenerating for the same month/year overwrites the old record
        const [result] = await pool.query(
            `INSERT INTO salary_records (employee_id, month, year, base_salary, deductions, net_salary, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE
                base_salary = VALUES(base_salary),
                deductions  = VALUES(deductions),
                net_salary  = VALUES(net_salary),
                notes       = VALUES(notes),
                generated_at = CURRENT_TIMESTAMP`,
            [user_id, month, year, base_salary, deductions, net_salary, notes]
        );
        return {
            salary_record_id: result.insertId || null,
            user_id, month, year,
            base_salary, deductions, net_salary, notes
        };
    },

    // Get salary history for one employee (used by both owner and employee)
    getSalaryHistory: async (user_id) => {
        const [rows] = await pool.query(
            `SELECT sr.id AS record_id, sr.month, sr.year, sr.base_salary,
                    sr.deductions, sr.net_salary, sr.notes, sr.generated_at,
                    u.name AS employee_name, u.email AS employee_email
             FROM salary_records sr
             JOIN users u ON sr.employee_id = u.id
             WHERE sr.employee_id = ?
             ORDER BY sr.year DESC, sr.month DESC`,
            [user_id]
        );
        return rows;
    },

    // Get all salary records for all employees (owner dashboard)
    getAllSalaryRecords: async (month = null, year = null) => {
        let query = `
            SELECT sr.id AS record_id, sr.employee_id, sr.month, sr.year,
                   sr.base_salary, sr.deductions, sr.net_salary, sr.notes, sr.generated_at,
                   u.name AS employee_name, u.email AS employee_email
            FROM salary_records sr
            JOIN users u ON sr.employee_id = u.id
        `;
        const params = [];
        const clauses = [];

        if (month) { clauses.push('sr.month = ?'); params.push(month); }
        if (year)  { clauses.push('sr.year  = ?'); params.push(year);  }
        if (clauses.length) query += ` WHERE ${clauses.join(' AND ')}`;
        query += ` ORDER BY sr.year DESC, sr.month DESC, u.name ASC`;

        const [rows] = await pool.query(query, params);
        return rows;
    },

    // List all users with role='employee' (for the "add profile" dropdown)
    getEmployeeUsers: async () => {
        const [rows] = await pool.query(
            `SELECT u.id, u.name, u.email,
                    ep.id AS profile_id, ep.base_salary
             FROM users u
             LEFT JOIN employee_profiles ep ON u.id = ep.user_id
             WHERE u.role = 'employee'
             ORDER BY u.name ASC`
        );
        return rows;
    }
};

module.exports = salaryModel;
