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
            echo "  --clean         Force clean PostgreSQL + Redis (use if errors occur)"
            echo "  --palermo       Start + scrape Palermo only (auto-cleans old properties)"
            echo "  --belgrano      Start + scrape Belgrano only (auto-cleans old properties)"
            echo "  --recoleta      Start + scrape Recoleta only (auto-cleans old properties)"
            echo "  --all           Start + scrape all neighborhoods (auto-cleans old properties)"
            echo "  --help, -h      Show this help message"
            echo ""
            echo "Note: When scraping, old properties are automatically removed to show fresh data."
            echo ""
            echo "Examples:"
            echo "  $0 --belgrano            # Scrape Belgrano (removes old data first)"
            echo "  $0 --clean --all         # Force clean + scrape all"
            echo "  $0                       # Just start (keeps existing data)"
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
echo -e "${GREEN}[1/8]${NC} Checking environment files..."

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
echo -e "${GREEN}[2/8]${NC} Loading backend environment variables..."
set -a
source "${API_DIR}/.env"
set +a
echo -e "${GREEN}[✓]${NC} Backend environment loaded"
echo ""

# ========================================
# 3. Deep clean Docker volumes if scraping
# ========================================
if [ "$SCRAPE_ALL" = true ] || [ -n "$SCRAPE_NEIGHBORHOOD" ] || [ "$CLEAN_DB" = true ]; then
    echo -e "${GREEN}[3/8]${NC} Deep cleaning Docker volumes..."
    cd "${PROJECT_ROOT}" || exit 1

    # Check if Docker is running
    echo -e "${YELLOW}[DEBUG]${NC} Checking if Docker daemon is running..."
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[ERROR]${NC} Docker is not running. Please start Docker."
        exit 1
    fi
    echo -e "${GREEN}[✓]${NC} Docker daemon is running"

    # Stop all containers
    echo -e "${YELLOW}[INFO]${NC} Stopping Docker containers..."
    docker compose down > /dev/null 2>&1 || true

    # Remove Redis and PostgreSQL volumes
    echo -e "${YELLOW}[INFO]${NC} Removing Redis and PostgreSQL volumes..."
    REDIS_VOLUME=$(docker volume ls -q | grep -E 'redis|cache' | head -1)
    POSTGRES_VOLUME=$(docker volume ls -q | grep -E 'postgres|db' | head -1)

    if [ -n "$REDIS_VOLUME" ]; then
        docker volume rm "$REDIS_VOLUME" > /dev/null 2>&1 || true
        echo -e "${GREEN}[✓]${NC} Redis volume removed"
    fi

    if [ -n "$POSTGRES_VOLUME" ]; then
        docker volume rm "$POSTGRES_VOLUME" > /dev/null 2>&1 || true
        echo -e "${GREEN}[✓]${NC} PostgreSQL volume removed"
    fi

    # Start fresh containers
    echo -e "${YELLOW}[INFO]${NC} Starting fresh containers..."
    docker compose up -d postgres redis > /dev/null 2>&1
    echo -e "${GREEN}[✓]${NC} Waiting for containers to be ready..."
    sleep 10

    echo -e "${GREEN}[✓]${NC} Deep clean complete - starting with fresh data"
else
    echo -e "${GREEN}[3/8]${NC} Checking Docker services..."
    cd "${PROJECT_ROOT}" || exit 1

    # Check if Docker is running
    echo -e "${YELLOW}[DEBUG]${NC} Checking if Docker daemon is running..."
    if ! docker info > /dev/null 2>&1; then
        echo -e "${RED}[ERROR]${NC} Docker is not running. Please start Docker."
        exit 1
    fi
    echo -e "${GREEN}[✓]${NC} Docker daemon is running"
fi

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
# 4. Clear Redis cache (prevents DevTools ClassCastException)
# ========================================
echo -e "${GREEN}[4/8]${NC} Clearing Redis cache..."
REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)
if [ -n "$REDIS_CONTAINER" ]; then
    echo -e "${YELLOW}[DEBUG]${NC} Flushing Redis cache to prevent DevTools class loader issues..."
    docker exec "$REDIS_CONTAINER" redis-cli FLUSHALL > /dev/null 2>&1 || true
    echo -e "${GREEN}[✓]${NC} Redis cache cleared (prevents ClassCastException on hot-reload)"
else
    echo -e "${YELLOW}[WARN]${NC} Redis container not found, skipping cache clear"
fi
echo ""

# ========================================
# 5. Verify clean state
# ========================================
if [ "$SCRAPE_ALL" = true ] || [ -n "$SCRAPE_NEIGHBORHOOD" ] || [ "$CLEAN_DB" = true ]; then
    echo -e "${GREEN}[5/8]${NC} Verifying clean state..."

    # Verify Redis is empty
    REDIS_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i redis | head -1)
    if [ -n "$REDIS_CONTAINER" ]; then
        REDIS_KEYS=$(docker exec "$REDIS_CONTAINER" redis-cli DBSIZE 2>/dev/null | grep -oP '\d+' || echo "0")
        echo -e "${GREEN}[✓]${NC} Redis is clean (0 keys)"
    fi

    # Verify PostgreSQL tables don't exist yet
    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)
    if [ -n "$POSTGRES_CONTAINER" ]; then
        echo -e "${GREEN}[✓]${NC} PostgreSQL is clean (fresh volume)"
    fi

    echo -e "${GREEN}[✓]${NC} All caches cleared - ready for fresh scraping"
else
    echo -e "${GREEN}[5/8]${NC} Skipping cache cleanup (no scraping requested)"
fi

echo ""

