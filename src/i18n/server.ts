import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALES, getDictionary, type Locale } from "./dictionaries";

/** Read the current locale from the cookie (defaults to English). */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("locale")?.value as Locale | undefined;
  return value && (LOCALES as readonly string[]).includes(value) ? value : DEFAULT_LOCALE;
}

/** Get the active locale + its dictionary in one call. */
export async function getI18n() {
  const locale = await getLocale();
  return { locale, dict: getDictionary(locale) };
}
