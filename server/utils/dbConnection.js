import mongoose from 'mongoose';
// Keep dotenv import in case it's needed in the future
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

// Get current directory for reference
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Environment variables should already be loaded by the main application (index.js)
// Do not load them again to avoid overriding what index.js has loaded
console.log(`Database connection using NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Database connection string: ${process.env.CONNECTION_STRING?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// Connection state tracking
let isConnected = false;
let retryCount = 0;
const MAX_RETRIES = 100; // Increase max retries for long-running server
let connectionAttemptTimestamp = 0;

// Configure Mongoose
mongoose.set('strictQuery', false);

// Connection options
const options = {
    serverSelectionTimeoutMS: 60000,     // Timeout for server selection
    socketTimeoutMS: 15000,              // Increase socket timeout
    family: 4,                           // Use IPv4, skip trying IPv6
    maxPoolSize: 20,                     // Maximum number of connections in the pool
    minPoolSize: 4,                      // Minimum number of connections in the pool
    connectTimeoutMS: 60000,             // Timeout for initial connection
    heartbeatFrequencyMS: 10000,
       // Increase heartbeat frequency to reduce disconnections
                        // Don't auto-create collections
};

// Connect function with retry logic
 const connectDB = async () => {
    console.log('Attempting to connect to MongoDB...');
    const NODE_ENV = process.env.NODE_ENV || 'development';
    console.log('Database connection using NODE_ENV:', NODE_ENV);
    
    // First try Atlas
    try {
        const atlasUri = process.env.MONGODB_ATLAS_URI || process.env.CONNECTION_STRING;
        console.log('Connection string:', atlasUri ? atlasUri.replace(/:[^:]*@/, ':***@') : undefined);
        
        if (atlasUri) {
            console.log('Attempting Atlas connection...');
            await mongoose.connect(atlasUri, {

                serverSelectionTimeoutMS: 5000, // 5 second timeout
            });
            
            const db = mongoose.connection.db;
            console.log('✅ MongoDB connected successfully');
            console.log('MongoDB Name:', db.databaseName);
            console.log('MongoDB Host:', mongoose.connection.host);
            console.log('Connection state:', mongoose.connection.readyState);
            return true;
        } else {
            console.log('No Atlas connection string found, trying local connection...');
        }
    } catch (atlasError) {
        console.error('❌ Atlas connection failed:', atlasError.message);
        
        // Then try local MongoDB
        try {
            const localUri = process.env.MONGODB_LOCAL_URI || 'mongodb://localhost:27017/e-commereceDatabase';
            console.log('Attempting Local MongoDB connection with:', localUri);
            await mongoose.connect(localUri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('✅ Connected to Local MongoDB');
            return true;
        } catch (localError) {
            console.error('❌ Local connection failed:', localError.message);
            throw new Error('All database connection attempts failed');
        }
    }
};

// Setup connection event listeners
const setupListeners = () => {
    // Avoid duplicate listeners
    mongoose.connection.removeAllListeners('error');
    mongoose.connection.removeAllListeners('disconnected');
    mongoose.connection.removeAllListeners('connected');
    
    mongoose.connection.on('error', handleError);
    mongoose.connection.on('disconnected', handleDisconnect);
    mongoose.connection.on('connected', () => {
        console.log('✅ Mongoose connected event fired');
        isConnected = true;
        retryCount = 0;
    });
};

// Handle connection errors
const handleError = (error) => {
    console.error('❌ MongoDB error event:', error);
    if (!isConnected) return; // Don't trigger reconnect if already disconnected
    isConnected = false;
    handleDisconnect();
};

// Handle disconnection
const handleDisconnect = () => {
    console.warn('⚠️ MongoDB disconnected');
    console.warn(`Time of disconnection: ${new Date().toISOString()}`);
    isConnected = false;
    
    // Try to reconnect with exponential backoff
    const backoffTime = Math.min(1000 * Math.pow(1.5, Math.min(retryCount, 15)), 60000); // Max 1 minute, gentler curve
    console.log(`Attempting to reconnect in ${(backoffTime/1000).toFixed(1)} seconds...`);
    
    setTimeout(async () => {
        await handleConnectionFailure();
    }, backoffTime);
};

// Handle connection failures
const handleConnectionFailure = async () => {
    if (retryCount >= MAX_RETRIES) {
        console.error(`Failed to connect after ${MAX_RETRIES} attempts. Will continue to retry but logging will be reduced.`);
        // Don't return, keep trying but less verbosely
        retryCount = MAX_RETRIES; // Keep retryCount at MAX_RETRIES to maintain backoff
    } else {
        retryCount++;
        console.log(`Reconnection attempt ${retryCount}/${MAX_RETRIES}`);
    }
    
    try {
        // Check if the internet is available by pinging a reliable host
        if (retryCount % 5 === 0) { // Only check occasionally
            try {
                const dns = await import('dns');
                const lookup = (hostname) => new Promise((resolve, reject) => {
                    dns.lookup(hostname, (err, address) => {
                        if (err) reject(err);
                        else resolve(address);
                    });
                });
                
                await lookup('google.com');
                console.log('✅ Internet connection available');
            } catch (error) {
                console.error('❌ Internet connection may be down:', error);
                // Still try to connect to MongoDB - it might be a local network
            }
        }
    } catch (error) {
        // Ignore DNS module import errors
    }
    
    await connectDB();
};

// Check if the database is connected
const isDbConnected = () => {
    return mongoose.connection.readyState === 1;
};

// Perform a simple ping to check if the DB connection is alive
 const pingDB = async () => {
    try {
        await mongoose.connection.db.admin().ping();
        return true;
    } catch (error) {
        return false;
    }
};

// Export both the default and named exports
export { connectDB, isDbConnected, pingDB };
export default connectDB; 