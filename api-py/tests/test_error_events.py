from __future__ import annotations

from labrecha_api.error_events import (
    NORMALIZED_MAX_LENGTH,
    fingerprint_for,
    first_stack_frame,
    normalize_for_grouping,
)

WEB_BROWSER = "web-browser"
API = "api"

STACK = """TypeError: cannot read properties of undefined
    at IndicatorDetail (/app/.next/server/chunks/482.js:1:2841)
    at renderWithHooks (/app/.next/server/chunks/react.js:1:9)
"""


def test_the_same_error_twice_shares_one_fingerprint() -> None:
    first = fingerprint_for(API, "ValueError", "no hay datos", STACK)
    second = fingerprint_for(API, "ValueError", "no hay datos", STACK)

    assert first == second


def test_numbers_do_not_split_a_group() -> None:
    with_id = fingerprint_for(API, "ValueError", "el indicador 4821 no existe", None)
    other_id = fingerprint_for(API, "ValueError", "el indicador 9137 no existe", None)

    assert with_id == other_id


def test_quoted_values_do_not_split_a_group() -> None:
    one = fingerprint_for(API, "HTTPException", "sin datos para 'dollar_blue'", None)
    another = fingerprint_for(API, "HTTPException", "sin datos para 'cpi_monthly'", None)

    assert one == another


def test_a_different_error_type_is_a_different_group() -> None:
    value_error = fingerprint_for(API, "ValueError", "mismo mensaje", None)
    key_error = fingerprint_for(API, "KeyError", "mismo mensaje", None)

    assert value_error != key_error


def test_the_origin_separates_groups() -> None:
    from_api = fingerprint_for(API, "TypeError", "mismo mensaje", None)
    from_browser = fingerprint_for(WEB_BROWSER, "TypeError", "mismo mensaje", None)

    assert from_api != from_browser


def test_two_errors_of_the_same_type_in_different_places_are_different_groups() -> None:
    here = fingerprint_for(API, "TypeError", "undefined", "at IndicatorDetail (a.js:1:1)")
    there = fingerprint_for(API, "TypeError", "undefined", "at GapComparison (b.js:2:2)")

    assert here != there


def test_a_missing_stack_still_groups() -> None:
    assert fingerprint_for(API, "TypeError", "sin stack", None) == fingerprint_for(
        API, "TypeError", "sin stack", None
    )


def test_the_first_frame_is_the_first_non_empty_line() -> None:
    assert first_stack_frame("\n\n  at foo (bar.js:1:1)\n  at baz") == "at foo (bar.js:<n>:<n>)"
    assert first_stack_frame(None) == ""
    assert first_stack_frame("   \n  ") == ""


def test_normalization_collapses_whitespace_and_caps_length() -> None:
    assert normalize_for_grouping("  hola   mundo \n ") == "hola mundo"
    assert len(normalize_for_grouping("x" * 500)) == NORMALIZED_MAX_LENGTH


def test_the_fingerprint_is_a_sha256_hex_digest() -> None:
    fingerprint = fingerprint_for(API, "ValueError", "algo", None)

    assert len(fingerprint) == 64
    assert set(fingerprint) <= set("0123456789abcdef")
