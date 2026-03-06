const EmployeeProjectRate = require('../models/EmployeeProjectRate');

// Create or update a project-specific rate
exports.upsertRate = (req, res) => {
    EmployeeProjectRate.upsert(req.body, (err, result) => {
        if (err) {
            console.error('Error upserting project rate:', err);
            return res.status(500).json({ error: 'Failed to save project rate' });
        }
        res.status(200).json({ message: 'Project rate saved successfully' });
    });
};

// Get rates for an employee
exports.getRatesByEmployee = (req, res) => {
    const { employeeId } = req.params;
    EmployeeProjectRate.getByEmployee(employeeId, (err, results) => {
        if (err) {
            console.error('Error fetching employee rates:', err);
            return res.status(500).json({ error: 'Failed to fetch rates' });
        }
        res.json(results);
    });
};

// Delete a project rate
exports.deleteRate = (req, res) => {
    const { id } = req.params;
    EmployeeProjectRate.delete(id, (err, result) => {
        if (err) {
            console.error('Error deleting project rate:', err);
            return res.status(500).json({ error: 'Failed to delete rate' });
        }
        res.status(200).json({ message: 'Project rate deleted successfully' });
    });
};