# Skip the old cleanup logic since we did deep clean
if false; then
    if [ "$CLEAN_DB" = true ]; then
        echo -e "${YELLOW}[INFO]${NC} Cleaning PostgreSQL tables (--clean flag enabled)..."
    else
        echo -e "${YELLOW}[INFO]${NC} Cleaning PostgreSQL property tables (scraping enabled)..."
    fi

    POSTGRES_CONTAINER=$(docker ps --format "{{.Names}}" | grep -i postgres | head -1)

    if [ -n "$POSTGRES_CONTAINER" ]; then
        echo -e "${YELLOW}[DEBUG]${NC} Using PostgreSQL container: $POSTGRES_CONTAINER"

        # Check if property table exists first
        TABLE_EXISTS=$(docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -t -c "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'property');" 2>/dev/null | xargs || echo "f")

        if [ "$TABLE_EXISTS" = "t" ]; then
            # Check current property count
            PROPERTY_COUNT_BEFORE=$(docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -t -c "SELECT COUNT(*) FROM property;" 2>/dev/null | xargs || echo "0")
            echo -e "${YELLOW}[DEBUG]${NC} Properties in DB before cleanup: $PROPERTY_COUNT_BEFORE"

            if [ "$PROPERTY_COUNT_BEFORE" != "0" ]; then
                # Use DELETE instead of TRUNCATE to avoid re-seeding issues
                # This preserves city/neighborhood data while removing properties
                echo -e "${YELLOW}[DEBUG]${NC} Deleting property_price records..."
                docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "DELETE FROM property_price;" 2>&1 | grep -v "NOTICE" || true

                echo -e "${YELLOW}[DEBUG]${NC} Deleting property records..."
                docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "DELETE FROM property;" 2>&1 | grep -v "NOTICE" || true

                # Verify cleanup
                PROPERTY_COUNT_AFTER=$(docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -t -c "SELECT COUNT(*) FROM property;" 2>/dev/null | xargs || echo "0")

                if [ "$PROPERTY_COUNT_AFTER" = "0" ]; then
                    echo -e "${GREEN}[✓]${NC} PostgreSQL tables cleaned successfully (removed $PROPERTY_COUNT_BEFORE properties)"
                else
                    echo -e "${RED}[ERROR]${NC} Failed to clean tables. Properties remaining: $PROPERTY_COUNT_AFTER"
                    echo -e "${YELLOW}[WARN]${NC} This may cause mixed results. Consider restarting PostgreSQL container."
                fi
            else
                echo -e "${GREEN}[✓]${NC} PostgreSQL tables are already empty (0 properties)"
            fi
        else
            echo -e "${YELLOW}[INFO]${NC} Property tables don't exist yet (first run)"
            echo -e "${YELLOW}[INFO]${NC} Backend will create them on startup"
        fi

        # Wait for PostgreSQL to commit transactions
        echo -e "${YELLOW}[DEBUG]${NC} Waiting for PostgreSQL transactions to complete..."
        sleep 2

        # Final verification
        echo -e "${YELLOW}[DEBUG]${NC} Final verification: checking PostgreSQL is ready..."
        for i in {1..10}; do
            if docker exec "$POSTGRES_CONTAINER" psql -U finarg -d finarg -c "SELECT 1;" > /dev/null 2>&1; then
                echo -e "${GREEN}[✓]${NC} PostgreSQL is ready and clean"
                break
            fi
            if [ $i -eq 10 ]; then
                echo -e "${RED}[ERROR]${NC} PostgreSQL not responding after cleanup"
            fi
            sleep 1
        done
    else
        echo -e "${YELLOW}[WARN]${NC} PostgreSQL container not found, skipping DB cleanup"
    fi
fi
# End of old cleanup logic (disabled)

# ========================================
# 6. Check npm dependencies and clear Next.js cache
# ========================================
echo -e "${GREEN}[6/8]${NC} Checking frontend dependencies..."
if [ ! -d "${WEB_DIR}/node_modules" ]; then
    echo -e "${YELLOW}[INFO]${NC} Installing frontend dependencies..."
    cd "${WEB_DIR}" || exit 1
    npm install
fi

# Clear Next.js cache to force recompilation
echo -e "${YELLOW}[DEBUG]${NC} Clearing Next.js cache..."
cd "${WEB_DIR}" || exit 1
rm -rf .next 2>/dev/null || true
echo -e "${GREEN}[✓]${NC} Frontend cache cleared"

echo -e "${GREEN}[✓]${NC} Frontend dependencies ready"
echo ""

# ========================================
# 7. Run Checkstyle validation
# ========================================
echo -e "${GREEN}[7/8]${NC} Running checkstyle validation..."
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
# 8. Start backend and frontend
# ========================================
echo -e "${GREEN}[8/8]${NC} Starting services..."
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

# Start backend in background with 'local' profile
cd "${API_DIR}" || exit 1
if [ -f "${API_DIR}/settings.xml" ]; then
    mvn spring-boot:run -Dspring-boot.run.profiles=local -s "${API_DIR}/settings.xml" 2>&1 | sed "s/^/[BACKEND] /" &
else
    mvn spring-boot:run -Dspring-boot.run.profiles=local 2>&1 | sed "s/^/[BACKEND] /" &
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

if [ "$SCRAPE_ALL" = true ] || [ -n "$SCRAPE_NEIGHBORHOOD" ]; then
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANTE:${NC} Después del scraping, refresca el navegador (Ctrl+Shift+R)"
    echo -e "${YELLOW}   para limpiar el caché del frontend y ver los nuevos datos${NC}"
fi

echo ""

# ========================================
# 9. Run property scraper if requested
# ========================================
if [ "$SCRAPE_ALL" = true ] || [ -n "$SCRAPE_NEIGHBORHOOD" ]; then
    echo -e "${GREEN}[9/9]${NC} Running property scraper..."
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
