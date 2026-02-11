# FinArg - AI Assistant Configuration

## 📋 Project Overview

**FinArg** is a comprehensive financial platform for Latin America, providing real-time exchange rates, macroeconomic indicators, financial calculators, and comparison tools. The platform specializes in Argentine financial data with infrastructure ready for expansion to Colombia, Brazil, Chile, and Uruguay.

### Key Features
- Real-time currency quotes (64+ types across 5 countries)
- Macroeconomic indicators (inflation, reserves, country risk)
- Financial calculators (income tax, compound interest)
- Rate comparison tools (banks, virtual wallets, exchange rates)
- User authentication (email/password + Google OAuth)
- Alert system (in development)

### Tech Stack Summary
- **Backend**: Spring Boot 3.5.x + Java 17 + PostgreSQL 16 + Redis 7
- **Frontend**: Next.js 14 + TypeScript + React 18 + Tailwind CSS
- **State**: Zustand + TanStack Query
- **Auth**: JWT + Google OAuth 2.0
- **Deployment**: Docker + Docker Compose + Nginx

---

## 📁 Project Structure

```
finarg/
├── api/                              # Backend (Spring Boot)
│   ├── src/main/java/com/finarg/
│   │   ├── controller/               # 12 REST controllers
│   │   ├── service/                  # 18 business services
│   │   ├── client/                   # 13 HTTP clients for external APIs
│   │   ├── config/                   # 12 configuration files
│   │   ├── model/
│   │   │   ├── entity/               # JPA entities (User, QuoteHistory, Alert)
│   │   │   ├── dto/                  # 25+ DTOs
│   │   │   └── enums/                # Country, CurrencyType, GapLevel, etc.
│   │   ├── repository/               # JPA repositories
│   │   ├── scheduler/                # Scheduled tasks
│   │   ├── security/                 # JWT filters & auth
│   │   └── exception/                # Exception handling
│   ├── pom.xml
│   └── Dockerfile
│
├── web/                              # Frontend (Next.js)
│   ├── src/
│   │   ├── app/                      # 12 pages + layout (App Router)
│   │   ├── components/
│   │   │   ├── dashboard/            # QuoteCard, GapGauge, ReservesWidget, etc.
│   │   │   ├── layout/               # Sidebar, Navbar
│   │   │   ├── ui/                   # shadcn-style primitives
│   │   │   └── charts/               # Recharts components
│   │   ├── hooks/                    # 7 custom hooks
│   │   ├── store/                    # Zustand stores (auth, app)
│   │   ├── lib/                      # API client, utils
│   │   ├── i18n/                     # Translations (Spanish)
│   │   ├── config/                   # Country configurations
│   │   └── types/                    # TypeScript types
│   ├── package.json
│   ├── tailwind.config.ts
│   └── Dockerfile
│
├── nginx/                            # Nginx config for production
├── docker-compose.yml                # Local development
├── docker-compose.prod.yml           # Production
└── CLAUDE.md                         # This file
```

---

## 🎨 Code Style Rules

### Comments
- **Do NOT add comments to code**
- Code should be self-documenting through clear naming
- Remove any existing comments when refactoring

### Equality
- **Always use strict equality**: `===` and `!==`, never `==` or `!=`
- To check for both null and undefined, use: `x !== undefined && x !== null`

### Language
- Use English for all variable names, method names, and class names
- Exception: Domain-specific terms in Spanish are acceptable for Argentine financial context (e.g., `cotizacion`, `inflacion`, `brecha`)

### General Guidelines
- Follow existing project patterns and conventions
- Keep methods short and focused (max 120 lines)
- Prefer explicit imports over wildcard imports (except for lombok, jakarta.persistence, jakarta.validation)
- Use constructor injection for dependencies
- Avoid self-invocation in `@Cacheable` methods

### Testing
- Run `mvn clean compile` before committing backend changes
- Run `npm run lint` before committing frontend changes
- Use TypeScript's `npx tsc --noEmit` to check types

---

## 🏗️ Backend Architecture (Spring Boot 3.5.x)

### Controllers (12 endpoints)

