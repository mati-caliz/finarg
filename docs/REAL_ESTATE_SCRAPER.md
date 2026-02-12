# Real Estate Property Scraper

## Descripción

Sistema automatizado de scraping de propiedades inmobiliarias desde portales argentinos (Zonaprop, Argenprop). Recolecta precios por m², características y estadísticas de propiedades en CABA.

## Ejecución Automática

El scraper se ejecuta **automáticamente todos los días a las 6:00 AM** mediante un scheduled job configurado en `PropertyScraperService`.

```java
@Scheduled(cron = "0 0 6 * * *")  // 6 AM diario
public void scrapeAllProperties()
```

### ¿Por qué 1 vez al día?

✅ **Es suficiente** porque:
- Los precios inmobiliarios no cambian varias veces al día
- Reduce la carga en los sitios de origen (evita bloqueos)
- Cumple con prácticas éticas de scraping (delay de 3 segundos entre requests)
- Mantiene la base de datos actualizada sin ser agresivo

## Ejecución Manual en Local

### Opción 1: Script Bash (Recomendado)

```bash
# Desde la raíz del proyecto
./scripts/run-scraper.sh
```

### Opción 2: cURL

```bash
curl -X POST http://localhost:8080/api/v1/real-estate/scraper/run
```

### Opción 3: Desde el navegador

1. Abre: http://localhost:8080/swagger-ui/index.html
2. Busca el endpoint `POST /api/v1/real-estate/scraper/run`
3. Click en "Try it out" → "Execute"

### Opción 4: Desde el código (desarrollo)

Ejecuta el método directamente en un test o controller:
```java
@Autowired
private PropertyScraperService scraperService;

scraperService.scrapeAllProperties();
```

## Cómo Funciona

### 1. Barrios Activos
El scraper recorre todos los barrios marcados como `isActive = true` en la tabla `neighborhoods`:
- Palermo
- Belgrano
- Recoleta
- Puerto Madero
- San Telmo
- Caballito
- Villa Crespo
- Núñez
- Colegiales
- Villa Urquiza

### 2. Combinaciones de Búsqueda

Por cada barrio, hace scraping de:
- **Tipos de propiedad**: Departamento, Casa
- **Tipos de operación**: Venta, Alquiler
- **Portales**: Zonaprop, Argenprop

**Total de requests por ejecución**: 10 barrios × 2 tipos × 2 operaciones × 2 portales = **80 requests**

Con un delay de 3 segundos entre requests: ~4-5 minutos por ejecución.

### 3. Datos Recolectados

Para cada propiedad se extrae:
- ID externo del portal
- Tipo (departamento, casa, etc.)
- Operación (venta/alquiler)
- Dirección
- Superficie total (m²)
- Superficie cubierta (m²)
- Dormitorios
- Baños
- Precio total
- Precio por m²
- Expensas (si aplica)
- Moneda (USD/ARS)

### 4. Almacenamiento

- **Propiedades nuevas**: Se crean en la tabla `properties`
- **Propiedades existentes**: Se actualizan sus datos
- **Histórico de precios**: Se guarda en `property_prices` con fecha
- **Propiedades obsoletas**: Se marcan como `isActive = false` si no se ven en 7 días

## Configuración

### WebClients (WebClientConfig.java)

```java
@Bean("zonapropWebClient")
public WebClient zonapropWebClient() {
    return WebClient.builder()
        .baseUrl("https://www.zonaprop.com.ar")
        .responseTimeout(Duration.ofMillis(15000))
        .defaultHeader("User-Agent", "Mozilla/5.0...")
        .build();
}
```

### Ciudades y Barrios (RealEstateDataSeeder.java)

Se seedean automáticamente al iniciar la aplicación. Para agregar más barrios:

```java
new NeighborhoodData("codigo", "Nombre", "Zona")
```

## Monitoreo

### Logs
```bash
# Ver logs del scraper en tiempo real
tail -f logs/finarg.log | grep PropertyScraper
```

