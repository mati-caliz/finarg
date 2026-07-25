from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from labrecha_api.config import settings
from labrecha_api.routers import (
    calculators,
    congress,
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

app = FastAPI(
    title="La Brecha API",
    version="0.1.0",
    description=(
        "API de lectura sobre los indicadores político-económicos ingeridos por el scraper."
    ),
)

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