| Controller | Routes | Functionality |
|-----------|--------|---------------|
| `AuthController` | `/api/v1/auth/*` | Login, register, Google OAuth, refresh token |
| `QuoteController` | `/api/v1/{country}/quotes/*` | Currency quotes, gap, historical data |
| `RatesController` | `/api/v1/rates/*` | Fixed-term rates, wallets, USD accounts, UVA mortgages |
| `InflationController` | `/api/v1/inflation/*` | Current, monthly, historical, adjustment calculator |
| `ReservesController` | `/api/v1/reserves/*` | BCRA reserves (gross, net, composition) |
| `IncomeTaxController` | `/api/v1/income-tax/*` | Income tax calculator (net salary) |
| `CompoundInterestController` | `/api/v1/compound-interest/*` | Compound interest calculator |
| `CountryRiskController` | `/api/v1/country-risk` | Country risk index |
| `ExchangeBandsController` | `/api/v1/exchange-bands` | Exchange rate bands (floor/ceiling) |
| `SocialIndicatorsController` | `/api/v1/indicators/social` | Social indicators (UVA, CER, minimum wage) |
| `AlertController` | `/api/v1/alerts/*` | Custom alerts system |
| `ExchangeRateComparisonController` | `/api/v1/{country}/exchange-rates/comparison` | Exchange rate comparison |

### Services Pattern

Controllers → Services → Clients → External APIs

**Key Services:**
- `QuoteService`: Handles quote aggregation from multiple APIs
- `InflationService`: IPC calculations and adjustments
- `ReservesService`: BCRA/FMI methodology for reserves
- `RatesService`: Banks and virtual wallets rates
- `IncomeTaxCalculatorService`: Complex tax calculations with deductions
- `JwtService`: JWT generation and validation
- `AlertService`: Alert management (in development)

### External API Clients (13 clients)

| Client | API | Purpose |
|--------|-----|---------|
| `ArgentinaQuoteClient` | dolarapi.com | Argentina currency quotes |
| `ArgentinaDatosClient` | argentina-datos.com | Inflation, FCI, historical data |
| `DatosGobArClient` | datos.gob.ar | Macro series, reserves |
| `BcraClient` | bcra.gob.ar | UVA, CER, bank reserves |
| `AmbitoClient` | ambito.com | Financial data |
| `BrazilQuoteClient` | bcb.gov.br | Brazil PTAX quotes |
| `ChileQuoteClient` | mindicador.cl | Chile indicators |
| `ColombiaQuoteClient` | datos.gov.co | Colombia TRM |
| `UruguayQuoteClient` | bcu.gub.uy | Uruguay quotes |
| `ExchangerateApiClient` | exchangerate-api.com | Multi-currency rates |
| `FciClient` | FCI data | Investment funds |
| `GoogleIdTokenVerifierService` | Google OAuth | Token verification |
| `QuoteClientFactory` | Factory pattern | Selects client by country |

### Database Schema (PostgreSQL 16)

**Tables:**
- `users`: User accounts, auth credentials, notification preferences
- `quote_history`: Historical quotes by type/country/date (indexed)
- `alert`: Custom user alerts with conditions

**Indexes:**
- `quote_history`: Composite indexes on `(type, country, date)`

### Caching Strategy (Redis 7)

- TTL: 5 minutes (300,000 ms) for most data
- Cached entities: Quotes, inflation, reserves, rates, country risk
- No caching of null values
- Cache keys format: `quotes:{country}`, `inflation:current`, etc.

### Security

- **JWT**: Access token (24h) + Refresh token (7d)
- **Password**: BCrypt hashing with automatic salt
- **Google OAuth**: Integration with Google Identity Services
- **Rate Limiting**: Bucket4j (5-minute windows)
- **CORS**: Restricted to `localhost:3000` and `localhost:3001` in dev
- **Session**: Stateless with JWT in HTTP-only cookies
- **CSRF**: Disabled for stateless API

### Configuration Files

| File | Purpose |
|------|---------|
| `SecurityConfig` | Spring Security + JWT setup |
| `CacheConfig` | Redis cache provider |
| `WebClientConfig` | HTTP clients with timeouts |
| `CorsConfig` | Cross-origin settings |
| `JacksonConfig` | JSON serialization |
| `OpenApiConfig` | Swagger/OpenAPI docs |
| `RedisConfig` | Redis connection pool |
| `ExternalApisProperties` | API URLs and timeouts |

### Enumerations

- `Country`: ARGENTINA, COLOMBIA, BRAZIL, CHILE, URUGUAY
- `CurrencyType`: 64 types (oficial, blue, mep, ccl, tarjeta, cripto, etc.)
- `GapLevel`: LOW, MEDIUM, HIGH

