const db = require('../config/database');

class Attendance {
    // Record or update attendance with rate snapshot
    static record(data, callback) {
        const { employee_id, project_id, attendance_date, status, shift_hours, check_in_time, check_out_time, notes } = data;

        // 1. Fetch the active rate (Site-specific override first, then base employee rate)
        const rateSql = `
            SELECT 
                COALESCE(r.rate, e.salary) as rate,
                COALESCE(r.rate_type, st.name) as type_name
            FROM employees e
            LEFT JOIN salary_types st ON e.salary_type_id = st.id
            LEFT JOIN employee_project_rates r ON e.id = r.employee_id 
                AND r.project_id = ? 
                AND r.effective_from <= ? 
                AND (r.effective_to IS NULL OR r.effective_to >= ?)
            WHERE e.id = ?
            ORDER BY r.effective_from DESC LIMIT 1
        `;

        db.query(rateSql, [project_id, attendance_date, attendance_date, employee_id], (err, rateResults) => {
            if (err) return callback(err);

            const rateData = rateResults[0] || { rate: 0, type_name: 'Monthly' };
            const applied_rate = rateData.rate;
            const hours = shift_hours || 8.00;

            // 2. Calculate amount based on rate type
            let calculated_amount = 0;
            if (status === 'Absent') {
                calculated_amount = 0;
            } else if (rateData.type_name === 'Hourly') {
                calculated_amount = hours * applied_rate;
            } else if (rateData.type_name === 'Daily') {
                calculated_amount = (hours / 8.00) * applied_rate; // Assuming 8h is standard day
            } else {
                // Monthly or other - split shifts for monthly are usually prorated per day
                calculated_amount = (hours / 8.00) * (applied_rate / 30); // Very rough daily estimate for monthly
            }

            const sql = `
                INSERT INTO attendance (
                    employee_id, project_id, attendance_date, status, shift_hours, 
                    check_in_time, check_out_time, applied_rate, calculated_amount, notes
                )
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                status = VALUES(status),
                shift_hours = VALUES(shift_hours),
                check_in_time = VALUES(check_in_time),
                check_out_time = VALUES(check_out_time),
                applied_rate = VALUES(applied_rate),
                calculated_amount = VALUES(calculated_amount),
                notes = VALUES(notes)
            `;

            const values = [
                employee_id, project_id, attendance_date, status, hours,
                check_in_time || null, check_out_time || null,
                applied_rate, calculated_amount, notes || null
            ];

            db.query(sql, values, callback);
        });
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
