"use server";

import { cookies } from "next/headers";
import { LOCALES, type Locale } from "./dictionaries";

/** Persist the chosen locale in a cookie (read by the server on next render). */
export async function setLocale(locale: Locale) {
  if (!(LOCALES as readonly string[]).includes(locale)) return;
  const store = await cookies();
  store.set("locale", locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
