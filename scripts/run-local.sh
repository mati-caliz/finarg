#!/bin/bash

# Script to run FinArg full stack locally (backend + frontend)
# Usage: ./scripts/run-local.sh

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Get the project root directory
PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_DIR="${PROJECT_ROOT}/api"
WEB_DIR="${PROJECT_ROOT}/web"

echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}[FinArg]${NC} Starting Full Stack Development"
echo -e "${BLUE}================================${NC}"
echo ""

# ========================================
# 1. Check .env files
# ========================================
echo -e "${GREEN}[1/5]${NC} Checking environment files..."

# Backend .env
if [ ! -f "${API_DIR}/.env" ]; then
    echo -e "${RED}[ERROR]${NC} Backend .env file not found at ${API_DIR}/.env"
    echo -e "${YELLOW}[INFO]${NC} Creating .env from .env.example..."
    
    if [ -f "${API_DIR}/.env.example" ]; then
        cp "${API_DIR}/.env.example" "${API_DIR}/.env"
        echo -e "${YELLOW}[WARN]${NC} Please configure ${API_DIR}/.env with your settings"
        exit 1
    else
        echo -e "${RED}[ERROR]${NC} .env.example not found. Cannot create .env file."
        exit 1
    fi
fi

# Frontend .env.local
if [ ! -f "${WEB_DIR}/.env.local" ]; then
    echo -e "${YELLOW}[WARN]${NC} Frontend .env.local not found"
    if [ -f "${WEB_DIR}/.env.example" ]; then
        echo -e "${YELLOW}[INFO]${NC} Creating .env.local from .env.example..."
        cp "${WEB_DIR}/.env.example" "${WEB_DIR}/.env.local"
    fi
fi

echo -e "${GREEN}[✓]${NC} Environment files ready"
echo ""

# ========================================
# 2. Load backend environment variables
# ========================================
echo -e "${GREEN}[2/5]${NC} Loading backend environment variables..."
set -a
source "${API_DIR}/.env"
set +a
echo -e "${GREEN}[✓]${NC} Backend environment loaded"
echo ""

# ========================================
# 3. Stop Docker backend if running
# ========================================
echo -e "${GREEN}[3/5]${NC} Checking Docker services..."
cd "${PROJECT_ROOT}" || exit 1

if docker compose ps | grep -q "backend.*Up"; then
    echo -e "${YELLOW}[WARN]${NC} Docker backend is running on port 8080. Stopping it..."
    docker compose stop backend
    echo -e "${GREEN}[✓]${NC} Docker backend stopped"
fi

# Start PostgreSQL and Redis if not running
if ! docker compose ps | grep -q "postgres.*Up"; then
    echo -e "${YELLOW}[INFO]${NC} Starting PostgreSQL and Redis..."
    docker compose up -d postgres redis
    echo -e "${GREEN}[INFO]${NC} Waiting for services to be ready..."
    sleep 5
fi

echo -e "${GREEN}[✓]${NC} Docker services ready"
echo ""

# ========================================
# 4. Check npm dependencies
# ========================================
echo -e "${GREEN}[4/5]${NC} Checking frontend dependencies..."
if [ ! -d "${WEB_DIR}/node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} Installing frontend dependencies..."
    cd "${WEB_DIR}" || exit 1
    npm install
fi
echo -e "${GREEN}[✓]${NC} Frontend dependencies ready"
echo ""

# ========================================
# 5. Start backend and frontend
# ========================================
echo -e "${GREEN}[5/5]${NC} Starting services..."
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:8080"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Swagger:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "${BLUE}================================${NC}"
echo ""
echo -e "${YELLOW}[INFO]${NC} Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Stopping services..."
    kill $(jobs -p) 2>/dev/null
    wait
    echo -e "${GREEN}[✓]${NC} All services stopped"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Start backend in background
cd "${API_DIR}" || exit 1
if [ -f "${API_DIR}/settings.xml" ]; then
    mvn spring-boot:run -s "${API_DIR}/settings.xml" 2>&1 | sed "s/^/[BACKEND] /" &
else
    mvn spring-boot:run 2>&1 | sed "s/^/[BACKEND] /" &
fi
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 8

# Start frontend in background
cd "${WEB_DIR}" || exit 1
npm run dev 2>&1 | sed "s/^/[FRONTEND] /" &
FRONTEND_PID=$!

# Wait for frontend to start and show final message
sleep 5

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:8080"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Swagger:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "${BLUE}================================${NC}"
echo ""

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
