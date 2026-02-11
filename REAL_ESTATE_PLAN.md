
# 🏠 Plan de Implementación - Módulo Real Estate Intelligence

## 📋 Executive Summary

**Objetivo**: Crear un módulo de inteligencia inmobiliaria para FinArg que permita:
- Análisis de mercado inmobiliario con datos en tiempo real
- Comparación de precios por m² a nivel barrio/ciudad
- Calculadora ROI (Comprar vs Alquilar)
- Análisis automático del estado de propiedades mediante IA

**Timeline Total**: 12-14 semanas (3-3.5 meses)
**Prioridad**: Alta (diferenciador competitivo clave)
**Complejidad**: Alta (scraping + ML/IA + analytics complejos)

---

## 🎯 Objetivos del Proyecto

### Objetivos de Negocio
1. Posicionar a FinArg como plataforma integral de inteligencia financiera
2. Captar usuarios interesados en inversión inmobiliaria
3. Generar engagement con herramientas de análisis avanzadas
4. Diferenciarse de portales inmobiliarios tradicionales con IA

### Objetivos Técnicos
1. Recolectar y normalizar datos de múltiples fuentes (scraping ético)
2. Almacenar históricos para análisis de tendencias
3. Implementar cálculos financieros complejos (ROI, TIR, CAP rate)
4. Integrar modelos de IA para análisis de imágenes
5. Mantener arquitectura escalable y performante

---

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

#### Backend (Spring Boot)
- **Scraping**: Jsoup + WebClient (async)
- **Base de datos**: PostgreSQL 16 (nuevas tablas)
- **Cache**: Redis (TTL 24h para properties)
- **IA/ML**: OpenAI Vision API (fase inicial) → TensorFlow Java (futuro)
- **Scheduler**: Spring @Scheduled (actualización diaria)
- **Rate Limiting**: Bucket4j (scraping respetuoso)

#### Frontend (Next.js)
- **Estado**: TanStack Query + Zustand
- **Charts**: Recharts (tendencias de precios)
- **Maps**: Leaflet o Google Maps API
- **UI**: shadcn/ui + Tailwind CSS
- **Forms**: React Hook Form + Zod

### Nuevas Entidades (Base de Datos)

```sql
-- Tabla principal de propiedades
CREATE TABLE properties (
    id BIGSERIAL PRIMARY KEY,
    source VARCHAR(50) NOT NULL,           -- ARGENPROP, ZONAPROP, PROPERATI
    source_id VARCHAR(255) UNIQUE NOT NULL,
    source_url TEXT,

    -- Básicos
    title VARCHAR(500),
    description TEXT,
    property_type VARCHAR(50),             -- APARTMENT, HOUSE, PH, LAND
    operation_type VARCHAR(50),            -- SALE, RENT

    -- Ubicación
    address VARCHAR(500),
    neighborhood VARCHAR(255),
    city VARCHAR(255),
    province VARCHAR(255),
    country VARCHAR(10) DEFAULT 'AR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),

    -- Características
    rooms INTEGER,
    bedrooms INTEGER,
    bathrooms INTEGER,
    total_area DECIMAL(10, 2),
    covered_area DECIMAL(10, 2),
    age INTEGER,                           -- Antigüedad en años
    garage BOOLEAN DEFAULT FALSE,
    garage_spaces INTEGER,
    amenities BOOLEAN DEFAULT FALSE,

    -- Precio
    price DECIMAL(15, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    price_per_m2 DECIMAL(10, 2),
    rental_price DECIMAL(10, 2),           -- Si está también en alquiler

    -- Metadata
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),
    last_scraped_at TIMESTAMP,

    -- Índices
    INDEX idx_location (neighborhood, city, country),
    INDEX idx_price_m2 (price_per_m2),
    INDEX idx_type (property_type, operation_type),
    INDEX idx_active (active, created_at)
);

-- Histórico de precios
CREATE TABLE property_prices (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    price DECIMAL(15, 2) NOT NULL,
    price_per_m2 DECIMAL(10, 2),
    currency VARCHAR(3),
    recorded_at DATE NOT NULL,

    INDEX idx_property_date (property_id, recorded_at)
);

-- Imágenes de propiedades
CREATE TABLE property_images (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    url TEXT NOT NULL,
    is_main BOOLEAN DEFAULT FALSE,
    display_order INTEGER,

    INDEX idx_property (property_id)
);

-- Análisis IA de propiedades
CREATE TABLE property_analysis (
    id BIGSERIAL PRIMARY KEY,
    property_id BIGINT UNIQUE REFERENCES properties(id) ON DELETE CASCADE,

    -- Resultados del análisis
    detected_condition VARCHAR(50),        -- NEW, EXCELLENT, GOOD, FAIR, POOR, REFURBISH
    confidence_score INTEGER,              -- 0-100
    detected_features JSONB,               -- ["renovated kitchen", "wooden floors"]
    detected_issues JSONB,                 -- ["humidity", "old fixtures"]

    -- Comparativa de mercado
    market_avg_price_m2 DECIMAL(10, 2),
    price_variance_percent DECIMAL(5, 2), -- % vs mercado

    -- ROI estimado
    estimated_rental_yield DECIMAL(5, 2), -- % anual
    months_to_break_even INTEGER,

    -- Metadata
    ai_model_version VARCHAR(50),
    analyzed_at TIMESTAMP DEFAULT NOW(),

    INDEX idx_analyzed_at (analyzed_at)
);

-- Favoritos de usuarios
CREATE TABLE user_favorite_properties (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE CASCADE,
    property_id BIGINT REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),

    UNIQUE (user_id, property_id),
    INDEX idx_user (user_id)
);

-- Estadísticas agregadas por barrio (materialized view)
CREATE MATERIALIZED VIEW neighborhood_stats AS
SELECT
    neighborhood,
    city,
    country,
    property_type,
    COUNT(*) as total_listings,
    AVG(price_per_m2) as avg_price_m2,
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_per_m2) as median_price_m2,
    MIN(price_per_m2) as min_price_m2,
    MAX(price_per_m2) as max_price_m2,
    AVG(total_area) as avg_area,
    MAX(updated_at) as last_updated
FROM properties
WHERE active = TRUE AND price_per_m2 IS NOT NULL
GROUP BY neighborhood, city, country, property_type;

CREATE INDEX idx_neighborhood_stats ON neighborhood_stats(neighborhood, city);

-- Refresh periódico (ejecutar con scheduler)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY neighborhood_stats;
```

