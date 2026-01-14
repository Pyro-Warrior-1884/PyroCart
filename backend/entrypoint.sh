#!/bin/sh
set -e

# Apply Prisma migrations
npx prisma migrate deploy

# Start NestJS app
node dist/src/main.js
