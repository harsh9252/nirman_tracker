const Employee = require('../models/Employee');
const SalaryType = require('../models/SalaryType');

// Get all employees
exports.getAllEmployees = (req, res) => {
    Employee.getAll((err, results) => {
        if (err) {
            console.error('Error fetching employees:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

// Get employee by ID
exports.getEmployeeById = (req, res) => {
    const { id } = req.params;
    Employee.getById(id, (err, results) => {
        if (err) {
            console.error(`Error fetching employee with ID ${id}:`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (results.length === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json(results[0]);
    });
};

// Create new employee
exports.createEmployee = (req, res) => {
    const employeeData = req.body;

    if (!employeeData.name) {
        return res.status(400).json({ error: 'Employee name is required' });
    }

    Employee.create(employeeData, (err, result) => {
        if (err) {
            console.error('Error creating employee:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.status(201).json({
            message: 'Employee created successfully',
            id: result.insertId
        });
    });
};

// Update employee
exports.updateEmployee = (req, res) => {
    const { id } = req.params;
    const employeeData = req.body;

    if (!employeeData.name) {
        return res.status(400).json({ error: 'Employee name is required' });
    }

    Employee.update(id, employeeData, (err, result) => {
        if (err) {
            console.error(`Error updating employee with ID ${id}:`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee updated successfully' });
    });
};

// Delete employee
exports.deleteEmployee = (req, res) => {
    const { id } = req.params;
    Employee.delete(id, (err, result) => {
        if (err) {
            console.error(`Error deleting employee with ID ${id}:`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: 'Employee not found' });
        }
        res.json({ message: 'Employee deleted successfully' });
    });
};

// Get employees by project ID
exports.getEmployeesByProject = (req, res) => {
    const { projectId } = req.params;
    Employee.getByProject(projectId, (err, results) => {
        if (err) {
            console.error(`Error fetching employees for project ID ${projectId}:`, err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};

// Get all salary types
exports.getSalaryTypes = (req, res) => {
    SalaryType.getAll((err, results) => {
        if (err) {
            console.error('Error fetching salary types:', err);
            return res.status(500).json({ error: 'Internal server error' });
        }
        res.json(results);
    });
};