### Nuevos Endpoints (API)

```
POST   /api/v1/real-estate/scrape                    # Disparar scraping manual (admin)
GET    /api/v1/real-estate/properties                # Listar propiedades (con filtros)
GET    /api/v1/real-estate/properties/{id}           # Detalle de propiedad
GET    /api/v1/real-estate/properties/{id}/history   # Histórico de precios
POST   /api/v1/real-estate/properties/{id}/analyze   # Analizar con IA

GET    /api/v1/real-estate/neighborhoods             # Listar barrios con datos
GET    /api/v1/real-estate/neighborhoods/{name}/stats # Estadísticas por barrio
GET    /api/v1/real-estate/neighborhoods/compare     # Comparar múltiples barrios

POST   /api/v1/real-estate/roi/calculate             # Calculadora ROI (comprar vs alquilar)
POST   /api/v1/real-estate/roi/investment            # Análisis de inversión (rentabilidad)

GET    /api/v1/real-estate/favorites                 # Favoritos del usuario
POST   /api/v1/real-estate/favorites                 # Agregar a favoritos
DELETE /api/v1/real-estate/favorites/{id}            # Remover de favoritos

GET    /api/v1/real-estate/trends                    # Tendencias de mercado
GET    /api/v1/real-estate/heatmap                   # Mapa de calor por zonas
```

---

## 📅 Plan de Implementación

### **FASE 1: Fundamentos & Data Collection** (4 semanas)

#### 🎯 Objetivos
- Configurar infraestructura de scraping
- Crear modelos de datos y repositorios
- Implementar scrapers para Argenprop y ZonaProp
- Poblar base de datos inicial

#### 📝 Tasks

##### Semana 1: Setup & Modelos

**Backend**
- [ ] **TASK-RE-001**: Crear modelos JPA (`Property`, `PropertyPrice`, `PropertyImage`, `PropertyAnalysis`)
  - Estimación: 1 día
  - Archivos: `model/entity/Property.java`, etc.
  - Validaciones Jakarta Validation

- [ ] **TASK-RE-002**: Crear repositorios JPA con queries personalizadas
  - Estimación: 0.5 días
  - Archivos: `repository/PropertyRepository.java`, etc.
  - Queries: `findByNeighborhoodAndCity`, `findByPricePerM2Between`, etc.

