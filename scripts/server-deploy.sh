#!/bin/bash

# Script para deploy rápido en producción
# Uso: ./scripts/server-deploy.sh

set -e

cd "$(dirname "$0")/.."

echo "🚀 Deploy de FinArg a Producción"
echo "═══════════════════════════════════════════════════════════"

# Verificar que estamos en la rama correcta
CURRENT_BRANCH=$(git branch --show-current)
echo "📌 Rama actual: $CURRENT_BRANCH"

# Pull de cambios
echo ""
echo "⬇️  Bajando últimos cambios del repositorio..."
git pull origin $CURRENT_BRANCH

# Detener servicios
echo ""
echo "⏹️  Deteniendo servicios..."
docker compose -f docker-compose.prod.yml down

# Rebuild
echo ""
echo "🏗️  Reconstruyendo imágenes..."
docker compose -f docker-compose.prod.yml build

# Levantar servicios
echo ""
echo "🚀 Levantando servicios..."
docker compose -f docker-compose.prod.yml up -d

# Esperar y verificar
echo ""
echo "⏳ Esperando a que los servicios estén listos..."
sleep 15

# Health check
echo ""
echo "🏥 Verificando health..."

max_attempts=20
attempt=0
while [ $attempt -lt $max_attempts ]; do
  if curl -f http://localhost:8080/api/v1/actuator/health >/dev/null 2>&1; then
    echo "✅ Backend funcionando correctamente!"
    break
  fi
  attempt=$((attempt + 1))
  echo "⏳ Intento $attempt/$max_attempts..."
  sleep 3
done

if [ $attempt -eq $max_attempts ]; then
  echo "❌ El backend no respondió. Ejecutá ./scripts/server-debug.sh para más información"
  exit 1
fi

# Mostrar estado final
echo ""
echo "📊 Estado Final:"
docker compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy completado exitosamente!"
echo ""
echo "🔗 URLs:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:8080"
echo "  - Health: http://localhost:8080/api/v1/actuator/health"
echo ""
echo "📋 Para ver logs: ./scripts/server-logs.sh backend"