### Dependencies (pom.xml)

- Spring Boot starters: web, data-jpa, security, cache, webflux, mail, actuator
- PostgreSQL driver
- Redis (spring-boot-starter-data-redis)
- JWT (jjwt 0.12.6)
- Lombok (boilerplate reduction)
- Bucket4j (rate limiting)
- Google API client (OAuth)
- Springdoc OpenAPI 2.8.4
- Apache Commons Lang3

---

## 🎨 Frontend Architecture (Next.js 14)

### Pages (App Router)

| Route | File | Description | Auth Required |
|-------|------|-------------|---------------|
| `/` | `app/page.tsx` | Dashboard with widgets | No |
| `/login` | `app/login/page.tsx` | Login (email/password + Google) | No |
| `/register` | `app/register/page.tsx` | User registration | No |
| `/cotizaciones` | `app/cotizaciones/page.tsx` | Historical quotes & charts | No |
| `/inflacion` | `app/inflacion/page.tsx` | Inflation data & calculator | No |
| `/reservas-bcra` | `app/reservas-bcra/page.tsx` | BCRA reserves | No |
| `/bandas-cambiarias` | `app/bandas-cambiarias/page.tsx` | Exchange bands | No |
| `/comparador-tasas` | `app/comparador-tasas/page.tsx` | Rate comparison (TNA) | No |
| `/comparador-tipos-cambio` | `app/comparador-tipos-cambio/page.tsx` | Exchange rate comparison | No |
| `/calculadora-sueldo-neto` | `app/calculadora-sueldo-neto/page.tsx` | Income tax calculator | No |
| `/calculadora-interes-compuesto` | `app/calculadora-interes-compuesto/page.tsx` | Compound interest calculator | No |

### Dashboard Widgets

**QuoteCard** (`components/dashboard/QuoteCard.tsx`)
- Displays currency quote with buy/sell/spread/variation
- Color-coded by type: oficial (emerald), blue (blue), tarjeta (violet), bolsa (amber)
- Pill-shaped variation badge (green/red)

**GapGauge** (`components/dashboard/GapGauge.tsx`)
- Visual gauge for exchange rate gap
- Color-coded by level: LOW (green), MEDIUM (yellow), HIGH (red)

**ReservesWidget** (`components/dashboard/ReservesWidget.tsx`)
- BCRA reserves (gross/net)
- Two methodologies (BCRA, FMI)
- Liabilities composition

**BandsWidget** (`components/dashboard/BandsWidget.tsx`)
- Exchange band floor/ceiling
- Crawling peg percentage

**CountryRiskWidget** (`components/dashboard/CountryRiskWidget.tsx`)
- Country risk score in basis points
- Daily variation

### Custom Hooks (7 hooks)

```typescript
useQuotes(country?: CountryCode)           // TanStack Query for quotes
useGap(country?: CountryCode)              // Exchange gap
useReserves(country: CountryCode)          // BCRA reserves
useCurrentInflation()                      // Current inflation
useMonthlyInflation(months: number)        // Historical inflation
useCountryRisk()                           // Country risk
useSocialIndicators(country: CountryCode)  // Social indicators
```

All hooks use TanStack Query with:
- Stale time and refetch intervals
- Error handling
- Loading states
- Type safety

### State Management (Zustand)

**useAuthStore** (`store/authStore.ts`)
```typescript
{
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth(user, token): void
  logout(): void
}
```

**useAppStore** (`store/appStore.ts`)
```typescript
{
  sidebarOpen: boolean
  toggleSidebar(): void
  selectedCountry: CountryCode
  setSelectedCountry(country): void
  _hasHydrated: boolean
  setHasHydrated(state): void
}
```

Both stores:
- Persist to localStorage
- Auto-rehydrate on mount

### API Client (Axios)

**Base Configuration** (`lib/api.ts`)
- Base URL: `NEXT_PUBLIC_API_URL` (default: `http://localhost:8080/api/v1`)
- Timeout: 15 seconds
- Credentials: included (cookies)
- Response interceptor: redirect to `/login` on 401

