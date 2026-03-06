const db = require('../config/database');
const Notification = require('./Notification'); // Import Notification model

class Task {
  // Get all tasks
  static getAll(callback) {
    const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        ORDER BY t.createdDate DESC
      `;
    db.query(sql, callback);
  }

  // Get task by ID
  static getById(id, callback) {
    const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        WHERE t.id = ?
      `;
    db.query(sql, [parseInt(id)], callback);
  }

  // Get tasks by project ID
  static getByProjectId(projectId, callback) {
    const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        WHERE t.project_id = ?
        ORDER BY t.createdDate DESC
      `;
    db.query(sql, [parseInt(projectId)], callback);
  }

  // Get tasks by lead ID
  static getByLeadId(leadId, callback) {
    const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        WHERE t.lead_id = ?
        ORDER BY t.createdDate DESC
      `;
    db.query(sql, [parseInt(leadId)], callback);
  }

  // Create new task
  static create(taskData, callback) {
    const {
      taskNumber,
      name,
      projectName,
      leadName,
      relatedTo,
      assignTo,
      assignBy,
      priority,
      status,
      dueDate,
      description,
      createdDate,
      project_id,
      lead_id,
      latitude,
      longitude
    } = taskData;

    const sql = `INSERT INTO tasks (taskNumber, name, projectName, leadName, relatedTo, assignTo, assignBy, priority, status, dueDate, description, createdDate, project_id, lead_id, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [
      taskNumber,
      name,
      projectName || null,
      leadName || null,
      relatedTo || null,
      assignTo,
      assignBy,
      priority || 'Medium',
      status,
      dueDate,
      description || null,
      createdDate,
      project_id || null,
      lead_id || null,
      latitude || null,
      longitude || null
    ];

    db.query(sql, values, (err, result) => {
      if (err) {
        return callback(err, null);
      }

      // Create notification for assigned user (if different from assigner)
      if (assignTo && assignTo !== assignBy) {
        const notificationData = {
          user_id: assignTo,
          title: 'New Task Assigned',
          message: `You have been assigned a new task: "${name}"`,
          type: 'task_assigned',
          related_id: result.insertId,
          is_read: false,
          created_at: new Date()
        };

        Notification.create(notificationData, (notifErr, notifResult) => {
          if (notifErr) {
            console.error('Error creating notification:', notifErr);
          } else {
            if (global.io) {
              Notification.getById(notifResult.insertId, (getErr, notifResults) => {
                if (!getErr && notifResults.length > 0) {
                  const notification = notifResults[0];
                  global.io.to(`user_${assignTo}`).emit('new-notification', {
                    notification: notification,
                    unreadCount: 1
                  });
                }
              });
            }
          }
          callback(null, result);
        });
      } else {
        callback(null, result);
      }
    });
  }

  // Update task
  static update(id, taskData, callback) {
    const {
      taskNumber,
      name,
      projectName,
      leadName,
      relatedTo,
      assignTo,
      assignBy,
      priority,
      status,
      dueDate,
      description,
      createdDate,
      project_id,
      lead_id,
      latitude,
      longitude
    } = taskData;

    const sql = `UPDATE tasks SET taskNumber=?, name=?, projectName=?, leadName=?, relatedTo=?, assignTo=?, assignBy=?, priority=?, status=?, dueDate=?, description=?, createdDate=?, project_id=?, lead_id=?, latitude=?, longitude=? WHERE id=?`;
    const values = [
      taskNumber,
      name,
      projectName || null,
      leadName || null,
      relatedTo || null,
      assignTo,
      assignBy,
      priority || 'Medium',
      status,
      dueDate,
      description || null,
      createdDate,
      project_id || null,
      lead_id || null,
      latitude || null,
      longitude || null,
      id
    ];

    db.query(sql, values, callback);
  }

  // Delete task
  static delete(id, callback) {
    const sql = 'DELETE FROM tasks WHERE id = ?';
    db.query(sql, [id], callback);
  }
}

module.exports = Task;
