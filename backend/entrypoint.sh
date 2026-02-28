#!/bin/sh
set -e

echo "Generating Prisma client..."
npx prisma generate

echo "Running migrations..."
npx prisma migrate deploy

echo "Checking seed state..."
COUNT=$(node dist/check-seed.js)

if [ "$COUNT" -eq "0" ]; then
  echo "Seeding database..."
  npx prisma db seed
else
  echo "Seed not required."
fi

echo "Starting server..."
node dist/main.js