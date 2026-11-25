/**
 * Internationalisation (i18n).
 *
 * Interface texts live in messages/<locale>.json. Dutch is the only locale for
 * now. Adding a language = adding a JSON file with the same keys and listing the
 * locale in `locales`. Salon-specific content (services, team, opening hours)
 * lives in src/content and will move to the database in a later phase.
 */
import nl from "./messages/nl.json";

export const locales = ["nl"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "nl";

type Messages = typeof nl;
const dictionaries: Record<Locale, Messages> = { nl };

// Every valid key, e.g. "nav.services".
type Leaves<T, P extends string = ""> = {
  [K in keyof T & string]: T[K] extends string ? `${P}${K}` : Leaves<T[K], `${P}${K}.`>;
}[keyof T & string];
export type MessageKey = Leaves<Messages>;

/** Returns the text for `key`, with `{name}` placeholders replaced by `params`. */
export function t(
  key: MessageKey,
  params?: Record<string, string | number>,
  locale: Locale = defaultLocale,
): string {
  let node: unknown = dictionaries[locale];
  for (const part of key.split(".")) {
    node = (node as Record<string, unknown> | undefined)?.[part];
  }
  if (typeof node !== "string") return key;
  if (!params) return node;
  return node.replace(/\{(\w+)\}/g, (match, name: string) => (name in params ? String(params[name]) : match));
}
