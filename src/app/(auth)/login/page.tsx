import type { Metadata } from "next";
import { getI18n } from "@/i18n/server";
import { LoginForm } from "@/features/auth/components/login-form";
import { DemoLogins } from "@/features/auth/components/demo-logins";
import { LanguageSwitcher } from "@/components/language-switcher";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage() {
  const { locale, dict } = await getI18n();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold tracking-tight">{dict.login.welcome}</h1>
          <p className="text-sm text-muted-foreground">{dict.login.subtitle}</p>
        </div>
      </div>
      <LoginForm
        labels={{
          email: dict.login.email,
          password: dict.login.password,
          signin: dict.login.signin,
        }}
      />
      <DemoLogins />
      <div className="flex justify-center pt-2">
        <LanguageSwitcher current={locale} />
      </div>
    </div>
  );
}
