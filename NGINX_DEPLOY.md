# Deploy con Nginx - Guía Profesional

Esta guía explica cómo deployar la aplicación usando Nginx como reverse proxy (configuración profesional para producción).

## 📋 Ventajas de Usar Nginx

- ✅ Un solo punto de entrada (puerto 80/443)
- ✅ SSL/HTTPS centralizado
- ✅ Compresión gzip automática
- ✅ Caching de archivos estáticos
- ✅ Headers de seguridad
- ✅ Load balancing (si tienes múltiples instancias)
- ✅ Logs centralizados

## 🚀 Deploy con Nginx

### 1. Configurar Variables de Entorno

En el servidor, edita el archivo `.env`:

```bash
nano /root/finarg/.env
```

**IMPORTANTE**: Cambia `NEXT_PUBLIC_API_URL`:

```bash
# ANTES (sin Nginx):
NEXT_PUBLIC_API_URL=http://178.156.210.71:8080/api/v1

# DESPUÉS (con Nginx):
NEXT_PUBLIC_API_URL=http://178.156.210.71/api/v1

# O si tienes dominio:
NEXT_PUBLIC_API_URL=https://tu-dominio.com/api/v1
```

También asegúrate de tener:
```bash
HIBERNATE_DDL_AUTO=update  # Para el primer deploy, luego cambiar a 'validate'
```

### 2. Deployar con Nginx

```bash
cd /root/finarg

# Pull de los últimos cambios
git pull

# Levantar todos los servicios con Nginx
docker compose -f docker-compose.prod.yml up -d --build

# Verificar que todo esté corriendo
docker compose -f docker-compose.prod.yml ps
```

Deberías ver 5 contenedores:
- ✅ finarg-postgres-prod (healthy)
- ✅ finarg-redis-prod (healthy)
- ✅ finarg-backend-prod (healthy)
- ✅ finarg-frontend-prod (running)
- ✅ finarg-nginx (running)

### 3. Acceder a la Aplicación

Con Nginx, todo está en el puerto 80:

- **Aplicación**: http://178.156.210.71
- **API**: http://178.156.210.71/api/v1
- **Swagger**: http://178.156.210.71/swagger-ui.html
- **Health Check**: http://178.156.210.71/actuator/health

## 🔐 Configurar HTTPS (Recomendado para Producción)

### Opción 1: Con Let's Encrypt (Gratis)

```bash
# 1. Instalar Certbot
apt-get update
apt-get install certbot

# 2. Obtener certificado (reemplaza con tu dominio)
certbot certonly --standalone -d tu-dominio.com

# 3. Los certificados estarán en:
# /etc/letsencrypt/live/tu-dominio.com/fullchain.pem
# /etc/letsencrypt/live/tu-dominio.com/privkey.pem

# 4. Copiar certificados al proyecto
mkdir -p /root/finarg/nginx/ssl
cp /etc/letsencrypt/live/tu-dominio.com/fullchain.pem /root/finarg/nginx/ssl/cert.pem
cp /etc/letsencrypt/live/tu-dominio.com/privkey.pem /root/finarg/nginx/ssl/key.pem

# 5. Descomentar el bloque HTTPS en nginx/nginx.conf
nano /root/finarg/nginx/nginx.conf
# Buscar y descomentar el server block de HTTPS

# 6. Reiniciar Nginx
docker compose -f docker-compose.prod.yml restart nginx
```

### Opción 2: Con Cloudflare (Más Fácil)

1. Apunta tu dominio a Cloudflare
2. En Cloudflare, activa "SSL/TLS" → "Full"
3. Cloudflare manejará el certificado automáticamente
4. Tu app seguirá en HTTP (puerto 80), Cloudflare lo convierte a HTTPS

## 📊 Comandos Útiles

### Ver logs
```bash
# Logs de Nginx
docker compose -f docker-compose.prod.yml logs -f nginx

# Logs del backend
docker compose -f docker-compose.prod.yml logs -f backend

# Logs del frontend
docker compose -f docker-compose.prod.yml logs -f frontend
```

### Verificar configuración de Nginx
```bash
# Probar sintaxis de la configuración
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Recargar configuración sin downtime
docker compose -f docker-compose.prod.yml exec nginx nginx -s reload
```

### Reiniciar servicios
```bash
# Reiniciar solo Nginx
docker compose -f docker-compose.prod.yml restart nginx

# Reiniciar todo
docker compose -f docker-compose.prod.yml restart
```

## 🔄 Actualizar la Aplicación

```bash
cd /root/finarg

# 1. Pull de cambios
git pull

# 2. Rebuild y redeploy
docker compose -f docker-compose.prod.yml up -d --build

# 3. Ver logs para verificar
docker compose -f docker-compose.prod.yml logs -f
```

## 🆚 Diferencias: Con y Sin Nginx

### Sin Nginx (docker-compose.yml)

```bash
docker compose up -d
```

- Frontend: http://IP:3000
- Backend: http://IP:8080
- Más simple para desarrollo
- Requiere abrir múltiples puertos

### Con Nginx (docker-compose.prod.yml)

```bash
docker compose -f docker-compose.prod.yml up -d
```

- Todo: http://IP (puerto 80)
- Profesional para producción
- Un solo puerto abierto
- Listo para HTTPS

## 🚨 Troubleshooting

### Nginx no arranca

```bash
# Ver logs de Nginx
docker compose -f docker-compose.prod.yml logs nginx

# Verificar sintaxis de configuración
docker compose -f docker-compose.prod.yml exec nginx nginx -t

# Verificar que el archivo nginx.conf existe
ls -la /root/finarg/nginx/nginx.conf
```

### Error 502 Bad Gateway

Significa que Nginx no puede conectarse al backend o frontend:

```bash
# Verificar que backend y frontend estén corriendo
docker compose -f docker-compose.prod.yml ps

# Ver logs del servicio que falla
docker compose -f docker-compose.prod.yml logs backend
docker compose -f docker-compose.prod.yml logs frontend
```

### El frontend no carga recursos estáticos

```bash
# Verificar que NEXT_PUBLIC_API_URL esté correcta
docker compose -f docker-compose.prod.yml exec frontend printenv | grep NEXT_PUBLIC_API_URL

# Debe ser: http://TU_IP/api/v1 (SIN el puerto 8080)
```

## 📝 Checklist de Producción

Antes de ir a producción, verifica:

- [ ] `HIBERNATE_DDL_AUTO=validate` (después del primer deploy)
- [ ] `JWT_SECRET` generado con `openssl rand -base64 64`
- [ ] Contraseñas de base de datos seguras
- [ ] `NEXT_PUBLIC_API_URL` apunta a tu dominio/IP (sin puerto)
- [ ] HTTPS configurado (Let's Encrypt o Cloudflare)
- [ ] Firewall configurado (solo puerto 80 y 443 abiertos)
- [ ] Backups automáticos de la base de datos
- [ ] Logs monitoreados

## 🎯 Recomendación Final

**Para Desarrollo/Testing**: Usa `docker-compose.yml` (más simple)

```bash
docker compose up -d
```

**Para Producción**: Usa `docker-compose.prod.yml` con Nginx

```bash
docker compose -f docker-compose.prod.yml up -d
```

La configuración con Nginx es más profesional, segura y escalable.
