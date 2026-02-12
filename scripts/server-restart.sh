#!/bin/bash

# Script para reiniciar el backend en producción
# Uso: ./scripts/server-restart.sh

set -e

echo "🔄 Reiniciando backend de FinArg..."

cd "$(dirname "$0")/.."

# Detener contenedores
echo "⏹️  Deteniendo contenedores..."
docker compose -f docker-compose.prod.yml down

# Limpiar imágenes antiguas (opcional)
echo "🧹 Limpiando imágenes antiguas..."
docker image prune -f

# Reconstruir y levantar
echo "🏗️  Reconstruyendo imágenes..."
docker compose -f docker-compose.prod.yml build --no-cache backend

echo "🚀 Levantando servicios..."
docker compose -f docker-compose.prod.yml up -d

# Esperar a que el backend esté listo
echo "⏳ Esperando a que el backend esté listo..."
sleep 10

# Verificar health
echo "🏥 Verificando health del backend..."
max_attempts=30
attempt=0

while [ $attempt -lt $max_attempts ]; do
  if curl -f http://localhost:8080/api/v1/actuator/health >/dev/null 2>&1; then
    echo "✅ Backend está funcionando correctamente!"
    docker compose -f docker-compose.prod.yml logs --tail=50 backend
    exit 0
  fi

  attempt=$((attempt + 1))
  echo "⏳ Intento $attempt/$max_attempts..."
  sleep 2
done

echo "❌ El backend no respondió después de $max_attempts intentos"
echo "📋 Logs del backend:"
docker compose -f docker-compose.prod.yml logs --tail=100 backend
exit 1
