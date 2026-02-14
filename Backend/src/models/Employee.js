const db = require('../config/database');

class Employee {
    // Get all employees with project information
    static getAll(callback) {
        const sql = `
      SELECT e.*, p.project_name 
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      ORDER BY e.name ASC
    `;
        db.query(sql, callback);
    }

    // Get employee by ID with project information
    static getById(id, callback) {
        const sql = `
      SELECT e.*, p.project_name 
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      WHERE e.id = ?
    `;
        db.query(sql, [id], callback);
    }

    // Get employees by project ID
    static getByProject(projectId, callback) {
        const sql = `
      SELECT e.*, p.project_name 
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      WHERE e.project_id = ?
      ORDER BY e.name ASC
    `;
        db.query(sql, [projectId], callback);
    }

    // Create new employee
    static create(employeeData, callback) {
        const {
            name, designation, department, phone, email,
            joining_date, salary, status, project_id,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image
        } = employeeData;

        const sql = `INSERT INTO employees 
      (name, designation, department, phone, email, joining_date, salary, status, project_id, 
       bank_name, account_number, ifsc_code, employment_type, aadhaar_number, pan_number, profile_image) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            name, designation, department, phone, email,
            joining_date, salary, status || 'Active', project_id || null,
            bank_name, account_number, ifsc_code,
            employment_type || 'Monthly', aadhaar_number, pan_number, profile_image
        ];

        db.query(sql, values, callback);
    }

    // Update employee
    static update(id, employeeData, callback) {
        const {
            name, designation, department, phone, email,
            joining_date, salary, status, project_id,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image
        } = employeeData;

        const sql = `UPDATE employees SET 
      name = ?, designation = ?, department = ?, phone = ?, email = ?, 
      joining_date = ?, salary = ?, status = ?, project_id = ?,
      bank_name = ?, account_number = ?, ifsc_code = ?,
      employment_type = ?, aadhaar_number = ?, pan_number = ?, profile_image = ?
      WHERE id = ?`;

        const values = [
            name, designation, department, phone, email,
            joining_date, salary, status, project_id || null,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image, id
        ];

        db.query(sql, values, callback);
    }

    // Delete employee
    static delete(id, callback) {
        const sql = 'DELETE FROM employees WHERE id = ?';
        db.query(sql, [id], callback);
    }
}

module.exports = Employee;
