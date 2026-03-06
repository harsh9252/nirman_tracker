const db = require('../config/database');

class SalaryType {
    // Get all salary types
    static getAll(callback) {
        const sql = 'SELECT * FROM salary_types ORDER BY id ASC';
        db.query(sql, callback);
    }

    // Get salary type by ID
    static getById(id, callback) {
        const sql = 'SELECT * FROM salary_types WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

module.exports = SalaryType;
