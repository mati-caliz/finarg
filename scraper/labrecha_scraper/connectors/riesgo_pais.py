from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

RIESGO_PAIS_URL = "https://api.argentinadatos.com/v1/finanzas/indices/riesgo-pais"


class RiesgoPaisConnector(Connector):
    name = "riesgo_pais"
    source = "argentinadatos"

    def fetch(self) -> list[IndicatorPoint]:
        with self.build_client() as client:
            response = client.get(RIESGO_PAIS_URL)
            response.raise_for_status()
            payload = response.json()

        points: list[IndicatorPoint] = []
        for item in payload:
            fecha = item.get("fecha")
            valor = item.get("valor")
            if fecha is None or valor is None:
                continue
            points.append(
                IndicatorPoint(
                    indicator_code="riesgo_pais",
                    source=self.source,
                    date=date.fromisoformat(fecha),
                    value=Decimal(str(valor)),
                )
            )
        return points
