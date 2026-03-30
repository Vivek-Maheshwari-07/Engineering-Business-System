const { Employee } = require('../models/employeeModel');

const getAllEmployees = async (req, res) => {
    try {
        const employees = await Employee.getAll();
        res.json(employees);
    } catch (error) {
        res.status(500).json({ message: 'Server error fetching employees' });
    }
};

const createEmployee = async (req, res) => {
    try {
        const id = await Employee.create(req.body);
        res.status(201).json({ message: 'Employee created', id });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error creating employee' });
    }
};

const updateEmployee = async (req, res) => {
    try {
        const updated = await Employee.update(req.params.id, req.body);
        if (!updated) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error updating employee' });
    }
};

const deleteEmployee = async (req, res) => {
    try {
        const deleted = await Employee.delete(req.params.id);
        if (!deleted) return res.status(404).json({ message: 'Employee not found' });
        res.json({ message: 'Employee deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting employee' });
    }
};

module.exports = { getAllEmployees, createEmployee, updateEmployee, deleteEmployee };
