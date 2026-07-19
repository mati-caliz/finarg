from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

BASE_URL = "https://api.bcra.gob.ar/estadisticas/v4.0/monetarias"
PAGE_LIMIT = 1000
BACKFILL_DESDE = "2004-01-01"


class VariableSpec:
    def __init__(self, id_variable: int, code: str, unit: str) -> None:
        self.id_variable = id_variable
        self.code = code
        self.unit = unit


VARIABLES: list[VariableSpec] = [
    VariableSpec(144, "tasa_prestamos_personales", "TNA_%"),
    VariableSpec(13, "tasa_adelantos_cuenta_corriente", "TNA_%"),
    VariableSpec(117, "prestamos_sector_privado", "ARS_millones"),
]


class CreditoBcraConnector(Connector):
    name = "credito_bcra"
    source = "bcra"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            for spec in VARIABLES:
                points.extend(self._fetch_variable(client, spec))
        return points

    def _fetch_variable(self, client, spec: VariableSpec) -> list[IndicatorPoint]:
        result: list[IndicatorPoint] = []
        offset = 0
        while True:
            response = client.get(
                f"{BASE_URL}/{spec.id_variable}",
                params={
                    "desde": BACKFILL_DESDE,
                    "hasta": date.today().isoformat(),
                    "limit": PAGE_LIMIT,
                    "offset": offset,
                },
            )
            response.raise_for_status()
            payload = response.json()
            results = payload.get("results", [])
            detalle = results[0].get("detalle", []) if results else []
            for item in detalle:
                fecha = item.get("fecha")
                valor = item.get("valor")
                if fecha is None or valor is None:
                    continue
                result.append(
                    IndicatorPoint(
                        indicator_code=spec.code,
                        source=self.source,
                        date=date.fromisoformat(fecha),
                        value=Decimal(str(valor)),
                        meta={"unit": spec.unit, "id_variable": spec.id_variable},
                    )
                )
            count = payload.get("metadata", {}).get("resultset", {}).get("count", 0)
            offset += PAGE_LIMIT
            if offset >= count or not detalle:
                break
        return result
