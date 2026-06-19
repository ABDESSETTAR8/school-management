# School Management System — Architecture

Next.js (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth + RLS) · shadcn/ui · Framer Motion

---

## 1. Database schema overview

The schema is normalized into four domains. Full DDL lives in
`supabase/migrations/0001_initial_schema.sql` and
`supabase/migrations/0002_rls_policies.sql`.

### Identity & roles

| Table | Purpose | Key relationships |
|---|---|---|
| `profiles` | 1:1 with `auth.users`; holds `role` + shared personal fields | `id → auth.users.id` |
| `students` | Student-only academic detail | `profile_id → profiles` |
| `guardians` | Parent/guardian detail | `profile_id → profiles` |
| `staff` | Teachers, workers, admins (employment detail) | `profile_id → profiles` |
| `student_guardians` | **M:N** child ↔ guardian | → `students`, `guardians` |

The single `role` enum (`admin, teacher, student, parent, worker`) drives
dashboards and RLS. Role-specific columns live in their own tables instead of
nullable columns on `profiles`.

### Academic structure

| Table | Purpose | Key relationships |
|---|---|---|
| `academic_years` | e.g. "2025–2026"; one `is_current` | — |
| `terms` | Semesters/quarters within a year | `academic_year_id → academic_years` |
| `subjects` | Catalog (Math, Physics…) | — |
| `classes` | A section/homeroom for a year | `academic_year_id`, `homeroom_teacher_id → staff` |
| `class_subjects` | **M:N** classes ↔ subjects + assigned teacher | → `classes`, `subjects`, `staff` |
| `enrollments` | **M:N** students ↔ classes | → `students`, `classes` |

A partial unique index keeps each student in **one active class** at a time.

### Attendance

| Table | Purpose | Key relationships |
|---|---|---|
| `attendance_sessions` | One row per `(class_subject, date)` | `class_subject_id`, `taken_by → staff` |
| `attendance_records` | Per-student status in a session | `session_id`, `student_id` |

Attendance hangs off `class_subjects` (a specific subject taught to a specific
class), so it's correctly scoped to class **and** date — `present / absent /
late / excused`.

### Relationship map

```
auth.users ─1:1─ profiles ─┬─1:1─ students ──┐
                           ├─1:1─ guardians   ├─M:N─ student_guardians
                           └─1:1─ staff       │
                                              └─M:N─ enrollments ─→ classes
academic_years ─1:N─ terms                                   │
academic_years ─1:N─ classes ─M:N(class_subjects)─ subjects  │
class_subjects ─1:N─ attendance_sessions ─1:N─ attendance_records ─→ students
```

### Security model (RLS)

Row Level Security is enabled on every table. `SECURITY DEFINER` helper
functions (`is_admin()`, `is_staff()`, `current_role()`, `my_student_ids()`)
keep policies simple and avoid recursion on `profiles`. In short:

- **Admins** — full read/write across all tables.
- **Staff (teacher/worker)** — read academic + roster data; teachers write
  attendance for sessions they take.
- **Students** — read their own profile, enrollment, and attendance.
- **Parents** — read the same data for their linked children (`my_student_ids`).

A trigger on `auth.users` auto-creates a `profiles` row on signup, reading
`first_name / last_name / role` from auth metadata.

---

## 2. Proposed folder structure

```
school-management/
├─ src/
│  ├─ app/                          # Next.js App Router
│  │  ├─ (auth)/                    # public auth routes, no sidebar
│  │  │  ├─ login/page.tsx
│  │  │  ├─ register/page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (dashboard)/               # protected, role-aware shell
│  │  │  ├─ layout.tsx              # sidebar + topbar, session guard
│  │  │  ├─ admin/                  # role-scoped route groups
│  │  │  ├─ teacher/
│  │  │  ├─ student/
│  │  │  ├─ parent/
│  │  │  └─ worker/
│  │  ├─ api/                       # route handlers / webhooks
│  │  ├─ layout.tsx                 # root layout, fonts, providers
│  │  └─ globals.css
│  │
│  ├─ components/
│  │  ├─ ui/                        # shadcn/ui primitives
│  │  ├─ layout/                    # sidebar, topbar, nav
│  │  ├─ dashboard/                 # stat cards, charts, tables
│  │  └─ motion/                    # Framer Motion wrappers/presets
│  │
│  ├─ features/                     # vertical slices (domain logic)
│  │  ├─ auth/                      # hooks, schemas, server actions
│  │  ├─ students/
│  │  ├─ classes/
│  │  ├─ attendance/
│  │  └─ enrollments/
│  │     ├─ components/
│  │     ├─ actions.ts              # server actions
│  │     ├─ queries.ts             # data fetching
│  │     └─ schema.ts              # zod validation
│  │
│  ├─ lib/
│  │  ├─ supabase/
│  │  │  ├─ client.ts               # browser client
│  │  │  ├─ server.ts               # server component client
│  │  │  └─ middleware.ts           # session refresh
│  │  ├─ auth/                      # role guards, getSession
│  │  └─ utils.ts                   # cn(), formatters
│  │
│  ├─ types/
│  │  └─ database.types.ts          # generated from Supabase
│  │
│  ├─ config/
│  │  ├─ site.ts                    # app metadata
│  │  └─ navigation.ts              # role → nav items map
│  │
│  ├─ hooks/                        # shared React hooks
│  └─ styles/                       # design tokens / theme
│
├─ supabase/
│  ├─ migrations/                   # SQL migrations (source of truth)
│  ├─ seed.sql                      # demo data
│  └─ config.toml
│
├─ docs/
│  └─ ARCHITECTURE.md               # this file
│
├─ public/
├─ middleware.ts                    # Next.js middleware → Supabase session
├─ components.json                  # shadcn/ui config
├─ tailwind.config.ts
├─ tsconfig.json
└─ package.json
```

**Why this layout**

- **Route groups** `(auth)` / `(dashboard)` give a clean public/protected split
  and one role-aware shell, while per-role folders keep dashboards isolated.
- **`features/`** (vertical slices) keep each domain's UI, server actions,
  queries, and validation together — far more scalable than splitting by
  technical type as the app grows.
- **`lib/supabase`** centralizes the browser/server/middleware client trio
  required by the App Router + SSR auth.
- **`config/navigation.ts`** maps role → nav items so the sidebar renders the
  correct surface per user with no scattered conditionals.

---

## 3. Design system (for the build phase)

- **Palette:** deep slate neutrals (`slate-950 → slate-50`), a professional blue
  primary, crisp white surfaces; semantic success/warning/destructive.
- **Type:** one geometric sans (e.g. Inter/Geist), tight heading scale,
  generous line-height for body.
- **Layout:** dashboard shell — fixed sidebar, sticky topbar, content max-width,
  card-based grids with deliberate whitespace.
- **Motion:** Framer Motion for page transitions, list stagger, and subtle
  hover/press micro-interactions.

---

## 4. Suggested next steps (after schema approval)

1. Scaffold Next.js + Tailwind + shadcn/ui; apply migrations to Supabase.
2. Generate `database.types.ts` from the live schema.
3. Build the Auth module: login/register, middleware session, role guards.
4. Build the global dashboard shell (sidebar/topbar) + role-based navigation.
