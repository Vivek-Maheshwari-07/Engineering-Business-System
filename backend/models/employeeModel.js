const db = require('../config/db');

const createEmployeesTable = async () => {
    const query = `
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      user_id INT,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(20),
      department VARCHAR(100),
      designation VARCHAR(100),
      salary DECIMAL(10,2) DEFAULT 0.00,
      join_date DATE,
      status VARCHAR(20) DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    )`;
    try {
        await db.query(query);
        console.log('Employees table initialized.');
    } catch (error) {
        console.error('Error creating employees table:', error.message);
    }
};

const Employee = {
    getAll: async () => {
        const [rows] = await db.query('SELECT * FROM employees ORDER BY created_at DESC');
        return rows;
    },
    getById: async (id) => {
        const [rows] = await db.query('SELECT * FROM employees WHERE id = ?', [id]);
        return rows[0];
    },
    create: async (data) => {
        const { name, email, phone, department, designation, salary, join_date } = data;
        const [result] = await db.query(
            'INSERT INTO employees (name, email, phone, department, designation, salary, join_date) VALUES (?, ?, ?, ?, ?, ?, ?) RETURNING id',
            [name, email, phone, department, designation, salary, join_date]
        );
        return result.insertId;
    },
    update: async (id, data) => {
        const { name, email, phone, department, designation, salary, status } = data;
        const [result] = await db.query(
            'UPDATE employees SET name=?, email=?, phone=?, department=?, designation=?, salary=?, status=? WHERE id=?',
            [name, email, phone, department, designation, salary, status, id]
        );
        return result.affectedRows > 0;
    },
    delete: async (id) => {
        const [result] = await db.query('DELETE FROM employees WHERE id = ?', [id]);
        return result.affectedRows > 0;
    },
    count: async () => {
        const [rows] = await db.query('SELECT COUNT(*) as total FROM employees WHERE status = "active"');
        return rows[0].total;
    }
};

module.exports = { Employee, createEmployeesTable };
