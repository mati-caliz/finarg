# 🔄 Plan de Refactorización - Reorganización por Módulos

## 📋 Executive Summary

**Objetivo**: Reorganizar la estructura del proyecto FinArg por módulos/dominios para mejorar escalabilidad, mantenibilidad y preparar la incorporación del módulo Real Estate.

**Tiempo estimado**: 2-3 días de trabajo
**Riesgo**: Bajo (migración incremental con tests)
**Prioridad**: Alta (bloqueante para Real Estate)

---

## 🎯 Motivación

### Problemas Actuales

**Backend:**
- 13 controllers en la misma carpeta
- 17 services sin agrupación
- 14 clients mezclados (por país y por funcionalidad)
- Dificulta navegación y escalabilidad
- No hay separación clara de dominios

**Frontend:**
- Store monolítico en un archivo
- API client monolítico
- Tipos centralizados sin separación
- Hooks globales sin contexto

### Beneficios Esperados

✅ **Modularidad**: Cada feature autocontenida
✅ **Escalabilidad**: Fácil agregar nuevos módulos (Real Estate)
✅ **Navegación**: Estructura intuitiva por dominio
✅ **Testing**: Tests organizados por módulo
✅ **Colaboración**: Múltiples devs sin conflictos
✅ **Onboarding**: Nuevos devs entienden la estructura rápidamente

---

## 🏗️ Nueva Estructura Propuesta

### Backend - Organización por Módulos

```
api/src/main/java/com/finarg/
├── FinArgApplication.java
│
├── core/                                    # Infraestructura compartida
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   ├── CacheConfig.java
│   │   ├── WebClientConfig.java
│   │   ├── CorsConfig.java
│   │   ├── JacksonConfig.java
│   │   ├── OpenApiConfig.java
│   │   ├── RedisConfig.java
│   │   ├── PasswordEncoderConfig.java
│   │   ├── ExternalApisProperties.java
│   │   ├── LoggingProperties.java
│   │   ├── SchedulerProperties.java
│   │   ├── SecurityConfigValidator.java
│   │   ├── MdcRequestLoggingFilter.java
│   │   └── StatusCapturingResponseWrapper.java
│   ├── security/
│   │   ├── JwtAuthenticationFilter.java
│   │   ├── JwtAuthenticationEntryPoint.java
│   │   └── RateLimitingFilter.java
│   ├── exception/
│   │   ├── GlobalExceptionHandler.java
│   │   ├── AlertNotFoundException.java
│   │   ├── EmailAlreadyRegisteredException.java
│   │   ├── InvalidTokenException.java
│   │   └── UserNotFoundException.java
│   └── util/
│       └── (utilidades compartidas si las hay)
│
├── auth/                                    # 🔐 Módulo Autenticación
│   ├── controller/
│   │   └── AuthController.java
│   ├── service/
│   │   ├── AuthService.java
│   │   ├── JwtService.java FALTA
│   │   ├── CookieService.java FALTA
│   │   └── GoogleIdTokenVerifierService.java FALTA
│   └── dto/
│       ├── AuthRequestDTO.java
│       ├── AuthResponseDTO.java
│       └── GoogleAuthRequestDTO.java
│
├── quotes/                                  # 💱 Módulo Cotizaciones
│   ├── controller/
│   │   ├── QuoteController.java
│   │   └── ExchangeRateComparisonController.java
│   ├── service/
│   │   ├── QuoteService.java
│   │   └── ExchangeRateComparisonService.java
│   ├── client/
│   │   ├── factory/
│   │   │   ├── QuoteClient.java              # Interface
│   │   │   └── QuoteClientFactory.java
│   │   ├── argentina/
│   │   │   ├── ArgentinaQuoteClient.java
│   │   │   └── ArgentinaDatosClient.java
│   │   ├── brazil/
│   │   │   └── BrazilQuoteClient.java
│   │   ├── chile/
│   │   │   └── ChileQuoteClient.java
│   │   ├── colombia/
│   │   │   └── ColombiaQuoteClient.java
│   │   ├── uruguay/
│   │   │   └── UruguayQuoteClient.java
│   │   └── common/
│   │       └── ExchangerateApiClient.java
│   ├── dto/
│   │   ├── QuoteDTO.java
│   │   ├── GapDTO.java
│   │   └── ExchangeRateComparisonDTO.java
│   ├── entity/
│   │   └── QuoteHistory.java
│   └── repository/
│       └── QuoteHistoryRepository.java
│
├── inflation/                               # 📈 Módulo Inflación
│   ├── controller/
│   │   └── InflationController.java
│   ├── service/
│   │   └── InflationService.java
│   ├── client/
│   │   ├── ArgentinaDatosClient.java        # Referencia a quotes/client/argentina
│   │   └── DatosGobArClient.java
│   └── dto/
│       ├── InflationDTO.java
│       └── InflationAdjustmentDTO.java
│
├── reserves/                                # 🏦 Módulo Reservas
│   ├── controller/
│   │   └── ReservesController.java
│   ├── service/
│   │   └── ReservesService.java
│   ├── client/
│   │   ├── BcraClient.java
│   │   └── DatosGobArClient.java            # Referencia a inflation/client
│   ├── config/
│   │   └── ReservesConfig.java
│   └── dto/
│       ├── ReservesDTO.java
│       └── ReserveLiabilityDTO.java
│
├── rates/                                   # 💰 Módulo Tasas
│   ├── controller/
│   │   └── RatesController.java
│   ├── service/
│   │   └── RatesService.java
│   ├── client/
│   │   └── (clientes de bancos y billeteras)
│   └── dto/
│       └── RateDTO.java
│
├── calculators/                             # 🧮 Módulo Calculadoras
│   ├── incometax/
│   │   ├── controller/
│   │   │   └── IncomeTaxController.java
│   │   ├── service/
│   │   │   └── IncomeTaxCalculatorService.java
│   │   └── dto/
│   │       ├── IncomeTaxRequestDTO.java
│   │       └── IncomeTaxResponseDTO.java
│   └── compoundinterest/
│       ├── controller/
│       │   └── CompoundInterestController.java
│       ├── service/
│       │   └── CompoundInterestCalculatorService.java
│       └── dto/
│           ├── CompoundInterestRequestDTO.java
│           └── CompoundInterestResponseDTO.java
│
├── indicators/                              # 📊 Módulo Indicadores
│   ├── countryrisk/
│   │   ├── controller/
│   │   │   └── CountryRiskController.java
│   │   ├── service/
│   │   │   └── CountryRiskService.java
│   │   ├── client/
│   │   │   └── AmbitoClient.java
│   │   └── dto/
│   │       └── CountryRiskDTO.java
│   ├── social/
│   │   ├── controller/
│   │   │   └── SocialIndicatorsController.java
│   │   ├── service/
│   │   │   └── SocialIndicatorsService.java
│   │   └── dto/
│   │       └── SocialIndicatorsDTO.java
│   └── exchangebands/
│       ├── controller/
│       │   └── ExchangeBandsController.java
│       ├── service/
│       │   └── ExchangeBandsService.java
│       └── dto/
│           └── ExchangeBandsDTO.java
│
├── crypto/                                  # ₿ Módulo Crypto
│   ├── controller/
│   │   └── CryptoController.java
│   ├── service/
│   │   └── CryptoService.java
│   ├── client/
│   │   └── CoinGeckoClient.java
│   └── dto/
│       └── CryptoDTO.java
│
├── alerts/                                  # 🔔 Módulo Alertas
│   ├── controller/
│   │   └── AlertController.java
│   ├── service/
│   │   └── AlertService.java
│   ├── entity/
│   │   └── Alert.java
│   ├── repository/
│   │   └── AlertRepository.java
│   └── dto/
│       ├── AlertRequestDTO.java
│       └── AlertResponseDTO.java
│
├── user/                                    # 👤 Módulo Usuario
│   ├── entity/
│   │   └── User.java
│   ├── repository/
│   │   └── UserRepository.java
│   └── dto/
│       └── UserDTO.java
│
└── shared/                                  # 🔗 Compartido entre módulos
    ├── enums/
    │   ├── Country.java
    │   ├── CurrencyType.java
    │   ├── GapLevel.java
    │   ├── AlertType.java
    │   └── InvestmentType.java
    └── dto/
        └── (DTOs compartidos entre módulos si los hay)
```