- [ ] **TASK-RE-003**: Ejecutar migraciones de base de datos
  - Estimación: 0.5 días
  - Crear scripts SQL o usar Flyway/Liquibase
  - Crear índices optimizados

- [ ] **TASK-RE-004**: Configurar WebClient para scraping
  - Estimación: 0.5 días
  - Archivo: `config/ScrapingWebClientConfig.java`
  - Timeouts, user-agent, rate limiting

- [ ] **TASK-RE-005**: Implementar rate limiter específico para scraping
  - Estimación: 0.5 días
  - Bucket4j con 1 request cada 2 segundos
  - Archivo: `service/ScrapingRateLimiterService.java`

**Frontend**
- [ ] **TASK-RE-006**: Crear tipos TypeScript para entidades de Real Estate
  - Estimación: 0.5 días
  - Archivo: `types/realEstate.ts`
  - Types: `Property`, `PropertyFilters`, `NeighborhoodStats`, etc.

##### Semana 2: Scraping - Argenprop

- [ ] **TASK-RE-007**: Implementar clase base abstracta `BasePropertyScraperClient`
  - Estimación: 1 día
  - Archivo: `client/scraper/BasePropertyScraperClient.java`
  - Rate limiting, error handling, retry logic

- [ ] **TASK-RE-008**: Implementar `ArgenPropScraperClient`
  - Estimación: 2 días
  - Archivo: `client/scraper/ArgenPropScraperClient.java`
  - Parsear listados de búsqueda
  - Parsear página de detalle
  - Extraer: precio, m², características, ubicación, imágenes

- [ ] **TASK-RE-009**: Testing del scraper Argenprop
  - Estimación: 1 día
  - Tests unitarios con mocks de HTML
  - Test de integración contra sitio real (sandbox)
  - Validar normalización de datos

##### Semana 3: Scraping - ZonaProp & Service Layer

- [ ] **TASK-RE-010**: Implementar `ZonaPropScraperClient`
  - Estimación: 2 días
  - Similar a Argenprop pero con selectores diferentes
  - Archivo: `client/scraper/ZonaPropScraperClient.java`

- [ ] **TASK-RE-011**: Crear `PropertyScraperService` (orquestador)
  - Estimación: 1 día
  - Archivo: `service/PropertyScraperService.java`
  - Coordinar múltiples scrapers
  - Deduplicación de propiedades (por URL/source_id)
  - Guardar en BD con transacciones

- [ ] **TASK-RE-012**: Implementar `PropertyService` (CRUD básico)
  - Estimación: 1 día
  - Archivo: `service/PropertyService.java`
  - Métodos: `findAll`, `findById`, `search`, `update`, `delete`
  - Paginación y filtros

- [ ] **TASK-RE-013**: Testing de services
  - Estimación: 1 día
  - Tests unitarios con mocks
  - Tests de deduplicación

##### Semana 4: Controller & Scheduled Jobs

- [ ] **TASK-RE-014**: Crear `RealEstateController`
  - Estimación: 1 día
  - Archivo: `controller/RealEstateController.java`
  - Endpoints: `GET /properties`, `GET /properties/{id}`
  - Validación de parámetros

- [ ] **TASK-RE-015**: Implementar `PropertyDataCollectorScheduler`
  - Estimación: 1 día
  - Archivo: `scheduler/PropertyDataCollectorScheduler.java`
  - `@Scheduled(cron = "0 0 3 * * *")` - ejecutar a las 3 AM
  - Scraping automático diario
  - Logging y monitoreo

- [ ] **TASK-RE-016**: Configurar caché Redis para propiedades
  - Estimación: 0.5 días
  - TTL: 24 horas
  - Cache keys: `properties:all`, `properties:{id}`, `properties:search:{hash}`

- [ ] **TASK-RE-017**: Poblar BD inicial (data seeding)
  - Estimación: 0.5 días
  - Ejecutar scraping manual para ~500-1000 propiedades
  - Validar calidad de datos
  - Documentar estadísticas de cobertura

**Frontend**
- [ ] **TASK-RE-018**: Crear API client para Real Estate
  - Estimación: 0.5 días
  - Archivo: `lib/api/realEstateApi.ts`
  - Métodos: `getProperties`, `getPropertyById`, etc.

