import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import dotenv from "dotenv";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// First, check if dotenv is already loaded by the system
if (!process.env.NODE_ENV) {
  // If NODE_ENV isn't set yet, set it with a default value
  process.env.NODE_ENV = 'production';
}

const NODE_ENV = process.env.NODE_ENV;
console.log('Starting server with NODE_ENV:', NODE_ENV);

// Determine which env file to use with absolute paths
const envFileProduction = join(__dirname, '.env.production');
const envFileDevelopment = join(__dirname, '.env.development');
const envFileDefault = join(__dirname, '.env');

const envFile = NODE_ENV === 'production' ? envFileProduction : envFileDevelopment;
console.log('Looking for environment file at:', envFile);
console.log('Current directory:', __dirname);
console.log('NODE_ENV value:', NODE_ENV);

// Only load .env as fallback if the specific environment file doesn't exist
try {
  if (fs.existsSync(envFile)) {
    console.log(`Found ${NODE_ENV} environment file. Loading from:`, envFile);
    const result = dotenv.config({ path: envFile });
    if (result.error) {
      console.error('Error loading environment file:', result.error);
    } else {
      console.log('Environment file loaded successfully');
      // console.log('Available environment variables:', Object.keys(process.env));
    }
  } else {
    console.log(`Warning: ${envFile} not found`);
    if (fs.existsSync(envFileDefault)) {
      console.log('Falling back to .env file:', envFileDefault);
      const result = dotenv.config({ path: envFileDefault });
      if (result.error) {
        console.error('Error loading default environment file:', result.error);
      } else {
        console.log('Default environment file loaded successfully');
      }
    } else {
      console.log('Warning: No environment file found');
    }
  }
} catch (error) {
  console.error('Error loading environment files:', error);
}

// Now import the rest of the dependencies
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose"; // Keep temporarily for backwards compatibility
import cors from "cors";
import cookieParser from "cookie-parser";
import sendOrderConfirmationEmail from "./Services/emailService.js";
import compression from 'compression';
import helmet from "helmet";
import rateLimit from 'express-rate-limit';

// Import our refactored utilities
import { connectDB, isDbConnected, pingDB } from './utils/dbConnection.js';
import { initHealthCheck, dbHealthMiddleware } from './utils/healthCheck.js';

import categoryRoutes from './routes/category.routes.js';
import subcategoryRoutes from './routes/subcategory.routes.js';
import productRoutes from './routes/product.routes.js';
import bulkUpload from  './routes/pro.routes.js';
import reviewRoutes from "./routes/review.routes.js";
import userRoutes from  "./routes/user.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import OrderRoutes from "./routes/order.routes.js";
import DropCategoryRoutes from './routes/drop-cat.routes.js';
import adminRoutes from './routes/admin.routes.js';
import featuredRoutes from './routes/featured.routes.js';
import notificationRoutes from './routes/notification.routes.js';

// Environment variables
const PORT = process.env.PORT || 5000;
const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:5173';
const isProd = NODE_ENV === 'production';
const KEY = process.env.ADMIN_SECRET_KEY;

// Debug Firebase service account
console.log('Firebase Service Account exists:', !!process.env.FIREBASE_SERVICE_ACCOUNT);
console.log('Firebase Service Account type:', typeof process.env.FIREBASE_SERVICE_ACCOUNT);

console.log('Current NODE_ENV:', NODE_ENV);
console.log("Current Port:", PORT);
console.log("FrontEnd URL:", FRONTEND_URL);
console.log("Current Secret key:", KEY);

const app = express();

// Configure CORS based on environment
app.use(cors({
    origin:["http://chinartrading.com", "http://www.chinartrading.com"],
    credentials: true, // Ensure credentials are included
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Security headers for production
if (isProd) {
  app.use((req, res, next) => {
    // Add security headers
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('X-Frame-Options', 'DENY');
    next();
  });
}

app.use(compression());
app.use(helmet());
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 2000, // increase max requests
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// Standard middleware
app.use(cookieParser());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = join(__dirname, 'uploads/reviews');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve uploaded files
app.use('/uploads', express.static(join(__dirname, 'uploads')));

// Apply database health middleware to critical routes
app.use('/api', dbHealthMiddleware);
app.use('/orders', dbHealthMiddleware);
app.use('/admin', dbHealthMiddleware);
app.use('/products', dbHealthMiddleware);
app.use('/categories', dbHealthMiddleware);
app.use('/subcategories', dbHealthMiddleware);
app.use('/users', dbHealthMiddleware);
app.use('/wishlist', dbHealthMiddleware);

// Routes
app.use('/categories', categoryRoutes);
app.use('/subcategories', subcategoryRoutes );
app.use('/products', productRoutes );
app.use('/bulk', bulkUpload);
app.use("/users", userRoutes);
app.use("/wishlist", wishlistRoutes);
app.use('/api', DropCategoryRoutes);
app.use("/api", reviewRoutes);
app.use("/orders", OrderRoutes);
app.use("/admin", adminRoutes);
app.use("/api", featuredRoutes);
app.use("/api/notifications", notificationRoutes);

// Add a simple health check endpoint
app.get('/health', async (req, res) => {
  try {
    // Check database connection
    const dbConnected = isDbConnected();
    
    // If not connected, try to reconnect
    if (!dbConnected) {
      await connectDB();
    }
    
    // Ping the database to ensure it's really responsive
    const pingResult = await pingDB();
    
    res.json({
      status: 'UP',
      timestamp: new Date().toISOString(),
      database: pingResult ? 'Connected' : 'Disconnected',
      server: 'Running'
    });
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'DOWN',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

app.get('/',(req,res)=>{
    res.send("E-commerece Server is ready!");
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || 'Something went wrong!',
    stack: isProd ? undefined : err.stack // Only send stack trace in development
  });
});

// Database Connection and Server Start
connectDB()
  .then(() => {
    // Start server only after successful database connection
    app.listen(PORT, () => {
      console.log(`✅ Server is listening on port${PORT}`);
      
      // Set up periodic health check for database connection
      initHealthCheck();
    });
  })
  .catch(error => {
    console.error('❌ Failed to start server:', error);
    
    // If initial connection fails, still start the server
    // This allows the application to start and try to reconnect later
    app.listen(PORT, () => {
      console.log(`⚠️ Server started without database connection on port${PORT}`);
      console.log('The application will try to reconnect to the database periodically.');
      
      // Start the health check system to try reconnecting
      initHealthCheck();
    });
  });