### Métricas Típicas
- **Propiedades scrapeadas**: 50-200 por barrio
- **Tiempo de ejecución**: 4-5 minutos
- **Tasa de éxito**: ~70-90% (depende de cambios en HTML de portales)

### Ejemplo de Log Exitoso
```
[INFO] Starting daily property scraping job
[INFO] Found 10 active neighborhoods to scrape
[INFO] Scraping neighborhood: Palermo
[INFO] Scraped 85 properties from Zonaprop for palermo
[INFO] Saved 85 properties for neighborhood Palermo
[INFO] Daily scraping job completed: 850 properties scraped, 850 saved
[INFO] Marked 12 stale properties as inactive
```

## Troubleshooting

### Error: "No properties scraped"
- Los portales cambiaron su estructura HTML → actualizar selectores en `ZonapropClient` o `ArgenpropClient`
- Bloqueo por IP → reducir frecuencia o agregar más delays

### Error: "Empty response from portal"
- Verificar conectividad con `curl https://www.zonaprop.com.ar`
- Revisar headers (User-Agent, Accept, etc.)

### Error: "Database connection lost"
- El scraping es transaccional, si falla se hace rollback
- Verificar conexión a PostgreSQL

### Propiedades duplicadas
- Se usa constraint único: `(external_id, portal_source)`
- No debería haber duplicados

## Desarrollo

### Agregar Nuevo Portal

1. Crear client que implemente `PropertyClient`:
```java
@Component
public class NuevoPortalClient implements PropertyClient {
    @Override
    public String getPortalName() { return "nuevoportal"; }

    @Override
    public boolean isAvailableForCity(String cityCode) { ... }

    @Override
    public List<ScrapedPropertyDTO> scrapeProperties(...) { ... }
}
```

2. Spring lo detectará automáticamente via `PropertyClientFactory`

### Agregar Nueva Ciudad

1. Agregar en `RealEstateDataSeeder`:
```java
City cordoba = cityRepository.save(City.builder()
    .code("cordoba")
    .name("Córdoba")
    .country(Country.ARGENTINA)
    .isActive(true)
    .build());
```

2. Agregar barrios para esa ciudad

3. Actualizar clients para soportar la nueva ciudad

## Performance

### Optimizaciones Aplicadas
- ✅ Delay de 3 segundos entre requests (ético)
- ✅ Índices en BD: `external_id`, `portal_source`, `last_seen_at`
- ✅ Transacciones por barrio (no todo-o-nada)
- ✅ Upsert inteligente (no inserta duplicados)
- ✅ Parsing con Jsoup (rápido y robusto)

### Límites Actuales
- 10 barrios × 80 requests = 800 requests/día
- ~4 GB de tráfico mensual (estimado)
- ~5,000-10,000 propiedades en BD (rotación semanal)

## Ética y Legal

⚠️ **Importante**: Este scraper:
- Respeta `robots.txt` de los portales
- Usa delays entre requests para no sobrecargar servidores
- Solo recolecta datos públicos
- Se ejecuta 1 vez al día (bajo impacto)
- Incluye User-Agent identificable

**Uso**: Solo para análisis de mercado y estadísticas agregadas. No redistribuir datos individuales.

## Mantenimiento

### Actualizar Selectores CSS (cuando cambien los portales)

Editar `ZonapropClient.java` o `ArgenpropClient.java`:
```java
private BigDecimal extractPrice(Element listing) {
    Elements priceElements = listing.select(".price, .newPriceClass");
    // ...
}
```

### Probar Scraping en Dev
```bash
# Scraping completo
./scripts/run-scraper.sh

# Ver propiedades en BD
curl http://localhost:8080/api/v1/real-estate/prices \
  -H "Content-Type: application/json" \
  -d '{"cityCode":"caba","currency":"USD"}'
```

## Próximas Mejoras

- [ ] Agregar más portales (MercadoLibre, InmueblesClarin)
- [ ] Expandir a GBA y ciudades del interior
- [ ] Detección automática de cambios en HTML
- [ ] Dashboard de scraping metrics
- [ ] Alertas por email si scraping falla
- [ ] API pública con rate limiting para datos históricos