- [ ] **TASK-RE-019**: Crear custom hook `useProperties`
  - Estimación: 0.5 días
  - Archivo: `hooks/useProperties.ts`
  - TanStack Query con filtros y paginación

#### 🎉 Entregables Fase 1
- ✅ Base de datos con ~1000 propiedades
- ✅ 2 scrapers funcionando (Argenprop, ZonaProp)
- ✅ Scraping automático diario
- ✅ API REST básica operativa
- ✅ Frontend preparado para consumir API

#### 📊 KPIs Fase 1
- Propiedades scrapeadas: 800-1200
- Tasa de éxito scraping: >85%
- Tiempo de scraping: <20 min
- Cobertura CABA: >70%

---

### **FASE 2: Analytics & ROI Calculator** (3 semanas)

#### 🎯 Objetivos
- Implementar cálculos de ROI (Comprar vs Alquilar)
- Crear estadísticas por barrio y m²
- Desarrollar comparador de propiedades/barrios
- Construir UI para análisis

#### 📝 Tasks

##### Semana 5: Analytics Service

- [ ] **TASK-RE-020**: Crear `PropertyAnalyticsService`
  - Estimación: 2 días
  - Archivo: `service/PropertyAnalyticsService.java`
  - Método: `calculateBuyVsRentROI`
  - Incluir: hipoteca, impuestos, expensas, apreciación

- [ ] **TASK-RE-021**: Implementar cálculo de estadísticas por barrio
  - Estimación: 1 día
  - Método: `getNeighborhoodStats`
  - Usar materialized view `neighborhood_stats`
  - Estadísticas: avg, median, min, max precio/m²

- [ ] **TASK-RE-022**: Crear DTOs para requests/responses de analytics
  - Estimación: 0.5 días
  - Archivos: `dto/ROICalculationRequestDTO.java`, `ROICalculationResponseDTO.java`
  - Validación exhaustiva con Jakarta

- [ ] **TASK-RE-023**: Testing de cálculos financieros
  - Estimación: 1 día
  - Tests con casos edge (precios extremos, 0%, 100% inicial)
  - Validar fórmulas contra Excel/calculadoras online

##### Semana 6: Comparador & Tendencias

- [ ] **TASK-RE-024**: Implementar comparador de barrios
  - Estimación: 1 día
  - Método: `compareNeighborhoods(List<String> neighborhoods)`
  - Retornar tabla comparativa con métricas clave

- [ ] **TASK-RE-025**: Crear service para tendencias de precios
  - Estimación: 1 día
  - Archivo: `service/PropertyTrendsService.java`
  - Usar tabla `property_prices` (histórico)
  - Calcular variación mensual, anual

- [ ] **TASK-RE-026**: Implementar heatmap de precios por zona
  - Estimación: 1 día
  - Método: `getHeatmapData(String city, PropertyType type)`
  - Agrupar por coordenadas (lat/lng) en grid
  - Retornar JSON para mapas

- [ ] **TASK-RE-027**: Crear endpoints en controller
  - Estimación: 1 día
  - `POST /roi/calculate`
  - `GET /neighborhoods/{name}/stats`
  - `GET /neighborhoods/compare?names=palermo,belgrano,recoleta`
  - `GET /trends?neighborhood=palermo&months=12`
  - `GET /heatmap?city=caba`

##### Semana 7: Frontend Analytics

**Frontend**
- [ ] **TASK-RE-028**: Crear página principal Real Estate
  - Estimación: 1.5 días
  - Archivo: `app/real-estate/page.tsx`
  - Listado de propiedades con filtros
  - Cards con precio, m², ubicación, imágenes

- [ ] **TASK-RE-029**: Crear componente `PropertyFilters`
  - Estimación: 1 día
  - Filtros: barrio, precio min/max, ambientes, tipo
  - Implementar con query params (Next.js router)

- [ ] **TASK-RE-030**: Crear página de detalle de propiedad
  - Estimación: 1 día
  - Archivo: `app/real-estate/[id]/page.tsx`
  - Galería de imágenes
  - Características completas
  - Mapa con ubicación

- [ ] **TASK-RE-031**: Crear calculadora ROI (página)
  - Estimación: 2 días
  - Archivo: `app/real-estate/roi-calculator/page.tsx`
  - Form con todos los parámetros
  - Visualización comparativa (charts)
  - Recomendación clara

