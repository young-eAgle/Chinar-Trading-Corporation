#!/bin/bash

echo "=== E-commerce Deployment Script ==="
echo "This script will deploy the application with production settings."

# Stop current application
echo "Stopping any running instances..."
pm2 stop e-backend || true
pm2 delete e-backend || true

# Ensure we're using the right environment
echo "Setting environment to production..."
export NODE_ENV=production

# Print environment information
echo "Current environment: $NODE_ENV"
echo "Current directory: $(pwd)"

# Install dependencies (if needed)
echo "Installing dependencies..."
npm install --production

# Make sure .env.production exists
if [ ! -f .env.production ]; then
  echo "ERROR: .env.production file not found!"
  exit 1
fi

# Verify .env.production has required variables
if ! grep -q "NODE_ENV=production" .env.production; then
  echo "WARNING: NODE_ENV might not be set correctly in .env.production"
fi

# Start the application with explicit production environment
echo "Starting application in production mode..."
NODE_ENV=production pm2 start index.js --name e-backend --max-memory-restart 300M

# Save PM2 configuration
echo "Saving PM2 configuration..."
pm2 save

# Display status
echo "Application deployment complete!"
echo "checking logs for environment verification:"
sleep 2
pm2 logs e-backend --lines 10 || true

echo ""
echo "=== Deployment Complete ==="
echo "To check status: pm2 status"
echo "To view logs: pm2 logs e-backend" 