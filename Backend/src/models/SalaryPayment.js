const db = require('../config/database');

class SalaryPayment {
    // Record a new salary payment
    static record(data, callback) {
        const { salary_slip_id, employee_id, amount, payment_date, payment_method, transaction_reference, notes } = data;

        const sql = `
            INSERT INTO salary_payments (salary_slip_id, employee_id, amount, payment_date, payment_method, transaction_reference, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.query(sql, [salary_slip_id, employee_id, amount, payment_date, payment_method, transaction_reference || null, notes || null], (err, result) => {
            if (err) return callback(err);

            // Check if total payments match net amount to update slip status
            const checkSql = `
                SELECT ss.net_amount, SUM(sp.amount) as total_paid
                FROM salary_slips ss
                LEFT JOIN salary_payments sp ON ss.id = sp.salary_slip_id
                WHERE ss.id = ?
                GROUP BY ss.id
            `;

            db.query(checkSql, [salary_slip_id], (err2, results) => {
                if (!err2 && results.length > 0) {
                    const { net_amount, total_paid } = results[0];
                    let newStatus = 'Pending';
                    if (total_paid >= net_amount) {
                        newStatus = 'Paid';
                    } else if (total_paid > 0) {
                        newStatus = 'Partial';
                    }
                    db.query('UPDATE salary_slips SET status = ? WHERE id = ?', [newStatus, salary_slip_id]);
                }
                callback(null, result);
            });
        });
    }

    // Get payments for an employee
    static getByEmployee(employeeId, callback) {
        const sql = 'SELECT * FROM salary_payments WHERE employee_id = ? ORDER BY payment_date DESC';
        db.query(sql, [employeeId], callback);
    }

    // Get payments for a salary slip
    static getBySalarySlip(salarySlipId, callback) {
        const sql = 'SELECT * FROM salary_payments WHERE salary_slip_id = ? ORDER BY payment_date DESC';
        db.query(sql, [salarySlipId], callback);
    }
}

module.exports = SalaryPayment;
