#!/bin/bash

set -e

echo "🚀 Quick Deploy - Finarg"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "Debes ejecutar este script desde la raíz del proyecto"
    exit 1
fi

# Detectar docker compose
if command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE="docker-compose"
elif docker compose version &> /dev/null; then
    DOCKER_COMPOSE="docker compose"
else
    echo "❌ Error: Docker Compose no está instalado"
    exit 1
fi

echo "Selecciona qué servicio actualizar:"
echo "  1) Backend"
echo "  2) Frontend"
echo "  3) Ambos"
echo "  4) Todo (incluyendo DB y Redis)"
echo ""
read -p "Opción [1-4]: " option

case $option in
    1)
        echo "📦 Rebuilding backend..."
        $DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build backend
        echo "✅ Backend actualizado"
        ;;
    2)
        echo "📦 Rebuilding frontend..."
        $DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build frontend
        echo "✅ Frontend actualizado"
        ;;
    3)
        echo "📦 Rebuilding backend y frontend..."
        $DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build backend frontend
        echo "✅ Backend y Frontend actualizados"
        ;;
    4)
        echo "📦 Rebuilding todos los servicios..."
        $DOCKER_COMPOSE -f docker-compose.prod.yml up -d --build
        echo "✅ Todos los servicios actualizados"
        ;;
    *)
        echo "❌ Opción inválida"
        exit 1
        ;;
esac

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 5

echo ""
echo "📊 Estado de los servicios:"
$DOCKER_COMPOSE -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy completado!"
echo ""
echo "📝 Ver logs:"
echo "  $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f backend"
echo "  $DOCKER_COMPOSE -f docker-compose.prod.yml logs -f frontend"
