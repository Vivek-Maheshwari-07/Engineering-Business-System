const pool = require('../config/db');

const userModel = {
    // Retrieve all users from database without exposing passwords
    getAllUsers: async () => {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, is_verified, created_at FROM users'
        );
        return rows;
    },

    // Retrieve a single user by ID
    getUserById: async (id) => {
        const [rows] = await pool.execute(
            'SELECT id, name, email, role, is_verified, created_at FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },

    // Update user role, ensuring only valid roles can be set
    updateUserRole: async (id, role) => {
        const validRoles = ['owner', 'employee', 'customer'];
        if (!validRoles.includes(role)) {
            throw new Error(`Invalid role. Valid roles are: ${validRoles.join(', ')}`);
        }

        const [result] = await pool.execute(
            'UPDATE users SET role = ? WHERE id = ?',
            [role, id]
        );
        return result.affectedRows > 0;
    },

    // Delete a user entirely
    deleteUser: async (id) => {
        const [result] = await pool.execute(
            'DELETE FROM users WHERE id = ?',
            [id]
        );
        return result.affectedRows > 0;
    }
};

module.exports = userModel;
