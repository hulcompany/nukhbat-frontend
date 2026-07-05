#!/bin/bash
set -euo pipefail

APP_NAME="frontend"
APP_DIR="/opt/nukhbat-frontend"
NODE_VERSION="20"

echo "=== Deploy started: $(date) ==="
echo "User: $(whoami) | HOME: $HOME"

# --- Load nvm and force Node 20 ---
export NVM_DIR="$HOME/.nvm"
if [ ! -s "$NVM_DIR/nvm.sh" ]; then
  echo "ERROR: nvm not found at $NVM_DIR"
  exit 1
fi
source "$NVM_DIR/nvm.sh"

nvm use "$NODE_VERSION" || {
  echo "Node $NODE_VERSION not installed, installing..."
  nvm install "$NODE_VERSION"
  nvm use "$NODE_VERSION"
}
nvm alias default "$NODE_VERSION" >/dev/null

# --- Hard assertion: never build on the wrong version ---
if [[ "$(node -v)" != v${NODE_VERSION}* ]]; then
  echo "ERROR: Wrong Node version: $(node -v) (expected v${NODE_VERSION}.x)"
  echo "which node: $(which node)"
  exit 1
fi

export PATH="$HOME/.npm-global/bin:$PATH"

echo "Node: $(node -v)"
echo "NPM:  $(npm -v)"

# --- Ensure pm2 exists ---
if ! command -v pm2 >/dev/null 2>&1; then
  echo "pm2 not found, installing globally..."
  npm install -g pm2
fi
echo "PM2:  $(which pm2)"

# --- Pull latest code ---
cd "$APP_DIR"
echo "=== Pulling latest code ==="
git fetch origin
git reset --hard origin/main

# --- Install & build ---
echo "=== Installing dependencies ==="
npm ci

echo "=== Building ==="
npm run build

# --- Restart app ---
# pm2 caches the node interpreter from the FIRST start of a process.
# If the process exists but runs the wrong node version, delete and
# recreate it so it picks up Node 20. Otherwise a normal restart is fine.
echo "=== Restarting app ==="
if pm2 describe "$APP_NAME" >/dev/null 2>&1; then
  PM2_NODE=$(pm2 info "$APP_NAME" | grep -oP 'node\.js version\s+│\s+\K[0-9]+' || echo "")
  if [ -n "$PM2_NODE" ] && [ "$PM2_NODE" != "$NODE_VERSION" ]; then
    echo "Process is running Node $PM2_NODE — recreating under Node $NODE_VERSION"
    pm2 delete "$APP_NAME"
    pm2 start npm --name "$APP_NAME" -- start
  else
    pm2 restart "$APP_NAME" --update-env
  fi
else
  pm2 start npm --name "$APP_NAME" -- start
fi

pm2 save

echo "=== Deploy finished: $(date) ==="
pm2 info "$APP_NAME" | grep -E "status|node" || true