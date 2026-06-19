import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { siteConfig } from "@/config/site";
import { FadeIn } from "@/components/motion/fade-in";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand panel — deep slate */}
      <div className="relative hidden flex-col justify-between bg-sidebar p-12 text-sidebar-foreground lg:flex">
        <div className="absolute inset-0 bg-[radial-gradient(60%_60%_at_50%_0%,hsl(var(--primary)/0.25),transparent)]" />
        <Link href="/" className="relative flex items-center gap-2 text-lg font-semibold">
          <GraduationCap className="size-6 text-primary" />
          {siteConfig.name}
        </Link>
        <FadeIn className="relative space-y-4" delay={0.1}>
          <h2 className="max-w-md text-3xl font-semibold leading-tight tracking-tight">
            {siteConfig.tagline}
          </h2>
          <p className="max-w-md text-sm text-sidebar-foreground/70">
            One platform for admins, teachers, students, parents, and staff — attendance,
            classes, and enrollment in a single, secure workspace.
          </p>
        </FadeIn>
        <p className="relative text-xs text-sidebar-foreground/50">
          © {new Date().getFullYear()} {siteConfig.name}. All rights reserved.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-12">
        <FadeIn className="w-full max-w-sm">{children}</FadeIn>
      </div>
    </div>
  );
}
