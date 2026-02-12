#!/bin/bash

# Script para debugging completo del servidor
# Uso: ./scripts/server-debug.sh

cd "$(dirname "$0")/.."

echo "🔧 Debugging Completo del Servidor FinArg"
echo "═══════════════════════════════════════════════════════════"

# 1. Estado de contenedores
echo ""
echo "1️⃣  Estado de Contenedores:"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml ps

# 2. Logs completos del backend
echo ""
echo "2️⃣  Logs Completos del Backend (últimas 200 líneas):"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml logs --tail=200 backend

# 3. Errores específicos
echo ""
echo "3️⃣  Errores y Excepciones:"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml logs backend 2>/dev/null | grep -i "error\|exception\|failed\|caused by" | tail -30

# 4. Conexiones de red
echo ""
echo "4️⃣  Puertos en Uso:"
echo "─────────────────────────────────────────────────────────"
sudo netstat -tlnp | grep -E ":(8080|3000|5432|6379)" || echo "Comando netstat no disponible"

# 5. Variables de entorno del backend
echo ""
echo "5️⃣  Variables de Entorno del Backend:"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml exec -T backend env | grep -E "DB_|REDIS_|JWT_|CORS_" || echo "No se pudo obtener variables de entorno"

# 6. Conexión a base de datos
echo ""
echo "6️⃣  Conexión a PostgreSQL:"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml exec -T postgres pg_isready || echo "PostgreSQL no está respondiendo"

# 7. Conexión a Redis
echo ""
echo "7️⃣  Conexión a Redis:"
echo "─────────────────────────────────────────────────────────"
docker compose -f docker-compose.prod.yml exec -T redis redis-cli ping || echo "Redis no está respondiendo"

# 8. Espacio en disco
echo ""
echo "8️⃣  Espacio en Disco:"
echo "─────────────────────────────────────────────────────────"
df -h | grep -E "Filesystem|/$"

# 9. Health checks
echo ""
echo "9️⃣  Health Checks:"
echo "─────────────────────────────────────────────────────────"
echo -n "Backend: "
if curl -f http://localhost:8080/api/v1/actuator/health 2>/dev/null; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

echo -n "Frontend: "
if curl -f http://localhost:3000 >/dev/null 2>&1; then
  echo "✅ OK"
else
  echo "❌ FAIL"
fi

# 10. Últimas builds
echo ""
echo "🔟 Información de Imágenes Docker:"
echo "─────────────────────────────────────────────────────────"
docker images | grep finarg

echo ""
echo "═══════════════════════════════════════════════════════════"
echo "✅ Debugging completo finalizado"
echo ""
echo "💡 Tips:"
echo "  - Para reiniciar: ./scripts/server-restart.sh"
echo "  - Para ver logs: ./scripts/server-logs.sh backend 100"
echo "  - Para ver estado: ./scripts/server-status.sh"
