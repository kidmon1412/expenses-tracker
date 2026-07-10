# Expenses Tracker

A personal expense tracker that logs cash and online transactions, categorises spending,
monitors savings targets, and generates exportable reports — with a free trial and paid tier.

See [docs/PRD.md](docs/PRD.md) for the product plan and [docs/TASKS.md](docs/TASKS.md) for the
sprint breakdown this app was built against.

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, React 19) |
| Language | TypeScript strict |
| Styles | Tailwind CSS v4 (CSS-first, no config file) |
| Auth + DB | Supabase (`@supabase/ssr`), Postgres + RLS |
| Payments | Stripe Checkout + webhooks |
| Reports | `@react-pdf/renderer` (PDF), streamed CSV |
| Deploy | Vercel |

## Quick start

```bash
npm install
vercel link
vercel env pull .env.local
npm run dev
```

Open http://localhost:3000 — the dashboard shows demo seed data with no login required.

## Database

Schema lives in `supabase/migrations/`. Apply with the Supabase CLI:

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## Working with AI

See [CLAUDE.md](CLAUDE.md) for build conventions.
