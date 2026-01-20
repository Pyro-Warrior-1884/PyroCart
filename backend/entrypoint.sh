#!/bin/sh
set -e

npx prisma generate

# Apply Prisma migrations
npx prisma migrate deploy

# Start NestJS app
node dist/main.js
