const db = require('../config/database');

class EmployeeProjectRate {
    // Create or update a project-specific rate for an employee
    static upsert(data, callback) {
        const { employee_id, project_id, rate_type, rate, effective_from, effective_to } = data;
        const sql = `
            INSERT INTO employee_project_rates (employee_id, project_id, rate_type, rate, effective_from, effective_to)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            rate_type = VALUES(rate_type),
            rate = VALUES(rate),
            effective_to = VALUES(effective_to)
        `;
        db.query(sql, [employee_id, project_id, rate_type, rate, effective_from, effective_to || null], callback);
    }

    // Get rates for an employee
    static getByEmployee(employeeId, callback) {
        const sql = `
            SELECT r.*, p.project_name 
            FROM employee_project_rates r
            JOIN projects p ON r.project_id = p.id
            WHERE r.employee_id = ?
            ORDER BY r.effective_from DESC
        `;
        db.query(sql, [employeeId], callback);
    }

    // Get active rate for an employee at a specific project on a specific date
    static getActiveRate(employeeId, projectId, date, callback) {
        const sql = `
            SELECT * FROM employee_project_rates 
            WHERE employee_id = ? AND project_id = ? 
            AND effective_from <= ? 
            AND (effective_to IS NULL OR effective_to >= ?)
            ORDER BY effective_from DESC LIMIT 1
        `;
        db.query(sql, [employeeId, projectId, date, date], (err, results) => {
            if (err) return callback(err);
            callback(null, results[0] || null);
        });
    }

    // Delete a rate record
    static delete(id, callback) {
        const sql = 'DELETE FROM employee_project_rates WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

module.exports = EmployeeProjectRate;
