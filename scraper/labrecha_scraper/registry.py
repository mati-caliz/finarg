from __future__ import annotations

from labrecha_scraper.base import Connector
from labrecha_scraper.connectors.congreso import CongresoConnector
from labrecha_scraper.connectors.dolar import DolarConnector
from labrecha_scraper.connectors.inflacion import InflacionConnector
from labrecha_scraper.connectors.reservas_bcra import ReservasBcraConnector
from labrecha_scraper.connectors.riesgo_pais import RiesgoPaisConnector
from labrecha_scraper.connectors.series_datosgob import SeriesDatosGobConnector

CONNECTORS: dict[str, Connector] = {
    connector.name: connector
    for connector in (
        CongresoConnector(),
        DolarConnector(),
        InflacionConnector(),
        ReservasBcraConnector(),
        RiesgoPaisConnector(),
        SeriesDatosGobConnector(),
    )
}


def get_connector(name: str) -> Connector:
    if name not in CONNECTORS:
        available = ", ".join(sorted(CONNECTORS))
        raise KeyError(f"job desconocido: {name}. Disponibles: {available}")
    return CONNECTORS[name]
