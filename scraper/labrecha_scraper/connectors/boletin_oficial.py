from __future__ import annotations

import html
import json
import re
from dataclasses import dataclass, field
from datetime import date

from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, upsert_rows
from labrecha_scraper.db import SessionLocal
from labrecha_scraper.llm import run_claude_json_array
from labrecha_scraper.models import BoletinSummary

BASE_URL = "https://www.boletinoficial.gob.ar"
SECTION = "primera"
MAX_AVISOS_PER_RUN = 12
BATCH_SIZE = 4
TEXT_TRUNCATE = 1500
BODY_MARKER = "Ver texto del aviso"

AVISO_LINK = re.compile(rf"/detalleAviso/{SECTION}/(\d+)/(\d{{8}})")
TITLE_TAG = re.compile(r"<title>(.*?)</title>", re.IGNORECASE | re.DOTALL)
TAG = re.compile(r"<[^>]+>")
SCRIPT_STYLE = re.compile(r"<(script|style)[^>]*>.*?</\1>", re.IGNORECASE | re.DOTALL)
WHITESPACE = re.compile(r"\s+")


@dataclass
class Aviso:
    norma_id: str
    date: date
    url: str
    title: str
    body: str


@dataclass
class BoletinData:
    summaries: list[dict] = field(default_factory=list)


def _clean(raw_html: str) -> str:
    text = SCRIPT_STYLE.sub("", raw_html)
    text = TAG.sub(" ", text)
    return html.unescape(WHITESPACE.sub(" ", text)).strip()


TITLE_PREFIX = "BOLETIN OFICIAL REPUBLICA ARGENTINA - "


def _title(raw_html: str) -> str:
    match = TITLE_TAG.search(raw_html)
    if not match:
        return "Aviso del Boletín Oficial"
    title = html.unescape(match.group(1).strip())
    if title.startswith(TITLE_PREFIX):
        title = title[len(TITLE_PREFIX) :]
    return title


def _body(clean_text: str) -> str:
    index = clean_text.find(BODY_MARKER)
    body = clean_text[index + len(BODY_MARKER) :] if index != -1 else clean_text
    return body.strip()[:TEXT_TRUNCATE]


def _build_prompt(batch: list[Aviso]) -> str:
    payload = [{"norma_id": aviso.norma_id, "titulo": aviso.title, "texto": aviso.body} for aviso in batch]
    return (
        "Sos un analista que resume normas del Boletín Oficial argentino para un observatorio "
        "económico. Para cada norma decidí si es RELEVANTE para el ciudadano común en materia "
        "económica/regulatoria (impuestos, alícuotas, regulaciones, política monetaria, tarifas, "
        "subsidios, empleo). Descartá lo puramente administrativo, designaciones y trámites internos. "
        "Devolvé SOLO un array JSON, sin texto adicional ni backticks, con un objeto por norma en el "
        "MISMO orden, con esta forma: {\"norma_id\": \"<id>\", \"relevante\": true|false, "
        "\"categoria\": \"impuesto|regulacion|monetario|laboral|subsidio|tarifa|otro\", "
        "\"resumen\": [\"viñeta 1\", \"viñeta 2\", \"viñeta 3\"]}. El resumen debe tener 3 viñetas "
        "claras y cortas en español. Normas:\n" + json.dumps(payload, ensure_ascii=False)
    )


class BoletinOficialConnector(Connector):
    name = "boletin_oficial"
    source = "boletin_oficial"

    def fetch(self) -> BoletinData:
        target_date = date.today()
        with self.build_client() as client:
            avisos = self._list_avisos(client, target_date)
            pending = self._filter_pending(avisos)[:MAX_AVISOS_PER_RUN]
            for aviso in pending:
                self._load_body(client, aviso)
        summaries = self._summarize(pending)
        return BoletinData(summaries=summaries)

    def persist(self, session: Session, data: object) -> int:
        assert isinstance(data, BoletinData)
        return upsert_rows(
            session, BoletinSummary, data.summaries, ["norma_id"], update_on_conflict=False
        )

    def _list_avisos(self, client, target_date: date) -> list[Aviso]:
        response = client.get(f"{BASE_URL}/seccion/{SECTION}")
        response.raise_for_status()
        seen: set[str] = set()
        avisos: list[Aviso] = []
        for norma_id, date_token in AVISO_LINK.findall(response.text):
            if norma_id in seen:
                continue
            seen.add(norma_id)
            avisos.append(
                Aviso(
                    norma_id=norma_id,
                    date=target_date,
                    url=f"{BASE_URL}/detalleAviso/{SECTION}/{norma_id}/{date_token}",
                    title="",
                    body="",
                )
            )
        return avisos

    def _filter_pending(self, avisos: list[Aviso]) -> list[Aviso]:
        ids = [aviso.norma_id for aviso in avisos]
        if not ids:
            return []
        with SessionLocal() as session:
            existing = set(
                session.scalars(
                    select(BoletinSummary.norma_id).where(BoletinSummary.norma_id.in_(ids))
                ).all()
            )
        return [aviso for aviso in avisos if aviso.norma_id not in existing]

    def _load_body(self, client, aviso: Aviso) -> None:
        response = client.get(aviso.url)
        response.raise_for_status()
        aviso.title = _title(response.text)
        aviso.body = _body(_clean(response.text))

    def _summarize(self, avisos: list[Aviso]) -> list[dict]:
        rows: list[dict] = []
        for start in range(0, len(avisos), BATCH_SIZE):
            batch = avisos[start : start + BATCH_SIZE]
            results = run_claude_json_array(_build_prompt(batch))
            by_id = {str(item.get("norma_id")): item for item in results if isinstance(item, dict)}
            for aviso in batch:
                item = by_id.get(aviso.norma_id)
                if item is None or not item.get("relevante"):
                    continue
                bullets = [str(bullet).strip() for bullet in item.get("resumen", []) if str(bullet).strip()]
                if not bullets:
                    continue
                rows.append(
                    {
                        "norma_id": aviso.norma_id,
                        "date": aviso.date,
                        "section": SECTION,
                        "title": aviso.title,
                        "summary": "\n".join(bullets),
                        "category": str(item.get("categoria") or "otro"),
                        "url": aviso.url,
                    }
                )
        return rows
