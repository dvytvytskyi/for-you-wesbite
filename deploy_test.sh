#!/bin/bash
# Deploy script for test environment
# Server: 135.181.201.185
# Path: /var/www/testenv.foryou-realestate.com
# PM2 Name: testenv-foryou

set -e

HOST="root@135.181.201.185"
PASS="FNrtVkfCRwgW"
DIR="/var/www/testenv.foryou-realestate.com"
APP_NAME="testenv-foryou"

echo "📡 Step 1: Syncing files to test environment..."
# Note: rsync needs sshpass to be installed locally
sshpass -p "$PASS" rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude '.git' \
    --exclude '.DS_Store' \
    --exclude '.env.local' \
    --exclude 'deploy.log' \
    -e "ssh -o StrictHostKeyChecking=no" \
    ./ $HOST:$DIR

echo "🏗️ Step 2: Building and restarting on server..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $HOST "cd $DIR && npm install --legacy-peer-deps && npm run build && pm2 restart $APP_NAME"

echo "✅ Test environment deployment complete!"