- [ ] **TASK-RE-032**: Crear custom hooks
  - Estimación: 1 día
  - `useROICalculation`, `useNeighborhoodStats`, `usePropertyTrends`

- [ ] **TASK-RE-033**: Crear componente `NeighborhoodStatsCard`
  - Estimación: 0.5 días
  - Mostrar métricas clave del barrio
  - Visualización con progress bars / gauges

#### 🎉 Entregables Fase 2
- ✅ Calculadora ROI completa y precisa
- ✅ Estadísticas por barrio funcionales
- ✅ Comparador de múltiples barrios
- ✅ Frontend con 3 páginas principales
- ✅ Charts de tendencias históricas

#### 📊 KPIs Fase 2
- Precisión cálculos ROI: >95%
- Barrios con estadísticas: >50
- Tiempo de carga página: <2s
- Mobile responsive: 100%

---

### **FASE 3: Análisis IA de Imágenes** (3 semanas)

#### 🎯 Objetivos
- Integrar OpenAI Vision API
- Analizar estado de propiedades desde imágenes
- Detectar características y problemas
- Ajustar valoraciones según estado

#### 📝 Tasks

##### Semana 8: Setup IA & Integración OpenAI

- [ ] **TASK-RE-034**: Configurar cuenta OpenAI y obtener API key
  - Estimación: 0.5 días
  - Agregar variable de entorno `OPENAI_API_KEY`
  - Configurar límites de uso y alertas

- [ ] **TASK-RE-035**: Crear `PropertyImageAnalysisService`
  - Estimación: 2 días
  - Archivo: `service/PropertyImageAnalysisService.java`
  - Método: `analyzePropertyImages(List<String> imageUrls)`
  - Integrar OpenAI Vision API con WebClient
  - Parsear respuesta JSON

- [ ] **TASK-RE-036**: Diseñar prompt óptimo para análisis
  - Estimación: 1 día
  - Iterar y testear diferentes prompts
  - Objetivo: máxima precisión en estado/características
  - Formato de respuesta: JSON estructurado

- [ ] **TASK-RE-037**: Implementar rate limiting para API de OpenAI
  - Estimación: 0.5 días
  - Límite: 50 análisis por día (plan gratuito)
  - Queue para análisis masivo

##### Semana 9: Lógica de Análisis & Validación

- [ ] **TASK-RE-038**: Crear pipeline de análisis completo
  - Estimación: 2 días
  - 1. Descargar imágenes (opcional, si no son URLs públicas)
  - 2. Llamar a OpenAI Vision
  - 3. Parsear y validar respuesta
  - 4. Guardar en `property_analysis`
  - 5. Calcular ajuste de precio basado en estado

- [ ] **TASK-RE-039**: Implementar lógica de valoración ajustada
  - Estimación: 1 día
  - NUEVO → +10% sobre mercado
  - EXCELENTE → +5%
  - BUENO → 0%
  - A REFACCIONAR → -10%
  - MALO → -20%
  - Actualizar `price_variance_percent`

- [ ] **TASK-RE-040**: Crear endpoint de análisis
  - Estimación: 0.5 días
  - `POST /properties/{id}/analyze`
  - Autenticación requerida (Admin o propietario)
  - Rate limiting (max 10/día por usuario)

- [ ] **TASK-RE-041**: Testing y validación de IA
  - Estimación: 1 día
  - Probar con 50 propiedades variadas
  - Comparar con evaluaciones manuales
  - Ajustar prompts si precisión <80%

##### Semana 10: Frontend IA & Visualización

**Frontend**
- [ ] **TASK-RE-042**: Crear componente `PropertyImageAnalyzer`
  - Estimación: 1.5 días
  - Archivo: `components/real-estate/PropertyImageAnalyzer.tsx`
  - Botón "Analizar con IA"
  - Mostrar resultados: estado, score, features, issues

- [ ] **TASK-RE-043**: Integrar análisis en página de detalle
  - Estimación: 0.5 días
  - Card dedicado con análisis IA
  - Loading state durante análisis

- [ ] **TASK-RE-044**: Crear custom hook `usePropertyImageAnalysis`
  - Estimación: 0.5 días
  - Archivo: `hooks/usePropertyImageAnalysis.ts`
  - Mutation para disparar análisis

- [ ] **TASK-RE-045**: Agregar badges visuales de estado
  - Estimación: 0.5 días
  - Color-coded por condición
  - Iconos representativos

