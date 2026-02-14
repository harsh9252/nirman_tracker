// Push Notification Service
import config from '../config/config';

class PushNotificationService {
  constructor() {
    this.registration = null;
    this.subscription = null;
    this.vapidPublicKey = null;
  }

  // Initialize the service
  async init() {
    try {
      // Check if service workers are supported
      if (!('serviceWorker' in navigator)) {
        console.warn('Service workers not supported');
        return false;
      }

      // Check if push messaging is supported
      if (!('PushManager' in window)) {
        console.warn('Push messaging not supported');
        return false;
      }

      // Register service worker
      this.registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service Worker registered successfully');

      // Get VAPID public key from backend
      await this.fetchVapidPublicKey();

      return true;
    } catch (error) {
      console.error('Error initializing push notifications:', error);
      return false;
    }
  }

  // Fetch VAPID public key from backend
  async fetchVapidPublicKey() {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/push/vapid-public-key`);
      if (response.ok) {
        const data = await response.json();
        this.vapidPublicKey = data.publicKey;
      } else {
        console.error('Failed to fetch VAPID public key');
      }
    } catch (error) {
      console.error('Error fetching VAPID public key:', error);
    }
  }

  // Request notification permission
  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      } else {
        console.log('Notification permission denied');
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
      return false;
    }
  }

  // Subscribe to push notifications
  async subscribe() {
    try {
      if (!this.registration) {
        throw new Error('Service worker not registered');
      }

      if (!this.vapidPublicKey) {
        throw new Error('VAPID public key not available');
      }

      // Convert VAPID key to Uint8Array
      const applicationServerKey = this.urlB64ToUint8Array(this.vapidPublicKey);

      this.subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: applicationServerKey
      });

      console.log('Push subscription created:', this.subscription);

      // Send subscription to backend
      await this.sendSubscriptionToBackend(this.subscription);

      return this.subscription;
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      throw error;
    }
  }

  // Unsubscribe from push notifications
  async unsubscribe() {
    try {
      if (this.subscription) {
        const result = await this.subscription.unsubscribe();
        console.log('Successfully unsubscribed from push notifications');

        // Remove subscription from backend
        await this.removeSubscriptionFromBackend();

        this.subscription = null;
        return result;
      }
      return false;
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      return false;
    }
  }

  // Get current subscription
  async getSubscription() {
    try {
      if (!this.registration) {
        return null;
      }

      this.subscription = await this.registration.pushManager.getSubscription();
      return this.subscription;
    } catch (error) {
      console.error('Error getting subscription:', error);
      return null;
    }
  }

  // Send subscription to backend
  async sendSubscriptionToBackend(subscription) {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/push/subscribe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          subscription: subscription.toJSON()
        })
      });

      if (response.ok) {
        console.log('Subscription sent to backend successfully');
      } else {
        console.error('Failed to send subscription to backend');
      }
    } catch (error) {
      console.error('Error sending subscription to backend:', error);
    }
  }

  // Remove subscription from backend
  async removeSubscriptionFromBackend() {
    try {
      const response = await fetch(`${config.api.baseUrl}/api/push/unsubscribe`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        console.log('Subscription removed from backend successfully');
      } else {
        console.error('Failed to remove subscription from backend');
      }
    } catch (error) {
      console.error('Error removing subscription from backend:', error);
    }
  }

  // Check if notifications are supported and enabled
  isSupported() {
    return 'serviceWorker' in navigator && 'PushManager' in window;
  }

  // Check current permission status
  getPermissionStatus() {
    if (!('Notification' in window)) {
      return 'not-supported';
    }
    return Notification.permission;
  }

  // Utility function to convert VAPID key
  urlB64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }

  // Test notification (for debugging)
  async testNotification() {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification('Test Notification', {
          body: 'This is a test push notification',
          icon: '/logo-small.png'
        });

        setTimeout(() => {
          notification.close();
        }, 3000);
      } else {
        console.warn('Notification permission not granted');
      }
    } catch (error) {
      console.error('Error showing test notification:', error);
    }
  }
}

// Create and export a singleton instance
const pushNotificationService = new PushNotificationService();
export default pushNotificationService;
