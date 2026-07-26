import logging
import traceback

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from sqlalchemy.exc import SQLAlchemyError

from labrecha_api.config import settings
from labrecha_api.db import SessionLocal
from labrecha_api.error_events import record_error
from labrecha_api.rate_limit import RateLimitMiddleware
from labrecha_api.routers import (
    calculators,
    congress,
    errors,
    events,
    gaps,
    gazette,
    holidays,
    housing,
    indicators,
    news,
    posts,
    revenue_sharing,
    senate,
    status,
    taxes,
    terms,
)

API_DESCRIPTION = """
Datos político-económicos de Argentina, de lectura y sin autenticación.

Cada valor viene con la **fuente** que lo midió y la **fecha** a la que corresponde: es la regla
del observatorio y también la de esta API. Podés usarla libremente citando a La Brecha y a la
fuente original de cada serie.

- `GET /indicators` — catálogo de series, con su cobertura y sus fuentes.
- `GET /indicators/{code}` — la serie, filtrable por fuente y rango de fechas.
- `GET /indicators/{code}/csv` — la misma serie en CSV.
- `GET /gaps` — discrepancias entre fuentes que miden el mismo indicador.
- `GET /terms/{code}` — la serie cortada por mandato presidencial.

Hay un límite de consultas por minuto y por IP. Si necesitás más volumen, escribinos antes de
scrapear: es más fácil para todos.
""".strip()

GZIP_MINIMUM_SIZE = 512

TAGS_METADATA = [
    {"name": "indicators", "description": "Series históricas y su catálogo."},
    {"name": "gaps", "description": "Discrepancias entre fuentes que miden lo mismo."},
    {"name": "terms", "description": "Series cortadas por mandato presidencial."},
    {"name": "political-events", "description": "Hitos políticos para anotar las series."},
    {"name": "congress", "description": "Votaciones nominales de Diputados y leyes sancionadas."},
    {"name": "status", "description": "Salud del pipeline de ingesta."},
    {"name": "errors", "description": "Errores de producción, agrupados."},
]

app = FastAPI(
    title="La Brecha API",
    version="1.0.0",
    description=API_DESCRIPTION,
    openapi_tags=TAGS_METADATA,
    license_info={"name": "Uso libre citando la fuente"},
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(RateLimitMiddleware, limit=settings.rate_limit_per_minute)
app.add_middleware(GZipMiddleware, minimum_size=GZIP_MINIMUM_SIZE)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(status.router)
app.include_router(indicators.router)
app.include_router(events.router)
app.include_router(gaps.router)
app.include_router(terms.router)
app.include_router(congress.router)
app.include_router(senate.router)
app.include_router(holidays.router)
app.include_router(news.router)
app.include_router(posts.router)
app.include_router(gazette.router)
app.include_router(revenue_sharing.router)
app.include_router(taxes.router)
app.include_router(housing.router)
app.include_router(calculators.router)
app.include_router(errors.router)


logger = logging.getLogger("labrecha_api")

API_ORIGIN = "api"
STACK_MAX_LENGTH = 8000
UNHANDLED_DETAIL = "error interno"


def _store_error(path: str, error: Exception, stack: str) -> None:
    try:
        with SessionLocal() as session:
            record_error(
                session,
                origin=API_ORIGIN,
                kind=type(error).__name__,
                message=str(error) or type(error).__name__,
                stack=stack[:STACK_MAX_LENGTH],
                path=path,
            )
    except SQLAlchemyError:
        logger.exception("no se pudo registrar el error de %s", path)


@app.exception_handler(Exception)
async def record_unhandled_error(request: Request, error: Exception) -> JSONResponse:
    stack = "".join(traceback.format_exception(error))
    logger.error("error no manejado en %s: %s", request.url.path, stack)
    _store_error(request.url.path, error, stack)
    return JSONResponse(status_code=500, content={"detail": UNHANDLED_DETAIL})
