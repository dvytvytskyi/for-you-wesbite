#!/bin/bash

# Deploy script for propart.ae
# Server: 88.99.38.25
# Domain: propart.ae

set -e

SERVER_IP="88.99.38.25"
SERVER_USER="root"
DOMAIN="propart.ae"
APP_DIR="/var/www/propart-ae"
PM2_APP_NAME="propart-ae"
SSHPASS="sshpass -p PgTeNqcgnwWu"

echo "🚀 Starting deployment to ${DOMAIN}..."
echo "📡 Connecting to ${SERVER_USER}@${SERVER_IP}"
echo ""

# Step 1: Create app directory
echo "📁 Creating app directory..."
$SSHPASS ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    mkdir -p /var/www/propart-ae
    cd /var/www/propart-ae
ENDSSH

# Step 2: Upload project files
echo "📤 Uploading project files..."
$SSHPASS rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.env.local' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

# Step 3: Create .env.local on server
echo "⚙️  Creating .env.local file..."
$SSHPASS ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    cat > /var/www/propart-ae/.env.local << 'ENVFILE'
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
NEXT_PUBLIC_API_KEY=fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016
NEXT_PUBLIC_API_SECRET=2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoibW1hcmFjaCIsImEiOiJjbTJqMG1pNjUwNzZ4M2psY21mazV5cDU4In0.FQ7FqgFo4QKHqOVaM3JXjQ
NODE_ENV=production
ENVFILE
ENDSSH

# Step 4: Install dependencies and build on server
echo "🔨 Installing dependencies and building project..."
$SSHPASS ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    cd /var/www/propart-ae
    
    # Check if node is installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
        apt-get install -y nodejs
    fi
    
    # Check if pm2 is installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2
    fi

    # Install dependencies
    echo "Installing npm dependencies..."
    npm install --production=false
    
    # Build project
    echo "Building Next.js project..."
    npm run build
ENDSSH

# Step 5: Configure Nginx
echo "🌐 Configuring Nginx..."
$SSHPASS ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/propart-ae << 'NGINXCONF'
server {
    listen 80;
    server_name propart.ae www.propart.ae;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXCONF

    # Enable new site
    ln -sf /etc/nginx/sites-available/propart-ae /etc/nginx/sites-enabled/propart-ae
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
ENDSSH

# Step 6: Start application with PM2
echo "🚀 Starting application with PM2..."
$SSHPASS ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << ENDSSH
    cd /var/www/propart-ae
    
    # Stop existing PM2 process if running
    pm2 stop ${PM2_APP_NAME} 2>/dev/null || true
    pm2 delete ${PM2_APP_NAME} 2>/dev/null || true
    
    # Start application
    pm2 start npm --name "${PM2_APP_NAME}" -- start
    pm2 save
ENDSSH

echo "✅ Deployment to propart.ae completed!"
