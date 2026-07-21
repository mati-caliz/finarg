from __future__ import annotations

from labrecha_scraper.base import Connector
from labrecha_scraper.connectors.bcra_tasas import BcraTasasConnector
from labrecha_scraper.connectors.big_mac import BigMacConnector
from labrecha_scraper.connectors.boletin_oficial import BoletinOficialConnector
from labrecha_scraper.connectors.congreso import CongresoConnector
from labrecha_scraper.connectors.credito_bcra import CreditoBcraConnector
from labrecha_scraper.connectors.crypto import CryptoConnector
from labrecha_scraper.connectors.dolar import DolarConnector
from labrecha_scraper.connectors.holidays import HolidaysConnector
from labrecha_scraper.connectors.icg import IcgConnector
from labrecha_scraper.connectors.inflacion import InflacionConnector
from labrecha_scraper.connectors.leyes import LeyesConnector
from labrecha_scraper.connectors.news import NewsConnector
from labrecha_scraper.connectors.reservas_bcra import ReservasBcraConnector
from labrecha_scraper.connectors.riesgo_pais import RiesgoPaisConnector
from labrecha_scraper.connectors.senado import SenadoConnector
from labrecha_scraper.connectors.series_datosgob import SeriesDatosGobConnector

CONNECTORS: dict[str, Connector] = {
    connector.name: connector
    for connector in (
        BcraTasasConnector(),
        BigMacConnector(),
        BoletinOficialConnector(),
        CongresoConnector(),
        CreditoBcraConnector(),
        CryptoConnector(),
        DolarConnector(),
        HolidaysConnector(),
        IcgConnector(),
        InflacionConnector(),
        LeyesConnector(),
        NewsConnector(),
        ReservasBcraConnector(),
        RiesgoPaisConnector(),
        SenadoConnector(),
        SeriesDatosGobConnector(),
    )
}


def get_connector(name: str) -> Connector:
    if name not in CONNECTORS:
        available = ", ".join(sorted(CONNECTORS))
        raise KeyError(f"job desconocido: {name}. Disponibles: {available}")
    return CONNECTORS[name]
