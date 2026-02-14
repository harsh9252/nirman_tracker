const Notification = require('../models/Notification');
const pushNotificationService = require('../services/pushNotificationService');
const db = require('../config/database');

class NotificationController {
  // Get notifications for a user
  static getUserNotifications(req, res) {
    try {
      const userId = req.user.id; // From auth middleware

      Notification.getByUserId(userId, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ notifications: results });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Get unread notifications count for a user
  static getUnreadCount(req, res) {
    try {
      const userId = req.user.id; // From auth middleware

      Notification.getUnreadCount(userId, (err, results) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ count: results[0].count });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Mark notification as read
  static markAsRead(req, res) {
    try {
      const { id } = req.params;

      Notification.markAsRead(id, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification marked as read' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Mark all notifications as read for a user
  static markAllAsRead(req, res) {
    try {
      const userId = req.user.id; // From auth middleware

      Notification.markAllAsRead(userId, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        res.json({ message: 'All notifications marked as read' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Delete notification
  static deleteNotification(req, res) {
    try {
      const { id } = req.params;

      Notification.delete(id, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        if (result.affectedRows === 0) {
          return res.status(404).json({ error: 'Notification not found' });
        }

        res.json({ message: 'Notification deleted' });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Create notification (for internal use or admin)
  static createNotification(req, res) {
    try {
      const { user_id, title, message, type, related_id, assignByName } = req.body;

      if (!user_id || !title || !message || !type) {
        return res.status(400).json({ error: 'user_id, title, message, and type are required' });
      }

      // Special handling for comment notifications - only keep one per task
      if (type === 'comment_added' && related_id) {
        NotificationController.handleCommentNotification(user_id, title, message, type, related_id, assignByName, res);
        return;
      }

      const notificationData = {
        user_id,
        title,
        message,
        type,
        related_id,
        assignByName,
        is_read: false,
        created_at: new Date()
      };

      Notification.create(notificationData, (err, result) => {
        if (err) {
          return res.status(500).json({ error: 'Database error' });
        }

        // Get the created notification with all details
        Notification.getById(result.insertId, (err, notificationResult) => {
          if (!err && notificationResult.length > 0) {
            const notification = notificationResult[0];

            // Emit real-time notification to the specific user via Socket.IO
            if (global.io) {
              global.io.to(`user_${user_id}`).emit('new-notification', {
                notification: notification,
                unreadCount: 1 // This will be updated by the frontend
              });
            }

            // Send push notification to the user
            const pushData = {
              id: notification.id,
              title: notification.title,
              message: notification.message,
              type: notification.type,
              url: NotificationController.getNotificationUrl(notification)
            };

            // Send push notification asynchronously (don't wait for it)
            pushNotificationService.sendNotificationToUser(user_id, pushData)
              .catch(error => console.error('Error sending push notification:', error));
          }
        });

        res.status(201).json({
          message: 'Notification created',
          notificationId: result.insertId
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Server error' });
    }
  }

  // Handle comment notifications - only keep one per task
  static handleCommentNotification(user_id, title, message, type, related_id, assignByName, res) {
    // Check if there's already a comment notification for this task
    const checkSql = 'SELECT id FROM notifications WHERE user_id = ? AND type = ? AND related_id = ?';
    db.query(checkSql, [user_id, type, related_id], (err, results) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }

      if (results.length > 0) {
        // Update existing comment notification
        const existingId = results[0].id;
        const updateData = {
          title,
          message,
          assignByName,
          is_read: false,
          created_at: new Date()
        };

        Notification.update(existingId, updateData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Get the updated notification
          Notification.getById(existingId, (err, notificationResult) => {
            if (!err && notificationResult.length > 0) {
              const notification = notificationResult[0];

              // Emit real-time notification to the specific user via Socket.IO
              if (global.io) {
                global.io.to(`user_${user_id}`).emit('update-notification', {
                  notification: notification,
                  unreadCount: 1
                });
              }

              // Send push notification to the user
              const pushData = {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                url: NotificationController.getNotificationUrl(notification)
              };

              pushNotificationService.sendNotificationToUser(user_id, pushData)
                .catch(error => console.error('Error sending push notification:', error));
            }
          });

          res.status(200).json({
            message: 'Comment notification updated',
            notificationId: existingId
          });
        });
      } else {
        // Create new comment notification
        const notificationData = {
          user_id,
          title,
          message,
          type,
          related_id,
          assignByName,
          is_read: false,
          created_at: new Date()
        };

        Notification.create(notificationData, (err, result) => {
          if (err) {
            return res.status(500).json({ error: 'Database error' });
          }

          // Get the created notification with all details
          Notification.getById(result.insertId, (err, notificationResult) => {
            if (!err && notificationResult.length > 0) {
              const notification = notificationResult[0];

              // Emit real-time notification to the specific user via Socket.IO
              if (global.io) {
                global.io.to(`user_${user_id}`).emit('new-notification', {
                  notification: notification,
                  unreadCount: 1
                });
              }

              // Send push notification to the user
              const pushData = {
                id: notification.id,
                title: notification.title,
                message: notification.message,
                type: notification.type,
                url: NotificationController.getNotificationUrl(notification)
              };

              pushNotificationService.sendNotificationToUser(user_id, pushData)
                .catch(error => console.error('Error sending push notification:', error));
            }
          });

          res.status(201).json({
            message: 'Comment notification created',
            notificationId: result.insertId
          });
        });
      }
    });
  }

  // Helper method to get URL for notification based on type
  static getNotificationUrl(notification) {
    switch (notification.type) {
      case 'task_assigned':
      case 'task_updated':
      case 'task_completed':
        return `/my-tasks`;
      case 'lead_assigned':
      case 'lead_updated':
        return `/lead-management`;
      case 'comment_added':
        return `/task/${notification.related_id}`;
      default:
        return '/notifications';
    }
  }
}

module.exports = NotificationController;
