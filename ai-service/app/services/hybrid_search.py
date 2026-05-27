"""Hybrid job ranking: semantic cosine + keyword/title/skills matching."""

from __future__ import annotations

import re
from typing import Any

from app.core.config import MIN_DISPLAY_PERCENT, MIN_HYBRID_SCORE, MIN_TITLE_SIGNAL
from app.services.matcher import cosine_sim
from app.services.query_normalize import ABBREVIATIONS, normalize_query, query_variants

SEMANTIC_WEIGHT = 0.6
KEYWORD_WEIGHT = 0.4

_WORD_RE = re.compile(r"[a-z0-9+#.]+", re.IGNORECASE)
_TITLE_WORD_RE = re.compile(r"[a-z0-9+#.]+", re.IGNORECASE)


def _words(text: str, *, min_len: int = 2) -> list[str]:
    return [w.lower() for w in _WORD_RE.findall(text or "") if len(w) >= min_len]


def _title_words(text: str) -> list[str]:
    return [w.lower() for w in _TITLE_WORD_RE.findall(text or "") if len(w) >= 2]


def _token_in_text(token: str, text: str) -> bool:
    """Word-boundary match for longer tokens."""
    if not token or not text:
        return False
    token_l = token.lower()
    if len(token_l) <= 3:
        return _partial_match_score(token_l, text) >= 0.5
    return bool(
        re.search(
            rf"\b{re.escape(token_l)}\b",
            text,
            re.IGNORECASE,
        )
    )


def _partial_match_score(token: str, text: str) -> float:
    """
    Partial / prefix matching for short queries (e.g. law → Lawyer, dev → Developer).
    """
    if not token or not text:
        return 0.0

    token_l = token.lower().strip()
    text_l = text.lower()
    if len(token_l) < 2:
        return 0.0

    # Full substring in field
    if token_l not in text_l:
        return 0.0

    best = 0.65
    for word in _title_words(text_l):
        if word == token_l:
            best = max(best, 0.98)
        elif word.startswith(token_l):
            # Prefix match: "law" → "lawyer", "dev" → "developer"
            coverage = len(token_l) / max(len(word), 1)
            if coverage >= 0.5:
                best = max(best, 0.95)
            elif coverage >= 0.33:
                best = max(best, 0.88)
            else:
                best = max(best, 0.78)
        elif token_l.startswith(word) and len(word) >= 3:
            best = max(best, 0.72)

    if token_l in text_l and best < 0.7:
        best = 0.7

    return round(min(1.0, best), 4)


def title_similarity_score(
    query: str,
    title: str,
    skills: str | None,
) -> float:
    """Title + skills relevance with partial word matching."""
    variants = query_variants(query)
    if not variants:
        return 0.0

    title_l = (title or "").lower()
    skills_l = (skills or "").lower()
    best = 0.0
    raw = (query or "").strip().lower()
    is_abbrev = raw in ABBREVIATIONS

    for variant in variants:
        if not variant:
            continue

        # Partial / includes on full title (law → Lawyer)
        partial_title = _partial_match_score(variant, title_l)
        partial_skills = _partial_match_score(variant, skills_l)
        best = max(best, partial_title, partial_skills * 0.92)

        if len(variant) >= 3 and variant in title_l:
            best = max(best, 0.96)
        if len(variant) >= 3 and variant in skills_l:
            best = max(best, 0.88)

        variant_words = _words(variant, min_len=2 if not is_abbrev else 2)
        if not variant_words and len(variant) >= 2:
            variant_words = [variant]

        for w in variant_words:
            best = max(best, _partial_match_score(w, title_l))
            best = max(best, _partial_match_score(w, skills_l) * 0.9)

        if not variant_words:
            continue

        title_hits = sum(1 for w in variant_words if _token_in_text(w, title_l))
        skills_hits = sum(1 for w in variant_words if _token_in_text(w, skills_l))
        n = len(variant_words)

        if title_hits == n and n >= 2:
            best = max(best, 0.96)
        elif title_hits == n:
            best = max(best, 0.9)
        elif title_hits >= max(1, n - 1) and n >= 2:
            best = max(best, 0.84)
        elif title_hits > 0:
            best = max(best, 0.58 + 0.32 * (title_hits / n))

        if skills_hits == n:
            best = max(best, 0.86)
        elif skills_hits > 0:
            best = max(best, 0.48 + 0.38 * (skills_hits / n))

    return round(min(1.0, best), 4)


