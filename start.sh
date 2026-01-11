#!/bin/sh
# Startup script for production deployment
# This script runs before the Next.js server starts

set -e

echo "🚀 Starting Utilities App deployment..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL is not set"
  exit 1
fi

echo "✅ Environment variables validated"

# Generate Prisma Client
echo "📦 Generating Prisma Client..."
npx prisma generate

# Run database migrations
echo "🗄️  Running database migrations..."
npx prisma migrate deploy

echo "✅ Database migrations completed"

# Start the Next.js server
echo "🌐 Starting Next.js server on port ${PORT:-9000}..."
exec node server.js
