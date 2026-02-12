#!/bin/bash

echo "🗑️  FinArg - Clear Redis Cache"
echo "=============================="
echo ""

echo "Checking if Redis is running..."
if ! docker ps | grep -q redis; then
    echo "❌ Error: Redis container is not running"
    echo "   Please start Redis first with: docker compose up -d redis"
    exit 1
fi

echo "✅ Redis is running"
echo ""
echo "This will clear ALL cached data including:"
echo "  - Cities and neighborhoods"
echo "  - Property prices"
echo "  - Currency quotes"
echo "  - Inflation data"
echo "  - Reserves data"
echo ""
read -p "Are you sure you want to continue? (y/N): " confirm

if [[ "$confirm" != "y" && "$confirm" != "Y" ]]; then
    echo "Operation cancelled."
    exit 0
fi

echo ""
echo "Clearing Redis cache..."

REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)

if [ -z "$REDIS_CONTAINER" ]; then
    echo "❌ Error: Could not find Redis container"
    exit 1
fi

echo "Using Redis container: $REDIS_CONTAINER"

docker exec "$REDIS_CONTAINER" redis-cli FLUSHDB

if [ $? -eq 0 ]; then
    echo "✅ Redis cache cleared successfully!"
    echo ""
    echo "📝 Note: The cache will be automatically repopulated on next API requests."
else
    echo "❌ Error clearing Redis cache"
    exit 1
fi
