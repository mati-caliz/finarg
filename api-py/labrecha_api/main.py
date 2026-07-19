from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from labrecha_api.config import settings
from labrecha_api.routers import events, indicators, status

app = FastAPI(
    title="La Brecha API",
    version="0.1.0",
    description="API de lectura sobre los indicadores político-económicos ingeridos por el scraper.",
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