**API Modules:**
```typescript
quotesApi                    // GET /quotes, /quotes/{type}, /quotes/gap
inflationApi                 // GET /inflation/current, /monthly, /adjust
reservesApi                  // GET /reserves, /reserves/history
incomeTaxApi                 // POST /income-tax/calculate
compoundInterestApi          // POST /compound-interest/calculate
exchangeBandsApi             // GET /exchange-bands
indicatorsApi                // GET /indicators/social
countryRiskApi               // GET /country-risk
ratesApi                     // GET /rates/*
exchangeRateComparisonApi    // GET /exchange-rates/comparison
authApi                      // POST /auth/login, /register, /google
```

### i18n - Translations

**System** (`i18n/translations.ts`)
- Simple key-value translation system (no library)
- ~250+ translation keys
- Spanish language
- Hook: `useTranslation()` returns `translate(key)` function

**Coverage:**
- Navigation, pages, forms, errors
- Financial terms
- Calculators
- FAQ sections

### Country Configuration

**Config** (`config/countries.ts`)
```typescript
COUNTRIES: {
  ar: { name: 'Argentina', flag: '🇦🇷', features: {...} }
  co: { name: 'Colombia', flag: '🇨🇴', features: {...} }
  br: { name: 'Brasil', flag: '🇧🇷', features: {...} }
  cl: { name: 'Chile', flag: '🇨🇱', features: {...} }
  uy: { name: 'Uruguay', flag: '🇺🇾', features: {...} }
}
```

**Features per Country:**
- `quotes`: Currency quotes
- `gap`: Exchange gap
- `inflation`: Inflation data
- `reserves`: Reserve data
- `incomeTax`: Income tax calculator
- `rates`: Rate comparison
- `exchangeBands`: Exchange bands

Currently **Argentina** has all features enabled, others are limited.

### Design System

**Theme** (`app/globals.css`)
- Light/dark mode with `next-themes`
- CSS variables in HSL format
- Background: Slightly blue-tinted (`220 20% 97%` light, `224 30% 6%` dark)
- Border radius: 0.75rem (12px) default

**Sidebar** (`components/layout/Sidebar.tsx`)
- Dark gradient background: `--sidebar-start` to `--sidebar-end`
- White text (not theme-dependent)

**Cards**
- Border top: 3px with color accent per type
  - Emerald: oficial
  - Blue: blue
  - Violet: tarjeta
  - Amber: bolsa
  - Cyan: reserves
  - Red: inflation

**Variation Badges**
- Pill-shaped with background color (emerald for positive, red for negative)

**Icons**
- Lucide React icons
- Small icons in CardTitle headers

### UI Components (shadcn-style)

**Primitives** (`components/ui/`)
- Button, Card, Input, Label, Dialog, Dropdown Menu
- Progress, Select, Separator, Skeleton, Tabs, Toast
- VariationBadge (custom)
- Table (custom)

All built on Radix UI for accessibility.

### Charts (Recharts)

**Components** (`components/charts/`)
- LineChart: Historical quotes
- BarChart: Monthly inflation
- AreaChart: Value evolution

All with:
- Dynamic imports (SSR disabled)
- Responsive containers
- Tooltips and legends
- Theme-aware colors

### Analytics (Google Analytics 4)

**Component** (`components/GoogleAnalytics.tsx`)
- Automatic page view tracking on route changes
- Configured via `NEXT_PUBLIC_GA_MEASUREMENT_ID` environment variable
- Uses `afterInteractive` strategy for optimal performance

**Configuration:**
```bash
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

**Usage:**
- Automatically included in `layout.tsx`
- Tracks all navigation without additional code
- Triggers on pathname and search params changes

**Custom Event Tracking:**
```typescript
// In any client component
if (typeof window !== "undefined" && window.gtag) {
  window.gtag("event", "event_name", {
    event_category: "category",
    event_label: "label",
    value: 1,
  });
}
```

### Dependencies (package.json)

```json
{
  "next": "16.1.6",
  "react": "18.3.1",
  "typescript": "5.7.2",
  "tailwindcss": "3.4.17",
  "@tanstack/react-query": "5.62.0",
  "zustand": "5.0.3",
  "axios": "1.7.9",
  "recharts": "2.15.0",
  "lucide-react": "0.468.0",
  "@radix-ui/*": "various",
  "@react-oauth/google": "0.13.4",
  "date-fns": "4.1.0",
  "next-themes": "0.4.6"
}
```

**Security Overrides:**
```json
{
  "cross-spawn": "7.0.6",
  "glob": "13.0.1",
  "tar": "7.5.7"
}
```

**Dev Dependencies:**
- Jest 29.7.0
- React Testing Library 16.1.0
- Biome 1.9.4 (linting)

---

## 🔧 Configuration & Environment Variables

### Backend (.env)

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=finarg
DB_USERNAME=finarg
DB_PASSWORD=finarg123

# Hibernate
HIBERNATE_DDL_AUTO=update
HIBERNATE_SHOW_SQL=false

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT
JWT_SECRET=your-secret-key-here
JWT_EXPIRATION=86400000           # 24 hours
JWT_REFRESH_EXPIRATION=604800000  # 7 days

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id

# Mail (optional)
MAIL_USERNAME=
MAIL_PASSWORD=

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL_ROOT=INFO
LOG_LEVEL_APP=DEBUG

# Java
JAVA_OPTS=-Xmx512m -Xms256m
```

