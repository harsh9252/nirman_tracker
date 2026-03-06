const SalarySlip = require('../models/SalarySlip');
const SalaryPayment = require('../models/SalaryPayment');

// Generate salary slip
exports.generateSalarySlip = (req, res) => {
    SalarySlip.generate(req.body, (err, result) => {
        if (err) {
            console.error('Error generating salary slip:', err);
            return res.status(500).json({ error: 'Failed to generate salary slip' });
        }
        res.status(201).json({ message: 'Salary slip generated successfully', id: result.insertId });
    });
};

// Get salary slips for employee
exports.getSalarySlips = (req, res) => {
    const { employeeId } = req.params;
    SalarySlip.getByEmployee(employeeId, (err, results) => {
        if (err) {
            console.error('Error fetching salary slips:', err);
            return res.status(500).json({ error: 'Failed to fetch salary slips' });
        }
        res.json(results);
    });
};

// Get salary slips for project
exports.getSalarySlipsByProject = (req, res) => {
    const { projectId } = req.params;
    const { month, year } = req.query;

    if (!month || !year) {
        return res.status(400).json({ error: 'Month and Year are required' });
    }

    SalarySlip.getByProject(projectId, month, year, (err, results) => {
        if (err) {
            console.error('Error fetching project salary slips:', err);
            return res.status(500).json({ error: 'Failed to fetch project salary slips' });
        }
        res.json(results);
    });
};

// Record payment
exports.recordPayment = (req, res) => {
    SalaryPayment.record(req.body, (err, result) => {
        if (err) {
            console.error('Error recording salary payment:', err);
            return res.status(500).json({ error: 'Failed to record payment' });
        }
        res.status(201).json({ message: 'Payment recorded successfully' });
    });
};

// Get payments for a slip
exports.getPaymentsBySlip = (req, res) => {
    const { slipId } = req.params;
    SalaryPayment.getBySalarySlip(slipId, (err, results) => {
        if (err) {
            console.error('Error fetching payments:', err);
            return res.status(500).json({ error: 'Failed to fetch payments' });
        }
        res.json(results);
    });
};
