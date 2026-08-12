export const LOCALES = ["en", "fr", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  fr: "Français",
  ar: "العربية",
};

export const dir = (l: Locale): "rtl" | "ltr" => (l === "ar" ? "rtl" : "ltr");

type Dict = {
  nav: Record<string, string>;
  common: Record<string, string>;
  login: Record<string, string>;
};

const en: Dict = {
  nav: {
    overview: "Overview",
    students: "Students",
    teachers: "Teachers",
    workers: "Workers",
    classes: "Classes",
    groups: "Groups",
    subjects: "Subjects",
    attendance: "Attendance",
    settings: "Settings",
    notifications: "Notifications",
  },
  common: {
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    edit: "Edit",
    add: "Add",
    search: "Search",
    export: "Export CSV",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    language: "Language",
  },
  login: {
    welcome: "Welcome back",
    subtitle: "Sign in to continue, or jump straight into a demo.",
    email: "Email",
    password: "Password",
    signin: "Sign in",
    orDemo: "Or explore a demo",
  },
};

const fr: Dict = {
  nav: {
    overview: "Aperçu",
    students: "Élèves",
    teachers: "Enseignants",
    workers: "Employés",
    classes: "Classes",
    groups: "Groupes",
    subjects: "Matières",
    attendance: "Présence",
    settings: "Paramètres",
    notifications: "Notifications",
  },
  common: {
    save: "Enregistrer",
    cancel: "Annuler",
    delete: "Supprimer",
    edit: "Modifier",
    add: "Ajouter",
    search: "Rechercher",
    export: "Exporter CSV",
    active: "Actif",
    inactive: "Inactif",
    actions: "Actions",
    language: "Langue",
  },
  login: {
    welcome: "Bon retour",
    subtitle: "Connectez-vous pour continuer, ou essayez une démo.",
    email: "E-mail",
    password: "Mot de passe",
    signin: "Se connecter",
    orDemo: "Ou essayez une démo",
  },
};

const ar: Dict = {
  nav: {
    overview: "نظرة عامة",
    students: "الطلاب",
    teachers: "المعلمون",
    workers: "الموظفون",
    classes: "الأقسام",
    groups: "المجموعات",
    subjects: "المواد",
    attendance: "الحضور",
    settings: "الإعدادات",
    notifications: "الإشعارات",
  },
  common: {
    save: "حفظ",
    cancel: "إلغاء",
    delete: "حذف",
    edit: "تعديل",
    add: "إضافة",
    search: "بحث",
    export: "تصدير CSV",
    active: "نشط",
    inactive: "غير نشط",
    actions: "إجراءات",
    language: "اللغة",
  },
  login: {
    welcome: "مرحبًا بعودتك",
    subtitle: "سجّل الدخول للمتابعة، أو جرّب نسخة تجريبية.",
    email: "البريد الإلكتروني",
    password: "كلمة المرور",
    signin: "تسجيل الدخول",
    orDemo: "أو جرّب نسخة تجريبية",
  },
};

const DICTS: Record<Locale, Dict> = { en, fr, ar };

export function getDictionary(locale: Locale): Dict {
  return DICTS[locale] ?? en;
}
