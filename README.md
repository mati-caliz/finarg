# FinArg

Aplicación financiera para seguimiento de cotizaciones, inflación y análisis de mercado argentino.

## Stack Tecnológico

### Backend
- Java 17
- Spring Boot 3.5.x
- PostgreSQL 16
- Redis 7
- Maven

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Zustand (state management)
- TanStack Query (data fetching)

## Requisitos Previos

- Java 17 o superior
- Node.js 18 o superior
- Docker y Docker Compose
- Maven 3.6+

## Instalación y Configuración

### 1. Clonar el repositorio

```bash
git clone <repository-url>
cd finarg
```

### 2. Instalar dependencias

```bash
npm install
cd finarg-frontend && npm install && cd ..
```

### 3. Iniciar servicios de infraestructura

El proyecto utiliza Docker Compose para PostgreSQL y Redis:

```bash
docker-compose up -d
```

Esto iniciará:
- PostgreSQL en `localhost:5432`
  - Database: `finarg`
  - User: `finarg`
  - Password: `finarg123`
- Redis en `localhost:6379`

Para verificar que los servicios están corriendo:

```bash
docker-compose ps
```

Para detener los servicios:

```bash
docker-compose down
```

### 4. Configurar variables de entorno (opcional)

El backend puede configurarse con variables de entorno:

```bash
# JWT (usa un valor por defecto si no se configura)
export JWT_SECRET=tu-secret-key-super-segura

# Email (opcional, solo si necesitas enviar emails)
export MAIL_USERNAME=tu-email@gmail.com
export MAIL_PASSWORD=tu-password-de-app
```

### 5. Iniciar el Backend

Desde el directorio raíz:

```bash
cd finarg-backend
mvn spring-boot:run
```

El backend estará disponible en:
- API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html
- API Docs: http://localhost:8080/api-docs

### 6. Iniciar el Frontend

En otra terminal, desde el directorio raíz:

```bash
cd finarg-frontend
npm run dev
```

El frontend estará disponible en: http://localhost:3000

## Scripts Disponibles

### Raíz del proyecto

```bash
npm run lint              # Ejecuta lint en frontend y backend
npm run lint:frontend     # Ejecuta ESLint en el frontend
npm run lint:backend      # Ejecuta Checkstyle en el backend
```

### Backend (finarg-backend)

```bash
mvn spring-boot:run       # Iniciar aplicación
mvn clean compile         # Compilar proyecto
mvn test                  # Ejecutar tests
mvn checkstyle:check      # Verificar estilo de código
```

### Frontend (finarg-frontend)

```bash
npm run dev               # Modo desarrollo
npm run build             # Build para producción
npm start                 # Iniciar build de producción
npm run lint              # ESLint
npm run test              # Ejecutar tests
npm run test:watch        # Tests en modo watch
npm run test:coverage     # Tests con cobertura
```

## Estructura del Proyecto

```
finarg/
├── finarg-backend/       # API Spring Boot
│   ├── src/
│   │   ├── main/
│   │   │   ├── java/
│   │   │   └── resources/
│   │   └── test/
│   └── pom.xml
├── finarg-frontend/      # Aplicación Next.js
│   ├── src/
│   │   ├── app/
│   │   ├── components/
│   │   └── lib/
│   └── package.json
├── docker-compose.yml    # Servicios PostgreSQL y Redis
└── package.json          # Scripts raíz del monorepo
```

## APIs Externas Integradas

El backend consume las siguientes APIs públicas:
- DolarApi.com - Cotizaciones de dólar
- ArgentinaDatos.com - Datos económicos
- Datos.gob.ar - Series históricas
- Datos.gov.co - Datos de Colombia
- Banco Central do Brasil - Cotizaciones Brasil
- Mindicador.cl - Indicadores Chile
- Banco Central del Uruguay - Datos Uruguay

## Desarrollo

### Antes de hacer commit

El proyecto tiene hooks de pre-commit configurados con Husky que ejecutan:
- ESLint en archivos del frontend
- Checkstyle en archivos del backend

Para ejecutar las validaciones manualmente:

```bash
npm run lint
```

### Reglas de código

- No agregar comentarios en el código
- Usar inglés para nombres de variables, métodos y clases
- Excepción: términos específicos del dominio argentino pueden estar en español
- Métodos cortos y enfocados (máx 120 líneas)
- Inyección de dependencias por constructor

Ver `CLAUDE.md` para más detalles sobre las convenciones del proyecto.

## Troubleshooting

### El backend no puede conectarse a PostgreSQL

Verificar que Docker esté corriendo:
```bash
docker-compose ps
```

Reiniciar los servicios:
```bash
docker-compose restart
```

### Error de puerto en uso

Si el puerto 8080, 3000, 5432 o 6379 está en uso:

```bash
# Encontrar proceso usando el puerto
netstat -ano | findstr :8080
# Matar el proceso o cambiar el puerto en application.yml
```

### Problemas con Maven

Limpiar y recompilar:
```bash
cd finarg-backend
mvn clean install
```

### Problemas con npm

Limpiar node_modules y reinstalar:
```bash
rm -rf node_modules package-lock.json
npm install
```

## Licencia

Privado
