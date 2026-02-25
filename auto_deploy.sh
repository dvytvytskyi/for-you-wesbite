#!/bin/bash
set -e

HOST="root@135.181.201.185"
PASS="FNrtVkfCRwgW"
DIR="/var/www/foryou-realestate"

echo "📡 Step 1: Syncing files to server..."
sshpass -p "$PASS" rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.DS_Store' --exclude 'node_modules' --exclude 'deploy.log' --exclude 'deploy.sh' ./ $HOST:$DIR

echo "🏗️ Step 2: Building and restarting on server..."
sshpass -p "$PASS" ssh -o StrictHostKeyChecking=no $HOST "cd $DIR && npm install --legacy-peer-deps && npm run build && pm2 restart foryou-realestate"

echo "✅ Deployment complete!"
