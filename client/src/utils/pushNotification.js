// import { initializeApp } from 'firebase/app';
// // import { getMessaging, getToken, onMessage } from "firebase/messaging";

// // Your web app's Firebase configuration
// const firebaseConfig = {
//   apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
//   authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.REACT_APP_FIREBASE_APP_ID
// };

// // Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const messaging = getMessaging(app);

// // Request permission and get token
// export const requestNotificationPermission = async () => {
//   try {
//     // Request permission
//     const permission = await Notification.requestPermission();
    
//     if (permission === 'granted') {
//       // Get FCM token
//       const token = await getToken(messaging, {
//         vapidKey: process.env.REACT_APP_FIREBASE_VAPID_KEY
//       });
      
//       if (token) {
//         console.log('FCM Token:', token);
//         return token;
//       }
//     }
//     return null;
//   } catch (error) {
//     console.error('Error requesting notification permission:', error);
//     return null;
//   }
// };

// // Listen for foreground messages
// export const onMessageListener = () =>
//   new Promise((resolve) => {
//     onMessage(messaging, (payload) => {
//       console.log('Received foreground message:', payload);
//       resolve(payload);
//     });
//   });

// // Subscribe to push notifications
// export const subscribeToPushNotifications = async (userId, isAdmin = false) => {
//   try {
//     const token = await requestNotificationPermission();
//     if (!token) {
//       console.log('No token available');
//       return false;
//     }

//     const response = await fetch('http://localhost:5000/api/notifications/subscribe', {
//       method: 'POST',
//       headers: {
//         'Content-Type': 'application/json',
//         'Authorization': `Bearer ${localStorage.getItem('token')}`
//       },
//       body: JSON.stringify({
//         token,
//         userId,
//         isAdmin
//       })
//     });

//     if (!response.ok) {
//       throw new Error('Failed to subscribe to notifications');
//     }

//     console.log('Successfully subscribed to notifications');
//     return true;
//   } catch (error) {
//     console.error('Error subscribing to push notifications:', error);
//     return false;
//   }
// }; 