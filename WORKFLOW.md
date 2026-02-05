# Workflow de Desarrollo y Deploy

## 📝 Flujo de Trabajo Normal

### 1. Hacer Cambios Localmente

```bash
# En tu máquina local
cd ~/Escritorio/frontend-components/finarg

# Hacer cambios en el código...

# Verificar que compila (si tocaste backend)
cd finarg-backend
mvn clean compile

# Verificar lint (si tocaste frontend)
cd finarg-frontend
npm run lint
```

### 2. Commit y Push

```bash
# Volver a la raíz
cd ~/Escritorio/frontend-components/finarg

# Commit y push
git add .
git commit -m "Descripción de los cambios"
git push origin main
```

### 3. Deploy en Producción

```bash
# Conectarte al servidor
ssh root@178.156.210.71

# Actualizar y deployar
cd /root/finarg
git pull
./scripts/deploy.sh
```

## ⚡ Deploy Rápido (Sin Rebuild Completo)

Si solo cambiaste código (no dependencias), usa:

```bash
cd /root/finarg
git pull

# Rebuild solo el servicio que cambió
docker compose -f docker-compose.prod.yml up -d --build backend   # Si cambiaste backend
docker compose -f docker-compose.prod.yml up -d --build frontend  # Si cambiaste frontend
```

Esto es **más rápido** porque usa el cache de Docker.

## 🔄 Cuándo Hacer Rebuild Completo

Usa `./scripts/deploy.sh` (rebuild completo) cuando:
- ✅ Cambies dependencias (`pom.xml`, `package.json`)
- ✅ Cambies configuración de Docker (`Dockerfile`, `docker-compose.yml`)
- ✅ Cambies variables de entorno (`.env`)
- ✅ No estés seguro qué cambió

Usa rebuild parcial cuando:
- ✅ Solo cambies código fuente (`.java`, `.ts`, `.tsx`)
- ✅ Solo cambies estilos (`.css`)
- ✅ Quieras un deploy más rápido

## 🤖 CI/CD Automático (Opcional)

### Configurar GitHub Actions

1. **Agregar secrets en GitHub:**
   - Ve a tu repositorio → Settings → Secrets and variables → Actions
   - Agrega estos secrets:
     - `SERVER_HOST`: `178.156.210.71`
     - `SERVER_USERNAME`: `root`
     - `SERVER_SSH_KEY`: Tu clave SSH privada

2. **Push el workflow:**
   ```bash
   git add .github/workflows/deploy.yml
   git commit -m "Add GitHub Actions deployment workflow"
   git push origin main
   ```

3. **A partir de ahora:**
   - Cada push a `main` → Deploy automático
   - Puedes ver el progreso en GitHub → Actions

### Desventajas de CI/CD Automático

⚠️ Considera antes de activarlo:
- Cada push deploya inmediatamente (sin revisión)
- Si commiteas código con bugs, va directo a producción
- Consume minutos de GitHub Actions (limitados en plan free)

**Recomendación:** Usa deploy manual hasta que el proyecto esté más maduro.

## 📊 Comandos Útiles

### Ver logs en tiempo real
```bash
docker compose -f docker-compose.prod.yml logs -f backend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Reiniciar un servicio específico
```bash
docker compose -f docker-compose.prod.yml restart backend
docker compose -f docker-compose.prod.yml restart frontend
```

### Ver estado de los contenedores
```bash
docker compose -f docker-compose.prod.yml ps
```

### Entrar a un contenedor
```bash
# Backend
docker compose -f docker-compose.prod.yml exec backend sh

# Frontend
docker compose -f docker-compose.prod.yml exec frontend sh

# Postgres
docker compose -f docker-compose.prod.yml exec postgres psql -U finarg_user -d finarg
```

### Limpiar todo y empezar de cero
```bash
# ⚠️ CUIDADO: Esto borra TODA la data
docker compose -f docker-compose.prod.yml down -v
./scripts/deploy.sh
```

## 🔐 Después del Primer Deploy

### Cambiar a modo "validate"

Después de que la app esté corriendo correctamente la primera vez:

```bash
# Editar .env en el servidor
nano /root/finarg/.env

# Cambiar:
HIBERNATE_DDL_AUTO=validate  # Era "update"

# Reiniciar backend
docker compose -f docker-compose.prod.yml restart backend
```

Esto previene que Hibernate modifique la estructura de la BD en producción.

## 🚨 Troubleshooting

### El deploy falló, ¿cómo volver atrás?

```bash
# Ver commits recientes
git log --oneline -5

# Volver al commit anterior
git reset --hard HEAD~1

# Rebuild
./scripts/deploy.sh
```

### ¿Los cambios no se ven reflejados?

```bash
# Limpiar cache de Docker y rebuild sin cache
docker compose -f docker-compose.prod.yml build --no-cache
docker compose -f docker-compose.prod.yml up -d
```

### ¿El frontend no se conecta al backend?

```bash
# Verificar que NEXT_PUBLIC_API_URL esté correcta
docker compose -f docker-compose.prod.yml exec frontend printenv | grep NEXT_PUBLIC_API_URL

# Debe ser: http://178.156.210.71:8080/api/v1
# Si está mal, editar .env y rebuild frontend
```

## 📚 Recursos

- Ver logs completos de deploy: `DEPLOY.md`
- Configuración de producción: `.env.production.example`
- Script de deploy: `scripts/deploy.sh`
