const Comment = require('../models/Comment');
const Notification = require('../models/Notification');
const db = require('../config/database');

class CommentController {
  // Get all comments for a specific task
  static getCommentsByTask(req, res) {
    const { taskId } = req.params;

    if (!taskId || isNaN(taskId)) {
      return res.status(400).json({ error: 'Valid task ID is required' });
    }

    Comment.getByTaskId(taskId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Format the results to group comments and replies
      const comments = [];
      const commentMap = new Map();

      results.forEach(row => {
        if (!row.parent_comment_id) {
          // Main comment
          const comment = {
            id: row.id,
            task_id: row.task_id,
            user_id: row.user_id,
            userName: row.userName,
            username: row.username,
            message: row.message,
            created_at: row.created_at,
            updated_at: row.updated_at,
            replies: []
          };
          comments.push(comment);
          commentMap.set(row.id, comment);
        } else {
          // Reply
          const reply = {
            id: row.id,
            task_id: row.task_id,
            user_id: row.user_id,
            userName: row.userName,
            username: row.username,
            message: row.message,
            parent_comment_id: row.parent_comment_id,
            created_at: row.created_at,
            updated_at: row.updated_at
          };

          const parentComment = commentMap.get(row.parent_comment_id);
          if (parentComment) {
            parentComment.replies.push(reply);
          }
        }
      });

      res.json(comments);
    });
  }

  // Create new comment
  static createComment(req, res) {
    const { task_id, message, parent_comment_id } = req.body;
    const user_id = req.user?.id; // Assuming auth middleware sets req.user

    if (!task_id || !message || !user_id) {
      return res.status(400).json({ error: 'Task ID, message, and user authentication are required' });
    }

    const commentData = {
      task_id,
      user_id,
      message: message.trim(),
      parent_comment_id: parent_comment_id || null
    };

    Comment.create(commentData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      // Get the created comment with user info
      Comment.getById(result.insertId, (err2, results) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        const comment = results[0];

        // Emit real-time comment event to task room
        if (global.io) {
          global.io.to(`task_${task_id}`).emit('new-comment', {
            comment: {
              id: comment.id,
              task_id: comment.task_id,
              user_id: comment.user_id,
              userName: comment.userName,
              username: comment.username,
              message: comment.message,
              parent_comment_id: comment.parent_comment_id,
              created_at: comment.created_at,
              updated_at: comment.updated_at,
              replies: []
            },
            taskId: task_id
          });
        }

        // Create notifications for users assigned to this task (except the commenter)
        const sql = `
          SELECT t.name as taskName, t.assignBy, t.assignTo,
                 u1.first_name as assignByFirstName, u1.last_name as assignByLastName,
                 u2.first_name as assignToFirstName, u2.last_name as assignToLastName
          FROM tasks t
          LEFT JOIN users u1 ON t.assignBy = u1.id
          LEFT JOIN users u2 ON t.assignTo = u2.id
          WHERE t.id = ?
        `;

        db.query(sql, [task_id], (err3, taskResults) => {
          if (!err3 && taskResults.length > 0) {
            const task = taskResults[0];
            const usersToNotify = [];

            // Add task creator if different from commenter
            if (task.assignBy && task.assignBy !== user_id) {
              usersToNotify.push({
                user_id: task.assignBy,
                userName: `${task.assignByFirstName} ${task.assignByLastName}`.trim()
              });
            }

            // Add task assignee if different from commenter
            if (task.assignTo && task.assignTo !== user_id) {
              usersToNotify.push({
                user_id: task.assignTo,
                userName: `${task.assignToFirstName} ${task.assignToLastName}`.trim()
              });
            }

            // Create notifications for each user
            usersToNotify.forEach(user => {
              const notificationData = {
                user_id: user.user_id,
                title: `New comment on task: ${task.taskName}`,
                message: `${comment.userName} commented: "${comment.message.length > 50 ? comment.message.substring(0, 50) + '...' : comment.message}"`,
                type: 'comment',
                related_id: task_id,
                assignByName: comment.userName,
                is_read: false,
                created_at: new Date()
              };

              Notification.create(notificationData, (err4, result) => {
                if (!err4 && global.io) {
                  // Emit notification to the user
                  global.io.to(`user_${user.user_id}`).emit('new-notification', {
                    notification: {
                      id: result.insertId,
                      ...notificationData
                    },
                    unreadCount: 1
                  });
                }
              });
            });
          }
        });

        res.status(201).json({
          id: comment.id,
          task_id: comment.task_id,
          user_id: comment.user_id,
          userName: comment.userName,
          username: comment.username,
          message: comment.message,
          parent_comment_id: comment.parent_comment_id,
          created_at: comment.created_at,
          updated_at: comment.updated_at
        });
      });
    });
  }

  // Update comment
  static updateComment(req, res) {
    const { id } = req.params;
    const { message } = req.body;
    const user_id = req.user?.id;

    if (!message || !user_id) {
      return res.status(400).json({ error: 'Message and user authentication are required' });
    }

    // First check if the comment belongs to the user
    Comment.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const comment = results[0];
      if (comment.user_id !== user_id) {
        return res.status(403).json({ error: 'You can only edit your own comments' });
      }

      Comment.update(id, { message: message.trim() }, (err2, result) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        res.json({ message: 'Comment updated successfully' });
      });
    });
  }

  // Delete comment
  static deleteComment(req, res) {
    const { id } = req.params;
    const user_id = req.user?.id;

    if (!user_id) {
      return res.status(401).json({ error: 'User authentication required' });
    }

    // First check if the comment belongs to the user
    Comment.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Comment not found' });
      }

      const comment = results[0];
      if (comment.user_id !== user_id) {
        return res.status(403).json({ error: 'You can only delete your own comments' });
      }

      Comment.delete(id, (err2, result) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Comment not found' });
        }

        res.json({ message: 'Comment deleted successfully' });
      });
    });
  }

  // Get replies for a specific comment
  static getCommentReplies(req, res) {
    const { commentId } = req.params;

    if (!commentId || isNaN(commentId)) {
      return res.status(400).json({ error: 'Valid comment ID is required' });
    }

    Comment.getReplies(commentId, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      res.json(results);
    });
  }
}

module.exports = CommentController;
