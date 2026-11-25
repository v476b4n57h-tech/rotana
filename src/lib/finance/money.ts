/**
 * Money is ALWAYS stored and calculated as whole cents (integers).
 * Example: € 25,00 = 2500. This avoids rounding errors.
 */

export type Cents = number;

export function assertCents(value: number): asserts value is Cents {
  if (!Number.isSafeInteger(value)) {
    throw new Error(`Amount must be a whole number of cents, got: ${value}`);
  }
}

const euro = new Intl.NumberFormat("nl-NL", { style: "currency", currency: "EUR" });

/** 2500 -> "€ 25,00" */
export function formatEuro(cents: Cents): string {
  assertCents(cents);
  return euro.format(cents / 100);
}
