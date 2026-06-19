// Hand-written types mirroring the SQL schema.
// Replace with generated types once linked:  npm run db:types
export type UserRole = "admin" | "teacher" | "student" | "parent" | "worker";
export type Gender = "male" | "female" | "other" | "undisclosed";
export type EnrollmentStatus = "active" | "transferred" | "withdrawn" | "graduated";

export type Profile = {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  gender: Gender | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type Student = {
  id: string;
  profile_id: string;
  admission_no: string;
  admission_date: string;
  created_at: string;
  updated_at: string;
};

export type Staff = {
  id: string;
  profile_id: string;
  employee_no: string;
  job_title: string | null;
  department: string | null;
  hire_date: string;
};

export type AcademicYear = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
  is_current: boolean;
};

export type Subject = {
  id: string;
  code: string;
  name: string;
  description: string | null;
};

export type GuardianRelationship = "mother" | "father" | "guardian" | "other";

export type Guardian = {
  id: string;
  profile_id: string;
  occupation: string | null;
};

export type StudentGuardian = {
  student_id: string;
  guardian_id: string;
  relationship: GuardianRelationship;
  is_primary: boolean;
};

/** A linked child shown under a guardian. */
export type LinkedChild = {
  linkStudentId: string;
  studentId: string;
  name: string;
  admission_no: string;
  relationship: GuardianRelationship;
};

/** A guardian (parent account) with their linked children, for the admin list. */
export type GuardianListItem = {
  id: string;
  occupation: string | null;
  profile: Pick<Profile, "id" | "first_name" | "last_name" | "email" | "phone" | "is_active">;
  children: LinkedChild[];
};

/** A student selectable for linking to a guardian. */
export type LinkableStudent = {
  id: string;
  admission_no: string;
  name: string;
};

export type TermKind = "semester" | "trimester" | "quarter";

export type Term = {
  id: string;
  academic_year_id: string;
  name: string;
  kind: TermKind;
  start_date: string;
  end_date: string;
};

/** An academic year with its terms, for the settings page. */
export type AcademicYearWithTerms = AcademicYear & { terms: Term[] };

export type Class = {
  id: string;
  academic_year_id: string;
  name: string;
  grade_level: number;
  capacity: number;
  homeroom_teacher_id: string | null;
};

export type Enrollment = {
  id: string;
  student_id: string;
  class_id: string;
  status: EnrollmentStatus;
  enrolled_at: string;
};

/** A student row joined with its profile and current class, for list views. */
export type StudentListItem = {
  id: string;
  admission_no: string;
  admission_date: string;
  profile: Pick<
    Profile,
    "id" | "first_name" | "last_name" | "email" | "phone" | "gender" | "is_active"
  >;
  currentClass: { id: string; name: string; grade_level: number } | null;
};

/** A class with its computed roster size and homeroom teacher name. */
export type ClassListItem = {
  id: string;
  name: string;
  grade_level: number;
  capacity: number;
  enrolledCount: number;
  homeroomTeacher: string | null;
  academicYear: string;
};

/** A student enrolled in a specific class. */
export type EnrolledStudent = {
  enrollmentId: string;
  studentId: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  email: string;
  enrolled_at: string;
};

/** A student with no active enrollment, available to add to a class. */
export type EnrollableStudent = {
  id: string;
  admission_no: string;
  first_name: string;
  last_name: string;
  email: string;
};

/** A staff member presented as a selectable homeroom teacher. */
export type TeacherOption = { id: string; name: string };

/** A staff row joined with its profile, for list views. */
export type StaffListItem = {
  id: string;
  employee_no: string;
  job_title: string | null;
  department: string | null;
  hire_date: string;
  profile: Pick<Profile, "id" | "first_name" | "last_name" | "email" | "phone" | "role" | "is_active">;
};

export type AttendanceStatus = "present" | "absent" | "late" | "excused";

export type ClassSubject = {
  id: string;
  class_id: string;
  subject_id: string;
  teacher_id: string | null;
};

export type AttendanceSession = {
  id: string;
  class_subject_id: string;
  session_date: string;
  taken_by: string | null;
  notes: string | null;
};

export type AttendanceRecord = {
  id: string;
  session_id: string;
  student_id: string;
  status: AttendanceStatus;
  remark: string | null;
};

/** A class-subject offering presented for selection when taking attendance. */
export type ClassSubjectOption = {
  id: string;
  classId: string;
  className: string;
  gradeLevel: number;
  subjectName: string;
  teacherName: string | null;
};

/** One row in the editable attendance sheet. */
export type AttendanceRow = {
  studentId: string;
  name: string;
  admission_no: string;
  status: AttendanceStatus | null;
};

/** Aggregate attendance figures for a student. */
export type AttendanceSummary = {
  total: number;
  present: number;
  absent: number;
  late: number;
  excused: number;
  rate: number; // % present-or-late
};

/** One historical attendance entry for a student. */
export type AttendanceHistoryItem = {
  date: string;
  status: AttendanceStatus;
  subject: string;
  className: string;
};

type Table<Row> = { Row: Row; Insert: Partial<Row>; Update: Partial<Row> };

export type Database = {
  public: {
    Tables: {
      profiles: Table<Profile>;
      students: Table<Student>;
      staff: Table<Staff>;
      academic_years: Table<AcademicYear>;
      subjects: Table<Subject>;
      classes: Table<Class>;
      terms: Table<Term>;
      guardians: Table<Guardian>;
      student_guardians: Table<StudentGuardian>;
      enrollments: Table<Enrollment>;
      class_subjects: Table<ClassSubject>;
      attendance_sessions: Table<AttendanceSession>;
      attendance_records: Table<AttendanceRecord>;
    };
    Enums: {
      user_role: UserRole;
      gender: Gender;
      enrollment_status: EnrollmentStatus;
      attendance_status: AttendanceStatus;
    };
  };
};
