#!/bin/bash

set -e

echo "========================================="
echo "  FinArg - News Refresh Script"
echo "========================================="
echo ""

API_URL="${API_URL:-http://localhost:8080}"
ENDPOINT="${API_URL}/api/v1/news/refresh"

echo "🔄 Triggering news aggregation..."
echo "API URL: $ENDPOINT"
echo ""

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" -X POST "$ENDPOINT")

if [ "$HTTP_CODE" -eq 200 ]; then
    echo "✅ News aggregation triggered successfully!"
    echo ""
    echo "📰 The system is now:"
    echo "   1. Scraping news from Infobae and El Economista"
    echo "   2. Analyzing each article with Ollama AI"
    echo "   3. Generating summaries and key points"
    echo ""
    echo "⏱️  This process may take 2-5 minutes depending on the number of new articles."
    echo ""
    echo "💡 You can check the logs with:"
    echo "   docker compose logs -f api    (if running in Docker)"
    echo "   or check your IDE console     (if running locally)"
else
    echo "❌ Error: News aggregation failed with HTTP code $HTTP_CODE"
    exit 1
fi
