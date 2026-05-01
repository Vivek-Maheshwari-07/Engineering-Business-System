const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');
require('dotenv').config({ path: __dirname + '/../.env' }); // Load .env from parent directory

// ==========================================
// ⚙️ DATABASE CONNECTION CONFIG
// ==========================================
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'engineering_erp'
};

// ==========================================
// 👥 DEMO USERS DATA
// ==========================================
const demoUsers = [
    // --- OWNER ---
    {
        name: 'Vivek Maheshwari',
        email: 'vivekmaheshwari115@gmail.com',
        role: 'owner',
    },
    // --- EMPLOYEES ---
    {
        name: 'Manav Lathiya',
        email: '24cs048@charusat.edu.in',
        role: 'employee',
        base_salary: 45000.00
    },
    {
        name: 'Deep Patel',
        email: '24cs061@charusat.edu.in',
        role: 'employee',
        base_salary: 42000.00
    },
    {
        name: 'Aayush Malhotra',
        email: '24cs051@charusat.edu.in',
        role: 'employee',
        base_salary: 40000.00
    },
    {
        name: 'Parth Patel',
        email: '24cs069@charusat.edu.in',
        role: 'employee',
        base_salary: 38000.00
    },
    // --- CUSTOMERS ---
    {
        name: 'Customer One',
        email: '24cs050@charusat.edu.in',
        role: 'customer'
    },
    {
        name: 'Customer Two',
        email: 'vivek07solanki@gmail.com',
        role: 'customer'
    }
];

const DEFAULT_PASSWORD = '123456';

// ==========================================
// 🚀 SEEDING LOGIC
// ==========================================
const seedDatabase = async (resetExisting = false) => {
    let connection;
    try {
        console.log('--------------------------------------------------');
        console.log('🌱 Starting Database Seeding (Demo Users)...');
        console.log('--------------------------------------------------');

        connection = await mysql.createConnection(dbConfig);
        console.log('[DB] Connected to database successfully.');

        // ⚠️ OPTIONAL: Reset/Delete existing demo users before seeding
        if (resetExisting) {
            console.log('[WARN] Deleting existing demo users from database...');
            const emailsToDelete = demoUsers.map(u => `'${u.email}'`).join(', ');
            await connection.query(`DELETE FROM users WHERE email IN (${emailsToDelete})`);
            console.log('[INFO] Existing demo users deleted.');
        }

        // Hash the default password once to use for all demo users
        console.log(`[AUTH] Hashing default password '${DEFAULT_PASSWORD}'...`);
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, salt);

        let createdCount = 0;
        let skippedCount = 0;

        // Loop through each demo user
        for (const user of demoUsers) {
            // Check if user already exists
            const [existing] = await connection.query(`SELECT id FROM users WHERE email = ?`, [user.email]);
            
            if (existing.length > 0) {
                console.log(`[SKIP] User already exists: ${user.email} (${user.role})`);
                skippedCount++;
                continue;
            }

            // Insert into users table
            const [result] = await connection.query(
                `INSERT INTO users (name, email, password, role, is_verified) VALUES (?, ?, ?, ?, true)`,
                [user.name, user.email, hashedPassword, user.role]
            );

            const userId = result.insertId;
            console.log(`[OK] Created User: ${user.name} | Role: ${user.role} | ID: ${userId}`);

            // If employee, create employee_profile
            if (user.role === 'employee' && user.base_salary) {
                // Get current date in YYYY-MM-DD format
                const currentDate = new Date().toISOString().split('T')[0];
                
                await connection.query(
                    `INSERT INTO employee_profiles (user_id, base_salary, join_date) VALUES (?, ?, ?)`,
                    [userId, user.base_salary, currentDate]
                );
                console.log(`  -> Added Employee Profile: Salary ₹${user.base_salary}`);
            }

            createdCount++;
        }

        console.log('--------------------------------------------------');
        console.log('✅ Seeding Complete!');
        console.log(`📊 Summary: Created = ${createdCount}, Skipped = ${skippedCount}`);
        console.log('--------------------------------------------------');

    } catch (error) {
        console.error('❌ [ERROR] Database seeding failed:', error.message);
    } finally {
        if (connection) {
            await connection.end();
            console.log('[DB] Connection closed.');
        }
    }
};

// ==========================================
// ⚡ EXECUTE SCRIPT
// ==========================================
// To reset existing users before seeding, pass `true` to seedDatabase
const shouldReset = process.argv.includes('--reset');
seedDatabase(shouldReset);
