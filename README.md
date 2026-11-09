# Visahobe OS · Next.js + PostgreSQL

Next.js 16 (App Router) workspace with email/password auth, dashboards, superagents,
admin console and a WhatsApp webhook surface. Data lives in PostgreSQL through Drizzle.

## Environment
- `DATABASE_URL` — Postgres connection string (a pooler URL works best on serverless)
- `ADMIN_EMAIL`, `ADMIN_PASSWORD` — bootstrap admin
- `OPENAI_API_KEY` — enables LLM replies for the agent runtime (optional)

## Run
```
npm install
npm run build   # applies the generated DDL, then builds
npm start
```
