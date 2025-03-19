// Test script to verify environment variable loading

import dotenv from 'dotenv';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('===== ENVIRONMENT TEST SCRIPT =====');
console.log('Current NODE_ENV:', process.env.NODE_ENV);
console.log('Current directory:', __dirname);

// Determine which env file to use with absolute paths
const envFileProduction = join(__dirname, '.env.production');
const envFileDevelopment = join(__dirname, '.env.development');
const envFileDefault = join(__dirname, '.env');

// Check if files exist
console.log('\nChecking file existence:');
console.log('.env.production exists:', fs.existsSync(envFileProduction));
console.log('.env.development exists:', fs.existsSync(envFileDevelopment));
console.log('.env exists:', fs.existsSync(envFileDefault));

// Load the appropriate file based on NODE_ENV
const envFile = process.env.NODE_ENV === 'production' 
  ? envFileProduction 
  : envFileDevelopment;

console.log('\nAttempting to load from:', envFile);

if (fs.existsSync(envFile)) {
  console.log('File exists, loading configuration...');
  dotenv.config({ path: envFile });
} else {
  console.log('Environment-specific file not found, falling back to .env');
  dotenv.config({ path: envFileDefault });
}

// Display a sample of loaded environment variables
console.log('\nLoaded Environment Variables:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('PORT:', process.env.PORT);
console.log('DATABASE URL:', process.env.CONNECTION_STRING ? process.env.CONNECTION_STRING.substring(0, 30) + '...' : 'Not defined');
console.log('FRONTEND_URL:', process.env.FRONTEND_URL);

console.log('\n===== TEST COMPLETE ====='); 