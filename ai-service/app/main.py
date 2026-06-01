import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routes import router

app = FastAPI(
    title="TalentBridge AI Service",
    description="Lightweight semantic search and resume-job matching",
    version="2.0.0",
)

allowed_origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

vercel_url = os.environ.get("VERCEL_URL", "")
if vercel_url:
    allowed_origins.append(f"https://{vercel_url}")

extra_origin = os.environ.get("ALLOWED_ORIGIN", "")
if extra_origin:
    allowed_origins.append(extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health", tags=["Health"])
def health_check():
    return {
        "status": "ok",
        "service": "TalentBridge AI Service",
        "features": ["semantic-search", "resume-matching", "candidate-matching"],
    }