### Frontend - Reorganización Modular

```
web/src/
├── app/                                     # ✅ MANTENER (App Router)
│   ├── (auth)/
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/
│   │   ├── page.tsx                         # Home
│   │   └── cotizaciones/
│   ├── (calculators)/
│   │   ├── calculadora-sueldo-neto/
│   │   └── calculadora-interes-compuesto/
│   ├── (indicators)/
│   │   ├── inflacion/
│   │   ├── reservas-bcra/
│   │   └── bandas-cambiarias/
│   ├── (comparison)/
│   │   ├── comparador-tasas/
│   │   └── comparador-tipos-cambio/
│   ├── api/
│   │   └── health/
│   ├── layout.tsx
│   └── globals.css
│
├── components/
│   ├── auth/                                # NEW: Componentes de autenticación
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── GoogleLoginButton.tsx
│   ├── quotes/                              # NEW: Componentes de cotizaciones
│   │   ├── QuoteCard.tsx                    # Mover de dashboard/
│   │   ├── QuotesList.tsx
│   │   ├── QuoteFilters.tsx
│   │   └── QuoteHistoryChart.tsx
│   ├── inflation/                           # NEW: Componentes de inflación
│   │   ├── InflationCard.tsx
│   │   ├── InflationChart.tsx
│   │   └── InflationCalculator.tsx
│   ├── reserves/                            # NEW: Componentes de reservas
│   │   ├── ReservesWidget.tsx               # Mover de dashboard/
│   │   └── ReservesComparison.tsx
│   ├── calculators/                         # NEW: Componentes de calculadoras
│   │   ├── IncomeTaxForm.tsx
│   │   └── CompoundInterestForm.tsx
│   ├── indicators/                          # NEW: Componentes de indicadores
│   │   ├── CountryRiskWidget.tsx            # Mover de dashboard/
│   │   ├── BandsWidget.tsx                  # Mover de dashboard/
│   │   └── SocialIndicators.tsx
│   ├── crypto/                              # NEW: Componentes de crypto
│   │   └── CryptoWidget.tsx                 # Mover de dashboard/
│   ├── dashboard/                           # REDUCIDO: Solo composición
│   │   ├── DashboardGrid.tsx
│   │   └── GapGauge.tsx
│   ├── layout/                              # ✅ MANTENER
│   │   ├── Sidebar.tsx
│   │   └── Navbar.tsx
│   ├── charts/                              # ✅ MANTENER
│   │   ├── LineChart.tsx
│   │   ├── BarChart.tsx
│   │   ├── AreaChart.tsx
│   │   └── index.tsx
│   ├── ui/                                  # ✅ MANTENER
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── skeleton.tsx
│   │   ├── table.tsx
│   │   └── variation-badge.tsx
│   ├── ErrorBoundary.tsx
│   ├── GoogleAnalytics.tsx
│   └── GoogleOAuthWrapper.tsx
│
├── hooks/                                   # Separar por módulo
│   ├── quotes/
│   │   ├── useQuotes.ts
│   │   ├── useGap.ts
│   │   └── index.ts
│   ├── inflation/
│   │   ├── useInflation.ts
│   │   ├── useCurrentInflation.ts
│   │   └── index.ts
│   ├── reserves/
│   │   ├── useReserves.ts
│   │   └── index.ts
│   ├── calculators/
│   │   ├── useIncomeTax.ts
│   │   ├── useCompoundInterest.ts
│   │   └── index.ts
│   ├── indicators/
│   │   ├── useCountryRisk.ts
│   │   ├── useSocialIndicators.ts
│   │   └── index.ts
│   ├── crypto/
│   │   ├── useCrypto.ts
│   │   └── index.ts
│   ├── auth/
│   │   ├── useAuth.ts
│   │   └── index.ts
│   ├── useTranslation.ts                    # Global
│   └── index.ts                             # Re-export
│
├── store/                                   # Separar stores
│   ├── authStore.ts                         # Solo estado de auth
│   ├── appStore.ts                          # Solo estado de app
│   ├── useStore.ts                          # DEPRECAR (mantener temporalmente)
│   └── index.ts
│
├── lib/
│   ├── api/                                 # Separar API clients
│   │   ├── quotes.ts
│   │   ├── inflation.ts
│   │   ├── reserves.ts
│   │   ├── rates.ts
│   │   ├── calculators.ts
│   │   ├── indicators.ts
│   │   ├── crypto.ts
│   │   ├── auth.ts
│   │   ├── client.ts                        # Axios base config
│   │   └── index.ts
│   ├── utils/
│   │   ├── formatters.ts
│   │   ├── validators.ts
│   │   └── index.ts
│   └── queryKeys.ts
│
├── types/                                   # Separar por módulo
│   ├── quotes.ts
│   ├── inflation.ts
│   ├── reserves.ts
│   ├── calculators.ts
│   ├── indicators.ts
│   ├── crypto.ts
│   ├── auth.ts
│   ├── common.ts
│   └── index.ts                             # Re-export
│
├── config/                                  # ✅ MANTENER
│   └── countries.ts
│
└── i18n/                                    # ✅ MANTENER
    └── translations.ts
```