- [ ] **TASK-RE-046**: Documentación de uso de IA
  - Estimación: 0.5 días
  - Página `/real-estate/about-ai`
  - Explicar cómo funciona
  - Disclaimer sobre precisión

#### 🎉 Entregables Fase 3
- ✅ Análisis IA funcional con OpenAI Vision
- ✅ Detección de estado y características
- ✅ Ajuste automático de valoraciones
- ✅ UI intuitiva para análisis
- ✅ Documentación de capacidades

#### 📊 KPIs Fase 3
- Precisión de detección: >80%
- Tiempo de análisis: <10s
- Propiedades analizadas: >100
- Satisfacción usuarios: NPS >7

---

### **FASE 4: Expansión & Optimización** (2 semanas)

#### 🎯 Objetivos
- Agregar más fuentes de datos (Properati API, ML)
- Implementar sistema de alertas
- Optimizar performance
- Mobile app considerations

#### 📝 Tasks

##### Semana 11: Nuevas Fuentes & Alertas

- [ ] **TASK-RE-047**: Integrar Properati API
  - Estimación: 2 días
  - Archivo: `client/ProperatiApiClient.java`
  - API Key gratuita (con límites)
  - Normalizar datos a modelo común

- [ ] **TASK-RE-048**: Integrar Mercado Libre Real Estate API
  - Estimación: 1 día
  - Archivo: `client/MLRealEstateClient.java`
  - OAuth si es necesario

- [ ] **TASK-RE-049**: Crear sistema de alertas de propiedades
  - Estimación: 2 días
  - Tabla: `property_alerts`
  - Criterios: barrio, precio max, tipo, características mínimas
  - Notificaciones por email cuando aparece match

##### Semana 12: Performance & Polish

- [ ] **TASK-RE-050**: Optimizar queries de base de datos
  - Estimación: 1 día
  - Analizar con EXPLAIN ANALYZE
  - Agregar índices faltantes
  - Considerar partitioning para `property_prices`

- [ ] **TASK-RE-051**: Implementar lazy loading de imágenes
  - Estimación: 0.5 días
  - Frontend: usar `next/image` con blur placeholder
  - Comprimir imágenes scrapeadas

- [ ] **TASK-RE-052**: Agregar infinite scroll en listados
  - Estimación: 1 día
  - Frontend: TanStack Query con `useInfiniteQuery`
  - Backend: cursor-based pagination

- [ ] **TASK-RE-053**: Crear mapa interactivo de propiedades
  - Estimación: 2 días
  - Librería: Leaflet o Google Maps
  - Pins agrupados por zona
  - Click en pin → popup con resumen

- [ ] **TASK-RE-054**: Testing E2E completo
  - Estimación: 1 día
  - Playwright tests
  - Flujo: buscar → filtrar → ver detalle → analizar IA → calcular ROI

#### 🎉 Entregables Fase 4
- ✅ 4 fuentes de datos integradas
- ✅ Sistema de alertas funcional
- ✅ Performance optimizado (<2s)
- ✅ Mapa interactivo
- ✅ Tests E2E completos

#### 📊 KPIs Fase 4
- Fuentes de datos: 4+
- Propiedades totales: >5000
- Alertas activas: >50
- Performance score: >90

---

## 🧪 Plan de Testing

### Testing Backend

```java
// Unit Tests
@Test
void calculateROI_buyingBetterThanRenting() {
    ROICalculationRequestDTO request = ROICalculationRequestDTO.builder()
        .propertyPrice(BigDecimal.valueOf(150000))
        .monthlyRent(BigDecimal.valueOf(1000))
        .years(10)
        .downPayment(BigDecimal.valueOf(30000))
        .annualAppreciation(BigDecimal.valueOf(5))
        .mortgageRate(BigDecimal.valueOf(6.5))
        .build();

    ROICalculationResponseDTO result = analyticsService.calculateBuyVsRentROI(request);

    assertThat(result.getRecommendation()).isEqualTo("BUY");
    assertThat(result.getBuyingScenario().getRoi()).isGreaterThan(BigDecimal.ZERO);
}

// Integration Tests
@SpringBootTest
@Transactional
class PropertyScraperServiceIntegrationTest {

    @Test
    void scrapeAndSave_argenProp_savesPropertiesCorrectly() {
        PropertySearchCriteria criteria = new PropertySearchCriteria();
        criteria.setNeighborhood("Palermo");

        List<Property> properties = scraperService.scrapeAndSaveProperties(criteria);

        assertThat(properties).isNotEmpty();
        assertThat(properties.get(0).getNeighborhood()).isEqualTo("Palermo");
        assertThat(properties.get(0).getPricePerM2()).isNotNull();
    }
}
```

