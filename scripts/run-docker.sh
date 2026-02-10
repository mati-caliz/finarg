#!/bin/bash

# Script to run FinArg with Docker
# Rebuilds images and starts all services with Docker Compose
# Use this for production-like testing, not for active development

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "${PROJECT_ROOT}" || exit 1

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}[FinArg]${NC} Starting with Docker"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}⚠️  Note: For active development, use ./scripts/run-local.sh instead${NC}"
echo -e "${YELLOW}⚠️  Docker mode does not have hot-reload - you need to rebuild after code changes${NC}"
echo ""

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Docker is not running. Please start Docker."
    exit 1
fi

# Ask if full rebuild is needed
echo -e "${YELLOW}[?]${NC} Do you want to rebuild without cache? (s/N): "
read -r rebuild
echo ""

if [[ $rebuild =~ ^[Ss]$ ]]; then
    echo -e "${YELLOW}[INFO]${NC} Stopping services and rebuilding without cache..."
    docker compose down
    docker compose build --no-cache
else
    echo -e "${YELLOW}[INFO]${NC} Rebuilding images..."
    docker compose build
fi

echo ""
echo -e "${GREEN}[INFO]${NC} Starting all services..."
docker compose up -d

echo ""
echo -e "${YELLOW}[INFO]${NC} Waiting for services to be ready..."
sleep 8

echo ""
echo -e "${GREEN}[✓]${NC} Services started!"
echo ""
docker compose ps
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Frontend:${NC}    http://localhost:3000"
echo -e "${GREEN}Backend:${NC}     http://localhost:8080"
echo -e "${GREEN}Swagger:${NC}     http://localhost:8080/swagger-ui.html"
echo -e "${GREEN}PostgreSQL:${NC}  localhost:5432"
echo -e "${GREEN}Redis:${NC}       localhost:6379"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}Useful commands:${NC}"
echo -e "  View logs:     docker compose logs -f [service]"
echo -e "  Stop all:      docker compose down"
echo -e "  Restart:       docker compose restart [service]"
echo -e "  Rebuild:       docker compose up -d --build"
echo ""
