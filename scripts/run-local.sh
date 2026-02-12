#!/bin/bash

# Script to run FinArg full stack locally (backend + frontend)
# Usage:
#   ./scripts/run-local.sh              # Start without scraping
#   ./scripts/run-local.sh --palermo    # Start + scrape Palermo
#   ./scripts/run-local.sh --belgrano   # Start + scrape Belgrano
#   ./scripts/run-local.sh --all        # Start + scrape all neighborhoods
#
# This runs WITHOUT Docker for fast development with hot-reload
# Changes to code will be reflected automatically

set -e

# Parse arguments
SCRAPE_NEIGHBORHOOD=""
SCRAPE_ALL=false
CLEAN_DB=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            SCRAPE_ALL=true
            shift
            ;;
        --clean)
            CLEAN_DB=true
            shift
            ;;
        --palermo|--belgrano|--recoleta|--puerto-madero|--san-telmo|--caballito|--villa-crespo|--nunez|--colegiales|--villa-urquiza)
            SCRAPE_NEIGHBORHOOD="${1:2}"
            shift
            ;;
        --help|-h)
            echo "Usage: $0 [OPTIONS]"
            echo ""
            echo "Options:"
            echo "  (no args)       Start backend and frontend without scraping"
            echo "  --clean         Clean PostgreSQL + Redis (fixes serialization errors)"
            echo "  --palermo       Start + scrape Palermo only"
            echo "  --belgrano      Start + scrape Belgrano only"
            echo "  --recoleta      Start + scrape Recoleta only"
            echo "  --all           Start + scrape all neighborhoods"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --clean --belgrano    # Clean DB + scrape Belgrano"
            echo "  $0 --clean               # Just clean and start"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            echo "Use --help for usage information"
            exit 1
            ;;
    esac
done

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
echo -e "${GREEN}[FinArg]${NC} Starting Full Stack Development (Local Mode)"
echo -e "${BLUE}================================${NC}"
echo -e "${YELLOW}💡 Hot-reload enabled - changes will be reflected automatically${NC}"
echo ""

# ========================================
# 1. Check .env files
# ========================================
echo -e "${GREEN}[1/7]${NC} Checking environment files..."

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
echo -e "${GREEN}[2/7]${NC} Loading backend environment variables..."
set -a
source "${API_DIR}/.env"
set +a
echo -e "${GREEN}[✓]${NC} Backend environment loaded"
echo ""

# ========================================
# 3. Check Docker and start infrastructure
# ========================================
echo -e "${GREEN}[3/7]${NC} Checking Docker services..."
cd "${PROJECT_ROOT}" || exit 1

# Check if Docker is running
echo -e "${YELLOW}[DEBUG]${NC} Checking if Docker daemon is running..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}[ERROR]${NC} Docker is not running. Please start Docker."
    exit 1
fi
echo -e "${GREEN}[✓]${NC} Docker daemon is running"

# Stop Docker backend/frontend if running (we'll run them locally)
echo -e "${YELLOW}[DEBUG]${NC} Checking Docker Compose services..."
if docker compose ps 2>/dev/null | grep -q "backend.*Up"; then
    echo -e "${YELLOW}[WARN]${NC} Docker backend is running on port 8080. Stopping it..."
    docker compose stop backend
fi

if docker compose ps 2>/dev/null | grep -q "frontend.*Up"; then
    echo -e "${YELLOW}[WARN]${NC} Docker frontend is running on port 3000. Stopping it..."
    docker compose stop frontend
fi

# Stop any Maven/Java processes running the backend
echo -e "${YELLOW}[DEBUG]${NC} Checking for backend processes..."

# Check and kill Maven processes
MAVEN_PIDS=$(pgrep -f "spring-boot:run" 2>/dev/null || true)
if [ -n "$MAVEN_PIDS" ]; then
    echo -e "${YELLOW}[WARN]${NC} Found Maven processes, stopping them..."
    echo "$MAVEN_PIDS" | xargs kill -15 2>/dev/null || true
    sleep 2
    # Force kill if still running
    echo "$MAVEN_PIDS" | xargs kill -9 2>/dev/null || true
fi

# Check and kill FinArg Java processes
FINARG_PIDS=$(pgrep -f "FinArgApplication" 2>/dev/null || true)
if [ -n "$FINARG_PIDS" ]; then
    echo -e "${YELLOW}[WARN]${NC} Found FinArg processes, stopping them..."
    echo "$FINARG_PIDS" | xargs kill -15 2>/dev/null || true
    sleep 2
    echo "$FINARG_PIDS" | xargs kill -9 2>/dev/null || true
fi

