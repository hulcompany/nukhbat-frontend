#!/bin/bash

set -e

export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"

nvm use 20

export PATH="$HOME/.npm-global/bin:$PATH"

echo "Node: $(node -v)"
echo "NPM: $(npm -v)"
echo "PM2: $(which pm2)"

cd /opt/nukhbat-frontend

git fetch origin
git reset --hard origin/main

npm ci
npm run build

pm2 restart frontend || pm2 start npm --name frontend -- start