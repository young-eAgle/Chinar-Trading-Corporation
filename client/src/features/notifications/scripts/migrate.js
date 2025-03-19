const fs = require('fs');
const path = require('path');

const filesToRemove = [
  './Context/notificationContext.js',
  './components/Notification/Notification.jsx',
  './pages/Notification Page/NotificationSetup.jsx'
];

const filesToBackup = [
  ...filesToRemove,
  './public/firebase-messaging-sw.js'
];

// Create backup directory
const backupDir = path.join(__dirname, '../../../backup-notifications');
if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

// Backup files
filesToBackup.forEach(file => {
  const fullPath = path.join(__dirname, '../../../', file);
  const backupPath = path.join(backupDir, path.basename(file));
  
  if (fs.existsSync(fullPath)) {
    fs.copyFileSync(fullPath, backupPath);
    console.log(`✅ Backed up ${file} to ${backupPath}`);
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

// Remove old files
filesToRemove.forEach(file => {
  const fullPath = path.join(__dirname, '../../../', file);
  
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
    console.log(`🗑️ Removed ${file}`);
  } else {
    console.log(`⚠️ File not found: ${file}`);
  }
});

console.log('\n🎉 Migration completed!');
console.log('\nNext steps:');
console.log('1. Update imports in your components to use the new notification system');
console.log('2. Test notification functionality');
console.log('3. If everything works, you can delete the backup directory');
console.log('\nTo rollback, copy files from the backup directory back to their original locations.'); 