# Guía de Deploy a Producción

## Requisitos Previos

- Docker y Docker Compose instalados
- Un servidor con al menos 2GB RAM
- Dominio configurado (opcional pero recomendado)
- Certificado SSL (para HTTPS)

## Configuración de Variables de Entorno

### 1. Crear archivo .env en la raíz del proyecto

```bash
# Database Configuration
DB_NAME=finarg_prod
DB_USERNAME=finarg_prod
DB_PASSWORD=tu_password_muy_seguro_aqui

# Hibernate Configuration
HIBERNATE_DDL_AUTO=validate
HIBERNATE_SHOW_SQL=false

# Redis Configuration
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=tu_redis_password

# JWT Configuration (GENERA UNO NUEVO)
JWT_SECRET=$(openssl rand -base64 64)

# Mail Configuration
MAIL_USERNAME=tu_email@gmail.com
MAIL_PASSWORD=tu_app_password_de_gmail

# Google OAuth
GOOGLE_CLIENT_ID=tu_google_client_id

# Frontend
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api/v1
```

### 2. Generar JWT Secret seguro

```bash
openssl rand -base64 64
```

## Deploy Local (Desarrollo)

```bash
# Construir y levantar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

Acceder a:
- Frontend: http://localhost:3000
- Backend: http://localhost:8080
- Swagger: http://localhost:8080/swagger-ui.html

## Deploy a Producción

### Opción 1: Con Docker Compose

```bash
# 1. Crear el archivo .env con las variables de producción
cp .env.example .env
nano .env  # Editar con tus valores de producción

# 2. Construir las imágenes
docker-compose -f docker-compose.yml build

# 3. Levantar los servicios
docker-compose -f docker-compose.yml up -d

# 4. Verificar que todo está corriendo
docker-compose -f docker-compose.yml ps

# 5. Ver logs
docker-compose -f docker-compose.yml logs -f
```

### Opción 2: En un VPS (AWS, DigitalOcean, etc.)

#### En tu máquina local:

```bash
# 1. Clonar el repositorio en el servidor
ssh usuario@tu-servidor
git clone tu-repositorio.git
cd finarg

# 2. Crear el archivo .env
nano .env
# Pegar las variables de producción

# 3. Ejecutar el deploy
docker-compose -f docker-compose.yml up -d
```

### Configuración de Nginx (Opcional pero Recomendado)

Si usas el `docker-compose.yml`, necesitas configurar Nginx:

```bash
# Crear directorio para la configuración
mkdir -p nginx/ssl

# Copiar tu certificado SSL
cp tu-certificado.crt nginx/ssl/
cp tu-clave.key nginx/ssl/
```

Crear `nginx/nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream frontend {
        server frontend:3000;
    }

    upstream backend {
        server backend:8080;
    }

    server {
        listen 80;
        server_name tu-dominio.com;
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name tu-dominio.com;

        ssl_certificate /etc/nginx/ssl/tu-certificado.crt;
        ssl_certificate_key /etc/nginx/ssl/tu-clave.key;

        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        location / {
            proxy_pass http://frontend;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_cache_bypass $http_upgrade;
        }

        location /api/ {
            proxy_pass http://backend;
            proxy_http_version 1.1;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## Migraciones de Base de Datos

### Primera vez (crear esquema)

```bash
# En el archivo .env, usar:
HIBERNATE_DDL_AUTO=update

# Después de la primera ejecución, cambiar a:
HIBERNATE_DDL_AUTO=validate
```

### Actualizaciones

Para producción, es recomendable usar herramientas de migración como Flyway o Liquibase.

## Monitoreo y Mantenimiento

### Ver logs en tiempo real

```bash
docker-compose -f docker-compose.yml logs -f backend
docker-compose -f docker-compose.yml logs -f frontend
```

### Reiniciar un servicio

```bash
docker-compose -f docker-compose.yml restart backend
docker-compose -f docker-compose.yml restart frontend
```

### Backup de la base de datos

```bash
# Backup
docker exec finarg-postgres-prod pg_dump -U finarg_prod finarg_prod > backup_$(date +%Y%m%d).sql

# Restaurar
docker exec -i finarg-postgres-prod psql -U finarg_prod finarg_prod < backup_20260205.sql
```

### Actualizar la aplicación

```bash
# 1. Pull los últimos cambios
git pull origin main

# 2. Reconstruir las imágenes
docker-compose -f docker-compose.prod.yml build

# 3. Reiniciar con los nuevos contenedores
docker-compose -f docker-compose.yml up -d
```

## Troubleshooting

### El backend no se conecta a la base de datos

```bash
# Verificar que postgres esté corriendo
docker-compose -f docker-compose.yml ps postgres

# Ver logs de postgres
docker-compose -f docker-compose.yml logs postgres

# Verificar la conexión
docker exec -it finarg-postgres-prod psql -U finarg_prod -d finarg_prod
```

### El frontend no se conecta al backend

```bash
# Verificar la variable NEXT_PUBLIC_API_URL
docker-compose -f docker-compose.yml exec frontend printenv | grep NEXT_PUBLIC_API_URL

# Debe apuntar a tu dominio público, no a localhost
```

### Memoria insuficiente

```bash
# Ajustar JAVA_OPTS en docker-compose.yml
JAVA_OPTS: "-Xmx512m -Xms256m"  # Para servidores con menos RAM
```

## Seguridad

### Checklist de Seguridad para Producción

- [ ] Cambiar todas las contraseñas por defecto
- [ ] Generar un nuevo JWT_SECRET
- [ ] Usar HTTPS (certificado SSL)
- [ ] Configurar firewall (solo puertos 80, 443)
- [ ] Actualizar variables de entorno sensibles
- [ ] Usar `HIBERNATE_DDL_AUTO=validate` en producción
- [ ] Configurar backups automáticos
- [ ] Limitar rate limiting en Nginx
- [ ] Configurar logs centralizados

## Plataformas de Deploy Recomendadas

### AWS (EC2 + RDS)

1. Crear una instancia EC2
2. Crear una base de datos RDS PostgreSQL
3. Usar ElastiCache para Redis
4. Configurar las variables de entorno con los endpoints de AWS

### DigitalOcean

1. Crear un Droplet (mínimo 2GB RAM)
2. Instalar Docker y Docker Compose
3. Seguir los pasos de "Deploy a Producción"

### Railway / Render

Estas plataformas tienen soporte nativo para Docker Compose:

1. Conectar tu repositorio
2. Configurar las variables de entorno en su panel
3. Deploy automático
