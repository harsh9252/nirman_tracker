// Push Notification Service for Backend
const webpush = require('web-push');
const db = require('../config/database');

class PushNotificationService {
  constructor() {
    // Set VAPID details if configured
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'support@nirmaantrack.com'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );
    } else {
      console.log('⚠️ Push notifications not configured - VAPID keys missing');
    }
  }

  // Send push notification to a specific user
  async sendNotificationToUser(userId, notificationData) {
    try {
      // Get user's push subscriptions
      const subscriptions = await this.getUserSubscriptions(userId);

      if (subscriptions.length === 0) {
        console.log(`No push subscriptions found for user ${userId}`);
        return;
      }

      // Prepare notification payload
      const payload = JSON.stringify({
        title: notificationData.title || 'NirmaanTrack',
        message: notificationData.message || 'You have a new notification',
        url: notificationData.url || '/',
        notificationId: notificationData.id || null,
        type: notificationData.type || 'general',
        icon: '/logo-small.png'
      });

      // Send to all user's subscriptions
      const sendPromises = subscriptions.map(async (subscription) => {
        try {
          const subscriptionObj = JSON.parse(subscription.subscription_data);
          await webpush.sendNotification(subscriptionObj, payload);
          console.log(`Push notification sent to user ${userId}`);
        } catch (error) {
          console.error(`Failed to send push notification to user ${userId}:`, error);

          // If subscription is invalid (410 Gone), remove it
          if (error.statusCode === 410) {
            await this.removeSubscription(subscription.id);
            console.log(`Removed invalid subscription for user ${userId}`);
          }
        }
      });

      await Promise.all(sendPromises);
    } catch (error) {
      console.error('Error sending push notification:', error);
    }
  }

  // Get user's push subscriptions
  async getUserSubscriptions(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT id, subscription_data FROM push_subscriptions WHERE user_id = ?';
      db.query(sql, [userId], (err, results) => {
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    });
  }

  // Remove invalid subscription
  async removeSubscription(subscriptionId) {
    return new Promise((resolve, reject) => {
      const sql = 'DELETE FROM push_subscriptions WHERE id = ?';
      db.query(sql, [subscriptionId], (err, result) => {
        if (err) {
          reject(err);
        } else {
          resolve(result);
        }
      });
    });
  }

  // Send notification to multiple users
  async sendNotificationToUsers(userIds, notificationData) {
    const sendPromises = userIds.map(userId =>
      this.sendNotificationToUser(userId, notificationData)
    );
    await Promise.all(sendPromises);
  }

  // Test push notification (for debugging)
  async testNotification(userId) {
    const testData = {
      title: 'Test Notification',
      message: 'This is a test push notification from NirmaanTrack',
      url: '/notifications',
      type: 'test'
    };

    await this.sendNotificationToUser(userId, testData);
  }
}

module.exports = new PushNotificationService();
