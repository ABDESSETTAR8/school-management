import { redirect } from "next/navigation";

// The Parents module has been removed — parent details now live on each
// student's record. Redirect any old links to Students.
export default function GuardiansPage() {
  redirect("/dashboard/students");
}
