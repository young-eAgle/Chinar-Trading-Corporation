import mongoose from 'mongoose';
import connectDB from './dbConnection.js';

/**
 * Wraps database operations with automatic reconnection logic
 * Use this to ensure critical database operations succeed even if connection is lost
 * 
 * @param {Function} operation - Async function containing the database operation
 * @param {number} maxRetries - Maximum number of retries (default: 3)
 * @returns {Promise<any>} - Result of the database operation
 */
export const withDBOperation = async (operation, maxRetries = 3) => {
  let retries = 0;
  
  const executeOperation = async () => {
    try {
      // Check connection before attempting operation
      if (mongoose.connection.readyState !== 1) {
        console.log('Database not connected, reconnecting before operation...');
        await connectDB();
      }
      
      // Execute the database operation
      return await operation();
    } catch (error) {
      // If this is a connection-related error and we haven't exceeded retries
      if (
        (error.name === 'MongoNetworkError' || 
         error.name === 'MongoServerSelectionError' || 
         error.message.includes('disconnected') ||
         mongoose.connection.readyState !== 1) && 
        retries < maxRetries
      ) {
        retries++;
        console.log(`Database operation failed, retry attempt ${retries}/${maxRetries}`);
        
        // Wait before retrying (exponential backoff)
        const delay = Math.min(100 * Math.pow(2, retries), 3000);
        await new Promise(resolve => setTimeout(resolve, delay));
        
        // Ensure we're connected before retrying
        if (mongoose.connection.readyState !== 1) {
          await connectDB();
        }
        
        // Retry the operation
        return executeOperation();
      }
      
      // Re-throw the error if it's not connection-related or max retries exceeded
      throw error;
    }
  };
  
  return executeOperation();
};

/**
 * Usage example:
 * 
 * import { withDBOperation } from '../utils/dbOperation.js';
 * 
 * // In your controller or service:
 * const products = await withDBOperation(async () => {
 *   return await Product.find();
 * });
 */ 