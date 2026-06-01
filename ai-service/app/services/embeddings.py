import os

import httpx

GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY", "")
EMBED_URL = "https://generativelanguage.googleapis.com/v1beta/models/text-embedding-004:embedContent"


def embed_text(text: str) -> list[float]:
    cleaned = " ".join(text.split()).strip()
    if not cleaned:
        raise ValueError("Text cannot be empty")
    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY environment variable is not set")
    response = httpx.post(
        f"{EMBED_URL}?key={GEMINI_API_KEY}",
        json={
            "model": "models/text-embedding-004",
            "content": {"parts": [{"text": cleaned}]},
        },
        timeout=30.0,
    )
    response.raise_for_status()
    return response.json()["embedding"]["values"]


def embed_batch(texts: list[str]) -> list[list[float]]:
    cleaned = [" ".join(t.split()).strip() for t in texts]
    if not any(cleaned):
        raise ValueError("Texts cannot be empty")
    return [embed_text(t) for t in cleaned if t]
