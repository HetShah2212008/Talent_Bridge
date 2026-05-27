from typing import Any

import numpy as np
from sklearn.metrics.pairwise import cosine_similarity

from app.core.config import MIN_SIMILARITY
from app.services.embeddings import embed_text


def cosine_sim(a: list[float], b: list[float]) -> float:
    score = float(cosine_similarity([a], [b])[0][0])
    return round(max(0.0, min(1.0, score)), 4)


def job_document(title: str, description: str, location: str | None = None) -> str:
    parts = [title, description]
    if location:
        parts.append(f"Location: {location}")
    return "\n".join(parts)


def rank_items(
    query_embedding: list[float],
    items: list[dict[str, Any]],
    *,
    embedding_key: str = "embedding",
    text_key: str | None = None,
    top_k: int | None = None,
) -> list[dict[str, Any]]:
    scored: list[dict[str, Any]] = []

    for item in items:
        emb = item.get(embedding_key)
        if emb is None and text_key and item.get(text_key):
            emb = embed_text(str(item[text_key]))
        if emb is None:
            continue

        score = cosine_sim(query_embedding, emb)
        if score < MIN_SIMILARITY:
            continue

        scored.append({**item, "score": score, "matchPercent": round(score * 100, 1)})

    scored.sort(key=lambda x: x["score"], reverse=True)
    if top_k is not None:
        return scored[:top_k]
    return scored
