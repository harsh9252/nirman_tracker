const db = require('../config/database');

class Comment {
  // Get all comments for a specific task
  static getByTaskId(taskId, callback) {
    const sql = `
      SELECT
        c.id, c.task_id, c.user_id, c.comment as message, c.parent_comment_id, c.created_at, c.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as userName,
        u.username,
        parent.comment as parentMessage
      FROM taskcomments c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN taskcomments parent ON c.parent_comment_id = parent.id
      WHERE c.task_id = ?
      ORDER BY c.created_at ASC
    `;
    db.query(sql, [taskId], callback);
  }

  // Get comment by ID
  static getById(id, callback) {
    const sql = `
      SELECT
        c.id, c.task_id, c.user_id, c.comment as message, c.parent_comment_id, c.created_at, c.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as userName,
        u.username
      FROM taskcomments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.id = ?
    `;
    db.query(sql, [id], callback);
  }

  // Create new comment
  static create(commentData, callback) {
    const { task_id, user_id, message, parent_comment_id } = commentData;

    const sql = `INSERT INTO taskcomments (task_id, user_id, comment, parent_comment_id, updated_at) VALUES (?, ?, ?, ?, NOW())`;
    const values = [task_id, user_id, message, parent_comment_id || null];

    db.query(sql, values, callback);
  }

  // Update comment
  static update(id, commentData, callback) {
    const { message } = commentData;

    const sql = `UPDATE taskcomments SET comment = ?, updated_at = NOW() WHERE id = ?`;
    const values = [message, id];

    db.query(sql, values, callback);
  }

  // Delete comment
  static delete(id, callback) {
    const sql = 'DELETE FROM taskcomments WHERE id = ?';
    db.query(sql, [id], callback);
  }

  // Get replies for a comment
  static getReplies(commentId, callback) {
    const sql = `
      SELECT
        c.id, c.task_id, c.user_id, c.comment as message, c.parent_comment_id, c.created_at, c.updated_at,
        CONCAT(u.first_name, ' ', u.last_name) as userName,
        u.username
      FROM taskcomments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.parent_comment_id = ?
      ORDER BY c.created_at ASC
    `;
    db.query(sql, [commentId], callback);
  }

  // Delete all comments for a task (when task is deleted)
  static deleteByTaskId(taskId, callback) {
    const sql = 'DELETE FROM taskcomments WHERE task_id = ?';
    db.query(sql, [taskId], callback);
  }
}

module.exports = Comment;
