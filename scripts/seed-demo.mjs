// =============================================================================
// Demo data seeder — creates teachers, students, enrollments & attendance.
// Run:  node scripts/seed-demo.mjs
// Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local.
// Idempotent: uses fixed @demo.school emails, so re-running won't duplicate users.
// =============================================================================
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// --- load .env.local (no dotenv dependency) ----------------------------------
function loadEnv() {
  const env = {};
  try {
    const raw = readFileSync(path.join(__dirname, "..", ".env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m) env[m[1]] = m[2].replace(/^["']|["']$/g, "");
    }
  } catch {
    console.error("Could not read .env.local"); process.exit(1);
  }
  return env;
}
const env = loadEnv();
const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const KEY = env.SUPABASE_SERVICE_ROLE_KEY;
if (!URL || !KEY) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local");
  process.exit(1);
}
const db = createClient(URL, KEY, { auth: { autoRefreshToken: false, persistSession: false } });

// --- helpers -----------------------------------------------------------------
const PASSWORD = "Password123!";
const FIRST = ["Ava","Liam","Noah","Emma","Olivia","Yusuf","Amir","Sara","Lina","Omar","Mia","Leo","Nour","Adam","Aya","Zayd","Ines","Karim","Maya","Rayan","Sofia","Hana","Ali","Lara","Bilal","Dina","Tariq","Yara","Sami","Rim","Idris","Salma","Kenza","Anas","Reda","Nada","Walid","Ihsane","Mehdi","Ghita"];
const LAST = ["Bennani","Alaoui","Haddad","Cherkaoui","Idrissi","Saidi","Ziani","Rami","Fassi","Tahiri","Naciri","Belhaj","Kabbaj","Sebti","Amrani","Bouzid","Lahlou","Mansouri","Othmani","Rachidi"];
const rand = (a) => a[Math.floor(Math.random() * a.length)];
const pad = (n, w = 4) => String(n).padStart(w, "0");

async function waitForProfile(id, tries = 10) {
  for (let i = 0; i < tries; i++) {
    const { data } = await db.from("profiles").select("id").eq("id", id).maybeSingle();
    if (data) return true;
    await new Promise((r) => setTimeout(r, 200));
  }
  return false;
}

// Create an auth user (or resolve an existing one by email). Returns user id.
async function getOrCreateUser(email, firstName, lastName, role) {
  const { data, error } = await db.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: { first_name: firstName, last_name: lastName, role },
  });
  if (!error && data?.user) {
    await waitForProfile(data.user.id);
    return data.user.id;
  }
  // Already exists → look up id from profiles
  const { data: existing } = await db.from("profiles").select("id").eq("email", email).maybeSingle();
  if (existing) return existing.id;
  throw new Error(`Could not create or find user ${email}: ${error?.message}`);
}

