/**
 * Geldbedragen worden ALTIJD als hele centen (integer) opgeslagen en berekend.
 * Voorbeeld: € 25,00 = 2500. Zo ontstaan geen afrondingsfouten.
 */

export type Cents = number;

export function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Bedrag moet een geheel aantal centen zijn, kreeg: ${value}`);
  }
}

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** 2500 -> "€ 25,00" */
export function formatEuro(cents: Cents): string {
  assertCents(cents);
  return euro.format(cents / 100);
}
