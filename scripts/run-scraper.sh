#!/bin/bash

NEIGHBORHOOD_CODE=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --palermo)
            NEIGHBORHOOD_CODE="palermo"
            shift
            ;;
        --belgrano)
            NEIGHBORHOOD_CODE="belgrano"
            shift
            ;;
        --recoleta)
            NEIGHBORHOOD_CODE="recoleta"
            shift
            ;;
        --caballito)
            NEIGHBORHOOD_CODE="caballito"
            shift
            ;;
        --*)
            NEIGHBORHOOD_CODE="${1:2}"
            shift
            ;;
        *)
            echo "Usage: $0 [--neighborhood-code]"
            echo "Examples:"
            echo "  $0                  # Scrape all CABA neighborhoods"
            echo "  $0 --palermo        # Scrape only Palermo"
            echo "  $0 --belgrano       # Scrape only Belgrano"
            exit 1
            ;;
    esac
done

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

if [ -n "$NEIGHBORHOOD_CODE" ]; then
    echo "Starting property scraping for neighborhood: $NEIGHBORHOOD_CODE"
    echo "⏳ This will take approximately 3-5 minutes..."
    URL="http://localhost:8080/api/v1/real-estate/scraper/run?neighborhoodCode=$NEIGHBORHOOD_CODE"
else
    echo "Starting property scraping for ALL neighborhoods..."
    echo "⏳ This may take several minutes (3-5 min per neighborhood)"
    URL="http://localhost:8080/api/v1/real-estate/scraper/run"
fi

echo ""

response=$(curl -s -w "\n%{http_code}" -X POST "$URL")
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
