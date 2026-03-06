const db = require('../config/database');

class Employee {
    // Get all employees with project information
    static getAll(callback) {
        const sql = `
      SELECT e.*, p.project_name, st.name as salary_type_name
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      LEFT JOIN salary_types st ON e.salary_type_id = st.id
      ORDER BY e.name ASC
    `;
        db.query(sql, callback);
    }

    // Get employee by ID with project information
    static getById(id, callback) {
        const sql = `
      SELECT e.*, p.project_name, st.name as salary_type_name
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      LEFT JOIN salary_types st ON e.salary_type_id = st.id
      WHERE e.id = ?
    `;
        db.query(sql, [id], callback);
    }

    // Get employees by project ID
    static getByProject(projectId, callback) {
        const sql = `
      SELECT e.*, p.project_name, st.name as salary_type_name
      FROM employees e 
      LEFT JOIN projects p ON e.project_id = p.id 
      LEFT JOIN salary_types st ON e.salary_type_id = st.id
      WHERE e.project_id = ?
      ORDER BY e.name ASC
    `;
        db.query(sql, [projectId], callback);
    }

    // Create new employee/party
    static create(employeeData, callback) {
        const {
            name, designation, department, phone, email,
            joining_date, salary, status, project_id,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image,
            party_type, party_id_custom, father_name, address,
            pf_number, uan_number, esi_number, salary_period,
            shift_hours, shift_period, overtime_amount, overtime_period,
            cost_code, salary_calculation_method, salary_type_id, role
        } = employeeData;

        const sql = `INSERT INTO employees 
      (name, designation, department, phone, email, joining_date, salary, status, project_id, 
       bank_name, account_number, ifsc_code, employment_type, aadhaar_number, pan_number, profile_image,
       party_type, party_id_custom, father_name, address,
       pf_number, uan_number, esi_number, salary_period,
       shift_hours, shift_period, overtime_amount, overtime_period,
       cost_code, salary_calculation_method, salary_type_id, role) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

        const values = [
            name, designation, department, phone, email,
            joining_date, salary, status || 'Active', project_id || null,
            bank_name, account_number, ifsc_code,
            employment_type || 'Monthly', aadhaar_number, pan_number, profile_image,
            party_type || 'Worker', party_id_custom, father_name, address,
            pf_number, uan_number, esi_number, salary_period,
            shift_hours, shift_period, overtime_amount, overtime_period,
            cost_code, salary_calculation_method,
            salary_type_id || 1, // Default to Monthly
            role || 'Employee'
        ];

        db.query(sql, values, callback);
    }

    // Update employee/party
    static update(id, employeeData, callback) {
        const {
            name, designation, department, phone, email,
            joining_date, salary, status, project_id,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image,
            party_type, party_id_custom, father_name, address,
            pf_number, uan_number, esi_number, salary_period,
            shift_hours, shift_period, overtime_amount, overtime_period,
            cost_code, salary_calculation_method, salary_type_id, role
        } = employeeData;

        const sql = `UPDATE employees SET 
      name = ?, designation = ?, department = ?, phone = ?, email = ?, 
      joining_date = ?, salary = ?, status = ?, project_id = ?,
      bank_name = ?, account_number = ?, ifsc_code = ?,
      employment_type = ?, aadhaar_number = ?, pan_number = ?, profile_image = ?,
      party_type = ?, party_id_custom = ?, father_name = ?, address = ?,
      pf_number = ?, uan_number = ?, esi_number = ?, salary_period = ?,
      shift_hours = ?, shift_period = ?, overtime_amount = ?, overtime_period = ?,
      cost_code = ?, salary_calculation_method = ?, salary_type_id = ?, role = ?
      WHERE id = ?`;

        const values = [
            name, designation, department, phone, email,
            joining_date, salary, status, project_id || null,
            bank_name, account_number, ifsc_code,
            employment_type, aadhaar_number, pan_number, profile_image,
            party_type, party_id_custom, father_name, address,
            pf_number, uan_number, esi_number, salary_period,
            shift_hours, shift_period, overtime_amount, overtime_period,
            cost_code, salary_calculation_method,
            salary_type_id || 1,
            role || 'Employee',
            id
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
