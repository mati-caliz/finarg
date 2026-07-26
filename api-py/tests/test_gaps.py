from __future__ import annotations

from datetime import date
from decimal import Decimal

from labrecha_api.routers.gaps import _build_gap

DAY = date(2026, 7, 1)
CODE = "international_reserves"


def test_a_single_measurement_is_not_a_gap() -> None:
    assert _build_gap(CODE, DAY, [("bcra", Decimal(100))]) is None


def test_no_measurements_is_not_a_gap() -> None:
    assert _build_gap(CODE, DAY, []) is None


def test_the_gap_is_the_spread_over_the_lower_measurement() -> None:
    gap = _build_gap(CODE, DAY, [("bcra", Decimal(120)), ("datosgobar", Decimal(100))])

    assert gap is not None
    assert gap.higher_source == "bcra"
    assert gap.higher_value == Decimal(120)
    assert gap.lower_source == "datosgobar"
    assert gap.lower_value == Decimal(100)
    assert gap.spread == Decimal(20)
    assert gap.gap_pct == 20.0


def test_the_gap_does_not_depend_on_the_order_of_the_measurements() -> None:
    ascending = _build_gap(CODE, DAY, [("datosgobar", Decimal(100)), ("bcra", Decimal(120))])
    descending = _build_gap(CODE, DAY, [("bcra", Decimal(120)), ("datosgobar", Decimal(100))])

    assert ascending is not None
    assert descending is not None
    assert ascending.model_dump() == descending.model_dump()


def test_measurements_are_reported_from_the_highest_to_the_lowest() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [("media", Decimal(110)), ("baja", Decimal(100)), ("alta", Decimal(120))],
    )

    assert gap is not None
    assert [measurement.source for measurement in gap.measurements] == ["alta", "media", "baja"]


def test_more_than_two_sources_compare_the_extremes() -> None:
    gap = _build_gap(
        CODE,
        DAY,
        [("media", Decimal(110)), ("baja", Decimal(100)), ("alta", Decimal(120))],
    )

    assert gap is not None
    assert gap.higher_source == "alta"
    assert gap.lower_source == "baja"
    assert gap.spread == Decimal(20)


def test_identical_measurements_have_no_gap() -> None:
    gap = _build_gap(CODE, DAY, [("bcra", Decimal(100)), ("datosgobar", Decimal(100))])

    assert gap is not None
    assert gap.spread == Decimal(0)
    assert gap.gap_pct == 0.0


def test_a_zero_baseline_does_not_blow_up() -> None:
    gap = _build_gap(CODE, DAY, [("bcra", Decimal(50)), ("datosgobar", Decimal(0))])

    assert gap is not None
    assert gap.spread == Decimal(50)
    assert gap.gap_pct == 0.0


def test_the_baseline_is_the_absolute_value_of_the_lower_measurement() -> None:
    gap = _build_gap(CODE, DAY, [("bcra", Decimal(50)), ("datosgobar", Decimal(-50))])

    assert gap is not None
    assert gap.spread == Decimal(100)
    assert gap.gap_pct == 200.0


def test_the_gap_keeps_the_indicator_and_the_date_it_was_measured() -> None:
    gap = _build_gap(CODE, DAY, [("bcra", Decimal(120)), ("datosgobar", Decimal(100))])

    assert gap is not None
    assert gap.indicator_code == CODE
    assert gap.date == DAY
