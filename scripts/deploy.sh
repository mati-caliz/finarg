#!/bin/bash

set -e

echo "🚀 Iniciando deploy de Finarg..."

if [ ! -f .env ]; then
    echo "❌ Error: Archivo .env no encontrado"
    echo "Copia .env.example a .env y configura las variables"
    exit 1
fi

if [ -z "$JWT_SECRET" ]; then
    echo "❌ Error: JWT_SECRET no configurado en .env"
    exit 1
fi

echo "📦 Construyendo imágenes..."
docker-compose -f docker-compose.prod.yml build --no-cache

echo "🛑 Deteniendo contenedores anteriores..."
docker-compose -f docker-compose.prod.yml down

echo "🚀 Levantando servicios..."
docker-compose -f docker-compose.prod.yml up -d

echo "⏳ Esperando que los servicios estén listos..."
sleep 10

echo "✅ Verificando estado de los servicios..."
docker-compose -f docker-compose.prod.yml ps

echo ""
echo "✅ Deploy completado!"
echo ""
echo "📊 Endpoints:"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:8080"
echo "  - API Docs: http://localhost:8080/swagger-ui.html"
echo ""
echo "📝 Ver logs:"
echo "  docker-compose -f docker-compose.prod.yml logs -f"
