const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token with user id and role
 * @param {number} id - The user ID
 * @param {string} role - The user role
 * @returns {string} - The generated JWT
 */
const generateToken = (id, role) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET, {
        expiresIn: '1d',
    });
};

module.exports = { generateToken };