### Testing Frontend

```typescript
// Component Tests
describe('ROICalculator', () => {
  it('shows buying recommendation when buying ROI is higher', () => {
    render(<ROICalculatorPage />)

    fireEvent.change(screen.getByLabelText('Property Price'), { target: { value: '150000' } })
    fireEvent.change(screen.getByLabelText('Monthly Rent'), { target: { value: '800' } })
    fireEvent.click(screen.getByText('Calculate'))

    expect(await screen.findByText(/Conviene COMPRAR/i)).toBeInTheDocument()
  })
})

// E2E Tests (Playwright)
test('user can search properties and view details', async ({ page }) => {
  await page.goto('/real-estate')

  await page.fill('[placeholder="Buscar barrio"]', 'Palermo')
  await page.selectOption('[name="propertyType"]', 'APARTMENT')
  await page.click('button:has-text("Buscar")')

  await expect(page.locator('.property-card')).toHaveCount.greaterThan(0)

  await page.click('.property-card:first-child')
  await expect(page.locator('h1')).toContainText('Palermo')
})
```

---

## 🔐 Consideraciones Legales & Éticas

### Scraping Ético

1. **Respetar robots.txt**
   ```java
   // Verificar antes de scrapear
   if (robotsParser.isDisallowed(url)) {
       log.warn("URL disallowed by robots.txt: {}", url);
       return;
   }
   ```

2. **Rate Limiting Estricto**
   - Max 1 request cada 2 segundos
   - Horarios nocturnos para scraping masivo (3-6 AM)
   - Backoff exponencial en errores

3. **User-Agent Identificable**
   ```
   User-Agent: FinArg Property Analyzer Bot/1.0 (+https://finarg.com.ar/about; contact@finarg.com.ar)
   ```

4. **Caché Agresivo**
   - Mínimo 24 horas de caché
   - No re-scrapear la misma propiedad en <7 días

5. **Opt-out Mechanism**
   - Página `/real-estate/opt-out` para propietarios de portales
   - Email de contacto visible

### GDPR & Datos Personales

- **NO almacenar**: nombres de propietarios, teléfonos, emails
- **Sí almacenar**: datos públicos (precio, ubicación, características)
- **Anonimización**: direcciones exactas → barrio + calle sin número

### Términos de Uso

Agregar a `TERMS.md`:
```markdown
## Datos Inmobiliarios

Los datos de propiedades son recopilados de fuentes públicas con fines informativos.
FinArg no garantiza la exactitud o actualidad de los datos. Para información oficial,
consulte directamente con los portales inmobiliarios o propietarios.

Los análisis de IA son estimaciones automatizadas y no reemplazan una tasación profesional.
```

---

## 📊 Métricas de Éxito

### Técnicas
- ✅ 95% uptime del servicio de scraping
- ✅ <2s tiempo de respuesta para búsquedas
- ✅ >85% tasa de éxito de scraping
- ✅ >80% precisión de análisis IA
- ✅ 0 quejas legales de portales scrapeados

### Producto
- ✅ 5000+ propiedades en BD
- ✅ 100+ análisis IA realizados
- ✅ 50+ cálculos ROI completados
- ✅ 500+ usuarios activos en módulo
- ✅ >30% engagement rate

### Negocio
- ✅ +20% tráfico orgánico al sitio
- ✅ +15% tiempo de sesión promedio
- ✅ Top 3 en Google para "comparador propiedades argentina"
- ✅ 10+ menciones en redes sociales

---

## 🚧 Riesgos & Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Bloqueo de scraping por portales | Alta | Alto | Rate limiting estricto, rotar IPs, usar APIs oficiales |
| Costos de OpenAI excesivos | Media | Medio | Limitar análisis a 50/día, explorar modelos locales |
| Datos desactualizados | Media | Medio | Scraping diario, caché con TTL, timestamps visibles |
| Performance con BD grande | Baja | Alto | Índices optimizados, partitioning, materialized views |
| Problemas legales | Baja | Alto | Solo datos públicos, opt-out mechanism, TOS claros |
| Precisión IA baja | Media | Medio | Iterar prompts, validar con expertos, disclaimers |

