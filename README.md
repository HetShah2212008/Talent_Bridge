# TalentBridge - AI Recruitment Platform

A modern, AI-powered recruitment platform built with a hybrid architecture.

## Architecture
- **Web (`/web`)**: Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, Prisma, PostgreSQL.
- **AI Service (`/ai-service`)**: Python, FastAPI. Used for computationally heavy AI tasks (resume parsing, NLP, vector embeddings).

## Prerequisites
- Node.js (v18+)
- PostgreSQL (local or Docker)
- [Clerk](https://clerk.com) account for authentication

## Getting Started

### 1. Database
Start PostgreSQL (Docker example):
```bash
docker compose up -d db
```

Copy `web/.env.example` to `web/.env.local` and set:
- `DATABASE_URL` — must use `postgresql://` (e.g. `postgresql://user:password@localhost:5432/talentbridge`)
- Clerk keys from your dashboard

Run migrations:
```bash
cd web
npx prisma migrate deploy
npx prisma generate
```

### 2. Clerk signup fields
Require **first name** and **last name** in the Clerk Dashboard (username disabled). See [docs/CLERK_SIGNUP_FIELDS.md](docs/CLERK_SIGNUP_FIELDS.md).

### 3. Web app
```bash
cd web
npm install
npm run dev
```
Open `http://localhost:3000`

### 4. AI service (semantic search + matching)
```bash
cd ai-service
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Set `AI_SERVICE_URL=http://localhost:8000` in `web/.env.local`.

See [docs/AI_IMPLEMENTATION.md](docs/AI_IMPLEMENTATION.md) for the full AI plan.

## Demo flow
1. Sign up (candidate) with first/last name → `/auth/complete`
2. Start AI service on port 8000
3. **Recruiter**: post jobs → embeddings auto-generated → **AI Matches** per job
4. **Candidate**: upload resume on Profile → semantic search on Jobs → **AI Matched Jobs** on dashboard
5. **Admin**: set `role` to `ADMIN` in PostgreSQL, use `/admin/dashboard`
