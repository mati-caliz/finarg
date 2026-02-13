#!/bin/bash

# Script to debug database contents

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)

if [ -z "$POSTGRES_CONTAINER" ]; then
    echo -e "${YELLOW}[ERROR]${NC} PostgreSQL container not found"
    exit 1
fi

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Database Debug Information${NC}"
echo -e "${BLUE}================================${NC}"
echo ""

echo -e "${YELLOW}[1] Tables in database:${NC}"
docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "\dt" 2>/dev/null
echo ""

echo -e "${YELLOW}[2] Property count:${NC}"
docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "SELECT COUNT(*) as total_properties FROM property;" 2>/dev/null
echo ""

echo -e "${YELLOW}[3] Properties by neighborhood:${NC}"
docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "
SELECT
    n.code as neighborhood_code,
    n.name as neighborhood_name,
    COUNT(p.id) as property_count
FROM neighborhood n
LEFT JOIN property p ON p.neighborhood_id = n.id
GROUP BY n.id, n.code, n.name
ORDER BY property_count DESC;
" 2>/dev/null
echo ""

echo -e "${YELLOW}[4] Sample properties (first 10):${NC}"
docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "
SELECT
    p.id,
    p.external_id,
    p.portal_source,
    n.name as neighborhood,
    p.property_type,
    p.operation_type,
    p.address
FROM property p
JOIN neighborhood n ON p.neighborhood_id = n.id
LIMIT 10;
" 2>/dev/null
echo ""

echo -e "${YELLOW}[5] Redis cache keys:${NC}"
REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)
if [ -n "$REDIS_CONTAINER" ]; then
    REDIS_KEYS=$(docker exec "$REDIS_CONTAINER" redis-cli KEYS "*" 2>/dev/null)
    if [ -z "$REDIS_KEYS" ]; then
        echo "No keys in Redis"
    else
        echo "$REDIS_KEYS"
    fi
    echo ""
    echo "Total keys: $(docker exec "$REDIS_CONTAINER" redis-cli DBSIZE 2>/dev/null)"
else
    echo "Redis container not found"
fi
echo ""

echo -e "${BLUE}================================${NC}"