// --- main --------------------------------------------------------------------
async function main() {
  console.log("→ Checking seeded structure…");
  const { data: classes } = await db
    .from("classes")
    .select("id, name, capacity")
    .order("grade_level");
  const { data: subjects } = await db.from("subjects").select("id, code, name");
  if (!classes?.length || !subjects?.length) {
    console.error("No classes/subjects found. Run supabase/seed.sql first.");
    process.exit(1);
  }
  console.log(`  ${classes.length} classes, ${subjects.length} subjects found.`);

  // 1. Teachers (staff) ------------------------------------------------------
  console.log("→ Creating 8 teachers…");
  const teachers = [];
  for (let i = 1; i <= 8; i++) {
    const fn = rand(FIRST), ln = rand(LAST);
    const email = `teacher${i}@demo.school`;
    const profileId = await getOrCreateUser(email, fn, ln, "teacher");
    const { data: existing } = await db.from("staff").select("id").eq("profile_id", profileId).maybeSingle();
    let staffId = existing?.id;
    if (!staffId) {
      const { data, error } = await db.from("staff")
        .insert({ profile_id: profileId, employee_no: `EMP-${pad(i, 3)}`, job_title: "Teacher", department: "Academics" })
        .select("id").single();
      if (error) throw error;
      staffId = data.id;
    }
    teachers.push({ staffId, name: `${fn} ${ln}` });
  }
  console.log(`  ${teachers.length} teachers ready.`);

  // 2. Homeroom + class_subjects --------------------------------------------
  console.log("→ Assigning homerooms & subjects to classes…");
  for (let c = 0; c < classes.length; c++) {
    const homeroom = teachers[c % teachers.length].staffId;
    await db.from("classes").update({ homeroom_teacher_id: homeroom }).eq("id", classes[c].id);
    // 4 subjects per class
    const picks = subjects.slice(0, 4);
    for (let s = 0; s < picks.length; s++) {
      const { data: exists } = await db.from("class_subjects")
        .select("id").eq("class_id", classes[c].id).eq("subject_id", picks[s].id).maybeSingle();
      if (!exists) {
        await db.from("class_subjects").insert({
          class_id: classes[c].id,
          subject_id: picks[s].id,
          teacher_id: teachers[(c + s) % teachers.length].staffId,
        });
      }
    }
  }

  // 3. Students --------------------------------------------------------------
  const TOTAL = 36;
  console.log(`→ Creating ${TOTAL} students…`);
  const students = [];
  for (let i = 1; i <= TOTAL; i++) {
    const fn = rand(FIRST), ln = rand(LAST);
    const email = `student${i}@demo.school`;
    const profileId = await getOrCreateUser(email, fn, ln, "student");
    await db.from("profiles").update({
      gender: rand(["male", "female"]),
      phone: `+212 6${Math.floor(10000000 + Math.random() * 89999999)}`,
    }).eq("id", profileId);
    const { data: existing } = await db.from("students").select("id").eq("profile_id", profileId).maybeSingle();
    let studentId = existing?.id;
    if (!studentId) {
      const { data, error } = await db.from("students")
        .insert({ profile_id: profileId, admission_no: `STU-2025-${pad(i)}`, admission_date: "2025-09-01" })
        .select("id").single();
      if (error) throw error;
      studentId = data.id;
    }
    students.push(studentId);
    process.stdout.write(`\r  ${i}/${TOTAL}`);
  }
  console.log("\n  students ready.");

  // 4. Enrollments (distribute across classes, respect capacity) -------------
  console.log("→ Enrolling students…");
  let ci = 0;
  for (const studentId of students) {
    const { data: active } = await db.from("enrollments")
      .select("id").eq("student_id", studentId).eq("status", "active").maybeSingle();
    if (active) continue; // already enrolled
    const cls = classes[ci % classes.length];
    ci++;
    await db.from("enrollments").insert({ student_id: studentId, class_id: cls.id, status: "active" });
  }

  // 5. Attendance history (last 5 weekdays) ----------------------------------
  console.log("→ Generating attendance for the last 5 school days…");
  const weekdays = [];
  const d = new Date();
  while (weekdays.length < 5) {
    const day = d.getDay();
    if (day !== 0 && day !== 6) weekdays.push(new Date(d).toISOString().slice(0, 10));
    d.setDate(d.getDate() - 1);
  }

  for (const cls of classes) {
    const { data: cs } = await db.from("class_subjects").select("id, teacher_id").eq("class_id", cls.id).limit(1).maybeSingle();
    if (!cs) continue;
    const { data: enr } = await db.from("enrollments").select("student_id").eq("class_id", cls.id).eq("status", "active");
    const ids = (enr ?? []).map((e) => e.student_id);
    if (ids.length === 0) continue;

    for (const date of weekdays) {
      let sessionId;
      const { data: exSession } = await db.from("attendance_sessions")
        .select("id").eq("class_subject_id", cs.id).eq("session_date", date).maybeSingle();
      if (exSession) sessionId = exSession.id;
      else {
        const { data, error } = await db.from("attendance_sessions")
          .insert({ class_subject_id: cs.id, session_date: date, taken_by: cs.teacher_id })
          .select("id").single();
        if (error) continue;
        sessionId = data.id;
      }
      const rows = ids.map((student_id) => {
        const r = Math.random();
        const status = r < 0.82 ? "present" : r < 0.88 ? "late" : r < 0.92 ? "excused" : "absent";
        return { session_id: sessionId, student_id, status };
      });
      // ignore duplicates from prior runs
      await db.from("attendance_records").upsert(rows, { onConflict: "session_id,student_id", ignoreDuplicates: true });
    }
  }

  // 6. Named one-per-role demo accounts (shown on the login page) -------------
  console.log("→ Creating named demo accounts (admin/worker/teacher/student/parent)…");

  // admin
  await getOrCreateUser("admin@demo.school", "Demo", "Admin", "admin");

  // worker (full-access) — give a staff record
  {
    const pid = await getOrCreateUser("worker@demo.school", "Demo", "Worker", "worker");
    const { data: ex } = await db.from("staff").select("id").eq("profile_id", pid).maybeSingle();
    if (!ex) await db.from("staff").insert({ profile_id: pid, employee_no: "EMP-DEMO-W", job_title: "Office", department: "Administration" });
  }

  // teacher — staff record + assign to a class_subject so attendance works
  let demoTeacherStaffId;
  {
    const pid = await getOrCreateUser("teacher@demo.school", "Demo", "Teacher", "teacher");
    const { data: ex } = await db.from("staff").select("id").eq("profile_id", pid).maybeSingle();
    demoTeacherStaffId = ex?.id;
    if (!demoTeacherStaffId) {
      const { data } = await db.from("staff").insert({ profile_id: pid, employee_no: "EMP-DEMO-T", job_title: "Teacher", department: "Academics" }).select("id").single();
      demoTeacherStaffId = data.id;
    }
    // assign this teacher to the first class_subject of the first class
    const { data: cs } = await db.from("class_subjects").select("id").eq("class_id", classes[0].id).limit(1).maybeSingle();
    if (cs) await db.from("class_subjects").update({ teacher_id: demoTeacherStaffId }).eq("id", cs.id);
  }

  // student — students record + enroll in the first class
  let demoStudentId;
  {
    const pid = await getOrCreateUser("student@demo.school", "Demo", "Student", "student");
    await db.from("profiles").update({ gender: "male" }).eq("id", pid);
    const { data: ex } = await db.from("students").select("id").eq("profile_id", pid).maybeSingle();
    demoStudentId = ex?.id;
    if (!demoStudentId) {
      const { data } = await db.from("students").insert({ profile_id: pid, admission_no: "STU-DEMO-1", admission_date: "2025-09-01" }).select("id").single();
      demoStudentId = data.id;
    }
    const { data: active } = await db.from("enrollments").select("id").eq("student_id", demoStudentId).eq("status", "active").maybeSingle();
    if (!active) await db.from("enrollments").insert({ student_id: demoStudentId, class_id: classes[0].id, status: "active" });
  }

  // parent — guardians record + link to the demo student
  {
    const pid = await getOrCreateUser("parent@demo.school", "Demo", "Parent", "parent");
    const { data: ex } = await db.from("guardians").select("id").eq("profile_id", pid).maybeSingle();
    let guardianId = ex?.id;
    if (!guardianId) {
      const { data } = await db.from("guardians").insert({ profile_id: pid, occupation: "Engineer" }).select("id").single();
      guardianId = data.id;
    }
    if (demoStudentId) {
      const { data: link } = await db.from("student_guardians").select("student_id").eq("guardian_id", guardianId).eq("student_id", demoStudentId).maybeSingle();
      if (!link) await db.from("student_guardians").insert({ guardian_id: guardianId, student_id: demoStudentId, relationship: "father", is_primary: true });
    }
  }

  console.log("\n✅ Done. One-click demo accounts (also shown on the login page):");
  console.log("   admin@demo.school · worker@demo.school · teacher@demo.school · student@demo.school · parent@demo.school");
  console.log("   bulk test data:    student1..36@demo.school / teacher1..8@demo.school");
  console.log(`   password (all):    ${PASSWORD}`);
}

main().catch((e) => { console.error("\n✖ Seeding failed:", e.message); process.exit(1); });
