const db = require('../config/db');

// Function to create users table if it doesn't exist
const createUsersTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      role VARCHAR(20) DEFAULT 'customer',
      otp VARCHAR(10),
      otp_expiry TIMESTAMP,
      is_verified BOOLEAN DEFAULT false,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `;
    try {
        await db.query(query);
        console.log("Users table initialized successfully.");
    } catch (error) {
        console.error("Error creating users table:", error.message);
    }
};

const User = {
    // Create a new user (during registration)
    create: async (name, email, hashedPassword, role, otp, otpExpiry) => {
        const query = `INSERT INTO users (name, email, password, role, otp, otp_expiry, is_verified) VALUES (?, ?, ?, ?, ?, ?, false) RETURNING id`;
        const [result] = await db.query(query, [name, email, hashedPassword, role, otp, otpExpiry]);
        return result.insertId;
    },

    // Find a user by email
    findByEmail: async (email) => {
        const query = `SELECT * FROM users WHERE email = ?`;
        const [rows] = await db.query(query, [email]);
        return rows[0];
    },

    // Find a user by ID
    findById: async (id) => {
        const query = `SELECT * FROM users WHERE id = ?`;
        const [rows] = await db.query(query, [id]);
        return rows[0];
    },

    // Update a user's OTP and expiry
    updateOTP: async (id, otp, otpExpiry) => {
        const query = `UPDATE users SET otp = ?, otp_expiry = ? WHERE id = ?`;
        const [result] = await db.query(query, [otp, otpExpiry, id]);
        return result.affectedRows > 0;
    },

    // Mark account as verified and clear OTP fields
    verifyAccount: async (id) => {
        const query = `UPDATE users SET is_verified = true, otp = NULL, otp_expiry = NULL WHERE id = ?`;
        const [result] = await db.query(query, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = { User, createUsersTable };
