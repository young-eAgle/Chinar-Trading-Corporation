import { initializeApp } from 'firebase/app';
// Comment out Firebase messaging imports
// import { getMessaging, getToken, onMessage, deleteToken } from 'firebase/messaging';

import.meta.env.VITE_FIREBASE_API_KEY
import.meta.env.VITE_FIREBASE_AUTH_DOMAIN
import.meta.env.VITE_FIREBASE_PROJECT_ID
import.meta.env.VITE_FIREBASE_STORAGE_BUCKET
import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID
import.meta.env.VITE_FIREBASE_APP_ID
import.meta.env.VITE_FIREBASE_VAPID_KEY


const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy-key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dummy-domain',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dummy-project',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dummy-bucket',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || 'dummy-sender',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || 'dummy-app-id',
};

let messaging = null;
let app = null;

// Initialize Firebase conditionally
try {
  // Only initialize if needed and all required env vars are present
  if (import.meta.env.VITE_USE_FIREBASE === 'true' && 
      import.meta.env.VITE_FIREBASE_API_KEY && 
      import.meta.env.VITE_FIREBASE_APP_ID) {
    console.log('Firebase initialization skipped - push notifications disabled');
    // Uncomment when ready to enable push notifications
    // app = initializeApp(firebaseConfig);
    // messaging = getMessaging(app);
  } else {
    console.log('Firebase disabled via environment variables');
  }
} catch (error) {
  console.error('Error initializing Firebase:', error);
}

// Stub implementations that return empty values but don't break the app
export const requestNotificationPermission = async () => {
  console.log('Push notifications are currently disabled');
  return null;
};

export const refreshToken = async () => {
  console.log('Push notifications are currently disabled');
  return null;
};

export const onMessageListener = () => {
  // Return a promise that never resolves to prevent errors
  return new Promise(() => {});
};

export const isNotificationSupported = () => {
  return 'Notification' in window;
};

export const getNotificationPermission = () => {
  return Notification.permission;
};

export const validateToken = async () => {
  return false;
};

export default messaging; 