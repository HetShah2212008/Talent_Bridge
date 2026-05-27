# TalentBridge AI Service

Lightweight **semantic search** and **resume–job matching** for the college demo.

## Features

- Job & resume embeddings (`all-MiniLM-L6-v2`)
- Cosine similarity ranking (scikit-learn)
- PDF resume text extraction (PyPDF2)
- Natural-language job search
- Candidate ↔ job matching both directions

## Setup

```bash
python -m venv venv
.\venv\Scripts\activate          # Windows
# source venv/bin/activate       # Mac/Linux
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

First request downloads the embedding model (~80MB). Runs on a normal laptop CPU.

## API docs

Open `http://localhost:8000/docs` after starting the server.

## Structure

```txt
app/
├── main.py
├── api/routes.py
├── core/config.py
└── services/
    ├── embeddings.py
    ├── matcher.py
    └── parser.py
```
