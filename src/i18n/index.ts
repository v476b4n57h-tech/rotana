/**
 * Meertaligheid (i18n) – basis.
 *
 * Fase 0: alleen Nederlands. Een nieuwe taal toevoegen = een bestand
 * messages/<taal>.json met dezelfde sleutels + de taal in `locales` zetten.
 * Later kunnen teksten per salon uit de database komen (bewerkbaar in het beheer).
 */
import nl from "./messages/nl.json";

export const locales = ["nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

type Messages = typeof nl;
const dictionaries: Record<Locale, Messages> = { nl };

// Alle geldige sleutels, bijvoorbeeld "home.underConstruction".
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
export type MessageKey = Leaves<Messages>;

export function t(key: MessageKey, locale: Locale = defaultLocale): string {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    node = (node as Record<string, unknown> | undefined)?.[part];
  }
  return typeof node === "string" ? node : key;
}
