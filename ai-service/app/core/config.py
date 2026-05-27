import os

MODEL_NAME = os.getenv(
    "EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"
)
MIN_SIMILARITY = float(os.getenv("MIN_SIMILARITY", "0.0"))

# Hybrid job search thresholds (keyword/title matches can pass with lower semantic)
MIN_HYBRID_SCORE = float(os.getenv("MIN_HYBRID_SCORE", "0.22"))
MIN_DISPLAY_PERCENT = float(os.getenv("MIN_DISPLAY_PERCENT", "40"))
MIN_TITLE_SIGNAL = float(os.getenv("MIN_TITLE_SIGNAL", "0.28"))
