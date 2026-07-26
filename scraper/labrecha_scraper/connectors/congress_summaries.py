from __future__ import annotations

import csv
import html
import io
import json
import re
from dataclasses import dataclass, field

import httpx
from labrecha_db import CongressVote, CongressVoteSummary
from sqlalchemy import select
from sqlalchemy.orm import Session

from labrecha_scraper.base import Connector, upsert_rows
from labrecha_scraper.db import SessionLocal
from labrecha_scraper.llm import run_claude_json_array

CKAN_PACKAGE_URL = "https://datos.hcdn.gob.ar/api/3/action/package_show"
PROJECTS_DATASET = "proyectos-parlamentarios"
CSV_FORMAT = "CSV"
LARGE_DOWNLOAD_TIMEOUT_SECONDS = 300.0

MAX_VOTES_PER_RUN = 40
BATCH_SIZE = 5
MAX_FILES_PER_VOTE = 5
MAX_PROJECT_TITLE_LENGTH = 300
NOT_AVAILABLE = "NA"
FILE_SEPARATOR = ", "

TOPICS = {
    "economia",
    "impuestos",
    "laboral",
    "salud",
    "educacion",
    "seguridad",
    "justicia",
    "institucional",
    "derechos",
    "ambiente",
    "internacional",
    "otro",
}
DEFAULT_TOPIC = "otro"

FILE_REFERENCE = re.compile(r"(\d{1,5})\s*-\s*([A-Za-z.]{1,4})\s*-\s*(\d{2,4})")
CENTURY_PIVOT = 50
SHORT_YEAR_LIMIT = 100


@dataclass
class PendingVote:
    vote_record_id: str
    title: str
    file_numbers: list[str]
    project_titles: list[str] = field(default_factory=list)


def _file_key(number: str, chamber: str, year: str) -> str:
    parsed_year = int(year)
    if parsed_year < SHORT_YEAR_LIMIT:
        parsed_year += 2000 if parsed_year < CENTURY_PIVOT else 1900
    return f"{int(number)}-{chamber.replace('.', '').upper()}-{parsed_year}"


def _file_keys_in(title: str) -> list[str]:
    keys: list[str] = []
    for number, chamber, year in FILE_REFERENCE.findall(title):
        key = _file_key(number, chamber, year)
        if key not in keys:
            keys.append(key)
    return keys[:MAX_FILES_PER_VOTE]


def _clean_project_title(value: str) -> str:
    return html.unescape(value.strip())[:MAX_PROJECT_TITLE_LENGTH]


def _build_prompt(batch: list[PendingVote]) -> str:
    payload = [
        {
            "vote_record_id": pending.vote_record_id,
            "titulo_acta": pending.title,
            "proyectos": pending.project_titles,
        }
        for pending in batch
    ]
    topics = "|".join(sorted(TOPICS))
    return (
        "Sos un periodista de datos que explica al ciudadano común qué se votó en la Cámara de "
        "Diputados de Argentina. Para cada votación te paso el título del acta (suele ser "
        "burocrático, del estilo 'Expediente 0073-S-2019 - Votación en General') y los títulos "
        "oficiales de los expedientes involucrados. Escribí un resumen de UNA sola oración, en "
        "español neutro y lenguaje llano, que diga qué se estaba votando y a quién afecta. Sin "
        "jerga parlamentaria, sin repetir el número de expediente, sin opinar ni interpretar "
        "intenciones políticas, y sin inventar nada que no esté en los datos que te paso. Si los "
        "títulos oficiales no alcanzan para saber de qué se trata, devolvé el resumen vacío. "
        "Devolvé SOLO un array JSON, sin texto adicional ni backticks, con un objeto por votación "
        'en el MISMO orden, con esta forma: {"vote_record_id": "<id>", '
        f'"resumen": "<una oración>", "tema": "{topics}"}}. Votaciones:\n'
        + json.dumps(payload, ensure_ascii=False)
    )


class CongressSummariesConnector(Connector):
    name = "congress_summaries"
    source = "hcdn"

    def fetch(self) -> list[dict]:
        pending = self._pending_votes()
        if not pending:
            return []
        with self.build_client() as client:
            titles_by_file = self._download_project_titles(client)
        for vote in pending:
            vote.project_titles = [
                titles_by_file[key] for key in vote.file_numbers if key in titles_by_file
            ]
        return self._summarize(pending)

    def persist(self, session: Session, data: object) -> int:
        assert isinstance(data, list)
        return upsert_rows(
            session, CongressVoteSummary, data, ["vote_record_id"], update_on_conflict=False
        )

    def _pending_votes(self) -> list[PendingVote]:
        statement = (
            select(CongressVote.vote_record_id, CongressVote.title)
            .outerjoin(
                CongressVoteSummary,
                CongressVoteSummary.vote_record_id == CongressVote.vote_record_id,
            )
            .where(
                CongressVoteSummary.vote_record_id.is_(None),
                CongressVote.title.is_not(None),
            )
            .order_by(CongressVote.date.desc().nullslast(), CongressVote.vote_record_id.desc())
            .limit(MAX_VOTES_PER_RUN)
        )
        with SessionLocal() as session:
            rows = session.execute(statement).all()
        return [
            PendingVote(
                vote_record_id=vote_record_id,
                title=title,
                file_numbers=_file_keys_in(title),
            )
            for vote_record_id, title in rows
        ]

    def _download_project_titles(self, client: httpx.Client) -> dict[str, str]:
        response = client.get(CKAN_PACKAGE_URL, params={"id": PROJECTS_DATASET})
        response.raise_for_status()
        url = next(
            (
                resource["url"]
                for resource in response.json()["result"]["resources"]
                if (resource.get("format") or "").upper() == CSV_FORMAT and resource.get("url")
            ),
            None,
        )
        if url is None:
            raise ValueError(f"no se encontró recurso CSV en el dataset {PROJECTS_DATASET}")

        download = client.get(url, timeout=LARGE_DOWNLOAD_TIMEOUT_SECONDS)
        download.raise_for_status()
        reader = csv.DictReader(io.StringIO(download.content.decode("utf-8-sig")))
        titles_by_file: dict[str, str] = {}
        for record in reader:
            title = record.get("TITULO")
            if not title:
                continue
            for column in ("EXP_DIPUTADOS", "EXP_SENADO"):
                reference = (record.get(column) or "").strip()
                if not reference or reference == NOT_AVAILABLE:
                    continue
                match = FILE_REFERENCE.fullmatch(reference)
                if match is None:
                    continue
                titles_by_file.setdefault(_file_key(*match.groups()), _clean_project_title(title))
        return titles_by_file

    def _summarize(self, pending: list[PendingVote]) -> list[dict]:
        summarizable = [vote for vote in pending if vote.project_titles]
        rows: list[dict] = []
        for start in range(0, len(summarizable), BATCH_SIZE):
            batch = summarizable[start : start + BATCH_SIZE]
            results = run_claude_json_array(_build_prompt(batch))
            by_id = {
                str(item.get("vote_record_id")): item for item in results if isinstance(item, dict)
            }
            for vote in batch:
                item = by_id.get(vote.vote_record_id)
                if item is None:
                    continue
                summary = str(item.get("resumen") or "").strip()
                if not summary:
                    continue
                topic = str(item.get("tema") or "").strip().lower()
                rows.append(
                    {
                        "vote_record_id": vote.vote_record_id,
                        "summary": summary,
                        "topic": topic if topic in TOPICS else DEFAULT_TOPIC,
                        "file_numbers": FILE_SEPARATOR.join(vote.file_numbers) or None,
                    }
                )
        return rows
