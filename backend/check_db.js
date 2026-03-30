const mysql = require('mysql2/promise');
require('dotenv').config();

async function checkDB() {
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
        });

        const [rows] = await connection.query(`SHOW DATABASES LIKE '${process.env.DB_NAME}'`);
        
        if (rows.length === 0) {
            console.log(`DATABASE_NOT_FOUND: ${process.env.DB_NAME}`);
            await connection.query(`CREATE DATABASE ${process.env.DB_NAME}`);
            console.log(`DATABASE_CREATED: ${process.env.DB_NAME}`);
        } else {
            console.log(`DATABASE_EXISTS: ${process.env.DB_NAME}`);
        }
        
        await connection.end();
    } catch (error) {
        console.error('CONNECTION_ERROR:', error.message);
    }
}

checkDB();
