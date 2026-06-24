import { redirect } from "next/navigation";

// Public sign-up is disabled. Accounts are provisioned by an administrator.
export default function RegisterPage() {
  redirect("/login");
}
