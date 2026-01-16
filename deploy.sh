#!/bin/bash

echo "🚀 Starting deployment to TimeWeb..."

# Create archive
echo "📦 Creating archive..."
cd /Users/nikita/.gemini/antigravity/scratch
tar -czf ngfit-deploy.tar.gz ngfit-pro-clean/ --exclude='node_modules' --exclude='.git' --exclude='dist'

# Upload to server
echo "⬆️  Uploading to server..."
scp ngfit-deploy.tar.gz root@178.209.127.28:/tmp/

# Execute on server
echo "🔧 Installing on server..."
ssh root@178.209.127.28 << 'ENDSSH'
cd /var/www/ngfit
rm -rf *
tar -xzf /tmp/ngfit-deploy.tar.gz --strip-components=1
rm /tmp/ngfit-deploy.tar.gz

# Install dependencies
npm install

# Build
npm run build

# Setup PM2 if not installed
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# Stop old process
pm2 stop ngfit 2>/dev/null || true
pm2 delete ngfit 2>/dev/null || true

# Start new process
pm2 start npm --name "ngfit" -- start
pm2 save

echo "✅ Deployment complete!"
echo "🌐 App should be running on http://178.209.127.28:3000"
ENDSSH

echo "🎉 Done!"
