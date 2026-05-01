const userModel = require('../models/userModel');

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Owner
const getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getAllUsers();
        res.status(200).json({ success: true, count: users.length, data: users });
    } catch (error) {
        console.error('[getAllUsers ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server Error: Unable to fetch users' });
    }
};

// @desc    Update user role
// @route   PUT /api/users/:id
// @access  Private/Owner
const updateUserRole = async (req, res) => {
    const { id } = req.params;
    const { role } = req.body;

    // Prevent user from changing their own role
    if (req.user.id === parseInt(id, 10)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot change your own role' });
    }

    if (!role) {
        return res.status(400).json({ success: false, message: 'Please provide a role' });
    }

    const validRoles = ['owner', 'employee', 'customer'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ success: false, message: `Invalid role. Allowed roles: ${validRoles.join(', ')}` });
    }

    try {
        // Validate if user exists
        const targetUser = await userModel.getUserById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isUpdated = await userModel.updateUserRole(id, role);

        if (isUpdated) {
            res.status(200).json({ success: true, message: `User role updated to ${role} successfully` });
        } else {
            res.status(400).json({ success: false, message: 'Failed to update user role' });
        }
    } catch (error) {
        console.error('[updateUserRole ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server Error: Unable to update user role' });
    }
};

// @desc    Delete user
// @route   DELETE /api/users/:id
// @access  Private/Owner
const deleteUser = async (req, res) => {
    const { id } = req.params;

    // Prevent user from deleting themselves
    if (req.user.id === parseInt(id, 10)) {
        return res.status(403).json({ success: false, message: 'Forbidden: You cannot delete your own account' });
    }

    try {
        const targetUser = await userModel.getUserById(id);
        if (!targetUser) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isDeleted = await userModel.deleteUser(id);

        if (isDeleted) {
            res.status(200).json({ success: true, message: 'User deleted successfully' });
        } else {
            res.status(400).json({ success: false, message: 'Failed to delete user' });
        }
    } catch (error) {
        console.error('[deleteUser ERROR]', error.message);
        res.status(500).json({ success: false, message: 'Server Error: Unable to delete user' });
    }
};

// ---------- TEST ROUTES ----------

// @desc    Test Owner Access
// @route   POST /api/test/owner
// @access  Private/Owner
const testOwnerAccess = (req, res) => {
    res.status(200).json({ success: true, message: 'Success! You have accessed an OWNER only route.' });
};

// @desc    Test Employee Access (Owner + Employee)
// @route   POST /api/test/employee
// @access  Private/Owner, Employee
const testEmployeeAccess = (req, res) => {
    res.status(200).json({ success: true, message: 'Success! You have accessed an EMPLOYEE (or Owner) route.' });
};

// @desc    Test Customer Access (Customer only)
// @route   POST /api/test/customer
// @access  Private/Customer
const testCustomerAccess = (req, res) => {
    res.status(200).json({ success: true, message: 'Success! You have accessed a CUSTOMER only route.' });
};

module.exports = {
    getAllUsers,
    updateUserRole,
    deleteUser,
    testOwnerAccess,
    testEmployeeAccess,
    testCustomerAccess
};