### Frontend (.env.local)

```bash
NEXT_PUBLIC_API_URL=http://localhost:8080/api/v1
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

---

## 🐳 Docker & Deployment

### Docker Compose Services

**Local Development** (`docker-compose.yml`)

1. **postgres** (PostgreSQL 16)
   - Image: `postgres:16-alpine`
   - Port: 5432
   - Database: finarg
   - Volume: `postgres_data`

2. **redis** (Redis 7)
   - Image: `redis:7-alpine`
   - Port: 6379
   - Persistence: AOF (append-only file)
   - Volume: `redis_data`

3. **backend** (Spring Boot API)
   - Build: `./api/Dockerfile`
   - Port: 8080
   - Depends on: postgres, redis (with health checks)
   - Health check: `GET /actuator/health`

4. **frontend** (Next.js)
   - Build: `./web/Dockerfile`
   - Port: 3000
   - Depends on: backend (with health check)
   - Build args: `NEXT_PUBLIC_API_URL`, `NEXT_PUBLIC_GOOGLE_CLIENT_ID`

### Commands

```bash
# Start all services
docker compose up -d

# Rebuild and start
docker compose up -d --build

# Rebuild without cache
docker compose build --no-cache

# Stop all services
docker compose down

# View logs
docker compose logs -f [service]

# Check status
docker compose ps
```

---

## 🧪 Testing & Quality

### Backend Testing

```bash
# Run tests
mvn test

# Compile
mvn clean compile

# Checkstyle
mvn checkstyle:check

# Format code
mvn spotless:apply
```

### Frontend Testing

```bash
# Run tests
npm run test

# Lint
npm run lint

# Format
npm run format

# Type check
npx tsc --noEmit

# Security scan (requires Trivy)
npm run security
```

### Pre-commit Checklist

- [ ] Run `mvn clean compile` (backend)
- [ ] Run `npm run lint` (frontend)
- [ ] Run `npx tsc --noEmit` (frontend)
- [ ] Check for console errors/warnings
- [ ] Test locally with Docker

---

## 🚀 Common Commands

### Monorepo (Root)

```bash
# Install dependencies
npm install             # Root + frontend
cd api && mvn install   # Backend

# Development
npm run dev             # Start frontend
cd api && mvn spring-boot:run  # Start backend

# Linting
npm run lint            # Lint frontend + backend
npm run format          # Format frontend + backend
npm run check           # Check frontend + backend