---

## 📅 Plan de Migración - Backend

### Fase 1: Preparación (2 horas)

#### TASK-REFACTOR-001: Crear estructura de carpetas

```bash
cd api/src/main/java/com/finarg

# Crear módulos principales
mkdir -p core/{config,security,exception,util}
mkdir -p auth/{controller,service,dto}
mkdir -p quotes/{controller,service,client,dto,entity,repository}
mkdir -p quotes/client/{factory,argentina,brazil,chile,colombia,uruguay,common}
mkdir -p inflation/{controller,service,client,dto}
mkdir -p reserves/{controller,service,client,config,dto}
mkdir -p rates/{controller,service,client,dto}
mkdir -p calculators/incometax/{controller,service,dto}
mkdir -p calculators/compoundinterest/{controller,service,dto}
mkdir -p indicators/countryrisk/{controller,service,client,dto}
mkdir -p indicators/social/{controller,service,dto}
mkdir -p indicators/exchangebands/{controller,service,dto}
mkdir -p crypto/{controller,service,client,dto}
mkdir -p alerts/{controller,service,entity,repository,dto}
mkdir -p user/{entity,repository,dto}
mkdir -p shared/{enums,dto}
```

#### TASK-REFACTOR-002: Crear branch de refactor

```bash
git checkout -b refactor/modular-structure
git push -u origin refactor/modular-structure
```

#### TASK-REFACTOR-003: Backup de tests

```bash
# Asegurar que todos los tests pasan antes de empezar
cd api
mvn clean test

# Si fallan tests, documentar cuáles y por qué
# NO continuar hasta que tests pasen
```

---

### Fase 2: Migración Core (3 horas)

#### TASK-REFACTOR-004: Mover configuraciones a core/config

```bash
# Git mv preserva el historial
git mv config/SecurityConfig.java core/config/
git mv config/CacheConfig.java core/config/
git mv config/WebClientConfig.java core/config/
git mv config/CorsConfig.java core/config/
git mv config/JacksonConfig.java core/config/
git mv config/OpenApiConfig.java core/config/
git mv config/RedisConfig.java core/config/
git mv config/PasswordEncoderConfig.java core/config/
git mv config/ExternalApisProperties.java core/config/
git mv config/LoggingProperties.java core/config/
git mv config/SchedulerProperties.java core/config/
git mv config/ReservesConfig.java reserves/config/
git mv config/SecurityConfigValidator.java core/config/
git mv config/MdcRequestLoggingFilter.java core/config/
git mv config/StatusCapturingResponseWrapper.java core/config/
```

**Actualizar imports en cada archivo:**
```java
// Antes
package com.finarg.config;

// Después
package com.finarg.core.config;
```

#### TASK-REFACTOR-005: Mover security a core/security

```bash
git mv security/JwtAuthenticationFilter.java core/security/
git mv security/JwtAuthenticationEntryPoint.java core/security/
git mv security/RateLimitingFilter.java core/security/
```

**Actualizar package:**
```java
package com.finarg.core.security;
```

#### TASK-REFACTOR-006: Mover exceptions a core/exception

