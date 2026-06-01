import math
from typing import Any

from app.core.config import MIN_SIMILARITY
from app.services.embeddings import embed_text


def cosine_sim(a: list[float], b: list[float]) -> float:
    dot = sum(x * y for x, y in zip(a, b))
    mag_a = math.sqrt(sum(x * x for x in a))
    mag_b = math.sqrt(sum(x * x for x in b))
    if mag_a == 0.0 or mag_b == 0.0:
        return 0.0
    score = dot / (mag_a * mag_b)
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
