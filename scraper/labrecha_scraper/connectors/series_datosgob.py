from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_scraper.base import Connector, IndicatorPoint

SERIES_URL = "https://apis.datos.gob.ar/series/api/series/"


class SeriesSpec:
    def __init__(self, code: str, unit: str, factor: Decimal = Decimal(1)) -> None:
        self.code = code
        self.unit = unit
        self.factor = factor


SERIES: dict[str, SeriesSpec] = {
    "444.1_CANASTA_BARIA_0_0_26_47": SeriesSpec("cba_nacional", "ARS"),
    "148.3_INIVELNAL_DICI_M_26": SeriesSpec("ipc_nivel_general", "indice"),
    "174.1_RRVAS_IDOS_0_0_36": SeriesSpec("reservas_internacionales", "USD_millones"),
    "158.1_REPTE_0_0_5": SeriesSpec("ripte", "ARS"),
    "149.1_TL_INDIIOS_OCTU_0_21": SeriesSpec("indice_salarios", "indice"),
    "64.2_POBLACION_NUA_0_0_34_74": SeriesSpec("pobreza_personas", "%", Decimal(100)),
    "331.1_SALDO_BASERIA__15": SeriesSpec("base_monetaria", "ARS_millones"),
    "172.3_TL_RECAION_M_0_0_17": SeriesSpec("recaudacion_tributaria", "ARS_millones"),
    "143.2_NO_PR_2004_A_21": SeriesSpec("emae", "indice"),
    "42.3_EPH_PUNTUATAL_0_M_30": SeriesSpec("desempleo", "%", Decimal(100)),
    "431.1_EXPECTATIVANA_M_0_0_29_85": SeriesSpec("expectativas_inflacion_rem", "%"),
    "57.1_SMVMM_0_M_34": SeriesSpec("salario_minimo", "ARS"),
    "453.1_SERIE_ORIGNAL_0_0_14_46": SeriesSpec("produccion_industrial", "indice"),
    "452.3_RESULTADO_RIO_0_M_18_54": SeriesSpec("resultado_primario", "ARS_millones"),
    "378.9_RESULTADO_017_0_M_18_90": SeriesSpec("resultado_financiero", "ARS_millones"),
}


class SeriesDatosGobConnector(Connector):
    name = "series_datosgob"
    source = "datosgobar"

    def fetch(self) -> list[IndicatorPoint]:
        points: list[IndicatorPoint] = []
        with self.build_client() as client:
            for series_id, spec in SERIES.items():
                points.extend(self._fetch_series(client, series_id, spec))
        return points

    def _fetch_series(self, client, series_id: str, spec: SeriesSpec) -> list[IndicatorPoint]:
        response = client.get(
            SERIES_URL,
            params={"ids": series_id, "limit": 5000, "sort": "asc", "format": "json"},
        )
        response.raise_for_status()
        payload = response.json()
        result: list[IndicatorPoint] = []
        for row in payload.get("data", []):
            if len(row) < 2 or row[0] is None or row[1] is None:
                continue
            result.append(
                IndicatorPoint(
                    indicator_code=spec.code,
                    source=self.source,
                    date=date.fromisoformat(row[0]),
                    value=Decimal(str(row[1])) * spec.factor,
                    meta={"series_id": series_id, "unit": spec.unit},
                )
            )
        return result
