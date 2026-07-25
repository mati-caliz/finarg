from __future__ import annotations

from dataclasses import dataclass
from datetime import date


@dataclass(frozen=True)
class GovernmentTerm:
    term_id: str
    president: str
    start: date
    end: date | None


TERMS: list[GovernmentTerm] = [
    GovernmentTerm("de_la_rua", "Fernando de la Rúa", date(1999, 12, 10), date(2001, 12, 20)),
    GovernmentTerm("duhalde", "Eduardo Duhalde", date(2002, 1, 2), date(2003, 5, 25)),
    GovernmentTerm("nestor_kirchner", "Néstor Kirchner", date(2003, 5, 25), date(2007, 12, 10)),
    GovernmentTerm(
        "cfk_1", "Cristina Fernández (1° mandato)", date(2007, 12, 10), date(2011, 12, 10)
    ),
    GovernmentTerm(
        "cfk_2", "Cristina Fernández (2° mandato)", date(2011, 12, 10), date(2015, 12, 10)
    ),
    GovernmentTerm("macri", "Mauricio Macri", date(2015, 12, 10), date(2019, 12, 10)),
    GovernmentTerm(
        "alberto_fernandez", "Alberto Fernández", date(2019, 12, 10), date(2023, 12, 10)
    ),
    GovernmentTerm("milei", "Javier Milei", date(2023, 12, 10), None),
]
