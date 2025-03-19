# Notification System Migration Guide

## Overview
This document outlines the steps to migrate from the old notification system to the new one.

## Files to Remove
1. `./Context/notificationContext.js`
2. `./components/Notification/Notification.jsx`
3. `./pages/Notification Page/NotificationSetup.jsx`

## Files to Keep (New Structure)
```
client/src/features/notifications/
├── components/
│   ├── NotificationBell.jsx
│   └── NotificationPreferences.jsx
├── context/
│   └── NotificationContext.jsx
├── utils/
│   └── firebase.js
└── hooks/
    └── useNotification.js
```

## Migration Steps

1. Update App.jsx:
   - Remove old NotificationProvider import
   - Remove NotificationSetup component
   - Use single NotificationProvider from new implementation

2. Update existing components using notifications:
   - Replace imports from old context with new one:
   ```javascript
   // Old
   import { useNotification } from './Context/notificationContext';
   
   // New
   import { useNotification } from './features/notifications/context/NotificationContext';
   ```

3. Firebase Configuration:
   - Move Firebase config to environment variables
   - Update service worker configuration

4. Data Migration:
   - Notification preferences will need to be reset
   - Users will need to re-enable notifications

## Breaking Changes
1. Notification API changes:
   - New notification structure includes more metadata
   - Different method names for some operations
   - Enhanced error handling

2. New Features:
   - Notification grouping
   - Notification preferences
   - Enhanced UI components

## Rollback Plan
If issues arise:
1. Keep both systems temporarily
2. Gradually migrate users to new system
3. Remove old system after successful migration 