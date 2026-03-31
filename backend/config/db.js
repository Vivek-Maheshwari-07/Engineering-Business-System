const { Pool } = require("pg");
const dotenv = require("dotenv");

dotenv.config();

// Create connection pool for PostgreSQL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    // For Supabase, ssl might be required depending on network setup
    ssl: {
        rejectUnauthorized: false
    }
});

// We can monkey-patch .execute() to map to .query() to minimize code changes 
// in other controllers that previously called promisePool.execute() from mysql2.
// mysql2 usually returns [rows, fields]. pg returns { rows, fields }.
const promisePool = {
    execute: async (text, params) => {
        // Convert mysql ? placeholders to pg $1, $2, etc.
        let pgText = text;
        if (params && params.length > 0) {
            let i = 1;
            pgText = text.replace(/\?/g, () => `$${i++}`);
        }
        
        try {
            const res = await pool.query(pgText, params);
            // Return an array matching mysql2's expected output format of [rows, fields]
            // Polyfill insertId and affectedRows
            let resultInfo = res.rows;
            if (res.command === 'INSERT' || res.command === 'UPDATE' || res.command === 'DELETE') {
                resultInfo = []; // Usually mysql2 returns an object for write operations in place of rows
                resultInfo.affectedRows = res.rowCount;
                if (res.command === 'INSERT' && res.rows.length > 0 && res.rows[0].id) {
                    resultInfo.insertId = res.rows[0].id;
                }
            }
            return [resultInfo, res.fields];
        } catch (error) {
            console.error('Database query error:', error);
            throw error;
        }
    },
    query: async (text, params) => {
        return promisePool.execute(text, params);
    }
};

// Initial connection test
pool.connect((err, client, release) => {
    if (err) {
        console.error("Error acquiring client from PostgreSQL connection pool:", err.stack);
    } else {
        console.log("Successfully connected to PostgreSQL (Supabase) database");
        release();
    }
});

module.exports = promisePool;
