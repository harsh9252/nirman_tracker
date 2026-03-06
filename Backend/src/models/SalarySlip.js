const db = require('../config/database');

class SalarySlip {
    // Generate a salary slip for an employee for a period
    static generate(data, callback) {
        let { employee_id, period_start, period_end, month, year, deductions, status } = data;

        // If month and year are provided instead of full dates, calculate period
        if (!period_start || !period_end) {
            if (month && year) {
                period_start = `${year}-${String(month).padStart(2, '0')}-01`;
                period_end = new Date(year, month, 0).toISOString().split('T')[0];
            } else {
                return callback(new Error('Missing period information (month/year or start/end dates)'));
            }
        }

        // 1. Calculate gross amount from attendance records
        const grossSql = `
            SELECT SUM(calculated_amount) as gross_amount 
            FROM attendance 
            WHERE employee_id = ? AND attendance_date BETWEEN ? AND ?
        `;

        db.query(grossSql, [employee_id, period_start, period_end], (err, results) => {
            if (err) return callback(err);

            const gross_amount = results[0].gross_amount || 0;
            const net_amount = gross_amount - (deductions || 0);

            const sql = `
                INSERT INTO salary_slips (employee_id, period_start, period_end, gross_amount, deductions, net_amount, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                gross_amount = VALUES(gross_amount),
                deductions = VALUES(deductions),
                net_amount = VALUES(net_amount),
                status = VALUES(status)
            `;

            db.query(sql, [employee_id, period_start, period_end, gross_amount, deductions || 0, net_amount, status || 'Pending'], callback);
        });
    }

    // Get salary slips for an employee
    static getByEmployee(employeeId, callback) {
        const sql = `
            SELECT ss.*, 
            e.name as employee_name,
            MONTH(ss.period_start) as month, 
            YEAR(ss.period_start) as year,
            (ss.net_amount - IFNULL((SELECT SUM(amount) FROM salary_payments WHERE salary_slip_id = ss.id), 0)) as balance
            FROM salary_slips ss
            JOIN employees e ON ss.employee_id = e.id
            WHERE ss.employee_id = ? 
            ORDER BY ss.period_start DESC
        `;
        db.query(sql, [employeeId], callback);
    }

    // Get salary slip by ID
    static getById(id, callback) {
        const sql = `
            SELECT ss.*, 
            e.name as employee_name,
            MONTH(ss.period_start) as month, 
            YEAR(ss.period_start) as year,
            (ss.net_amount - IFNULL((SELECT SUM(amount) FROM salary_payments WHERE salary_slip_id = ss.id), 0)) as balance
            FROM salary_slips ss
            JOIN employees e ON ss.employee_id = e.id
            WHERE ss.id = ?
        `;
        db.query(sql, [id], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0] || null);
        });
    }

    // Get salary slips for a project (complex because slips are period-wide)
    // We'll fetch slips for employees who have attendance in this project for the selected period
    static getByProject(projectId, month, year, callback) {
        const period_start = `${year}-${String(month).padStart(2, '0')}-01`;
        const period_end = new Date(year, month, 0).toISOString().split('T')[0];

        const sql = `
            SELECT ss.*, 
            e.name as employee_name,
            MONTH(ss.period_start) as month, 
            YEAR(ss.period_start) as year,
            (ss.net_amount - IFNULL((SELECT SUM(amount) FROM salary_payments WHERE salary_slip_id = ss.id), 0)) as balance
            FROM salary_slips ss
            JOIN employees e ON ss.employee_id = e.id
            WHERE ss.period_start = ? AND ss.period_end = ?
            AND ss.employee_id IN (
                SELECT DISTINCT employee_id 
                FROM attendance 
                WHERE project_id = ? AND attendance_date BETWEEN ? AND ?
            )
        `;
        db.query(sql, [period_start, period_end, projectId, period_start, period_end], callback);
    }

    // Update salary slip status
    static updateStatus(id, status, callback) {
        const sql = 'UPDATE salary_slips SET status = ? WHERE id = ?';
        db.query(sql, [status, id], callback);
    }
}

module.exports = SalarySlip;
