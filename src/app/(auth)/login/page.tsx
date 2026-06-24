import type { Metadata } from "next";
import { LoginForm } from "@/features/auth/components/login-form";
import { DemoLogins } from "@/features/auth/components/demo-logins";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to continue, or jump straight into a demo.
        </p>
      </div>
      <LoginForm />
      <DemoLogins />
    </div>
  );
}
