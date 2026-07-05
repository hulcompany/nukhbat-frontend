#!/bin/bash

cd /opt/nukhbat-frontend || exit

git pull origin main

npm run build

npm run start