# Docker
docker compose up -d    # Start infrastructure
docker compose down     # Stop infrastructure
```

### Backend (api/)

```bash
mvn clean compile       # Compile
mvn spring-boot:run     # Run
mvn test                # Test
mvn package             # Build JAR
mvn spotless:apply      # Format
mvn checkstyle:check    # Lint
```

### Frontend (web/)

```bash
npm run dev             # Development server
npm run build           # Production build
npm run start           # Start production server
npm run lint            # Lint with Biome
npm run format          # Format with Biome
npm run test            # Run Jest tests
npm run test:watch      # Jest watch mode
```

---

## 🌍 API Integrations

### External APIs

| API | Base URL | Timeout | Purpose |
|-----|----------|---------|---------|
| Dolar API | `dolarapi.com/v1` | 10s | Argentina quotes |
| Argentina Datos | `api.argentinadatos.com/v1` | 10s | Inflation, FCI |
| Datos.gob.ar | `apis.datos.gob.ar/series/api` | 60s | Macro series, reserves |
| BCRA | `api.bcra.gob.ar` | 15s | UVA, CER, bank reserves |
| Ambito | `mercados.ambito.com` | 10s | Financial data |
| ExchangerateAPI | `open.er-api.com/v6` | 10s | Multi-currency rates |
| Colombia | `datos.gov.co/api` | 10s | TRM, exchange |
| Brazil | `olinda.bcb.gov.br/olinda/servico/PTAX` | 10s | PTAX quotes |
| Chile | `mindicador.cl/api` | 10s | IPC, indicators |
| Uruguay | `bcu.gub.uy/api` | 10s | Rates, quotes |
| Google OAuth | `accounts.google.com` | - | Authentication |

### API Rate Limiting

- Bucket4j with 5-minute windows
- Configurable per endpoint
- Redis-backed for distributed systems

---

## 📊 Features by Country

| Feature | 🇦🇷 AR | 🇨🇴 CO | 🇧🇷 BR | 🇨🇱 CL | 🇺🇾 UY |
|---------|:------:|:------:|:------:|:------:|:------:|
| Quotes | ✅ | ✅ | ✅ | ✅ | ✅ |
| Gap | ✅ | ✅ | ✅ | ✅ | ✅ |
| Inflation | ✅ | ✅ | ✅ | ✅ | ✅ |
| Reserves | ✅ | ❌ | ❌ | ❌ | ❌ |
| Income Tax | ✅ | ❌ | ❌ | ❌ | ❌ |
| Rates | ✅ | ❌ | ❌ | ❌ | ❌ |
| Exchange Bands | ✅ | ✅ | ✅ | ✅ | ✅ |

**Argentina** is the primary market with all features enabled.

---

## 🎯 Architectural Patterns

### Backend Patterns

1. **Controller-Service-Client**: Clear separation of concerns
2. **Factory Pattern**: `QuoteClientFactory` for country-specific clients
3. **Strategy Pattern**: Multiple reserve calculation methodologies
4. **DTO Pattern**: Request/Response separation from entities
5. **Repository Pattern**: JPA repositories for data access
6. **Builder Pattern**: Complex DTO construction
7. **Dependency Injection**: Constructor injection throughout

### Frontend Patterns

1. **Container/Presentational**: Smart hooks + dumb components
2. **Custom Hooks**: Encapsulate business logic and API calls
3. **Compound Components**: Cards with CardHeader/CardContent/CardFooter
4. **Render Props**: Charts with custom tooltips
5. **Higher-Order Components**: Auth guards (planned)
6. **State Management**: Zustand stores for global state
7. **Query Keys**: Centralized TanStack Query key management

### Performance Optimizations

- **Caching**: Redis for backend, TanStack Query for frontend
- **Lazy Loading**: Dynamic imports for charts
- **Code Splitting**: Next.js automatic route-based splitting
- **Memoization**: React.memo for expensive components
- **Debouncing**: User input in calculators
- **Pagination**: Large datasets (planned)
- **SSR**: Server-side rendering for SEO

---

## 🔒 Security Best Practices

### Backend
- ✅ JWT with short expiration + refresh tokens
- ✅ BCrypt password hashing
- ✅ Rate limiting with Bucket4j
- ✅ Input validation with Jakarta Validation
- ✅ SQL injection prevention (JPA prepared statements)
- ✅ CORS restricted to known origins
- ✅ HTTP-only cookies for tokens
- ✅ Stateless sessions

### Frontend
- ✅ XSS prevention (React escapes by default)
- ✅ CSRF protection (not needed for stateless JWT)
- ✅ Secure API calls (credentials included)
- ✅ Input sanitization
- ✅ Auto-logout on 401
- ✅ No sensitive data in localStorage (tokens in memory/cookies)

### Dependencies
- ✅ Fixed versions for security overrides
- ✅ Regular dependency audits
- ✅ Trivy security scanning (frontend)

---

## 📚 Conventions & Best Practices

### Backend Conventions

**File Naming:**
- Controllers: `{Resource}Controller.java`
- Services: `{Resource}Service.java`
- DTOs: `{Resource}RequestDTO.java`, `{Resource}ResponseDTO.java`
- Entities: `{Resource}.java`
- Repositories: `{Resource}Repository.java`

**Method Naming:**
- GET endpoints: `get{Resource}`, `getAll{Resource}`
- POST endpoints: `create{Resource}`, `calculate{Resource}`
- PUT endpoints: `update{Resource}`
- DELETE endpoints: `delete{Resource}`

**Exception Handling:**
- Use `@ControllerAdvice` for global exception handling
- Custom exceptions: `{Resource}NotFoundException`, `{Resource}ValidationException`
- Return proper HTTP status codes

**Logging:**
- Use SLF4J with `@Slf4j` (Lombok)
- Log levels: ERROR (exceptions), WARN (unexpected), INFO (important), DEBUG (details)
- Log format: `[{timestamp}] {level} {logger} - {message}`

### Frontend Conventions

**File Naming:**
- Components: PascalCase (e.g., `QuoteCard.tsx`)
- Hooks: camelCase with `use` prefix (e.g., `useQuotes.ts`)
- Utils: camelCase (e.g., `formatCurrency.ts`)
- Types: PascalCase (e.g., `Quote.ts`)
- Pages: kebab-case in folder (e.g., `calculadora-sueldo-neto/page.tsx`)

**Component Structure:**
```tsx
// 1. Imports (React, third-party, local)
// 2. Types/Interfaces
// 3. Component definition
// 4. Hooks
// 5. Handlers
// 6. Effects
// 7. Render helpers
// 8. Return JSX
```

**CSS Classes:**
- Use Tailwind utility classes
- Theme colors via CSS variables (e.g., `bg-card`, `text-foreground`)
- Custom classes only when absolutely necessary
- No hardcoded colors (except in specific design cases like sidebar)

**State Management:**
- Server state: TanStack Query
- Global client state: Zustand
- Local component state: `useState`
- Form state: Controlled components
- URL state: Next.js router (planned)

---

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find and kill process on port 8080
lsof -ti:8080 | xargs kill -9  # macOS/Linux
netstat -ano | findstr :8080   # Windows
```