---

## 💰 Costos Estimados

### Infraestructura
- **Base de datos**: $0 (PostgreSQL self-hosted)
- **Redis**: $0 (self-hosted)
- **Storage (imágenes)**: ~$5/mes (S3 o similar)

### APIs
- **OpenAI Vision API**: ~$50-150/mes (según volumen)
  - $0.01 por imagen analizada
  - Estimado: 100-300 análisis/mes
- **Google Maps API**: $0-50/mes (plan gratuito hasta 28k requests)
- **Properati API**: $0 (plan developer gratuito)

### Desarrollo
- **Tiempo estimado**: 12-14 semanas
- **1 desarrollador full-time**: ~3 meses

**Total estimado Fase 1-4**: $200-400 en APIs durante desarrollo

---

## 📚 Recursos & Referencias

### Documentación Técnica
- [Jsoup Documentation](https://jsoup.org/)
- [OpenAI Vision API](https://platform.openai.com/docs/guides/vision)
- [Leaflet Maps](https://leafletjs.com/)
- [TanStack Query](https://tanstack.com/query/latest)

### Scrapers de Referencia
- [Scrapy Best Practices](https://docs.scrapy.org/en/latest/topics/practices.html)
- [Ethical Web Scraping](https://scrapingrobot.com/blog/ethical-web-scraping/)

### Calculadoras Financieras
- [Mortgage Calculator Formula](https://www.bankrate.com/mortgages/mortgage-calculator/)
- [ROI Real Estate](https://www.investopedia.com/articles/mortgages-real-estate/08/real-estate-roi.asp)

### Datasets
- [Properati Data](https://properati.com.ar/data)
- [Argenprop Proptech](https://www.argenprop.com/)

---

## 📞 Contactos & Soporte

### Equipo
- **Lead Developer**: [Nombre]
- **Backend**: [Nombre]
- **Frontend**: [Nombre]
- **Data Engineer**: [Nombre]

### Canales
- **Slack**: `#real-estate-module`
- **Jira**: Board RE (FINARG-RE-XXX)
- **Docs**: Confluence `/real-estate`

---

## ✅ Checklist Pre-Launch

### Técnico
- [ ] Todos los tests pasan (unit + integration + E2E)
- [ ] Performance bajo 2s para queries complejas
- [ ] Rate limiting configurado y testeado
- [ ] Logs y monitoreo configurados (Sentry, Datadog)
- [ ] Backups de BD automáticos
- [ ] HTTPS en todos los endpoints
- [ ] CORS configurado correctamente

### Legal
- [ ] Términos de uso actualizados
- [ ] Política de privacidad con sección de scraping
- [ ] Disclaimers visibles en todas las páginas
- [ ] Página de opt-out creada
- [ ] Contacto legal visible

### Producto
- [ ] Documentación de usuario completa
- [ ] FAQ con 20+ preguntas comunes
- [ ] Tooltips en todos los campos complejos
- [ ] Onboarding tutorial para nuevos usuarios
- [ ] Analytics configurado (GA4)

### Marketing
- [ ] Landing page del módulo
- [ ] Blog post de lanzamiento
- [ ] Social media posts programados
- [ ] Email a usuarios existentes
- [ ] Press release (opcional)

---

## 🔄 Plan de Mantenimiento Post-Launch

### Diario
- Monitorear scraping scheduler (logs)
- Verificar tasa de éxito de scraping
- Revisar errores en Sentry

### Semanal
- Actualizar materialized views
- Revisar alertas de usuarios
- Analizar métricas de uso

### Mensual
- Auditar calidad de datos
- Optimizar queries lentas
- Actualizar precios históricos
- Review de costos de APIs

### Trimestral
- Agregar nuevas fuentes de datos
- Mejorar modelos de IA
- Expandir a nuevas ciudades
- A/B testing de features

---

**Última actualización**: 2026-02-11
**Versión**: 1.0
**Estado**: Draft - Pending Approval

---

## 🎯 Próximos Pasos Inmediatos

1. **Review de este plan** con equipo técnico y producto
2. **Aprobar presupuesto** de APIs (OpenAI, Maps)
3. **Crear tickets Jira** para todas las tasks
4. **Kick-off meeting** para Fase 1
5. **Setup de repositorio** y branches (`feature/real-estate`)

¿Listo para empezar? 🚀
