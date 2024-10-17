// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBMl2-dsWYFs_vVG_oKjBg6WCjl79QBR_Y",
  authDomain: "kino-n-chill.firebaseapp.com",
  projectId: "kino-n-chill",
  storageBucket: "kino-n-chill.appspot.com",
  messagingSenderId: "904976281790",
  appId: "1:904976281790:web:eb2fbdd47862df668a6eef"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Only show notification if the app is in the background
  if (!self.clients.matchAll()) {
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
      body: payload.notification.body,
      icon: '/icon-192x192.png'
    };

    self.registration.showNotification(notificationTitle, notificationOptions);
  }
});