```bash
git mv exception/GlobalExceptionHandler.java core/exception/
git mv exception/AlertNotFoundException.java core/exception/
git mv exception/EmailAlreadyRegisteredException.java core/exception/
git mv exception/InvalidTokenException.java core/exception/
git mv exception/UserNotFoundException.java core/exception/
```

**Actualizar package:**
```java
package com.finarg.core.exception;
```

#### TASK-REFACTOR-007: Compilar y corregir imports

```bash
mvn clean compile -DskipTests

# Anotar errores de compilación
# Corregir imports en archivos que referencien core/*
```

**Script para actualizar imports automáticamente (opcional):**
```bash
# Buscar y reemplazar en todos los archivos .java
find . -name "*.java" -type f -exec sed -i 's/import com.finarg.config./import com.finarg.core.config./g' {} \;
find . -name "*.java" -type f -exec sed -i 's/import com.finarg.security./import com.finarg.core.security./g' {} \;
find . -name "*.java" -type f -exec sed -i 's/import com.finarg.exception./import com.finarg.core.exception./g' {} \;
```

#### TASK-REFACTOR-008: Tests de core

```bash
mvn test -Dtest="*Config*,*Security*,*Exception*"
```

---

### Fase 3: Migración Módulos Principales (8 horas)

#### TASK-REFACTOR-009: Migrar módulo AUTH

```bash
# Mover controllers
git mv controller/AuthController.java auth/controller/

# Mover services
git mv service/AuthService.java auth/service/
git mv service/JwtService.java auth/service/
git mv service/CookieService.java auth/service/
git mv service/GoogleIdTokenVerifierService.java auth/service/

# Mover DTOs
git mv model/dto/AuthRequestDTO.java auth/dto/
git mv model/dto/AuthResponseDTO.java auth/dto/
git mv model/dto/GoogleAuthRequestDTO.java auth/dto/
```

**Actualizar packages:**
```java
// auth/controller/AuthController.java
package com.finarg.auth.controller;

import com.finarg.auth.service.AuthService;
import com.finarg.auth.dto.AuthRequestDTO;
import com.finarg.auth.dto.AuthResponseDTO;
import com.finarg.core.security.JwtAuthenticationFilter;
// ... resto de imports
```

**Actualizar @RequestMapping si es necesario:**
```java
@RestController
@RequestMapping("/api/v1/auth")  // Mantener URLs actuales
public class AuthController {
    // ...
}
```

#### TASK-REFACTOR-010: Migrar módulo QUOTES

```bash
# Controllers
git mv controller/QuoteController.java quotes/controller/
git mv controller/ExchangeRateComparisonController.java quotes/controller/

# Services
git mv service/QuoteService.java quotes/service/
git mv service/ExchangeRateComparisonService.java quotes/service/

# Clients - Factory
git mv client/QuoteClient.java quotes/client/factory/
git mv client/QuoteClientFactory.java quotes/client/factory/

# Clients - Por país
git mv client/ArgentinaQuoteClient.java quotes/client/argentina/
git mv client/ArgentinaDatosClient.java quotes/client/argentina/
git mv client/BrazilQuoteClient.java quotes/client/brazil/
git mv client/ChileQuoteClient.java quotes/client/chile/
git mv client/ColombiaQuoteClient.java quotes/client/colombia/
git mv client/UruguayQuoteClient.java quotes/client/uruguay/
git mv client/ExchangerateApiClient.java quotes/client/common/

# Entity y Repository
git mv model/entity/QuoteHistory.java quotes/entity/
git mv repository/QuoteHistoryRepository.java quotes/repository/

# DTOs
git mv model/dto/QuoteDTO.java quotes/dto/
git mv model/dto/GapDTO.java quotes/dto/
git mv model/dto/ExchangeRateComparisonDTO.java quotes/dto/
```

**Actualizar packages:**
```java
// quotes/controller/QuoteController.java
package com.finarg.quotes.controller;

import com.finarg.quotes.service.QuoteService;
import com.finarg.quotes.dto.QuoteDTO;
import com.finarg.quotes.dto.GapDTO;
import com.finarg.shared.enums.Country;
import com.finarg.shared.enums.CurrencyType;
// ...
```

#### TASK-REFACTOR-011: Migrar módulo INFLATION

```bash
# Controller
git mv controller/InflationController.java inflation/controller/

# Service
git mv service/InflationService.java inflation/service/

# Clients (algunos compartidos con quotes)
# DatosGobArClient - decidir si va en inflation o shared
git mv client/DatosGobArClient.java inflation/client/

# DTOs
git mv model/dto/InflationDTO.java inflation/dto/
git mv model/dto/InflationAdjustmentDTO.java inflation/dto/
```

**Nota sobre clientes compartidos:**
Si `ArgentinaDatosClient` se usa tanto en quotes como inflation:
- Opción 1: Dejarlo en `quotes/client/argentina/` y que inflation lo importe
- Opción 2: Moverlo a `shared/client/argentina/`
- **Recomendación**: Opción 1 (quotes es el owner principal)

#### TASK-REFACTOR-012: Migrar módulo RESERVES

```bash
# Controller
git mv controller/ReservesController.java reserves/controller/

# Service
git mv service/ReservesService.java reserves/service/

# Client
git mv client/BcraClient.java reserves/client/

# DTOs
git mv model/dto/ReservesDTO.java reserves/dto/
git mv model/dto/ReserveLiabilityDTO.java reserves/dto/

# Config ya fue movido en TASK-REFACTOR-004
```

