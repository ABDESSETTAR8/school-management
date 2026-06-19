# Scholar — School Management System

A secure, multi-role school management platform built as a portfolio project. Admins, teachers, students, and parents each get a tailored dashboard for managing students, classes, enrollment, and attendance — wrapped in a clean, enterprise-grade UI.

> **Tech:** Next.js 15 (App Router) · TypeScript · Tailwind CSS · Supabase (Postgres + Auth + Row Level Security) · shadcn-style components · Framer Motion

---

## Features

- **Multi-role authentication** — Admin, Teacher, Student, Parent, and Worker, each with a role-specific dashboard and sidebar.
- **Row Level Security** — every table is protected by Postgres RLS policies, so users only ever see the data they're allowed to.
- **Students** — full CRUD; creating a student provisions a real auth account.
- **Staff** — manage teacher / worker / admin accounts.
- **Classes & enrollment** — class sections per academic year, homeroom teachers, subject assignment, and a student-enrollment picker (one active class per student, enforced in the database).
- **Subjects** — a managed subject catalog.
- **Attendance** — teachers take attendance per class/subject/date (present / late / excused / absent); students see their own history; parents see their children's.
- **Parents & guardians** — link parent accounts to their children so they can follow attendance.
- **Settings** — manage academic years and terms, including switching the current year.
- **Polish** — toast notifications, animated transitions, loading skeletons, and graceful error / 404 pages.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 15 (App Router, Server Components, Server Actions) |
| Language | TypeScript |
| Styling | Tailwind CSS with CSS-variable design tokens |
| UI | shadcn-style primitives (Radix) + Framer Motion |
| Backend | Supabase — PostgreSQL, Auth, Row Level Security |
| Validation | Zod |

The codebase is organized as **vertical feature slices** (`src/features/<domain>/` holds that domain's `schema`, `queries`, `actions`, and `components`), which keeps each feature self-contained and easy to extend. See `docs/ARCHITECTURE.md` for the full schema and folder structure.

---

## Getting started

### 1. Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A free [Supabase](https://supabase.com) project

### 2. Install

```bash
npm install
```

### 3. Environment variables

Copy the example file and fill in your Supabase keys (Supabase → Settings → API):

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # server-only; required to create student/staff/parent accounts
```

> ⚠️ The **service_role** key bypasses RLS. Keep it out of source control (`.env.local` is gitignored) and never expose it to the browser.

### 4. Database

Run the SQL files in order in the Supabase **SQL Editor** (or via `supabase db push`):

1. `supabase/migrations/0001_initial_schema.sql` — tables, enums, indexes
2. `supabase/migrations/0002_rls_policies.sql` — RLS, helper functions, signup trigger
3. `supabase/migrations/0003_policy_updates.sql` — staff roster access
4. `supabase/migrations/0004_parent_access.sql` — parent access to linked children
5. `supabase/seed.sql` — academic year, subjects, and classes

### 5. Demo data (optional but recommended)

Populate teachers, students, enrollments, and attendance history:

```bash
npm run seed:demo
```

Demo logins (password `Password123!`):

- `student1@demo.school` … `student36@demo.school`
- `teacher1@demo.school` … `teacher8@demo.school`

### 6. Run

```bash
npm run dev
```

Open <http://localhost:3000>. Register an account, then promote yourself to admin in the SQL Editor to access all features:

```sql
update profiles set role = 'admin' where email = 'you@example.com';
```

> **Tip:** for local testing, disable Supabase → Authentication → "Confirm email" so you can sign in immediately.

---

## Deployment (Vercel)

1. Push this project to a GitHub repository.
2. In [Vercel](https://vercel.com), **Add New → Project** and import the repo. Vercel auto-detects Next.js — no extra config needed.
3. Add the three environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) under **Project → Settings → Environment Variables**.
4. Deploy.
5. In Supabase → **Authentication → URL Configuration**, set the **Site URL** to your Vercel domain (e.g. `https://your-app.vercel.app`) and add it to the redirect allow-list, so auth emails and redirects point at production.

## Deployment (Netlify)

This repo includes a `netlify.toml` that enables the official Next.js runtime (SSR, server actions, and middleware all work — no static export needed).

1. Push this project to a GitHub repository.
2. In [Netlify](https://app.netlify.com): **Add new site → Import an existing project**, pick the repo. Netlify reads `netlify.toml` and installs the Next.js plugin automatically.
3. Under **Site configuration → Environment variables**, add the three keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
4. **Deploy site**. You'll get a public URL like `https://your-app.netlify.app`.
5. In Supabase → **Authentication → URL Configuration**, set the **Site URL** to your Netlify domain and add it to the redirect allow-list.

> Link it from your portfolio with a "Live Demo" button pointing at the Netlify URL.

---

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check |
| `npm run seed:demo` | Seed demo teachers, students, enrollments & attendance |

---

## Project structure

```
src/
├─ app/                  # App Router: (auth) + (dashboard) route groups
├─ components/           # UI primitives, layout, dashboard widgets
├─ features/             # Vertical slices: students, classes, attendance, …
├─ lib/                  # Supabase clients, auth guards, utils
├─ config/               # site + role-based navigation
└─ types/                # database types
supabase/
├─ migrations/           # SQL migrations (source of truth)
└─ seed.sql              # base academic data
```

---

## Notes

- Built as a portfolio piece to demonstrate full-stack design: a normalized Postgres schema, database-enforced security with RLS, role-based access, and a modern Next.js architecture.
- Database types in `src/types/database.types.ts` are hand-written to mirror the schema; run `npm run db:types` to regenerate them from a linked Supabase project.
