from fastapi import APIRouter, File, Form, HTTPException, UploadFile
from pydantic import BaseModel, Field

from app.services.embeddings import embed_text
from app.services.hybrid_search import hybrid_rank_jobs
from app.services.matcher import job_document, rank_items
from app.services.parser import extract_resume_text
from app.services.query_normalize import normalize_query

router = APIRouter()


class EmbedTextRequest(BaseModel):
    text: str = Field(..., min_length=1)


class EmbedTextResponse(BaseModel):
    embedding: list[float]
    dimensions: int
    extracted_text: str | None = None


class JobItem(BaseModel):
    id: str
    title: str
    description: str
    skills: str | None = None
    location: str | None = None
    embedding: list[float] | None = None


class CandidateItem(BaseModel):
    id: str
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    embedding: list[float] | None = None
    resume_text: str | None = None


class SearchJobsRequest(BaseModel):
    query: str = Field(..., min_length=1)
    jobs: list[JobItem]
    top_k: int | None = Field(default=None, ge=1, le=100)


class MatchJobsRequest(BaseModel):
    resume_embedding: list[float] | None = None
    resume_text: str | None = None
    jobs: list[JobItem]
    top_k: int | None = Field(default=10, ge=1, le=100)


class MatchCandidatesRequest(BaseModel):
    job_embedding: list[float] | None = None
    job_text: str | None = None
    candidates: list[CandidateItem]
    top_k: int | None = Field(default=10, ge=1, le=100)


class RankedJobResult(BaseModel):
    id: str
    title: str
    description: str
    location: str | None = None
    score: float
    matchPercent: float


class RankedCandidateResult(BaseModel):
    id: str
    firstName: str | None = None
    lastName: str | None = None
    email: str | None = None
    score: float
    matchPercent: float


def _prepare_jobs(jobs: list[JobItem]) -> list[dict]:
    prepared = []
    for job in jobs:
        skills = job.skills or ""
        text = job_document(job.title, job.description, job.location)
        if skills:
            text = f"{text}\nSkills: {skills}"
        prepared.append(
            {
                "id": job.id,
                "title": job.title,
                "description": job.description,
                "skills": skills,
                "location": job.location,
                "embedding": job.embedding,
                "text": text,
            }
        )
    return prepared


@router.post("/embed/job", response_model=EmbedTextResponse)
def embed_job(body: EmbedTextRequest):
    try:
        embedding = embed_text(body.text)
        return EmbedTextResponse(embedding=embedding, dimensions=len(embedding))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/embed/resume", response_model=EmbedTextResponse)
async def embed_resume(
    text: str | None = Form(None),
    file: UploadFile | None = File(None),
):
    try:
        file_bytes = await file.read() if file else None
        extracted = extract_resume_text(file_bytes, text)
        embedding = embed_text(extracted)
        return EmbedTextResponse(
            embedding=embedding,
            dimensions=len(embedding),
            extracted_text=extracted[:5000],
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/embed/resume/json", response_model=EmbedTextResponse)
def embed_resume_json(body: EmbedTextRequest):
    try:
        embedding = embed_text(body.text)
        return EmbedTextResponse(embedding=embedding, dimensions=len(embedding))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/search/jobs")
def search_jobs(body: SearchJobsRequest):
    if not body.jobs:
        return {"results": []}
    try:
        ranked = hybrid_rank_jobs(
            body.query,
            _prepare_jobs(body.jobs),
            top_k=body.top_k,
        )
        normalized_query = normalize_query(body.query)
        results = [
            RankedJobResult(
                id=r["id"],
                title=r["title"],
                description=r["description"],
                location=r.get("location"),
                score=r["score"],
                matchPercent=r["matchPercent"],
            )
            for r in ranked
        ]
        return {
            "results": results,
            "normalizedQuery": normalized_query or body.query.strip(),
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/match/jobs")
def match_jobs(body: MatchJobsRequest):
    if not body.jobs:
        return {"matches": []}
    try:
        if body.resume_embedding:
            query_embedding = body.resume_embedding
        elif body.resume_text:
            query_embedding = embed_text(body.resume_text)
        else:
            raise ValueError("Provide resume_embedding or resume_text")

        ranked = rank_items(
            query_embedding,
            _prepare_jobs(body.jobs),
            text_key="text",
            top_k=body.top_k,
        )
        results = [
            RankedJobResult(
                id=r["id"],
                title=r["title"],
                description=r["description"],
                location=r.get("location"),
                score=r["score"],
                matchPercent=r["matchPercent"],
            )
            for r in ranked
        ]
        return {"matches": results}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e


@router.post("/match/candidates")
def match_candidates(body: MatchCandidatesRequest):
    if not body.candidates:
        return {"matches": []}
    try:
        if body.job_embedding:
            query_embedding = body.job_embedding
        elif body.job_text:
            query_embedding = embed_text(body.job_text)
        else:
            raise ValueError("Provide job_embedding or job_text")

        items = [
            {
                "id": c.id,
                "firstName": c.firstName,
                "lastName": c.lastName,
                "email": c.email,
                "embedding": c.embedding,
                "resume_text": c.resume_text,
            }
            for c in body.candidates
        ]
        ranked = rank_items(
            query_embedding,
            items,
            text_key="resume_text",
            top_k=body.top_k,
        )
        results = [
            RankedCandidateResult(
                id=r["id"],
                firstName=r.get("firstName"),
                lastName=r.get("lastName"),
                email=r.get("email"),
                score=r["score"],
                matchPercent=r["matchPercent"],
            )
            for r in ranked
        ]
        return {"matches": results}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e)) from e