#### TASK-REFACTOR-013: Migrar módulo RATES

```bash
# Controller
git mv controller/RatesController.java rates/controller/

# Service
git mv service/RatesService.java rates/service/

# Clients (si hay específicos de bancos/billeteras)
# git mv client/*BankClient.java rates/client/

# DTOs
git mv model/dto/RateDTO.java rates/dto/
```

#### TASK-REFACTOR-014: Migrar módulo CALCULATORS

```bash
# Income Tax
git mv controller/IncomeTaxController.java calculators/incometax/controller/
git mv service/IncomeTaxCalculatorService.java calculators/incometax/service/
git mv model/dto/IncomeTaxRequestDTO.java calculators/incometax/dto/
git mv model/dto/IncomeTaxResponseDTO.java calculators/incometax/dto/

# Compound Interest
git mv controller/CompoundInterestController.java calculators/compoundinterest/controller/
git mv service/CompoundInterestCalculatorService.java calculators/compoundinterest/service/
git mv model/dto/CompoundInterestRequestDTO.java calculators/compoundinterest/dto/
git mv model/dto/CompoundInterestResponseDTO.java calculators/compoundinterest/dto/
```

**Actualizar packages:**
```java
package com.finarg.calculators.incometax.controller;
package com.finarg.calculators.incometax.service;
package com.finarg.calculators.incometax.dto;
```

#### TASK-REFACTOR-015: Migrar módulo INDICATORS

```bash
# Country Risk
git mv controller/CountryRiskController.java indicators/countryrisk/controller/
git mv service/CountryRiskService.java indicators/countryrisk/service/
git mv client/AmbitoClient.java indicators/countryrisk/client/
git mv model/dto/CountryRiskDTO.java indicators/countryrisk/dto/

# Social Indicators
git mv controller/SocialIndicatorsController.java indicators/social/controller/
git mv service/SocialIndicatorsService.java indicators/social/service/
git mv model/dto/SocialIndicatorsDTO.java indicators/social/dto/

# Exchange Bands
git mv controller/ExchangeBandsController.java indicators/exchangebands/controller/
git mv service/ExchangeBandsService.java indicators/exchangebands/service/
git mv model/dto/ExchangeBandsDTO.java indicators/exchangebands/dto/
```

#### TASK-REFACTOR-016: Migrar módulo CRYPTO

```bash
git mv controller/CryptoController.java crypto/controller/
git mv service/CryptoService.java crypto/service/
git mv client/CoinGeckoClient.java crypto/client/
git mv model/dto/CryptoDTO.java crypto/dto/
```

#### TASK-REFACTOR-017: Migrar módulo ALERTS

```bash
git mv controller/AlertController.java alerts/controller/
git mv service/AlertService.java alerts/service/
git mv model/entity/Alert.java alerts/entity/
git mv repository/AlertRepository.java alerts/repository/
git mv model/dto/AlertRequestDTO.java alerts/dto/
git mv model/dto/AlertResponseDTO.java alerts/dto/
```

#### TASK-REFACTOR-018: Migrar módulo USER

```bash
git mv model/entity/User.java user/entity/
git mv repository/UserRepository.java user/repository/
# git mv model/dto/UserDTO.java user/dto/ (si existe)
```

#### TASK-REFACTOR-019: Migrar SHARED (enums)

```bash
git mv model/enums/Country.java shared/enums/
git mv model/enums/CurrencyType.java shared/enums/
git mv model/enums/GapLevel.java shared/enums/
git mv model/enums/AlertType.java shared/enums/
git mv model/enums/InvestmentType.java shared/enums/
```

**Actualizar package:**
```java
package com.finarg.shared.enums;
```

---

### Fase 4: Cleanup & Testing (2 horas)

#### TASK-REFACTOR-020: Eliminar carpetas vacías

```bash
# Verificar que están vacías
ls -la controller/
ls -la service/
ls -la client/
ls -la model/entity/
ls -la model/dto/
ls -la model/enums/
ls -la repository/
ls -la config/
ls -la security/
ls -la exception/

# Eliminar si están vacías
rmdir controller/ service/ client/ model/entity/ model/dto/ model/enums/ repository/ config/ security/ exception/
rmdir model/ 2>/dev/null  # Puede fallar si quedan archivos
```

#### TASK-REFACTOR-021: Compilación completa

```bash
mvn clean compile

# Si hay errores de compilación:
# 1. Revisar imports
# 2. Buscar referencias cruzadas
# 3. Actualizar manualmente
```

#### TASK-REFACTOR-022: Ejecutar todos los tests

```bash
mvn clean test

# Objetivo: 100% tests pasando
# Si fallan tests:
# - Revisar imports en test files
# - Actualizar @SpringBootTest si es necesario
# - Verificar @ComponentScan si se usa
```

#### TASK-REFACTOR-023: Actualizar application.yml (si tiene escaneo de paquetes)

```yaml
# Si existe configuración de component scan, verificar que incluya nuevos paquetes
spring:
  application:
    name: finarg

# Por defecto Spring Boot escanea todo el paquete base (com.finarg)
# Debería funcionar sin cambios
```

#### TASK-REFACTOR-024: Verificar OpenAPI/Swagger

```bash
# Arrancar aplicación
mvn spring-boot:run

# Verificar Swagger UI
# http://localhost:8080/swagger-ui.html

# Confirmar que todos los endpoints aparecen correctamente agrupados
```

---

## 📅 Plan de Migración - Frontend

### Fase 1: Preparación (1 hora)

#### TASK-REFACTOR-025: Crear estructura de carpetas

