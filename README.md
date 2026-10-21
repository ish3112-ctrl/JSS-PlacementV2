# JSS University Noida Placement Intelligence Hub

A mobile-first React, Vite, TypeScript, Tailwind, and shadcn/ui single-page app for company research and placement skill analytics.

## Phase 2 — Supabase

Paste `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` into `.env`, then run `npm install` and `npm run dev`.

The app is public and read-only. It uses the Supabase anon key in the browser and does not add authentication, write queries, migrations, or database changes. Company cards and profiles read only `public.company_json`; skill data reads `public.company_skill_levels`, `public.skill_set_master`, `public.proficiency_levels`, and `public.skill_set_topics`. Skill rows are assembled in the browser from those four selects.

Supabase must allow public `SELECT` access to the listed tables. Missing or denied configuration is shown with a retry action. Do not put a service role key or database password in the browser app.

The original `src/data/seedCompanies.ts` and `src/data/skillTopics.ts` are retained as reference fallback data. They are not imported in the live render path.

## Run and verify

```bash
npm install
npm run dev
npm run build
npm test
```

## Routes

- `/` — searchable company directory
- `/company` — redirects to `/company/intelligence`
- `/company/intelligence` — 22-section company profile
- `/company/skills` — skill proficiency cards and 10-level roadmaps
- unmatched paths — not-found page
