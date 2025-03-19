# Deployment Guide

This guide provides step-by-step instructions for deploying this application to a VPS or Linux server.

## Prerequisites

- Node.js 16+ and npm installed on the server
- Git installed on the server
- MongoDB instance setup and configured

## Preparation Steps

Before deployment, ensure your codebase is prepared:

1. **Run the structure fix script locally**:
   ```
   .\fix-structure.ps1
   ```
   This script ensures all directories and files use correct naming conventions for cross-platform compatibility.

2. **Test the build locally**:
   ```
   cd client
   npm run build
   ```
   Fix any errors before proceeding.

3. **Prepare your environment variables**:
   - Set up `.env.production` files for both client and server
   - Never commit these files to Git

## Server Deployment Steps

### Backend Deployment

1. **Clone the repository**:
   ```bash
   git clone <your-repo-url> <project-folder>
   cd <project-folder>
   ```

2. **Install dependencies**:
   ```bash
   cd server
   npm install --production
   ```

3. **Set up environment variables**:
   ```bash
   cp .env.production .env
   # Edit .env with your production values
   ```

4. **Start the server**:
   For development testing:
   ```bash
   npm start
   ```
   
   For production (with PM2):
   ```bash
   npm install -g pm2
   pm2 start index.js --name "ecommerce-backend"
   ```

### Frontend Deployment

1. **Install dependencies and build**:
   ```bash
   cd client
   npm install
   npm run build
   ```

2. **Serve the built frontend**:
   Using Nginx (recommended):
   ```bash
   # Install Nginx if not installed
   sudo apt-get install nginx
   
   # Configure Nginx to serve your frontend and proxy API requests
   sudo nano /etc/nginx/sites-available/your-app
   ```
   
   Add configuration:
   ```
   server {
       listen 80;
       server_name your-domain.com;
       
       # Serve frontend files
       location / {
           root /path/to/your/client/dist;
           try_files $uri $uri/ /index.html;
       }
       
       # Proxy API requests to backend
       location /api {
           proxy_pass http://localhost:5000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```
   
3. **Enable the site and restart Nginx**:
   ```bash
   sudo ln -s /etc/nginx/sites-available/your-app /etc/nginx/sites-enabled/
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Common Issues and Solutions

### Case-Sensitivity Issues

- **Problem**: File imports work on Windows but fail on Linux
- **Solution**: Ensure all import paths exactly match directory and file names
- **Prevention**: Use the `fix-structure.ps1` script to standardize naming conventions

### Environment Variable Issues

- **Problem**: Environment variables not being loaded
- **Solution**: Verify `.env` file exists and has correct permissions
- **Solution**: Use full paths in your `.env` file configuration

### Build Errors

- **Problem**: Build failing with "Module not found" errors
- **Solution**: Check import paths for case-sensitivity issues
- **Solution**: Ensure all dependencies are installed correctly

## Maintenance Commands

- **View backend logs**: `pm2 logs ecommerce-backend`
- **Restart backend**: `pm2 restart ecommerce-backend`
- **Update application**:
  ```bash
  git pull
  cd server && npm install
  cd ../client && npm install && npm run build
  pm2 restart ecommerce-backend
  ``` 