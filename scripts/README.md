# Scripts de Servidor para FinArg

Scripts útiles para deployment, debugging y gestión del servidor en producción.

## 📋 Scripts Disponibles

### 🚀 `server-deploy.sh`
Deploy completo: pull de git, rebuild de imágenes, y restart de servicios.

```bash
./scripts/server-deploy.sh
```

**Uso:** Ejecutar después de hacer push de cambios al repositorio para deployar automáticamente.

---

### 🔄 `server-restart.sh`
Reinicia el backend reconstruyendo la imagen sin caché.

```bash
./scripts/server-restart.sh
```

**Uso:** Cuando necesitás reiniciar el backend después de cambios en el código Java.

---

### 📋 `server-logs.sh`
Muestra logs de un servicio específico.

```bash
# Ver logs del backend (últimas 100 líneas y seguir)
./scripts/server-logs.sh backend 100

# Ver logs del frontend
./scripts/server-logs.sh frontend

# Ver logs de postgres
./scripts/server-logs.sh postgres 50
```

**Argumentos:**
- `$1`: Nombre del servicio (backend, frontend, postgres, redis, nginx)
- `$2`: Número de líneas a mostrar (default: 100)

---

### 🔍 `server-status.sh`
Verifica el estado de todos los servicios.

```bash
./scripts/server-status.sh
```

**Muestra:**
- Estado de contenedores Docker
- Health checks del backend y frontend
- Uso de recursos (CPU, memoria)
- Últimos errores en logs

**Uso:** Verificación rápida del estado del servidor.

---

### 🔧 `server-debug.sh`
Debugging completo con información detallada.

```bash
./scripts/server-debug.sh
```

**Muestra:**
- Logs completos del backend
- Errores y excepciones
- Puertos en uso
- Variables de entorno
- Conexiones a PostgreSQL y Redis
- Espacio en disco
- Health checks
- Imágenes Docker

**Uso:** Cuando algo no funciona y necesitás información completa para debuggear.

---

## 🎯 Casos de Uso Comunes

### Después de subir cambios
```bash
# Conectarse al servidor
ssh usuario@servidor

# Ir al directorio del proyecto
cd /path/to/finarg

# Deploy automático
./scripts/server-deploy.sh
```

### Backend no responde
```bash
# Ver el estado general
./scripts/server-status.sh

# Si hay problemas, ver debug completo
./scripts/server-debug.sh

# Ver logs en tiempo real
./scripts/server-logs.sh backend 200
```

### Reiniciar después de cambios
```bash
# Si solo cambiaste backend
./scripts/server-restart.sh

# Si cambiaste backend y frontend
./scripts/server-deploy.sh
```

### Ver errores específicos
```bash
# Ver últimos 500 logs del backend
./scripts/server-logs.sh backend 500

# Filtrar solo errores
./scripts/server-logs.sh backend 500 | grep -i error
```

---

## ⚠️ Notas Importantes

- Los scripts usan `docker-compose.prod.yml` por defecto
- Requieren permisos de ejecución (`chmod +x scripts/*.sh`)
- `server-debug.sh` requiere `sudo` para algunos comandos (netstat)
- Los health checks esperan hasta 30 intentos antes de fallar

---

## 🆘 Solución de Problemas

### "Permission denied"
```bash
chmod +x scripts/*.sh
```

### "docker-compose.prod.yml not found"
Asegurarte de ejecutar los scripts desde la raíz del proyecto.

### Backend no levanta después de restart
```bash
# Ver logs completos
./scripts/server-debug.sh

# Verificar variables de entorno
docker compose -f docker-compose.prod.yml config

# Reiniciar todo desde cero
docker compose -f docker-compose.prod.yml down -v
docker compose -f docker-compose.prod.yml up -d --build
```

---

## 🔗 Links Útiles

- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Backend Health: http://localhost:8080/api/v1/actuator/health
- Swagger: http://localhost:8080/swagger-ui.html
