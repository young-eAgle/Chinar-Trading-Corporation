import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { exec } from 'child_process';
import { promisify } from 'util';
import dns from 'dns';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const execAsync = promisify(exec);
const dnsLookup = promisify(dns.lookup);

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

// Log environment details
console.log('\n=== ENVIRONMENT INFO ===');
console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Connection String: ${process.env.CONNECTION_STRING?.replace(/\/\/([^:]+):([^@]+)@/, '//***:***@')}`);

async function getServerInfo() {
    console.log('\n=== SERVER INFO ===');
    try {
        // Get public IP
        const { stdout: publicIp } = await execAsync('curl -s https://api.ipify.org');
        console.log(`Server Public IP: ${publicIp}`);
        
        // Get memory info
        const { stdout: memInfo } = await execAsync('free -m');
        console.log('Memory Information:');
        console.log(memInfo);
        
        // Get MongoDB Atlas connection info
        const mongoUrl = new URL(process.env.CONNECTION_STRING);
        const host = mongoUrl.hostname;
        console.log(`MongoDB Host: ${host}`);
        
        // Try to resolve the MongoDB host
        try {
            const { address } = await dnsLookup(host);
            console.log(`MongoDB DNS Resolution: ${host} -> ${address}`);
        } catch (error) {
            console.error(`Failed to resolve MongoDB host: ${error.message}`);
        }
        
        // Check MongoDB Atlas connectivity
        try {
            const { stdout: pingResult } = await execAsync(`ping -c 3 ${host}`);
            console.log('Ping to MongoDB Atlas:');
            console.log(pingResult);
        } catch (error) {
            console.error(`Ping to MongoDB Atlas failed (this is normal if ICMP is blocked): ${error.message}`);
        }
        
        // Check port connectivity
        try {
            const { stdout: tcpResult } = await execAsync(`nc -zv ${host} 27017 2>&1 || echo "Connection failed"`);
            console.log('TCP Connection to MongoDB Atlas:');
            console.log(tcpResult);
        } catch (error) {
            console.error(`TCP connection test failed: ${error.message}`);
        }
    } catch (error) {
        console.error(`Error getting server info: ${error.message}`);
    }
}

async function testMongoConnection() {
    console.log('\n=== TESTING MONGODB CONNECTION ===');
    
    // Connection options
    const options = {
        serverSelectionTimeoutMS: 30000,
        socketTimeoutMS: 75000,
        connectTimeoutMS: 30000
    };
    
    try {
        console.log('Attempting to connect to MongoDB...');
        const startTime = Date.now();
        const connection = await mongoose.connect(process.env.CONNECTION_STRING, options);
        const endTime = Date.now();
        
        console.log(`✅ Connection successful! Time taken: ${endTime - startTime}ms`);
        console.log(`MongoDB Database Name: ${connection.connection.name}`);
        console.log(`Connection State: ${mongoose.connection.readyState}`);
        
        // Listen for disconnection
        mongoose.connection.on('disconnected', () => {
            console.log(`⚠️ Disconnected at ${new Date().toISOString()}`);
        });
        
        // Keep the connection open for 1 minute to test stability
        console.log('Keeping connection open for 60 seconds to test stability...');
        await new Promise(resolve => setTimeout(resolve, 60000));
        
        try {
            // Try running a simple command to check if still connected
            const result = await mongoose.connection.db.admin().ping();
            console.log('Ping result after 60 seconds:', result);
            console.log('✅ Connection remained stable for 60 seconds');
        } catch (error) {
            console.error('❌ Connection unstable. Could not ping the database after 60 seconds:', error);
        }
        
        // Close the connection
        await mongoose.connection.close();
        console.log('Connection closed');
    } catch (error) {
        console.error('❌ MongoDB Connection Error:', error);
        console.error('Error name:', error.name);
        console.error('Error code:', error.code);
        
        if (error.name === 'MongoServerSelectionError') {
            console.error('Could not select a MongoDB server. Check network or firewall issues.');
        } else if (error.name === 'MongoNetworkError') {
            console.error('Network error connecting to MongoDB. Check your internet connection.');
        }
    }
}

async function checkAtlasQuotas() {
    console.log('\n=== CHECKING MONGODB ATLAS QUOTAS ===');
    console.log('Note: To properly check MongoDB Atlas quotas, you need to:');
    console.log('1. Log in to the MongoDB Atlas dashboard');
    console.log('2. Check your cluster metrics for:');
    console.log('   - Connection limits');
    console.log('   - Storage usage');
    console.log('   - IOPS usage');
    console.log('   - Free tier limitations');
    console.log('3. Check if your account is on a shared (M0) free tier, which has:');
    console.log('   - Limited connections (typically 100)');
    console.log('   - Automatic sleep after 24 hours of inactivity');
    console.log('   - Limited storage (512 MB)');
    console.log('   - Limited IOPS');
}

async function runDiagnostics() {
    console.log('=== MONGODB DIAGNOSTICS STARTING ===');
    console.log(`Time: ${new Date().toISOString()}`);
    
    await getServerInfo();
    await checkAtlasQuotas();
    await testMongoConnection();
    
    console.log('\n=== MONGODB DIAGNOSTICS COMPLETE ===');
    console.log(`Time: ${new Date().toISOString()}`);
    
    console.log('\n=== RECOMMENDATIONS ===');
    console.log('1. Make sure your MongoDB Atlas IP whitelist includes your server IP');
    console.log('2. If using a free M0 cluster, consider upgrading to a dedicated cluster');
    console.log('3. Check for network stability issues between your server and MongoDB Atlas');
    console.log('4. Review connection limits in MongoDB Atlas dashboard');
    console.log('5. Check if MongoDB Atlas is in maintenance mode');
    
    process.exit(0);
}

runDiagnostics().catch(error => {
    console.error('Diagnostics failed:', error);
    process.exit(1);
}); 