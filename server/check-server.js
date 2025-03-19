import mongoose from 'mongoose';
import dotenv from 'dotenv';
import dns from 'dns';
import http from 'http';
import https from 'https';
import { exec } from 'child_process';
import util from 'util';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const execPromise = util.promisify(exec);

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

console.log('=== SERVER HEALTH CHECK ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`PORT: ${process.env.PORT}`);
console.log(`FRONTEND_URL: ${process.env.FRONTEND_URL}`);
console.log(`Connection String: ${process.env.CONNECTION_STRING?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

// Check MongoDB connection
async function checkMongoDB() {
    console.log('\n=== CHECKING MONGODB CONNECTION ===');
    try {
        console.log('Attempting to connect to MongoDB...');
        await mongoose.connect(process.env.CONNECTION_STRING, {
            serverSelectionTimeoutMS: 30000,
            socketTimeoutMS: 45000,
        });
        console.log('✅ Successfully connected to MongoDB Atlas!');
        console.log(`Connection state: ${mongoose.connection.readyState}`);
        await mongoose.connection.close();
        console.log('Connection closed successfully');
        return true;
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        return false;
    }
}

// Check DNS resolution
async function checkDNS() {
    console.log('\n=== CHECKING DNS RESOLUTION ===');
    try {
        const mongoHost = process.env.CONNECTION_STRING.match(/mongodb\+srv:\/\/.*?@(.*?)\//)[1];
        console.log(`Resolving MongoDB host: ${mongoHost}`);
        
        const lookup = util.promisify(dns.lookup);
        const result = await lookup(mongoHost);
        console.log(`✅ DNS Resolution successful: ${mongoHost} -> ${result.address}`);
        return true;
    } catch (error) {
        console.error('❌ DNS Resolution Error:', error);
        return false;
    }
}

// Check network connectivity
async function checkNetwork() {
    console.log('\n=== CHECKING NETWORK CONNECTIVITY ===');
    try {
        const { stdout } = await execPromise('curl -s https://api.ipify.org');
        console.log(`Server public IP: ${stdout}`);
        
        console.log('Checking MongoDB Atlas connectivity...');
        const mongoHost = process.env.CONNECTION_STRING.match(/mongodb\+srv:\/\/.*?@(.*?)\//)[1];
        
        // Try to ping the MongoDB host
        try {
            await execPromise(`ping -c 3 ${mongoHost}`);
            console.log(`✅ Ping to ${mongoHost} successful`);
        } catch (error) {
            console.warn(`⚠️ Ping to ${mongoHost} failed: ${error.message}`);
            // Ping might be blocked, try HTTP request instead
        }
        
        return true;
    } catch (error) {
        console.error('❌ Network Check Error:', error);
        return false;
    }
}

// Check HTTP server
async function checkHTTPServer() {
    console.log('\n=== CHECKING HTTP SERVER ===');
    try {
        const port = process.env.PORT || 5000;
        console.log(`Checking if server is listening on port ${port}...`);
        
        try {
            const { stdout } = await execPromise(`netstat -an | grep LISTEN | grep :${port}`);
            console.log(`✅ Server is listening on port ${port}:`);
            console.log(stdout);
        } catch (error) {
            console.error(`❌ Server is NOT listening on port ${port}`);
        }
        
        return true;
    } catch (error) {
        console.error('❌ HTTP Server Check Error:', error);
        return false;
    }
}

// Run all checks
async function runHealthCheck() {
    console.log('Starting health check...');
    
    const mongoDBStatus = await checkMongoDB();
    const dnsStatus = await checkDNS();
    const networkStatus = await checkNetwork();
    const httpStatus = await checkHTTPServer();
    
    console.log('\n=== HEALTH CHECK SUMMARY ===');
    console.log(`MongoDB Connection: ${mongoDBStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`DNS Resolution: ${dnsStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`Network Connectivity: ${networkStatus ? '✅ PASS' : '❌ FAIL'}`);
    console.log(`HTTP Server: ${httpStatus ? '✅ PASS' : '❌ FAIL'}`);
    
    if (!mongoDBStatus) {
        console.log('\n=== MONGODB TROUBLESHOOTING ===');
        console.log('1. Check if your MongoDB Atlas IP whitelist includes your server IP');
        console.log('2. Verify your MongoDB Atlas username and password are correct');
        console.log('3. Check if your MongoDB Atlas cluster is running');
        console.log('4. Make sure your MongoDB Atlas connection string is correct');
    }
    
    process.exit(0);
}

runHealthCheck().catch(error => {
    console.error('Health check failed:', error);
    process.exit(1);
}); 