# Force kill anything on port 8080
PORT_8080_PIDS=$(lsof -ti:8080 2>/dev/null || true)
if [ -n "$PORT_8080_PIDS" ]; then
    echo -e "${YELLOW}[WARN]${NC} Found processes on port 8080, killing them..."
    echo "$PORT_8080_PIDS" | xargs kill -9 2>/dev/null || true
fi

# Wait for database connections to close
if [ "$CLEAN_DB" = true ]; then
    echo -e "${YELLOW}[INFO]${NC} Waiting for database connections to close..."
    sleep 5
fi

echo -e "${GREEN}[✓]${NC} Backend cleanup complete"

# Stop any Node processes on port 3000
echo -e "${YELLOW}[DEBUG]${NC} Checking port 3000..."
PORT_3000_PIDS=$(lsof -ti:3000 2>/dev/null || true)
if [ -n "$PORT_3000_PIDS" ]; then
    echo -e "${YELLOW}[WARN]${NC} Found processes on port 3000, killing them..."
    echo "$PORT_3000_PIDS" | xargs kill -9 2>/dev/null || true
    sleep 2
fi
echo -e "${GREEN}[✓]${NC} Frontend cleanup complete"

# Start PostgreSQL and Redis if not running
echo -e "${YELLOW}[DEBUG]${NC} Checking PostgreSQL and Redis..."
if ! docker compose ps 2>/dev/null | grep -q "postgres.*Up"; then
    echo -e "${YELLOW}[INFO]${NC} Starting PostgreSQL and Redis..."
    docker compose up -d postgres redis
    echo -e "${GREEN}[INFO]${NC} Waiting for services to be ready..."
    sleep 5
else
    echo -e "${GREEN}[✓]${NC} PostgreSQL and Redis already running"
fi

echo -e "${GREEN}[✓]${NC} Infrastructure ready (PostgreSQL + Redis)"
echo ""

# ========================================
# 4. Clear Redis cache + PostgreSQL (optional)
# ========================================
echo -e "${GREEN}[4/7]${NC} Clearing cache to prevent serialization errors..."

# Clear Redis
REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)

if [ -n "$REDIS_CONTAINER" ]; then
    KEYS_BEFORE=$(docker exec "$REDIS_CONTAINER" redis-cli DBSIZE 2>/dev/null | grep -oP '\d+' || echo "0")
    if docker exec "$REDIS_CONTAINER" redis-cli FLUSHDB > /dev/null 2>&1; then
        echo -e "${GREEN}[✓]${NC} Redis cache cleared (removed $KEYS_BEFORE keys)"
    else
        echo -e "${YELLOW}[WARN]${NC} Could not clear Redis cache"
    fi
else
    echo -e "${YELLOW}[WARN]${NC} Redis container not found, skipping cache clear"
fi

# Clear PostgreSQL if --clean flag
if [ "$CLEAN_DB" = true ]; then
    echo -e "${YELLOW}[INFO]${NC} Cleaning PostgreSQL tables (--clean flag enabled)..."

    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)

    if [ -n "$POSTGRES_CONTAINER" ]; then
        echo -e "${YELLOW}[DEBUG]${NC} Using PostgreSQL container: $POSTGRES_CONTAINER"

        # Use TRUNCATE CASCADE for faster cleanup (doesn't require locks)
        docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "TRUNCATE TABLE property_price, property, neighborhood, city CASCADE;" 2>&1 | grep -v "NOTICE" || true

        if [ $? -eq 0 ]; then
            echo -e "${GREEN}[✓]${NC} PostgreSQL tables cleaned (properties will be re-seeded)"
        else
            echo -e "${YELLOW}[WARN]${NC} Could not clean PostgreSQL tables (may already be empty)"
        fi
    else
        echo -e "${YELLOW}[WARN]${NC} PostgreSQL container not found, skipping DB cleanup"
    fi
fi

echo -e "${GREEN}[✓]${NC} Cache cleanup complete"
echo ""