**Database connection issues:**
```bash
# Check PostgreSQL is running
docker compose ps
docker compose logs postgres

# Reset database
docker compose down -v
docker compose up -d postgres
```

**Redis connection issues:**
```bash
# Check Redis is running
docker compose ps
docker compose logs redis

# Test Redis connection
redis-cli ping
```

**JWT issues:**
```bash
# Ensure JWT_SECRET is set and strong
# Check token expiration times
# Verify cookie settings (HTTP-only, SameSite)
```

### Frontend Issues

**API connection issues:**
```bash
# Check NEXT_PUBLIC_API_URL is set correctly
# Verify backend is running on correct port
# Check CORS settings in backend
```

**Build errors:**
```bash
# Clear Next.js cache
rm -rf .next
npm run build

# Clear node_modules
rm -rf node_modules
npm install
```

**Type errors:**
```bash
# Run TypeScript check
npx tsc --noEmit

# Check for missing types
npm install --save-dev @types/{package}
```

**Hydration errors:**
```bash
# Check for SSR/CSR mismatches
# Ensure Zustand store is properly hydrated
# Use suppressHydrationWarning for known issues
```

---

## 📈 Roadmap & Future Features

### Planned Features (POST MVP)
- [ ] Complete alert system with email/push notifications
- [ ] Expand features to other countries (CO, BR, CL, UY)
- [ ] More virtual wallets in rate comparison
- [ ] Real-time currency converter
- [ ] Historical purchasing power calculator
- [ ] Advanced tax optimization tools
- [ ] Investment simulator
- [ ] Investment heatmap
- [ ] Country risk & bonds dashboard
- [ ] Big Mac Index
- [ ] Economic calendar
- [ ] Salary statistics by profession
- [ ] Pension evolution tracker
- [ ] AI-powered inflation predictor
- [ ] Public monetizable API
- [ ] Customizable dashboard (drag-and-drop widgets)
- [ ] Real estate intelligence module
- [ ] UX 2.0 improvements

### Technical Debt
- [x] Add analytics (Google Analytics 4)
- [ ] Add E2E tests (Playwright)
- [ ] Improve error boundaries
- [ ] Implement rate limiting on frontend
- [ ] Add request retry logic
- [ ] Optimize bundle size
- [ ] Add performance monitoring
- [ ] Implement feature flags
- [ ] Add A/B testing infrastructure

---

## 📞 Support & Resources

