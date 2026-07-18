from __future__ import annotations

import json
from dataclasses import dataclass, field
from datetime import date

from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, upsert_rows
from labrecha_scraper.models import CongressVote, CongressVoteDetail

CKAN_PACKAGE_URL = "https://datos.hcdn.gob.ar/api/3/action/package_show"
DATASET_ID = "votaciones_nominales"
JSON_FORMAT = "JSON"
HEADER_KEYWORD = "cabecera"
DETAIL_KEYWORD = "detalle"


@dataclass
class CongresoData:
    votes: list[dict] = field(default_factory=list)
    details: list[dict] = field(default_factory=list)


def _text(value: object) -> str | None:
    if value is None:
        return None
    stripped = str(value).strip()
    return stripped or None


def _integer(value: object) -> int | None:
    text = _text(value)
    if text is None:
        return None
    try:
        return int(text)
    except ValueError:
        return None


def _fecha(value: object) -> date | None:
    text = _text(value)
    if text is None:
        return None
    try:
        return date.fromisoformat(text[:10])
    except ValueError:
        return None


class CongresoConnector(Connector):
    name = "congreso"
    source = "hcdn"

    def fetch(self) -> CongresoData:
        with self.build_client() as client:
            header_urls, detail_urls = self._resolve_resources(client)
            data = CongresoData()
            for url in header_urls:
                data.votes.extend(self._map_votes(self._download_json(client, url)))
            for url in detail_urls:
                data.details.extend(self._map_details(self._download_json(client, url)))
            return data

    def persist(self, session: Session, data: object) -> int:
        assert isinstance(data, CongresoData)
        votes = upsert_rows(session, CongressVote, data.votes, ["acta_id"])
        details = upsert_rows(session, CongressVoteDetail, data.details, ["vote_detail_id"])
        return votes + details

    def _resolve_resources(self, client) -> tuple[list[str], list[str]]:
        response = client.get(CKAN_PACKAGE_URL, params={"id": DATASET_ID})
        response.raise_for_status()
        resources = response.json()["result"]["resources"]
        header_urls: list[str] = []
        detail_urls: list[str] = []
        for resource in resources:
            if (resource.get("format") or "").upper() != JSON_FORMAT:
                continue
            name = (resource.get("name") or "").lower()
            url = resource.get("url")
            if url is None:
                continue
            if DETAIL_KEYWORD in name:
                detail_urls.append(url)
            elif HEADER_KEYWORD in name:
                header_urls.append(url)
        if not header_urls or not detail_urls:
            raise ValueError("no se encontraron recursos JSON de cabecera y detalle en CKAN")
        return header_urls, detail_urls

    def _download_json(self, client, url: str) -> dict:
        response = client.get(url)
        response.raise_for_status()
        return json.loads(response.content.decode("utf-8-sig"))

    def _map_votes(self, payload: dict) -> list[dict]:
        rows: list[dict] = []
        for record in payload.values():
            acta_id = _text(record.get("acta_id"))
            if acta_id is None:
                continue
            rows.append(
                {
                    "acta_id": acta_id,
                    "session_source_id": _text(record.get("sesion_id")),
                    "period_number": _integer(record.get("nroperiodo")),
                    "period_type": _text(record.get("tipo_periodo")),
                    "session_type": _text(record.get("tipo_sesion")),
                    "meeting_number": _text(record.get("reunion")),
                    "session_number": _text(record.get("sesion")),
                    "ballot_number": _text(record.get("numero")),
                    "date": _fecha(record.get("fecha")),
                    "time": _text(record.get("hora")),
                    "majority_base": _text(record.get("base_mayoria")),
                    "majority_type": _text(record.get("tipo_mayoria")),
                    "title": _text(record.get("titulo")),
                    "result": _text(record.get("resultado")),
                    "president_name": _text(record.get("presidente_nombre")),
                    "affirmative_votes": _integer(record.get("votos_afirmativos")),
                    "negative_votes": _integer(record.get("votos_negativos")),
                    "abstentions": _integer(record.get("abstenciones")),
                    "absents": _integer(record.get("ausentes")),
                }
            )
        return rows

    def _map_details(self, payload: dict) -> list[dict]:
        rows: list[dict] = []
        for record in payload.values():
            vote_detail_id = _text(record.get("acta_detalle_id"))
            acta_id = _text(record.get("acta_id"))
            if vote_detail_id is None or acta_id is None:
                continue
            rows.append(
                {
                    "vote_detail_id": vote_detail_id,
                    "acta_id": acta_id,
                    "deputy_name": _text(record.get("diputado_nombre")),
                    "bloc": _text(record.get("bloque")),
                    "district": _text(record.get("distrito_nombre")),
                    "vote": _text(record.get("voto")),
                }
            )
        return rows
