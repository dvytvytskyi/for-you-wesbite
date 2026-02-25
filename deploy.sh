#!/bin/bash
set -e

HOST="root@135.181.201.185"
DIR="/var/www/foryou-realestate"

echo "Creating remote directory if needed..."
ssh $HOST "mkdir -p $DIR"

echo "Syncing files..."
rsync -avz --exclude 'node_modules' --exclude '.next' --exclude '.git' --exclude '.DS_Store' --exclude 'setup_ssh.exp' --exclude 'deploy.sh' ./ $HOST:$DIR

echo "Building and restarting on server..."
ssh $HOST "cd $DIR && npm install --legacy-peer-deps && npm run build && pm2 restart 35"

echo "Deployment complete!"