```bash
cd web/src

# Componentes por módulo
mkdir -p components/auth
mkdir -p components/quotes
mkdir -p components/inflation
mkdir -p components/reserves
mkdir -p components/calculators
mkdir -p components/indicators
mkdir -p components/crypto

# Hooks por módulo
mkdir -p hooks/quotes
mkdir -p hooks/inflation
mkdir -p hooks/reserves
mkdir -p hooks/calculators
mkdir -p hooks/indicators
mkdir -p hooks/crypto
mkdir -p hooks/auth

# API clients separados
mkdir -p lib/api
mkdir -p lib/utils

# Types separados
mkdir -p types
```

#### TASK-REFACTOR-026: Backup y branch

```bash
git checkout -b refactor/frontend-modular-structure

# Ejecutar tests actuales
npm test

# Ejecutar build
npm run build

# Verificar que todo funciona
npm run dev
```

---

### Fase 2: Migrar Stores (1 hora)

#### TASK-REFACTOR-027: Separar authStore y appStore

**Crear `store/authStore.ts`:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface User {
  id: string
  email: string
  name: string
}

interface AuthState {
  user: User | null
  accessToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      isAuthenticated: false,
      setAuth: (user, token) =>
        set({ user, accessToken: token, isAuthenticated: true }),
      logout: () =>
        set({ user: null, accessToken: null, isAuthenticated: false }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
)
```

**Crear `store/appStore.ts`:**
```typescript
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AppState {
  sidebarOpen: boolean
  toggleSidebar: () => void
  selectedCountry: 'ar' | 'co' | 'br' | 'cl' | 'uy'
  setSelectedCountry: (country: AppState['selectedCountry']) => void
  _hasHydrated: boolean
  setHasHydrated: (state: boolean) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      selectedCountry: 'ar',
      setSelectedCountry: (country) => set({ selectedCountry: country }),
      _hasHydrated: false,
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: 'app-storage',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    }
  )
)
```

**Crear `store/index.ts`:**
```typescript
export { useAuthStore } from './authStore'
export { useAppStore } from './appStore'

// Mantener compatibilidad temporal con código existente
export { useStore } from './useStore'  // DEPRECAR en v2.0
```

#### TASK-REFACTOR-028: Actualizar importaciones de stores

```bash
# Buscar todos los archivos que usan useStore
grep -r "useStore" --include="*.tsx" --include="*.ts" src/

# Actualizar manualmente cada uno:
# Antes:
# import { useStore } from '@/store/useStore'
# const { user, logout } = useStore()

# Después:
# import { useAuthStore } from '@/store'
# const { user, logout } = useAuthStore()
```

---

### Fase 3: Migrar API Clients (1.5 horas)

#### TASK-REFACTOR-029: Crear cliente base

**Crear `lib/api/client.ts`:**
```typescript
import axios from 'axios'

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 15000,
  withCredentials: true,
})

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)
```

#### TASK-REFACTOR-030: Separar API por módulo

**Crear `lib/api/quotes.ts`:**
```typescript
import { apiClient } from './client'
import type { Quote, Gap, ExchangeRateComparison } from '@/types/quotes'

export const quotesApi = {
  getAll: (country?: string) =>
    apiClient.get<Quote[]>(`/${country || 'ar'}/quotes`),

  getByType: (country: string, type: string) =>
    apiClient.get<Quote>(`/${country}/quotes/${type}`),

  getGap: (country?: string) =>
    apiClient.get<Gap>(`/${country || 'ar'}/quotes/gap`),

  getHistory: (country: string, type: string, days: number) =>
    apiClient.get<Quote[]>(`/${country}/quotes/${type}/history`, {
      params: { days },
    }),

  compareRates: (country: string) =>
    apiClient.get<ExchangeRateComparison>(`/${country}/exchange-rates/comparison`),
}
```

**Crear `lib/api/inflation.ts`:**
```typescript
import { apiClient } from './client'
import type { Inflation, InflationAdjustment } from '@/types/inflation'

export const inflationApi = {
  getCurrent: () =>
    apiClient.get<Inflation>('/inflation/current'),

  getMonthly: (months: number) =>
    apiClient.get<Inflation[]>('/inflation/monthly', { params: { months } }),

  getHistorical: (startDate: string, endDate: string) =>
    apiClient.get<Inflation[]>('/inflation/historical', {
      params: { startDate, endDate },
    }),

  calculateAdjustment: (amount: number, startDate: string, endDate: string) =>
    apiClient.post<InflationAdjustment>('/inflation/adjust', {
      amount,
      startDate,
      endDate,
    }),
}
```

**Repetir para todos los módulos:**
- `lib/api/reserves.ts`
- `lib/api/rates.ts`
- `lib/api/calculators.ts`
- `lib/api/indicators.ts`
- `lib/api/crypto.ts`
- `lib/api/auth.ts`

**Crear `lib/api/index.ts`:**
```typescript
export * from './quotes'
export * from './inflation'
export * from './reserves'
export * from './rates'
export * from './calculators'
export * from './indicators'
export * from './crypto'
export * from './auth'

// Export client para casos especiales
export { apiClient } from './client'
```

---

### Fase 4: Migrar Types (1 hora)

#### TASK-REFACTOR-031: Separar types por módulo

**Crear `types/quotes.ts`:**
```typescript
export interface Quote {
  name: string
  buy: number
  sell: number
  spread: number
  variation: number
  lastUpdate: string
}

export interface Gap {
  percentage: number
  level: 'LOW' | 'MEDIUM' | 'HIGH'
  officialRate: number
  blueRate: number
}

