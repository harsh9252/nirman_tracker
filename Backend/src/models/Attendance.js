const db = require('../config/database');

class Attendance {
    // Record or update attendance
    static record(data, callback) {
        const { employee_id, project_id, attendance_date, status, shift_hours, notes } = data;
        const sql = `
            INSERT INTO attendance (employee_id, project_id, attendance_date, status, shift_hours, notes)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
            status = VALUES(status),
            shift_hours = VALUES(shift_hours),
            notes = VALUES(notes)
        `;
        const values = [employee_id, project_id, attendance_date, status, shift_hours || 8.00, notes || null];
        db.query(sql, values, callback);
    }

    // Get attendance for a project on a specific date
    static getByProjectAndDate(projectId, date, callback) {
        const sql = `
            SELECT a.*, e.name as employee_name 
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.project_id = ? AND a.attendance_date = ?
        `;
        db.query(sql, [projectId, date], callback);
    }

    // Get attendance for a project within a date range
    static getByProjectAndRange(projectId, startDate, endDate, callback) {
        const sql = `
            SELECT a.*, e.name as employee_name, e.designation, e.phone, e.email, e.salary, e.employment_type
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.project_id = ? AND a.attendance_date BETWEEN ? AND ?
            ORDER BY a.attendance_date DESC, e.name ASC
        `;
        db.query(sql, [projectId, startDate, endDate], callback);
    }

    // Get attendance stats/summary for a project in a period
    static getSummaryByProject(projectId, startDate, endDate, callback) {
        const sql = `
            SELECT 
                e.id as employee_id, 
                e.name as employee_name,
                COUNT(CASE WHEN a.status = 'Present' THEN 1 END) as present_days,
                COUNT(CASE WHEN a.status = 'Absent' THEN 1 END) as absent_days,
                COUNT(CASE WHEN a.status = 'Half Day' THEN 1 END) as half_days,
                SUM(a.shift_hours) as total_hours
            FROM employees e
            LEFT JOIN attendance a ON e.id = a.employee_id AND a.project_id = ? AND a.attendance_date BETWEEN ? AND ?
            WHERE e.project_id = ?
            GROUP BY e.id
        `;
        db.query(sql, [projectId, startDate, endDate, projectId], callback);
    }

    // Get consecutive absences for reporting
    static getConsecutiveAbsences(projectId, limit = 3, callback) {
        // This is a more complex query, for now we will implement basic history in controller
        // and add specialized logic later if needed.
        const sql = `
            SELECT a.*, e.name as employee_name
            FROM attendance a
            JOIN employees e ON a.employee_id = e.id
            WHERE a.project_id = ? AND a.status = 'Absent'
            ORDER BY a.employee_id, a.attendance_date DESC
        `;
        db.query(sql, [projectId], callback);
    }
}

module.exports = Attendance;
