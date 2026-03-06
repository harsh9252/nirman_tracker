const db = require('../config/database');

class MaterialRequest {
  static create(data, callback) {
    const query = `
      INSERT INTO material_requests (
        project_id, material_name, quantity, unit, 
        request_date, requested_by, assigned_to, priority, description
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      data.project_id,
      data.material_name,
      data.quantity,
      data.unit || null,
      data.request_date,
      data.requested_by,
      data.assigned_to || null,
      data.priority || 'Medium',
      data.description || null
    ];

    db.query(query, values, callback);
  }

  static findByProjectId(projectId, callback) {
    const query = `
      SELECT 
        mr.*, 
        p.project_name,
        u1.first_name, u1.last_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as assigned_to_name
      FROM material_requests mr
      LEFT JOIN projects p ON mr.project_id = p.id
      LEFT JOIN users u1 ON mr.requested_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      WHERE mr.project_id = ? 
      ORDER BY mr.request_date DESC, mr.created_at DESC
    `;
    db.query(query, [projectId], callback);
  }

  static findByAssigneeId(userId, callback) {
    const query = `
      SELECT 
        mr.*, 
        p.project_name,
        u1.first_name, u1.last_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as assigned_to_name
      FROM material_requests mr
      LEFT JOIN projects p ON mr.project_id = p.id
      LEFT JOIN users u1 ON mr.requested_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      WHERE mr.assigned_to = ? 
      ORDER BY mr.request_date DESC, mr.created_at DESC
    `;
    db.query(query, [userId], callback);
  }

  static findAllPending(callback) {
    const query = `
      SELECT 
        mr.*, 
        p.project_name,
        u1.first_name, u1.last_name,
        CONCAT(u2.first_name, ' ', u2.last_name) as assigned_to_name
      FROM material_requests mr
      LEFT JOIN projects p ON mr.project_id = p.id
      LEFT JOIN users u1 ON mr.requested_by = u1.id
      LEFT JOIN users u2 ON mr.assigned_to = u2.id
      WHERE mr.status = 'Pending'
      ORDER BY mr.request_date DESC, mr.created_at DESC
    `;
    db.query(query, [], callback);
  }

  static findById(id, callback) {
    const query = 'SELECT * FROM material_requests WHERE id = ?';
    db.query(query, [id], (err, results) => {
      if (err) return callback(err);
      callback(null, results[0]);
    });
  }

  static updateStatus(id, status, callback) {
    const query = 'UPDATE material_requests SET status = ? WHERE id = ?';
    db.query(query, [status, id], callback);
  }

  static delete(id, callback) {
    const query = 'DELETE FROM material_requests WHERE id = ?';
    db.query(query, [id], callback);
  }
}

module.exports = MaterialRequest;
