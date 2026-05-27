# TalentBridge - Web

Next.js 15 frontend and main API application.

## Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS
- shadcn/ui
- Prisma ORM
- PostgreSQL

## Folder Structure
- `src/app`: Next.js pages and API routes
- `src/components`: UI components
  - `ui`: shadcn generated components
  - `shared`: common components
  - `dashboard`: dashboard layout/components
  - `forms`: form components
- `src/features`: Feature-based architecture (auth, jobs, candidates, recruiter, ai)
- `src/hooks`: Custom React hooks
- `src/lib`: Utilities and Prisma client
- `src/styles`: Global CSS
- `src/types`: TypeScript type definitions

## Development
```bash
npm run dev
```