export interface ExchangeRateComparison {
  // ... tipos
}

export type CurrencyType =
  | 'oficial'
  | 'blue'
  | 'mep'
  | 'ccl'
  // ... resto
```

**Crear `types/inflation.ts`, `types/reserves.ts`, etc.**

**Crear `types/index.ts`:**
```typescript
export * from './quotes'
export * from './inflation'
export * from './reserves'
export * from './calculators'
export * from './indicators'
export * from './crypto'
export * from './auth'
export * from './common'
```

---

### Fase 5: Migrar Hooks (2 horas)

#### TASK-REFACTOR-032: Reorganizar hooks por módulo

**Crear `hooks/quotes/useQuotes.ts`:**
```typescript
import { useQuery } from '@tanstack/react-query'
import { quotesApi } from '@/lib/api'
import type { Quote } from '@/types/quotes'

export function useQuotes(country?: string) {
  return useQuery({
    queryKey: ['quotes', country],
    queryFn: () => quotesApi.getAll(country),
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchInterval: 5 * 60 * 1000,
  })
}
```

**Crear `hooks/quotes/useGap.ts`, etc.**

**Crear `hooks/quotes/index.ts`:**
```typescript
export * from './useQuotes'
export * from './useGap'
export * from './useQuoteHistory'
```

**Repetir para todos los módulos**

**Actualizar `hooks/index.ts`:**
```typescript
export * from './quotes'
export * from './inflation'
export * from './reserves'
export * from './calculators'
export * from './indicators'
export * from './crypto'
export * from './auth'
export * from './useTranslation'
```

---

### Fase 6: Migrar Componentes (3 horas)

#### TASK-REFACTOR-033: Reorganizar componentes dashboard

```bash
# Mover widgets específicos a sus módulos
git mv components/dashboard/QuoteCard.tsx components/quotes/
git mv components/dashboard/ReservesWidget.tsx components/reserves/
git mv components/dashboard/CountryRiskWidget.tsx components/indicators/
git mv components/dashboard/BandsWidget.tsx components/indicators/
git mv components/dashboard/CryptoWidget.tsx components/crypto/

# Mantener en dashboard solo composición
# - DashboardGrid.tsx
# - GapGauge.tsx (específico de dashboard)
```

**Actualizar imports en páginas:**
```typescript
// app/page.tsx (home/dashboard)
// Antes:
import { QuoteCard } from '@/components/dashboard/QuoteCard'

// Después:
import { QuoteCard } from '@/components/quotes/QuoteCard'
```

#### TASK-REFACTOR-034: Crear barrel exports por módulo

**Crear `components/quotes/index.ts`:**
```typescript
export { QuoteCard } from './QuoteCard'
export { QuotesList } from './QuotesList'
export { QuoteFilters } from './QuoteFilters'
```

**Repetir para todos los módulos**

---

### Fase 7: Testing & Cleanup (2 horas)

#### TASK-REFACTOR-035: Actualizar imports en toda la app

```bash
# Buscar imports antiguos
grep -r "from '@/lib/api'" --include="*.tsx" --include="*.ts" src/
grep -r "from '@/types'" --include="*.tsx" --include="*.ts" src/
grep -r "from '@/hooks'" --include="*.tsx" --include="*.ts" src/

# Actualizar manualmente o con script
```

#### TASK-REFACTOR-036: Ejecutar linter

```bash
npm run lint:check

# Corregir errores
npm run lint:write
```

#### TASK-REFACTOR-037: Type checking

```bash
npx tsc --noEmit

# Corregir errores de tipos
```

#### TASK-REFACTOR-038: Build de producción

```bash
npm run build

# Verificar que no hay errores
# Verificar bundle size (no debería aumentar significativamente)
```

#### TASK-REFACTOR-039: Testing manual

```bash
npm run dev

# Probar:
# - Login/Logout
# - Navegación entre páginas
# - Carga de datos
# - Calculadoras
# - Cambio de país
# - Cambio de tema
```

#### TASK-REFACTOR-040: Tests automatizados

```bash
npm test

# Objetivo: Todos los tests pasan
```

---

## ✅ Checklist Pre-Merge

### Backend
- [ ] Todos los archivos movidos a nuevas carpetas
- [ ] Packages actualizados en todos los .java
- [ ] Imports corregidos en todos los archivos
- [ ] `mvn clean compile` exitoso
- [ ] `mvn test` 100% tests pasan
- [ ] Swagger UI muestra todos los endpoints
- [ ] Application arranca sin errores
- [ ] Carpetas antiguas eliminadas

### Frontend
- [ ] Stores separados y funcionando
- [ ] API clients modularizados
- [ ] Types separados por módulo
- [ ] Hooks reorganizados
- [ ] Componentes movidos
- [ ] Imports actualizados en toda la app
- [ ] `npm run lint:check` sin errores
- [ ] `npx tsc --noEmit` sin errores
- [ ] `npm run build` exitoso
- [ ] `npm test` tests pasan
- [ ] Testing manual completo

### Git
- [ ] Commits atómicos por cada fase
- [ ] Mensajes de commit descriptivos
- [ ] Branch pusheado a remote
- [ ] No hay merge conflicts
- [ ] Pull request creado
- [ ] Code review solicitado

---

## 📝 Estrategia de Commits

### Commits Atómicos Sugeridos

```bash
# Backend - Core
git add core/
git commit -m "refactor(backend): move config, security, exception to core module"

# Backend - Auth
git add auth/
git commit -m "refactor(backend): create auth module with controller, services, DTOs"

