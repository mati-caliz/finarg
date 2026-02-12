#!/bin/bash

# Script para verificar el estado del servidor
# Uso: ./scripts/server-status.sh

cd "$(dirname "$0")/.."

echo "🔍 Estado de los servicios de FinArg"
echo "═══════════════════════════════════════════════════════════"

# Estado de contenedores
echo ""
echo "📦 Contenedores Docker:"
docker compose -f docker-compose.prod.yml ps

# Health del backend
echo ""
echo "🏥 Health Check del Backend:"
if curl -f http://localhost:8080/api/v1/actuator/health 2>/dev/null; then
  echo "✅ Backend respondiendo correctamente"
else
  echo "❌ Backend NO está respondiendo"
  echo ""
  echo "📋 Últimas 50 líneas de logs:"
  docker compose -f docker-compose.prod.yml logs --tail=50 backend
fi

# Health del frontend
echo ""
echo "🏥 Health Check del Frontend:"
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ Frontend respondiendo correctamente"
else
  echo "❌ Frontend NO está respondiendo"
fi

# Uso de recursos
echo ""
echo "💾 Uso de Recursos:"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" \
  $(docker compose -f docker-compose.prod.yml ps -q)

# Últimos errores
echo ""
echo "🚨 Últimos errores en logs (si hay):"
docker compose -f docker-compose.prod.yml logs --tail=200 backend 2>/dev/null | grep -i "error\|exception\|failed" | tail -10 || echo "No se encontraron errores recientes"
