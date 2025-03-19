# Deployment Guide for MongoDB Connection Fix

This guide will help you fix the MongoDB connection issues on your VPS.

## Local Development Steps

1. **Make the code changes locally**:
   - Add the new database connection manager
   - Update the server code to use the connection manager
   - Test locally to ensure everything works

2. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Add robust MongoDB connection manager"
   git push origin master
   ```

## VPS Deployment Steps

1. **SSH into your VPS**:
   ```bash
   ssh username@your-vps-ip
   ```

2. **Backup your environment files**:
   ```bash
   cd ~/e-commerece/FullStack-Ecommerece-Website---Copy
   cp server/.env server/.env.backup
   cp server/.env.production server/.env.production.backup
   ```

3. **Pull the latest changes**:
   ```bash
   git pull origin master
   ```
   
   If you encounter conflicts with your env files, run:
   ```bash
   cp server/.env.backup server/.env
   cp server/.env.production.backup server/.env.production
   ```

4. **Install any new dependencies**:
   ```bash
   cd server
   npm install
   ```

5. **Run the health check script to test MongoDB connection**:
   ```bash
   export NODE_ENV=production
   node check-server.js
   ```

6. **Update MongoDB Atlas whitelist**:
   - Login to MongoDB Atlas
   - Go to Network Access
   - Click "Add IP Address"
   - Add your VPS IP address (visible in the health check output)
   - Save the changes

7. **Restart your application**:
   ```bash
   pm2 stop e-backend
   pm2 start index.js --name e-backend --max-memory-restart 300M
   ```

8. **Monitor the logs**:
   ```bash
   pm2 logs e-backend
   ```

## Troubleshooting

If you still encounter MongoDB disconnection issues:

1. **Check that your environment variables are correctly set**:
   ```bash
   cat .env.production
   ```
   
   Make sure `CONNECTION_STRING` is correctly formatted.

2. **Check for network restrictions**:
   ```bash
   curl -v telnet://cluster0.06bq0.mongodb.net:27017
   ```

3. **Verify database user credentials**:
   - Login to MongoDB Atlas
   - Go to Database Access
   - Verify your user has the right permissions
   - Reset the password if needed and update your .env.production file

4. **Check resources on your VPS**:
   ```bash
   free -m
   df -h
   top
   ```
   
   Make sure you have enough memory and disk space.

## Future Updates

When making future changes:

1. Always develop and test locally first
2. Push to GitHub
3. Pull on your VPS
4. Restart your application

This workflow ensures your code is consistent and properly tested before deployment. 