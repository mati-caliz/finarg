# Fix pendiente en producción: los indicator_code quedaron en español

> Documento de traspaso. El fix del **esquema** (tablas y columnas) ya se aplicó el 2026-07-25 y
> los endpoints que daban 500 volvieron a 200. Queda este segundo problema, del mismo origen.
> Borralo cuando esté resuelto.

## Qué pasa

El commit `a4de6ea` renombró los identificadores a inglés y dejó tres scripts para la base. Se
corrió el del esquema, pero **no** el de los `indicator_code`. Resultado: el scraper nuevo escribe
en inglés y el histórico quedó en español, así que **cada serie está partida en dos**.

Medido contra producción el 2026-07-25:

| Código viejo | Histórico | Código nuevo | Datos |
| --- | --- | --- | --- |
| `dolar_blue` | 5688 datos, 2011 → hoy | `dollar_blue` | 1 dato (hoy) |
| `cripto_btc` | 367 datos | `crypto_btc` | 1 dato (hoy) |
| `reservas_internacionales` | 8556 datos, 1940 → hoy | `international_reserves` | no existe |
| `base_monetaria` | 280 datos | `monetary_base` | no existe |
| `salario_minimo` | 740 datos, 1965 → hoy | `minimum_wage` | no existe |

La web busca los códigos en inglés, así que **la home no muestra ningún dato**: se sirve con los
6 esqueletos de carga. Lo mismo las páginas de indicador y las brechas curadas.

## Ojo: el script original ya no sirve

`scripts/migrate-indicator-codes-english.sql` hace `UPDATE ... SET indicator_code = 'dollar_blue'`
directo. Como el scraper ya escribió filas en inglés para el día de hoy, ese UPDATE colisiona con
`uq_indicator_source_date`. Lo probé replicando el estado de producción: **falla** con
`duplicate key value violates unique constraint`. Aborta la transacción, así que no rompe nada,
pero tampoco arregla nada.

Por eso está `scripts/merge-indicator-codes-english.sql`, que primero descarta la fila nueva
cuando ya existe la vieja para el mismo (fuente, fecha) —son la misma medición— y después renombra.
Probado sobre el estado replicado: mergea conservando el histórico completo.

## Instrucción para el agente de producción

```
En /home/deploy/labrecha, las series de indicator_history quedaron partidas: el histórico está
bajo los codigos viejos en español y el scraper nuevo escribe en inglés. Por eso la home del sitio
no muestra ningún dato.

1. Backup antes de tocar nada:

   docker compose -f docker-compose.prod.yml exec -T postgres \
     sh -c 'pg_dump -U "$POSTGRES_USER" "$POSTGRES_DB"' > ~/labrecha-backup-codes-$(date +%F).sql

   Confirmá que el archivo pesa > 0 antes de seguir.

2. Anotá el estado actual para poder comparar después:

   docker compose -f docker-compose.prod.yml exec -T postgres \
     sh -c 'psql -tAX -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
     -c "SELECT indicator_code, count(*) FROM indicator_history GROUP BY 1 ORDER BY 1;"

3. Aplicá el merge. Es transaccional y conserva el histórico:

   docker compose -f docker-compose.prod.yml exec -T postgres \
     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/merge-indicator-codes-english.sql

   NO uses scripts/migrate-indicator-codes-english.sql: ese falla por clave duplicada.

4. Renombrá también los job_name del tracking (no toca datos, sólo scrape_runs):

   docker compose -f docker-compose.prod.yml exec -T postgres \
     sh -c 'psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"' < scripts/migrate-job-names-english.sql

5. Verificá que no quede ningún código en español y que el histórico siga entero:

   docker compose -f docker-compose.prod.yml exec -T postgres \
     sh -c 'psql -tAX -U "$POSTGRES_USER" -d "$POSTGRES_DB"' \
     -c "SELECT indicator_code, count(*), min(date), max(date) FROM indicator_history
         WHERE indicator_code IN ('dollar_blue','international_reserves','monetary_base','minimum_wage')
         GROUP BY 1 ORDER BY 1;"

   dollar_blue tiene que quedar con ~5689 datos desde 2011, no con 1.

6. La home se sirve cacheada: forzá el rebuild del frontend para que tome los datos.

   docker compose -f docker-compose.prod.yml build frontend
   docker compose -f docker-compose.prod.yml up -d frontend

7. Confirmá que la home ya no muestra esqueletos:

   curl -s https://finlatamio.com/ | grep -c animate-pulse

   Tiene que dar 0 (o bajar mucho respecto de 6).

Reglas:
- Si el paso 3 falla, pegame el error completo. No edites el .sql ni lo corras por partes.
- No borres ni recrees tablas: ahí está todo el histórico.
- Si algún conteo del paso 5 baja respecto del paso 2, pará y avisame.
```

## Después

- Borrar `scripts/migrate-indicator-codes-english.sql`, que ya no es aplicable, y este documento.
- Revisar si el dominio `labrecha.ar` va a apuntar al server: hoy el sitio vive en
  `finlatamio.com` y `labrecha.ar` no resuelve, pero el sitemap, el JSON-LD y los feeds RSS
  publican URLs `https://labrecha.ar/...`.
