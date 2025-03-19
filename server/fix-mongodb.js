import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables with absolute paths
const envFileProduction = join(__dirname, '.env.production');
const envFileDevelopment = join(__dirname, '.env.development');
const envFileDefault = join(__dirname, '.env');

const envFile = process.env.NODE_ENV === 'production' ? envFileProduction : envFileDevelopment;
console.log(`Loading environment from: ${envFile}`);

// Only load .env as fallback if the specific environment file doesn't exist
try {
  if (fs.existsSync(envFile)) {
    dotenv.config({ path: envFile });
  } else {
    console.log(`Warning: ${envFile} not found, falling back to .env file`);
    if (fs.existsSync(envFileDefault)) {
      dotenv.config({ path: envFileDefault });
    }
  }
} catch (error) {
  console.error('Error loading environment files:', error);
}

console.log('Attempting to connect to MongoDB...');
console.log(`Connection string: ${process.env.CONNECTION_STRING.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

mongoose.connect(process.env.CONNECTION_STRING, {
    serverSelectionTimeoutMS: 30000, // Increased timeout to 30 seconds
    heartbeatFrequencyMS: 10000,     // Check server status every 10 seconds
    socketTimeoutMS: 45000,          // Socket timeout after 45 seconds
    family: 4                        // Use IPv4, skip trying IPv6
})
.then(() => {
    console.log('✅ Successfully connected to MongoDB Atlas!');
    
    // Check connection status
    console.log(`Connection state: ${mongoose.connection.readyState}`);
    // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
    
    // Close connection after successful test
    mongoose.connection.close()
    .then(() => {
        console.log('Connection closed successfully');
        process.exit(0);
    });
})
.catch((error) => {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
});

// Add error handler for mongoose connection
mongoose.connection.on('error', (err) => {
    console.error('❌ Mongoose Connection Error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.warn('⚠️ Mongoose Disconnected');
}); 