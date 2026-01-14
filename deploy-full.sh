#!/bin/bash

# Full deployment script for foryou-realestate.com
# This script performs complete deployment without interactive prompts

set -e

SERVER_IP="135.181.201.185"
SERVER_USER="root"
DOMAIN="foryou-realestate.com"
APP_DIR="/var/www/foryou-realestate"
PM2_APP_NAME="foryou-realestate"

echo "🚀 Starting full deployment to ${DOMAIN}..."
echo ""

# Check if sshpass is available, if not, provide instructions
if ! command -v sshpass &> /dev/null; then
    echo "⚠️  sshpass is not installed. Installing it first..."
    if [[ "$OSTYPE" == "darwin"* ]]; then
        echo "   Please install sshpass: brew install hudochenko/sshpass/sshpass"
        echo "   Or run: brew install hudochenko/sshpass/sshpass"
        exit 1
    else
        echo "   Installing sshpass..."
        sudo apt-get update && sudo apt-get install -y sshpass
    fi
fi

# Read password from user or use environment variable
if [ -z "$SERVER_PASSWORD" ]; then
    SERVER_PASSWORD="xTVvPEwrpaF4"
fi

echo "📡 Step 1: Checking server connection..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no -o ConnectTimeout=10 ${SERVER_USER}@${SERVER_IP} "echo '✓ Connected to server'" || {
    echo "❌ Cannot connect to server. Please check network and credentials."
    exit 1
}

echo "📦 Step 2: Installing required packages on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    echo "Updating system packages..."
    apt-get update -y > /dev/null 2>&1
    
    # Install Node.js 20.x if not installed
    if ! command -v node &> /dev/null; then
        echo "Installing Node.js 20.x..."
        curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null 2>&1
        apt-get install -y nodejs > /dev/null 2>&1
    else
        echo "✓ Node.js already installed: $(node --version)"
    fi
    
    # Install PM2 if not installed
    if ! command -v pm2 &> /dev/null; then
        echo "Installing PM2..."
        npm install -g pm2 > /dev/null 2>&1
    else
        echo "✓ PM2 already installed: $(pm2 --version)"
    fi
    
    # Install Nginx if not installed
    if ! command -v nginx &> /dev/null; then
        echo "Installing Nginx..."
        apt-get install -y nginx > /dev/null 2>&1
        systemctl enable nginx > /dev/null 2>&1
    else
        echo "✓ Nginx already installed"
    fi
    
    # Install Certbot if not installed
    if ! command -v certbot &> /dev/null; then
        echo "Installing Certbot..."
        apt-get install -y certbot python3-certbot-nginx > /dev/null 2>&1
    else
        echo "✓ Certbot already installed"
    fi
    
    echo "✓ All packages installed"
ENDSSH

echo "📁 Step 3: Creating app directory and cleaning up..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    mkdir -p /var/www/foryou-realestate
    cd /var/www/foryou-realestate
    
    # Stop and remove old PM2 process if exists
    pm2 stop foryou-realestate 2>/dev/null || true
    pm2 delete foryou-realestate 2>/dev/null || true
    
    # Remove old build files but keep .env.local if exists
    if [ -f .env.local ]; then
        mv .env.local .env.local.backup
    fi
    rm -rf .next node_modules package*.json *.ts *.tsx components app lib messages public scripts middleware.ts i18n.ts next.config.mjs tsconfig.json
    
    echo "✓ Directory prepared"
ENDSSH

echo "📤 Step 4: Uploading project files..."
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.env.local' \
    --exclude '.DS_Store' \
    --exclude '*.log' \
    -e "sshpass -p '$SERVER_PASSWORD' ssh -o StrictHostKeyChecking=no" \
    ./ ${SERVER_USER}@${SERVER_IP}:${APP_DIR}/

echo "⚙️  Step 5: Creating .env.local file on server..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    cat > /var/www/foryou-realestate/.env.local << 'ENVFILE'
NEXT_PUBLIC_API_URL=https://admin.foryou-realestate.com/api
NEXT_PUBLIC_API_KEY=fyr_7084daf35cf6427f60e06bccd675f133b8a19ce4866cf941156bb4f38fba4016
NEXT_PUBLIC_API_SECRET=2e9e9a3a8080f207cf1c684baaeff40dcd4404c10f4d2207340bb48ee8ccdccda3f4e2fde5bd74fa4d8f463e361c45c9437206a97abb772415263e3a69655a73
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1IjoiYWJpZXNwYW5hIiwiYSI6ImNsb3N4NzllYzAyOWYybWw5ZzNpNXlqaHkifQ.UxlTvUuSq9L5jt0jRtRR-A
NODE_ENV=production
ENVFILE
    echo "✓ .env.local created"
ENDSSH

echo "🔨 Step 6: Installing dependencies (this may take 5-10 minutes)..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    cd /var/www/foryou-realestate
    
    echo "Installing npm dependencies..."
    npm install 2>&1
    
    echo "✓ Dependencies installed"
ENDSSH

echo "🏗️  Step 7: Building project (this may take 5-10 minutes)..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    cd /var/www/foryou-realestate
    
    echo "Building Next.js project..."
    npm run build 2>&1
    
    echo "✓ Build completed"
ENDSSH

echo "🌐 Step 8: Configuring Nginx..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    
    # Create Nginx configuration
    cat > /etc/nginx/sites-available/foryou-realestate << 'NGINXCONF'
server {
    listen 80;
    server_name foryou-realestate.com www.foryou-realestate.com;
    
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINXCONF

    # Remove default site
    rm -f /etc/nginx/sites-enabled/default
    
    # Enable new site
    ln -sf /etc/nginx/sites-available/foryou-realestate /etc/nginx/sites-enabled/foryou-realestate
    
    # Test Nginx configuration
    nginx -t
    
    # Reload Nginx
    systemctl reload nginx
    
    echo "✓ Nginx configured"
ENDSSH

echo "🚀 Step 9: Starting application with PM2..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    cd /var/www/foryou-realestate
    
    # Start application
    pm2 start npm --name "foryou-realestate" -- start
    
    # Save PM2 configuration
    pm2 save
    
    # Wait a bit for app to start
    sleep 5
    
    # Check status
    pm2 status
    
    echo "✓ Application started"
ENDSSH

echo "🔒 Step 10: Setting up SSL certificate..."
sshpass -p "$SERVER_PASSWORD" ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} bash << 'ENDSSH'
    set -e
    
    # Try to get SSL certificate
    certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com \
        --non-interactive --agree-tos \
        --email admin@foryou-realestate.com \
        --redirect 2>&1 || {
        echo "⚠️  SSL certificate setup may need manual intervention"
        echo "   Run manually: certbot --nginx -d foryou-realestate.com -d www.foryou-realestate.com"
    }
    
    echo "✓ SSL setup attempted"
ENDSSH

echo ""
echo "✅ Deployment completed!"
echo ""
echo "📋 Verification steps:"
echo "1. Check PM2 status: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "2. Check application logs: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs foryou-realestate'"
echo "3. Check Nginx status: ssh ${SERVER_USER}@${SERVER_IP} 'systemctl status nginx'"
echo "4. Visit website: http://${DOMAIN} (or https://${DOMAIN} if SSL is configured)"
echo ""
echo "🔍 To check if app is running:"
echo "   curl http://localhost:3000 (on server)"
echo "   or visit: http://${DOMAIN}"

