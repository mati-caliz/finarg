#!/bin/bash

# Script para ver logs del servidor
# Uso: ./scripts/server-logs.sh [servicio] [líneas]
# Ejemplos:
#   ./scripts/server-logs.sh backend 100
#   ./scripts/server-logs.sh frontend
#   ./scripts/server-logs.sh

SERVICE=${1:-backend}
LINES=${2:-100}

cd "$(dirname "$0")/.."

echo "📋 Mostrando últimas $LINES líneas de logs de $SERVICE..."
echo "─────────────────────────────────────────────────────────"

docker compose -f docker-compose.prod.yml logs --tail=$LINES --follow $SERVICE