# Backend - Quotes
git add quotes/
git commit -m "refactor(backend): create quotes module with clients organized by country"

# Backend - Resto de módulos
git add inflation/ reserves/ rates/ calculators/ indicators/ crypto/ alerts/ user/ shared/
git commit -m "refactor(backend): create domain modules (inflation, reserves, rates, calculators, indicators, crypto, alerts, user)"

# Backend - Cleanup
git add -A
git commit -m "refactor(backend): remove old folder structure and update all imports"

# Frontend - Stores
git add store/
git commit -m "refactor(frontend): separate authStore and appStore"

# Frontend - API Clients
git add lib/api/
git commit -m "refactor(frontend): modularize API clients by domain"

# Frontend - Types
git add types/
git commit -m "refactor(frontend): separate types by domain module"

# Frontend - Hooks
git add hooks/
git commit -m "refactor(frontend): organize hooks by domain module"

# Frontend - Components
git add components/
git commit -m "refactor(frontend): reorganize components by domain"

# Frontend - Cleanup
git add -A
git commit -m "refactor(frontend): update all imports and remove deprecated files"
```

---

## 🚨 Troubleshooting

### Problema: Compilation errors después de mover archivos

**Solución:**
```bash
# 1. Verificar que todos los packages están correctos
find . -name "*.java" -exec grep -H "^package" {} \; | grep -v "com.finarg.MODULE"

# 2. Regenerar índice de IDE
# IntelliJ: File > Invalidate Caches / Restart
# VS Code: Reload Window

# 3. Limpiar y recompilar
mvn clean compile -U
```

### Problema: Tests fallan con ClassNotFoundException

**Solución:**
```java
// Verificar @SpringBootTest en test classes
@SpringBootTest(classes = FinArgApplication.class)
class MyModuleTest {
    // ...
}

// O configurar component scan explícito si es necesario
@ComponentScan(basePackages = "com.finarg")
```

### Problema: Frontend build fails con "Cannot find module"

**Solución:**
```bash
# 1. Verificar que todos los index.ts existen
ls -la hooks/*/index.ts
ls -la components/*/index.ts

# 2. Verificar tsconfig paths
cat tsconfig.json | grep "paths"

# 3. Limpiar y rebuild
rm -rf .next node_modules
npm install
npm run build
```

### Problema: Imports circulares

**Solución:**
```typescript
// Evitar:
// moduleA/index.ts imports moduleB
// moduleB/index.ts imports moduleA

// Solución: Imports específicos
import { SpecificFunction } from '@/module/specificFile'
// NO: import { SpecificFunction } from '@/module'
```

---

## 📊 Métricas de Éxito

### Antes de Refactor
- Carpetas raíz: 10+
- Archivos por carpeta: 13-17
- Profundidad: 2 niveles
- Tiempo de navegación: Alto
- Módulos acoplados: Sí

### Después de Refactor
- Módulos: 10 (auth, quotes, inflation, reserves, rates, calculators, indicators, crypto, alerts, user)
- Archivos por módulo: 3-8
- Profundidad: 4 niveles
- Tiempo de navegación: Bajo
- Módulos desacoplados: Sí

### KPIs
- ✅ 0 errores de compilación
- ✅ 100% tests passing
- ✅ 0 warnings de imports
- ✅ Build time < 60s (frontend)
- ✅ Build time < 120s (backend)
- ✅ Bundle size no aumenta >5%

---

## 🎯 Próximos Pasos Post-Refactor

1. **Merge a main**
   ```bash
   git checkout main
   git merge refactor/modular-structure
   git push origin main
   ```

2. **Actualizar CLAUDE.md**
   - Documentar nueva estructura
   - Actualizar guías de desarrollo
   - Agregar convenciones de módulos

3. **Comunicar al equipo**
   - Presentar nueva estructura
   - Actualizar onboarding docs
   - Training session si es necesario

4. **Iniciar módulo Real Estate**
   ```bash
   mkdir -p api/src/main/java/com/finarg/realestate/{controller,service,client,dto,entity,repository}
   mkdir -p web/src/{components,hooks,types}/realestate
   ```

5. **Monitorear impacto**
   - Velocity de desarrollo
   - Tiempo de onboarding
   - Facilidad de mantenimiento

---

## 📚 Referencias

### Arquitectura Modular
- [Spring Boot Multi-Module Projects](https://spring.io/guides/gs/multi-module/)
- [Feature-Sliced Design](https://feature-sliced.design/)
- [Modular Monoliths](https://www.kamilgrzybek.com/blog/posts/modular-monolith-primer)

### Refactoring
- [Refactoring Guru](https://refactoring.guru/)
- [Martin Fowler - Refactoring](https://martinfowler.com/books/refactoring.html)

### Git Best Practices
- [Atomic Commits](https://www.aleksandrhovhannisyan.com/blog/atomic-git-commits/)
- [Conventional Commits](https://www.conventionalcommits.org/)

---

**Última actualización**: 2026-02-11
**Versión**: 1.0
**Estado**: Ready for Execution
**Autor**: Claude + FinArg Team

---

## 🚀 Ready to Start?

**Comando inicial:**
```bash
# Backend
cd api/src/main/java/com/finarg
mkdir -p core/{config,security,exception,util}

# Frontend
cd web/src
mkdir -p components/{auth,quotes,inflation,reserves,calculators,indicators,crypto}

# Git
git checkout -b refactor/modular-structure
git push -u origin refactor/modular-structure
```

**¡Manos a la obra!** 💪
