// client/public/service-worker.js - FIREBASE MESSAGING DISABLED
console.log('Service worker loaded but Firebase messaging is disabled');

// The push event listener is disabled
self.addEventListener('push', function(event) {
  console.log('Push notification received, but ignored (Firebase disabled)');
  // Do nothing - push notifications are disabled
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  console.log('Notification clicked, but Firebase messaging is disabled');
  
  // Still handle the click if there's a URL
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});