const Task = require('../models/Task');
const db = require('../config/database');

class TaskController {
  // Get all tasks
  static getAllTasks(req, res) {
    const { user_id } = req.query;

    if (user_id) {
      // Filter tasks for the current user: tasks they created OR tasks assigned to them
      const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName,
          u1.status as assignByStatus,
          u2.status as assignToStatus
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        WHERE t.assignBy = ? OR t.assignTo = ?
        ORDER BY t.createdDate DESC
      `;

      db.query(sql, [user_id, user_id], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Ensure dates are properly formatted for consistent frontend handling
        const formattedResults = results.map(task => {
          if (task.createdDate) {
            task.createdDate = new Date(task.createdDate).toISOString();
          }
          if (task.dueDate) {
            task.dueDate = new Date(task.dueDate).toISOString();
          }
          return task;
        });

        res.json(formattedResults);
      });
    } else {
      // No user_id provided - return ALL tasks (for admin)
      const sql = `
        SELECT
          t.*,
          CONCAT(u1.first_name, ' ', u1.last_name) as assignByName,
          CONCAT(u2.first_name, ' ', u2.last_name) as assignToName,
          u1.status as assignByStatus,
          u2.status as assignToStatus
        FROM tasks t
        LEFT JOIN users u1 ON t.assignBy = u1.id
        LEFT JOIN users u2 ON t.assignTo = u2.id
        ORDER BY t.createdDate DESC
      `;

      db.query(sql, (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        // Ensure dates are properly formatted for consistent frontend handling
        const formattedResults = results.map(task => {
          if (task.createdDate) {
            task.createdDate = new Date(task.createdDate).toISOString();
          }
          if (task.dueDate) {
            task.dueDate = new Date(task.dueDate).toISOString();
          }
          return task;
        });

        res.json(formattedResults);
      });
    }
  }

  // Get task by ID
  static getTaskById(req, res) {
    const { id } = req.params;

    // Check if id is numeric (to avoid matching routes like 'next-number')
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid task ID' });
    }

    Task.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Ensure dates are properly formatted for consistent frontend handling
      const task = results[0];
      if (task.createdDate) {
        task.createdDate = new Date(task.createdDate).toISOString();
      }
      if (task.dueDate) {
        task.dueDate = new Date(task.dueDate).toISOString();
      }

      console.log('task record======>', task);
      res.json(task);
    });
  }

  // Create new task
  static createTask(req, res) {
    const taskData = req.body;

    Task.create(taskData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      // Get the created task with assignBy
      Task.getById(result.insertId, (err2, results) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        const newTask = results[0];

        // Emit real-time task creation event to ALL connected users
        if (global.io) {
          global.io.emit('task-created', {
            task: newTask,
            action: 'created'
          });
        }

        res.json(newTask);
      });
    });
  }

  // Update task
  static updateTask(req, res) {
    const { id } = req.params;
    const taskId = parseInt(id);
    const taskData = req.body;

    Task.update(taskId, taskData, (err, result) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      // Get the updated task with assignBy and assignTo names
      Task.getById(taskId, (err2, results) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        const updatedTask = results[0];

        // Emit real-time task update event to ALL connected users
        if (global.io) {
          global.io.emit('task-updated', {
            task: updatedTask,
            action: 'updated'
          });
        }

        res.json(updatedTask);
      });
    });
  }

  // Delete task (Admin only)
  static deleteTask(req, res) {
    const { id } = req.params;
    const currentUser = req.user;

    // Check if current user is admin
    if (!currentUser || currentUser.role?.toLowerCase() !== 'admin') {
      return res.status(403).json({
        error: 'Access denied',
        message: 'Only administrators can delete tasks. Regular users can only create tasks.'
      });
    }

    // First get the task details before deletion for socket events
    Task.getById(id, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      const taskToDelete = results[0];

      Task.delete(id, (err2, result) => {
        if (err2) {
          return res.status(500).json({ error: err2.message });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Delete related notifications for this task
        const Notification = require('../models/Notification');
        Notification.deleteByRelatedId(id, (err3, result3) => {
          // Ignore errors for notification deletion, task deletion is more important
          console.log(`Deleted ${result3?.affectedRows || 0} notifications for task ${id}`);
        });

        // Emit real-time task deletion event to ALL connected users
        if (global.io) {
          global.io.emit('task-deleted', {
            taskId: id,
            action: 'deleted'
          });
        }

        res.json({ message: 'Task deleted successfully' });
      });
    });
  }

  // Get next task number
  static getNextTaskNumber(req, res) {
    const sql = `SELECT MAX(CAST(SUBSTRING(taskNumber, 5) AS UNSIGNED)) as maxNumber FROM tasks`;

    db.query(sql, (err, results) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      const maxNumber = results[0].maxNumber || 10000; // Start from 10001 if no tasks exist
      const nextNumber = maxNumber + 1;
      const taskNumber = `TSK-${nextNumber.toString().padStart(5, '0')}`;

      res.json({ taskNumber });
    });
  }
}

module.exports = TaskController;
