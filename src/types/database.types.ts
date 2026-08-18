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
  permissions: string[];
  created_at: string;
  updated_at: string;
};

export type StudentStatus = "active" | "inactive";

export type StudentPayment = {
  id: string;
  student_id: string;
  amount: number;
  paid_on: string;
  for_month: string;
  purpose: string;
  method: string | null;
  note: string | null;
  created_at: string;
};

export type BillingStatus = "paid" | "partial" | "unpaid";

/** A student's billing summary for the current month. */
export type BillingRow = {
  id: string;
  name: string;
  groupName: string | null;
  monthlyFee: number;
  paidThisMonth: number;
  status: BillingStatus;
  parentName: string | null;
  parentPhone: string | null;
  payments: StudentPayment[];
};

export type Student = {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  registration_date: string;
  class_id: string | null;
  group_id: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  notes: string | null;
  status: StudentStatus;
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

export type Notification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  created_at: string;
};

export type SchoolSettings = {
  id: boolean;
  school_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  logo_url: string | null;
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

export type Teacher = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  subjects: string[];
  salary: number;
  notes: string | null;
  is_active: boolean;
};

export type TeacherPayment = {
  id: string;
  teacher_id: string;
  amount: number;
  payment_date: string;
  method: string | null;
  note: string | null;
};

/** A teacher with payment summary + groups count, for list views. */
export type TeacherListItem = {
  id: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  email: string | null;
  subjects: string[];
  salary: number;
  notes: string | null;
  isActive: boolean;
  groupsCount: number;
  paidThisMonth: number;
  remaining: number;
  lastPaymentDate: string | null;
  payments: TeacherPayment[];
};

export type Group = {
  id: string;
  name: string;
  class_id: string | null;
  teacher_id: string | null;
  classroom: string | null;
  schedule: string | null;
  capacity: number;
  monthly_fee: number;
  is_active: boolean;
};

/** A student inside a group, with attendance + payment status this month. */
export type GroupStudentRow = {
  id: string;
  name: string;
  phone: string | null;
  attendanceRate: number;
  presentCount: number;
  absentCount: number;
  paidThisMonth: number;
  monthlyFee: number;
  paidStatus: BillingStatus;
};

export type GroupDetail = {
  id: string;
  name: string;
  className: string | null;
  teacherName: string | null;
  schedule: string | null;
  classroom: string | null;
  monthlyFee: number;
  capacity: number;
  isActive: boolean;
};

/** One row in the combined payments ledger (students + teachers). */
export type PaymentLedgerRow = {
  id: string;
  type: "student" | "teacher";
  payee: string;
  amount: number;
  date: string;
  purpose: string;
  method: string | null;
  forMonth: string | null;
};

/** A group with computed roster size and monthly revenue, for list views. */
export type GroupListItem = {
  id: string;
  name: string;
  className: string | null;
  teacherName: string | null;
  classroom: string | null;
  schedule: string | null;
  capacity: number;
  monthlyFee: number;
  studentsCount: number;
  revenue: number;
  isActive: boolean;
};

/** A student record with its class & group names, for list views. */
export type StudentListItem = {
  id: string;
  first_name: string;
  last_name: string;
  gender: Gender | null;
  date_of_birth: string | null;
  class_id: string | null;
  group_id: string | null;
  className: string | null;
  groupName: string | null;
  parent_name: string | null;
  parent_phone: string | null;
  address: string | null;
  notes: string | null;
  status: StudentStatus;
  registration_date: string;
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

/** A student assigned to a specific class. */
export type EnrolledStudent = {
  studentId: string;
  first_name: string;
  last_name: string;
  parent_name: string | null;
  parent_phone: string | null;
  status: StudentStatus;
  registration_date: string;
};

/** A student with no class assigned, available to add to a class. */
export type EnrollableStudent = {
  id: string;
  first_name: string;
  last_name: string;
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
  profile: Pick<
    Profile,
    "id" | "first_name" | "last_name" | "email" | "phone" | "role" | "is_active" | "permissions"
  >;
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
      groups: Table<Group>;
      teachers: Table<Teacher>;
      teacher_payments: Table<TeacherPayment>;
      student_payments: Table<StudentPayment>;
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
