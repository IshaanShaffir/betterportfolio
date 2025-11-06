#!/bin/sh
set -e

echo "🚀 Starting application..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed the database
echo "🌱 Seeding database..."
node prisma/seed.js

# Start the application
echo "✅ Starting Next.js server..."
exec node server.js
