#!/bin/bash

# Script to fix Nginx configuration for foryou-realestate.com
# This ensures the main site is served correctly, not the admin panel

set -e

SERVER_IP="135.181.201.185"
SERVER_USER="root"
DOMAIN="foryou-realestate.com"
ADMIN_DOMAIN="admin.foryou-realestate.com"

echo "🔧 Fixing Nginx configuration for ${DOMAIN}..."
echo "📡 Connecting to ${SERVER_USER}@${SERVER_IP}"
echo ""

# Step 1: Check current Nginx configuration
echo "📋 Checking current Nginx configuration..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    echo "=== Current Nginx sites-enabled ==="
    ls -la /etc/nginx/sites-enabled/ || echo "No sites-enabled directory"
    echo ""
    echo "=== Current Nginx sites-available ==="
    ls -la /etc/nginx/sites-available/ || echo "No sites-available directory"
    echo ""
    echo "=== Checking for admin configuration ==="
    if [ -f /etc/nginx/sites-available/admin ]; then
        echo "Found admin configuration:"
        cat /etc/nginx/sites-available/admin
    fi
    if [ -f /etc/nginx/sites-enabled/admin ]; then
        echo "Admin configuration is enabled!"
    fi
    echo ""
    echo "=== Checking for main site configuration ==="
    if [ -f /etc/nginx/sites-available/foryou-realestate ]; then
        echo "Found main site configuration:"
        cat /etc/nginx/sites-available/foryou-realestate
    fi
ENDSSH

# Step 2: Create correct Nginx configuration for main site
echo ""
echo "🔧 Creating correct Nginx configuration for main site..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Create main site configuration
    cat > /etc/nginx/sites-available/foryou-realestate << 'NGINXCONF'
server {
    listen 80;
    listen [::]:80;
    server_name foryou-realestate.com www.foryou-realestate.com;
    
    # Redirect HTTP to HTTPS if SSL is configured
    # Uncomment after SSL setup:
    # return 301 https://$server_name$request_uri;
    
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

# HTTPS configuration (uncomment and configure after SSL setup)
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name foryou-realestate.com www.foryou-realestate.com;
#     
#     ssl_certificate /etc/letsencrypt/live/foryou-realestate.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/foryou-realestate.com/privkey.pem;
#     
#     location / {
#         proxy_pass http://localhost:3000;
#         proxy_http_version 1.1;
#         proxy_set_header Upgrade $http_upgrade;
#         proxy_set_header Connection 'upgrade';
#         proxy_set_header Host $host;
#         proxy_set_header X-Real-IP $remote_addr;
#         proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
#         proxy_set_header X-Forwarded-Proto $scheme;
#         proxy_cache_bypass $http_upgrade;
#         proxy_read_timeout 300s;
#         proxy_connect_timeout 75s;
#     }
# }
NGINXCONF

    echo "✅ Main site configuration created"
ENDSSH

# Step 3: Ensure admin configuration doesn't interfere
echo ""
echo "🔧 Checking admin configuration..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Create or update admin configuration to only serve admin subdomain
    if [ ! -f /etc/nginx/sites-available/admin ]; then
        echo "Creating admin configuration..."
        cat > /etc/nginx/sites-available/admin << 'ADMINCONF'
# Admin panel configuration - ONLY for admin.foryou-realestate.com
server {
    listen 80;
    listen [::]:80;
    server_name admin.foryou-realestate.com;
    
    # Admin panel should be on a different port or path
    # Update this to match your admin panel setup
    location / {
        # If admin is on port 3001, change accordingly
        proxy_pass http://localhost:3001;
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
ADMINCONF
        echo "✅ Admin configuration created"
    else
        echo "Admin configuration already exists, checking it..."
        # Check if admin config has wrong server_name
        if grep -q "server_name.*foryou-realestate.com" /etc/nginx/sites-available/admin && ! grep -q "server_name.*admin.foryou-realestate.com" /etc/nginx/sites-available/admin; then
            echo "⚠️  Admin configuration has wrong server_name, fixing..."
            # Backup original
            cp /etc/nginx/sites-available/admin /etc/nginx/sites-available/admin.backup
            # Fix server_name to only match admin subdomain
            sed -i 's/server_name.*foryou-realestate.com/server_name admin.foryou-realestate.com/g' /etc/nginx/sites-available/admin
            echo "✅ Admin configuration fixed"
        fi
    fi
ENDSSH

# Step 4: Enable correct sites and disable conflicting ones
echo ""
echo "🔧 Enabling correct Nginx sites..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Remove default site if it exists
    rm -f /etc/nginx/sites-enabled/default
    
    # Enable main site
    ln -sf /etc/nginx/sites-available/foryou-realestate /etc/nginx/sites-enabled/foryou-realestate
    echo "✅ Main site enabled"
    
    # Enable admin site only if it exists and is configured correctly
    if [ -f /etc/nginx/sites-available/admin ]; then
        ln -sf /etc/nginx/sites-available/admin /etc/nginx/sites-enabled/admin
        echo "✅ Admin site enabled"
    fi
    
    # Remove any other conflicting configurations
    # Keep only foryou-realestate and admin
    for site in /etc/nginx/sites-enabled/*; do
        if [ -L "$site" ]; then
            site_name=$(basename "$site")
            if [ "$site_name" != "foryou-realestate" ] && [ "$site_name" != "admin" ]; then
                echo "⚠️  Removing conflicting site: $site_name"
                rm -f "$site"
            fi
        fi
    done
    
    echo ""
    echo "=== Enabled sites ==="
    ls -la /etc/nginx/sites-enabled/
ENDSSH

# Step 5: Test and reload Nginx
echo ""
echo "🧪 Testing Nginx configuration..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    # Test Nginx configuration
    if nginx -t; then
        echo "✅ Nginx configuration is valid"
        echo "🔄 Reloading Nginx..."
        systemctl reload nginx
        echo "✅ Nginx reloaded"
    else
        echo "❌ Nginx configuration test failed!"
        echo "Please check the error above"
        exit 1
    fi
ENDSSH

# Step 6: Check if Next.js app is running
echo ""
echo "🔍 Checking if Next.js application is running..."
ssh -o StrictHostKeyChecking=no ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
    echo "=== PM2 Status ==="
    pm2 status || echo "PM2 not running or no processes"
    echo ""
    echo "=== Checking port 3000 ==="
    netstat -tulpn | grep :3000 || echo "Port 3000 not in use"
    echo ""
    echo "=== Checking if app directory exists ==="
    if [ -d /var/www/foryou-realestate ]; then
        echo "✅ App directory exists"
        ls -la /var/www/foryou-realestate/.next 2>/dev/null && echo "✅ Build directory exists" || echo "⚠️  Build directory not found - may need to build"
    else
        echo "⚠️  App directory not found at /var/www/foryou-realestate"
    fi
ENDSSH

echo ""
echo "✅ Nginx configuration fix completed!"
echo ""
echo "📋 Next steps:"
echo "1. Check if the site is accessible: http://${DOMAIN}"
echo "2. If you see admin panel, check PM2 status: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 status'"
echo "3. Restart the Next.js app if needed: ssh ${SERVER_USER}@${SERVER_IP} 'cd /var/www/foryou-realestate && pm2 restart foryou-realestate'"
echo "4. Check Nginx logs: ssh ${SERVER_USER}@${SERVER_IP} 'tail -f /var/log/nginx/error.log'"
echo "5. Check app logs: ssh ${SERVER_USER}@${SERVER_IP} 'pm2 logs foryou-realestate'"

