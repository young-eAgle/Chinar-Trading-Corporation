import mongoose from 'mongoose';
import connectDB from './dbConnection.js';
import { isDbConnected, pingDB } from './dbConnection.js';

/**
 * Sets up a periodic health check to maintain database connection
 * This is particularly important for MongoDB Atlas free tier which disconnects frequently
 */
export const setupPeriodicHealthCheck = () => {
  // Initial log
  console.log('Setting up periodic database health check');
  
  // Set up a periodic health check every 3 minutes
  const interval = setInterval(async () => {
    try {
      if (mongoose.connection.readyState !== 1) {
        console.log('Periodic health check: Database disconnected, reconnecting...');
        await connectDB();
      } else {
        // Try a simple operation to verify connection is truly working
        try {
          await mongoose.connection.db.admin().ping();
          console.log('Periodic health check: Database connection verified');
        } catch (pingError) {
          console.error('Periodic health check: Database ping failed, reconnecting...', pingError.message);
          await connectDB();
        }
      }
    } catch (error) {
      console.error('Periodic health check failed:', error.message);
    }
  }, 3 * 60 * 1000); // 3 minutes
  
  // Handle process termination
  process.on('SIGINT', () => {
    clearInterval(interval);
    console.log('Periodic health check stopped');
    process.exit(0);
  });
  
  return interval;
};

/**
 * Performs a one-time database connection check
 * Useful for running at application startup
 */
export const performInitialHealthCheck = async () => {
  try {
    console.log('Performing initial database health check');
    if (mongoose.connection.readyState !== 1) {
      console.log('Initial health check: Database not connected, connecting...');
      await connectDB();
    } else {
      console.log('Initial health check: Database already connected');
    }
    return true;
  } catch (error) {
    console.error('Initial health check failed:', error.message);
    return false;
  }
};

/**
 * Health check middleware for request handlers
 */
export const dbHealthMiddleware = async (req, res, next) => {
  try {
    if (!isDbConnected()) {
      // Try to reconnect if disconnected
      await connectDB();
      
      // If still not connected after reconnection attempt
      if (!isDbConnected()) {
        return res.status(503).json({
          success: false,
          message: 'Database service unavailable, please try again later'
        });
      }
    }
    
    // Proceed to the next middleware/handler
    next();
  } catch (error) {
    console.error('🔴 Database middleware error:', error.message);
    return res.status(500).json({
      success: false,
      message: 'Internal server error, please try again later'
    });
  }
};

/**
 * Alias for setupPeriodicHealthCheck to match index.js import
 */
export const initHealthCheck = setupPeriodicHealthCheck; 