# ========================================
# 5. Check npm dependencies
# ========================================
echo -e "${GREEN}[5/7]${NC} Checking frontend dependencies..."
if [ ! -d "${WEB_DIR}/node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} Installing frontend dependencies..."
    cd "${WEB_DIR}" || exit 1
    npm install
fi
echo -e "${GREEN}[✓]${NC} Frontend dependencies ready"
echo ""

# ========================================
# 5. Run Checkstyle validation
# ========================================
echo -e "${GREEN}[6/7]${NC} Running checkstyle validation..."
cd "${API_DIR}" || exit 1

CHECKSTYLE_OUTPUT=$(mktemp)
if mvn checkstyle:check > "$CHECKSTYLE_OUTPUT" 2>&1; then
    echo -e "${GREEN}[✓]${NC} Checkstyle validation passed"
else
    echo -e "${RED}[✗]${NC} Checkstyle validation failed"
    echo ""
    echo -e "${YELLOW}Checkstyle Errors:${NC}"
    echo -e "${RED}==================${NC}"

    grep -A 5 "\[ERROR\]" "$CHECKSTYLE_OUTPUT" | grep -v "^\[INFO\]" | sed 's/^\[ERROR\]/  /' || cat "$CHECKSTYLE_OUTPUT"

    echo -e "${RED}==================${NC}"
    echo ""
    echo -e "${YELLOW}[WARN]${NC} Code style issues detected. Please fix them before continuing."
    echo -e "${YELLOW}[INFO]${NC} You can run 'mvn spotless:apply' to auto-format the code."
    echo ""

    read -p "Do you want to continue anyway? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        rm "$CHECKSTYLE_OUTPUT"
        echo -e "${RED}[ABORTED]${NC} Please fix checkstyle errors and try again."
        exit 1
    fi
fi
rm "$CHECKSTYLE_OUTPUT"
echo ""

# ========================================
# 6. Start backend and frontend
# ========================================
echo -e "${GREEN}[7/7]${NC} Starting services..."
echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:8080"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Swagger:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "${BLUE}================================${NC}"
echo ""

# Show scraping plan
if [ "$SCRAPE_ALL" = true ]; then
    echo -e "${YELLOW}[INFO]${NC} Will scrape ALL neighborhoods after backend is ready"
elif [ -n "$SCRAPE_NEIGHBORHOOD" ]; then
    echo -e "${YELLOW}[INFO]${NC} Will scrape $SCRAPE_NEIGHBORHOOD after backend is ready"
fi

echo -e "${YELLOW}[INFO]${NC} Press Ctrl+C to stop all services"
echo ""

# Function to cleanup on exit
cleanup() {
    echo ""
    echo -e "${YELLOW}[INFO]${NC} Stopping services..."
    # shellcheck disable=SC2046
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

# Wait for frontend to start
sleep 5

echo ""
echo -e "${BLUE}================================${NC}"
echo -e "${GREEN}Backend:${NC}  http://localhost:8080"
echo -e "${GREEN}Frontend:${NC} http://localhost:3000"
echo -e "${GREEN}Swagger:${NC}  http://localhost:8080/swagger-ui.html"
echo -e "${BLUE}================================${NC}"
echo ""

# ========================================
# 8. Run property scraper if requested
# ========================================
if [ "$SCRAPE_ALL" = true ] || [ -n "$SCRAPE_NEIGHBORHOOD" ]; then
    echo -e "${GREEN}[8/8]${NC} Running property scraper..."
    echo ""

    # Wait for backend to be fully ready
    echo -e "${YELLOW}[INFO]${NC} Waiting for backend to be fully ready..."
    for i in {1..30}; do
        if curl -s http://localhost:8080/actuator/health > /dev/null 2>&1; then
            echo -e "${GREEN}[✓]${NC} Backend is ready"
            break
        fi
        if [ $i -eq 30 ]; then
            echo -e "${RED}[ERROR]${NC} Backend not ready after 30 seconds, skipping scraper"
            break
        fi
        sleep 1
    done

    echo ""

    # Run scraper
    if [ "$SCRAPE_ALL" = true ]; then
        echo -e "${YELLOW}[INFO]${NC} Starting scraper for ALL neighborhoods..."
        echo -e "${YELLOW}[INFO]${NC} This will take 30-50 minutes (3-5 min per neighborhood)"
        echo ""

        curl -X POST "http://localhost:8080/api/v1/real-estate/scraper/run" \
            -H "Content-Type: application/json" \
            2>&1 | grep -v "%" || true

        echo ""
        echo -e "${GREEN}[✓]${NC} Scraping completed"
    elif [ -n "$SCRAPE_NEIGHBORHOOD" ]; then
        echo -e "${YELLOW}[INFO]${NC} Starting scraper for neighborhood: $SCRAPE_NEIGHBORHOOD..."
        echo -e "${YELLOW}[INFO]${NC} This will take 3-5 minutes"
        echo ""

        curl -X POST "http://localhost:8080/api/v1/real-estate/scraper/run?neighborhoodCode=$SCRAPE_NEIGHBORHOOD" \
            -H "Content-Type: application/json" \
            2>&1 | grep -v "%" || true

        echo ""
        echo -e "${GREEN}[✓]${NC} Scraping completed for $SCRAPE_NEIGHBORHOOD"
    fi

    echo ""
fi

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID
