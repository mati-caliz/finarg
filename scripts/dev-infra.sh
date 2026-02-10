#!/bin/bash

# Script para desarrollo local con hot-reload
# Los cambios se reflejan instantáneamente sin reconstruir

set -e

echo "🚀 Iniciando FinArg en modo desarrollo..."
echo ""

# Verificar si Docker está corriendo
if ! docker info > /dev/null 2>&1; then
    echo "❌ Error: Docker no está corriendo"
    exit 1
fi

# Levantar solo PostgreSQL y Redis
echo "📦 Levantando infraestructura (PostgreSQL + Redis)..."
docker compose up -d postgres redis

# Esperar a que estén listos
echo "⏳ Esperando a que la base de datos esté lista..."
sleep 3

echo ""
echo "✅ Infraestructura lista!"
echo ""
echo "📝 Para iniciar el desarrollo:"
echo ""
echo "  Frontend (en una terminal):"
echo "    cd web && npm run dev"
echo ""
echo "  Backend (en otra terminal):"
echo "    cd api && mvn spring-boot:run"
echo ""
echo "  O usa concurrently para ambos:"
echo "    npm run dev:all"
echo ""
echo "💡 Los cambios en el código se reflejarán automáticamente"
echo "🌐 Frontend: http://localhost:3000"
echo "🔧 Backend: http://localhost:8080"
echo ""
