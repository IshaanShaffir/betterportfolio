#!/bin/sh
set -e

echo "🚀 Starting application..."

# Wait for database to be ready
echo "⏳ Waiting for database..."
sleep 3

# Skip migrations for now - database schema should be managed separately
# Prisma config dependencies are complex for standalone mode
echo "📦 Skipping migrations (database should already have schema)..."

# Seed the database
echo "🌱 Seeding database..."
node prisma/seed.js

# Start the application
echo "✅ Starting Next.js server..."
exec node server.js
