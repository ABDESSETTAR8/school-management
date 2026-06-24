import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { siteConfig } from "@/config/site";
import { ToastProvider } from "@/components/ui/toaster";
import { PWARegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: siteConfig.name, statusBarStyle: "default" },
  icons: { apple: "/apple-icon.png" },
};

export const viewport: Viewport = {
  themeColor: "#2563eb",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans`}>
        <ToastProvider>{children}</ToastProvider>
        <PWARegister />
      </body>
    </html>
  );
}
