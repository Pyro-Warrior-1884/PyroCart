#!/bin/sh
set -e

echo "Generating Prisma Client"
npx prisma generate

echo "Running Migrations"
npx prisma migrate deploy

echo "Seeding Process"

npx prisma db seed

echo "Starting Server"
node dist/main.js