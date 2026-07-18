from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

MENSUAL_URL = "https://api.argentinadatos.com/v1/finanzas/indices/inflacion"
INTERANUAL_URL = "https://api.argentinadatos.com/v1/finanzas/indices/inflacionInteranual"


class InflacionConnector(Connector):
    name = "inflacion"
    source = "argentinadatos"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            points.extend(self._fetch_series(client, MENSUAL_URL, "ipc_mensual"))
            points.extend(self._fetch_series(client, INTERANUAL_URL, "ipc_interanual"))
        return points

    def _fetch_series(self, client, url: str, indicator_code: str) -> list[IndicatorPoint]:
        response = client.get(url)
        response.raise_for_status()
        result: list[IndicatorPoint] = []
        for item in response.json():
            fecha = item.get("fecha")
            valor = item.get("valor")
            if fecha is None or valor is None:
                continue
            result.append(
                IndicatorPoint(
                    indicator_code=indicator_code,
                    source=self.source,
                    date=date.fromisoformat(fecha),
                    value=Decimal(str(valor)),
                )
            )
        return result