### Documentation
- Spring Boot: https://spring.io/projects/spring-boot
- Next.js: https://nextjs.org/docs
- TanStack Query: https://tanstack.com/query
- Tailwind CSS: https://tailwindcss.com
- Zustand: https://zustand-demo.pmnd.rs

### External APIs Documentation
- Dolar API: https://dolarapi.com
- Argentina Datos: https://argentinadatos.com
- BCRA: https://www.bcra.gob.ar

### Tools
- Biome (linting): https://biomejs.dev
- Recharts: https://recharts.org
- Radix UI: https://www.radix-ui.com

---

## 🎓 Learning Resources

### For New Developers

**Backend:**
1. Understand Spring Boot basics
2. Learn JPA/Hibernate for database
3. Master Spring Security & JWT
4. Study WebFlux for reactive programming
5. Practice Redis caching strategies

**Frontend:**
1. Master Next.js App Router
2. Learn TanStack Query for server state
3. Understand Zustand for global state
4. Practice Tailwind CSS
5. Study React hooks patterns

**Full Stack:**
1. RESTful API design
2. Authentication flows (JWT + OAuth)
3. Docker & containerization
4. API integration patterns
5. Performance optimization

---

## ✨ Code Examples

### Backend - Creating a New Endpoint

```java
// 1. Create DTO
public record NewFeatureRequestDTO(
    @NotBlank String parameter1,
    @Min(1) Integer parameter2
) {}

public record NewFeatureResponseDTO(
    String result,
    LocalDateTime timestamp
) {}

// 2. Create Service
@Service
@Slf4j
public class NewFeatureService {

    public NewFeatureResponseDTO processFeature(NewFeatureRequestDTO request) {
        log.info("Processing feature with params: {}", request);

        // Business logic here
        String result = performCalculation(request);

        return new NewFeatureResponseDTO(result, LocalDateTime.now());
    }
}

// 3. Create Controller
@RestController
@RequestMapping("/api/v1/new-feature")
@RequiredArgsConstructor
public class NewFeatureController {

    private final NewFeatureService newFeatureService;

    @PostMapping
    public ResponseEntity<NewFeatureResponseDTO> processFeature(
            @Valid @RequestBody NewFeatureRequestDTO request) {

        NewFeatureResponseDTO response = newFeatureService.processFeature(request);
        return ResponseEntity.ok(response);
    }
}
```

### Frontend - Creating a New Page

```tsx
// 1. Create API client method (lib/api.ts)
export const newFeatureApi = {
  process: (data: NewFeatureRequest) =>
    apiClient.post<NewFeatureResponse>('/new-feature', data)
}

// 2. Create custom hook (hooks/useNewFeature.ts)
export function useNewFeature() {
  const { translate } = useTranslation()

  return useMutation({
    mutationFn: (data: NewFeatureRequest) =>
      newFeatureApi.process(data),
    onError: (error) => {
      toast.error(translate('errors.newFeature'))
    }
  })
}

// 3. Create page component (app/new-feature/page.tsx)
'use client'

export default function NewFeaturePage() {
  const { translate } = useTranslation()
  const { mutate, isPending } = useNewFeature()
  const [formData, setFormData] = useState({
    parameter1: '',
    parameter2: 1
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    mutate(formData)
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-6">
        {translate('newFeature.title')}
      </h1>

      <Card>
        <CardHeader>
          <CardTitle>{translate('newFeature.form')}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit}>
            {/* Form fields */}
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Processing...' : 'Submit'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🏁 Getting Started Checklist

For new developers joining the project:

- [ ] Clone repository
- [ ] Install Java 17 (backend)
- [ ] Install Node.js 20+ (frontend)
- [ ] Install Docker & Docker Compose
- [ ] Copy `.env.example` to `.env` and configure
- [ ] Run `npm install` in root and `web/`
- [ ] Run `mvn install` in `api/`
- [ ] Start Docker services: `docker compose up -d`
- [ ] Verify backend: http://localhost:8080/actuator/health
- [ ] Verify frontend: http://localhost:3000
- [ ] Run tests: `mvn test` and `npm run test`
- [ ] Read this CLAUDE.md thoroughly
- [ ] Review existing code patterns
- [ ] Set up IDE with Lombok plugin
- [ ] Configure Git hooks (optional)

---

**Last Updated:** February 2026
**Version:** 1.0.0
**Maintained by:** FinArg Development Team
