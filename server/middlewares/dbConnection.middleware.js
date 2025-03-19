import mongoose from 'mongoose';
import connectDB from '../utils/dbConnection.js';

/**
 * Middleware to ensure database connection is active before processing requests
 * This helps handle MongoDB Atlas disconnections that are common with free tier
 */
export const ensureDbConnection = async (req, res, next) => {
  try {
    // Check if connection is not established or disconnected
    if (mongoose.connection.readyState !== 1) {
      console.log('Database connection not ready, reconnecting...');
      await connectDB();
    }
    next();
  } catch (error) {
    console.error('Failed to ensure DB connection:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Database connection error',
      error: 'Internal server error'
    });
  }
}; 