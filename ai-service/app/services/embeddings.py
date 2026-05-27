from functools import lru_cache

from sentence_transformers import SentenceTransformer

from app.core.config import MODEL_NAME


@lru_cache(maxsize=1)
def get_model() -> SentenceTransformer:
    return SentenceTransformer(MODEL_NAME)


def embed_text(text: str) -> list[float]:
    cleaned = " ".join(text.split()).strip()
    if not cleaned:
        raise ValueError("Text cannot be empty")
    model = get_model()
    vector = model.encode(cleaned, normalize_embeddings=True)
    return vector.tolist()


def embed_batch(texts: list[str]) -> list[list[float]]:
    cleaned = [" ".join(t.split()).strip() for t in texts]
    if not any(cleaned):
        raise ValueError("Texts cannot be empty")
    model = get_model()
    vectors = model.encode(cleaned, normalize_embeddings=True)
    return [v.tolist() for v in vectors]
