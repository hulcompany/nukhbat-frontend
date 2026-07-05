cd /opt/nukhbat-frontend

git reset --hard
git pull origin main

rm -rf node_modules .next package-lock.json

npm install
npm run build

pm2 restart frontend