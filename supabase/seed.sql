-- =============================================================================
-- School Management System — demo seed data
-- Safe to re-run (ON CONFLICT DO NOTHING on unique keys).
-- =============================================================================
-- NOTE: students, staff, guardians are NOT seeded here because each requires a
-- Supabase Auth user. Create those through the app (Students page → Add student),
-- which provisions the auth account + profile + record together.
-- =============================================================================

-- Academic year ---------------------------------------------------------------
insert into public.academic_years (name, start_date, end_date, is_current)
values ('2025–2026', '2025-09-01', '2026-06-30', true)
on conflict (name) do nothing;

-- Terms -----------------------------------------------------------------------
insert into public.terms (academic_year_id, name, kind, start_date, end_date)
select ay.id, t.name, 'semester'::term_kind, t.start_date, t.end_date
from public.academic_years ay
cross join (values
  ('Semester 1', date '2025-09-01', date '2026-01-15'),
  ('Semester 2', date '2026-01-16', date '2026-06-30')
) as t(name, start_date, end_date)
where ay.name = '2025–2026'
on conflict (academic_year_id, name) do nothing;

-- Subjects --------------------------------------------------------------------
insert into public.subjects (code, name, description)
values
  ('MATH',  'Mathematics',     'Core mathematics'),
  ('ENG',   'English',         'English language & literature'),
  ('SCI',   'Science',         'General science'),
  ('PHYS',  'Physics',         'Introductory physics'),
  ('CHEM',  'Chemistry',       'Introductory chemistry'),
  ('BIO',   'Biology',         'Introductory biology'),
  ('HIST',  'History',         'World & national history'),
  ('GEO',   'Geography',       'Physical & human geography'),
  ('CS',    'Computer Science','Programming & computing'),
  ('ART',   'Art',             'Visual arts'),
  ('PE',    'Physical Education','Sports & fitness')
on conflict (code) do nothing;

-- Classes (sections) ----------------------------------------------------------
insert into public.classes (academic_year_id, name, grade_level, capacity)
select ay.id, c.name, c.grade_level, 30
from public.academic_years ay
cross join (values
  ('Grade 7 - A', 7),
  ('Grade 7 - B', 7),
  ('Grade 8 - A', 8),
  ('Grade 8 - B', 8),
  ('Grade 9 - A', 9),
  ('Grade 10 - A', 10)
) as c(name, grade_level)
where ay.name = '2025–2026'
on conflict (academic_year_id, name) do nothing;
