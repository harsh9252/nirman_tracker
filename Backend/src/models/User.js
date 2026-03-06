const db = require('../config/database');

class User {
  // === AUTHENTICATION METHODS ===

  // Get user by ID (for auth)
  static getById(id, callback) {
    const sql = 'SELECT id, first_name, last_name, email, username, created_at FROM users WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Get full user profile by ID (for profile page)
  static getFullProfileById(id, callback) {
    const sql = 'SELECT id, first_name, last_name, email, username, phone, role, status, profile_image, created_at, is_temp_password, permissions FROM users WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Get user by email or phone (for login)
  static getByIdentifier(identifier, callback) {
    // Check if identifier looks like a phone number (10 digits)
    const isPhoneNumber = /^\d{10}$/.test(identifier);

    let sql;
    let values;

    if (isPhoneNumber) {
      // If it's a 10-digit number, check phone field
      sql = 'SELECT * FROM users WHERE phone = ?';
      values = [identifier];
    } else {
      // Assume it's email, check email and phone (in case phone is stored as email format, but unlikely)
      sql = 'SELECT * FROM users WHERE email = ? OR phone = ?';
      values = [identifier, identifier];
    }

    db.query(sql, values, callback);
  }

  // Check if user exists (for auth)
  static checkExists(email, username, callback) {
    const sql = 'SELECT id FROM users WHERE email = ? OR username = ?';
    db.query(sql, [email, username], callback);
  }

  // Create new user (basic auth)
  static create(userData, callback) {
    const { firstName, lastName, email, username, password } = userData;
    const sql = `INSERT INTO users (first_name, last_name, email, username, password) VALUES (?, ?, ?, ?, ?)`;
    const values = [firstName, lastName, email, username, password];
    db.query(sql, values, callback);
  }

  // Update user password
  static updatePassword(id, hashedPassword, callback) {
    const sql = 'UPDATE users SET password = ? WHERE id = ?';
    db.query(sql, [hashedPassword, id], callback);
  }

  // === USER MANAGEMENT METHODS ===

  // Get all users (for user management) - exclude soft deleted users
  static getAll(callback) {
    const sql = `SELECT id, first_name, last_name, email, phone, username, role, status, created_at, is_temp_password, password, permissions
             FROM users
             WHERE status != 'Deleted'
             ORDER BY created_at DESC`;
    db.query(sql, callback);
  }

  // Get user by email, username, or phone for login (management version with more fields)
  static getByEmailOrUsername(identifier, callback) {
    // Check if identifier looks like a phone number (10 digits)
    const isPhoneNumber = /^\d{10}$/.test(identifier);

    let sql;
    let values;

    if (isPhoneNumber) {
      // If it's a 10-digit number, check phone field
      sql = `SELECT id, first_name, last_name, email, username, password, role, status, is_temp_password
             FROM users WHERE phone = ?`;
      values = [identifier];
    } else {
      // For username/email, check all three fields
      sql = `SELECT id, first_name, last_name, email, username, password, role, status, is_temp_password
             FROM users WHERE email = ? OR username = ? OR phone = ?`;
      values = [identifier, identifier, identifier];
    }

    db.query(sql, values, callback);
  }

  // Create new user - plain text password (management version)
  static createManagement(userData, callback) {
    const { first_name, last_name, email, username, password, role, status, phone, permissions } = userData;

    const sql = `INSERT INTO users (first_name, last_name, email, phone, username, password, role, status, is_temp_password, permissions)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;
    const values = [first_name, last_name, email, phone, username, password, role || 'Field', status || 'Active', 1, permissionsJson];
    db.query(sql, values, callback);
  }

  // Update user - plain text password (management version)
  static update(id, userData, callback) {
    const { first_name, last_name, email, phone, role, status, profile_image, permissions } = userData;

    // Proceed with update (task validation is now done in controller)
    const sql = `UPDATE users SET first_name = ?, last_name = ?, email = ?, phone = ?, role = ?, status = ?, profile_image = ?, permissions = ?
             WHERE id = ?`;
    const permissionsJson = permissions ? JSON.stringify(permissions) : null;
    const values = [first_name, last_name, email, phone, role, status, profile_image, permissionsJson, id];
    db.query(sql, values, callback);
  }

  // Check only tasks assigned TO this user (for deactivation validation)
  static checkAssignedToTasks(id, callback) {
    const sql = `
      SELECT t.id, t.name, t.status, t.dueDate,
             CONCAT(u.first_name, ' ', u.last_name) as assignedBy
      FROM tasks t
      LEFT JOIN users u ON t.assignBy = u.id
      WHERE t.assignTo = ? AND t.status != 'Completed'
    `;
    db.query(sql, [id], callback);
  }

  // Check if user has assigned tasks or is assigned tasks
  static checkTaskRelationships(id, callback) {
    // Check tasks assigned TO this user (pending/incomplete)
    const assignedToSql = `
      SELECT t.id, t.name, t.status, t.dueDate,
             CONCAT(u.first_name, ' ', u.last_name) as assignedBy
      FROM tasks t
      LEFT JOIN users u ON t.assignBy = u.id
      WHERE t.assignTo = ? AND LOWER(t.status) NOT IN ('completed', 'done', 'finished')
    `;

    // Check tasks assigned BY this user (pending/incomplete)
    const assignedBySql = `
      SELECT t.id, t.name, t.status, t.dueDate,
             CONCAT(u.first_name, ' ', u.last_name) as assignedTo
      FROM tasks t
      LEFT JOIN users u ON t.assignTo = u.id
      WHERE t.assignBy = ? AND LOWER(t.status) NOT IN ('completed', 'done', 'finished')
    `;

    // Run both queries
    db.query(assignedToSql, [id], (err1, assignedToResults) => {
      if (err1) return callback(err1, null);

      db.query(assignedBySql, [id], (err2, assignedByResults) => {
        if (err2) return callback(err2, null);

        const taskRelationships = {
          assignedTo: assignedToResults || [],
          assignedBy: assignedByResults || []
        };

        callback(null, taskRelationships);
      });
    });
  }

  // Check if user has any incomplete tasks (simplified for delete/inactive operations)
  static checkUserIncompleteTasks(userId, callback) {
    const sql = `
      SELECT
        t.id,
        t.name,
        t.status,
        t.dueDate,
        CASE
          WHEN t.assignTo = ? THEN CONCAT(u1.first_name, ' ', u1.last_name)
          WHEN t.assignBy = ? THEN CONCAT(u2.first_name, ' ', u2.last_name)
        END as assignedBy,
        CASE
          WHEN t.assignTo = ? THEN 'assigned_to_you'
          WHEN t.assignBy = ? THEN 'assigned_by_you'
        END as taskType
      FROM tasks t
      LEFT JOIN users u1 ON t.assignBy = u1.id
      LEFT JOIN users u2 ON t.assignTo = u2.id
      WHERE (t.assignTo = ? OR t.assignBy = ?)
      AND LOWER(TRIM(t.status)) != 'completed'
      ORDER BY t.dueDate ASC
    `;
    db.query(sql, [userId, userId, userId, userId, userId, userId], callback);
  }

  // Hard delete user
  static delete(id, callback) {
    // Delete notifications first
    const deleteNotificationsSql = 'DELETE FROM notifications WHERE user_id = ?';

    db.query(deleteNotificationsSql, [id], (deleteNotifErr, deleteNotifResult) => {
      if (deleteNotifErr) return callback(deleteNotifErr, null);

      // Hard delete: Remove user record from database
      const deleteUserSql = "DELETE FROM users WHERE id = ?";
      db.query(deleteUserSql, [id], callback);
    });
  }

  // Check if email exists
  static checkEmailExists(email, excludeId, callback) {
    let sql = "SELECT id FROM users WHERE email = ? AND status != 'Deleted'";
    let values = [email];

    if (excludeId) {
      sql += ' AND id != ?';
      values.push(excludeId);
    }

    db.query(sql, values, callback);
  }

  // Check if username exists
  static checkUsernameExists(username, excludeId, callback) {
    let sql = "SELECT id FROM users WHERE username = ? AND status != 'Deleted'";
    let values = [username];

    if (excludeId) {
      sql += ' AND id != ?';
      values.push(excludeId);
    }

    db.query(sql, values, callback);
  }

  // Check if phone exists
  static checkPhoneExists(phone, excludeId, callback) {
    let sql = "SELECT id FROM users WHERE phone = ? AND status != 'Deleted'";
    let values = [phone];

    if (excludeId) {
      sql += ' AND id != ?';
      values.push(excludeId);
    }

    db.query(sql, values, callback);
  }
}

module.exports = User;
