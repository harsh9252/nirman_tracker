// Service Worker for Web Push Notifications
self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('Service Worker activating.');
  event.waitUntil(clients.claim());
});

// Handle push notifications
self.addEventListener('push', (event) => {
  console.log('Push message received:', event);

  let data = {};

  if (event.data) {
    data = event.data.json();
  }

  const options = {
    body: data.message || 'You have a new notification',
    icon: '/logo-small.png', // Make sure this path exists
    badge: '/logo-small.png',
    image: data.image || undefined,
    data: {
      url: data.url || '/',
      notificationId: data.notificationId || null
    },
    requireInteraction: true,
    silent: false,
    actions: [
      {
        action: 'view',
        title: 'View',
        icon: '/logo-small.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ],
    tag: data.tag || 'general-notification',
    renotify: true
  };

  // Play notification sound
  event.waitUntil(
    Promise.all([
      self.registration.showNotification(data.title || 'NirmaanTrack', options),
      // Play notification sound
      new Promise((resolve) => {
        try {
          // Create audio context and play sound
          const audio = new Audio('/sounds/Sound-1.mp3');
          audio.volume = 1.0; // Set volume to 100%
          audio.play().then(() => {
            console.log('Notification sound played successfully');
            resolve();
          }).catch((error) => {
            console.log('Could not play notification sound:', error);
            resolve(); // Resolve anyway to not block notification
          });
        } catch (error) {
          console.log('Audio playback not supported:', error);
          resolve();
        }
      })
    ])
  );
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received:', event);

  event.notification.close();

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // Check if there is already a window/tab open with the target URL
      for (let client of windowClients) {
        if (client.url.includes(url) && 'focus' in client) {
          return client.focus();
        }
      }

      // If no suitable window is found, open a new one
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
});
