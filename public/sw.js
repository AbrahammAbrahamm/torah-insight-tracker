// Minimal service worker for scheduled local notifications.
self.addEventListener('install', (e) => { self.skipWaiting(); });
self.addEventListener('activate', (e) => { e.waitUntil(self.clients.claim()); });

self.addEventListener('message', (event) => {
  const data = event.data || {};
  if (data.type === 'SHOW_NOTIFICATION') {
    self.registration.showNotification(data.title || 'Reminder', {
      body: data.body || 'Time for your learning.',
      icon: '/placeholder.svg',
      badge: '/placeholder.svg',
      tag: data.tag,
      requireInteraction: true,
    });
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(self.clients.matchAll({ type: 'window' }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    if (self.clients.openWindow) return self.clients.openWindow('/');
  }));
});
