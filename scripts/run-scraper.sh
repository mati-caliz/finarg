#!/bin/bash

echo "🏠 FinArg - Property Scraper Manual Execution"
echo "=============================================="
echo ""

echo "Checking if backend is running..."
if ! curl -s http://localhost:8080/actuator/health > /dev/null; then
    echo "❌ Error: Backend is not running on port 8080"
    echo "   Please start the backend first with: cd api && mvn spring-boot:run"
    exit 1
fi

echo "✅ Backend is running"
echo ""
echo "Starting property scraping job..."
echo "⏳ This may take several minutes (3-5 min per neighborhood)"
echo ""

response=$(curl -s -w "\n%{http_code}" -X POST http://localhost:8080/api/v1/real-estate/scraper/run)
http_code=$(echo "$response" | tail -n1)
body=$(echo "$response" | sed '$d')

if [ "$http_code" -eq 200 ]; then
    echo "✅ Scraping completed successfully!"
    echo "$body" | jq .
else
    echo "❌ Error running scraper (HTTP $http_code)"
    echo "$body" | jq .
    exit 1
fi

echo ""
echo "📊 Checking scraped data..."
cities=$(curl -s http://localhost:8080/api/v1/real-estate/cities | jq length)
echo "   Cities available: $cities"

echo ""
echo "🎉 Done! You can now use the Real Estate Intelligence page."
