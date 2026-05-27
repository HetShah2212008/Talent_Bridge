"""Expand hiring abbreviations before embedding and keyword matching."""

from __future__ import annotations

import re

# Whole-query and per-token abbreviations (lowercase keys)
ABBREVIATIONS: dict[str, str] = {
    "sd": "software developer",
    "sde": "software development engineer",
    "fe": "frontend",
    "be": "backend",
    "fs": "full stack",
    "fullstack": "full stack",
    "ml": "machine learning",
    "ai": "artificial intelligence",
    "devops": "devops",
    "qa": "quality assurance",
    "pm": "product manager",
    "ui": "user interface",
    "ux": "user experience",
    "hr": "human resources",
    "ds": "data science",
    "de": "data engineer",
    "intern": "internship",
    "dev": "developer",
    "law": "lawyer",
}

_TOKEN_RE = re.compile(r"[a-z0-9+#.]+", re.IGNORECASE)


def _expand_token(token: str) -> str:
    key = token.lower().strip()
    return ABBREVIATIONS.get(key, token)


def normalize_query(query: str) -> str:
    """
    Normalize a search query for embeddings and keyword scoring.
    Expands known abbreviations (e.g. sd → software developer).
    """
    raw = (query or "").strip()
    if not raw:
        return ""

    lowered = raw.lower()
    if lowered in ABBREVIATIONS:
        return ABBREVIATIONS[lowered]

    tokens = _TOKEN_RE.findall(raw)
    if not tokens:
        return lowered

    expanded = [_expand_token(t) for t in tokens]
    return " ".join(expanded)


def query_variants(query: str) -> list[str]:
    """Original + normalized forms used for keyword matching."""
    raw = (query or "").strip().lower()
    norm = normalize_query(query).lower()
    variants: list[str] = []
    for value in (raw, norm):
        if value and value not in variants:
            variants.append(value)
    return variants