def keyword_score(
    query: str,
    title: str,
    skills: str | None,
    description: str | None,
) -> float:
    """Title/skills-first keyword score; description is secondary."""
    title_score = title_similarity_score(query, title, skills)
    desc_l = (description or "").lower()
    norm = normalize_query(query).lower()
    raw = (query or "").strip().lower()

    desc_bonus = 0.0
    for probe in (raw, norm):
        if not probe:
            continue
        desc_bonus = max(desc_bonus, _partial_match_score(probe, desc_l) * 0.35)
        if len(probe) >= 4 and probe in desc_l:
            desc_bonus = max(desc_bonus, 0.2)

    combined = title_score * 0.9 + desc_bonus * 0.1
    return round(min(1.0, combined), 4)


def hybrid_score(semantic: float, keyword: float, title_score: float) -> float:
    """semantic * 0.6 + keyword * 0.4 with boosts for strong keyword/title hits."""
    keyword_signal = max(keyword, title_score)
    base = semantic * SEMANTIC_WEIGHT + keyword_signal * KEYWORD_WEIGHT

    if keyword_signal >= 0.75:
        base = max(base, keyword_signal * 0.88 + semantic * 0.12)
    if keyword_signal >= 0.85 and semantic < 0.45:
        base = max(base, keyword_signal * 0.92 + semantic * 0.08)
    if title_score >= 0.8:
        base = max(base, title_score * 0.9 + semantic * 0.1)

    return round(min(1.0, base), 4)


def calibrate_match_percent(
    final_score: float,
    keyword_score: float,
    title_score: float,
) -> float:
    """Map hybrid score to UI percentage."""
    signal = max(final_score, title_score * 0.98, keyword_score * 0.92)

    if title_score >= 0.8 or keyword_score >= 0.75:
        display = 82 + min(13, (max(title_score, keyword_score) - 0.7) / 0.3 * 13)
    elif title_score >= 0.55 or keyword_score >= 0.55 or signal >= 0.5:
        display = 52 + (signal - 0.32) / 0.38 * 23
    elif signal >= 0.28:
        display = 40 + (signal - 0.28) / 0.22 * 12
    else:
        display = signal * 55

    return round(min(95.0, max(0.0, display)), 1)


def is_relevant_result(
    final_score: float,
    semantic: float,
    keyword: float,
    title_score: float,
    match_percent: float,
) -> bool:
    """Practical filtering: keep strong keyword/title matches even if semantic is weak."""
    if match_percent < MIN_DISPLAY_PERCENT:
        return False

    strong_keyword = keyword >= 0.55 or title_score >= 0.55
    moderate_keyword = keyword >= 0.4 or title_score >= 0.4

    if strong_keyword:
        return final_score >= 0.15 or match_percent >= MIN_DISPLAY_PERCENT

    if moderate_keyword:
        return final_score >= 0.12 or match_percent >= MIN_DISPLAY_PERCENT

    if final_score < MIN_HYBRID_SCORE:
        return False

    if title_score < MIN_TITLE_SIGNAL and keyword < 0.45:
        return False

    if semantic < 0.38 and title_score < 0.45 and keyword < 0.45:
        return False

    return True


def hybrid_rank_jobs(
    query: str,
    items: list[dict[str, Any]],
    *,
    top_k: int | None = None,
) -> list[dict[str, Any]]:
    """Rank jobs using normalized query + semantic + keyword hybrid scoring."""
    from app.services.embeddings import embed_text

    normalized = normalize_query(query)
    embed_query = normalized if normalized else query
    query_embedding = embed_text(embed_query)

    scored: list[dict[str, Any]] = []

    for item in items:
        title = str(item.get("title") or "")
        skills = str(item.get("skills") or "")
        description = str(item.get("description") or "")

        emb = item.get("embedding")
        if emb is None and item.get("text"):
            emb = embed_text(str(item["text"]))

        semantic = cosine_sim(query_embedding, emb) if emb else 0.0
        title_score = title_similarity_score(query, title, skills)
        keyword = keyword_score(query, title, skills, description)
        final = hybrid_score(semantic, keyword, title_score)
        match_percent = calibrate_match_percent(final, keyword, title_score)

        if not is_relevant_result(
            final, semantic, keyword, title_score, match_percent
        ):
            continue

        scored.append(
            {
                **item,
                "semanticScore": semantic,
                "keywordScore": keyword,
                "titleScore": title_score,
                "score": final,
                "matchPercent": match_percent,
            }
        )

    scored.sort(
        key=lambda x: (
            x["score"],
            x.get("titleScore", 0),
            x.get("keywordScore", 0),
            x.get("semanticScore", 0),
        ),
        reverse=True,
    )

    if top_k is not None:
        return scored[:top_k]
    return scored
