/**
 * VAT (BTW) calculations.
 *
 * Rates are NOT hard-coded: they will be managed per salon in the database (with
 * a valid-from date), because rates can change.
 * A rate is expressed in basis points: 21% = 2100, 9% = 900.
 */
import { assertCents, type Cents } from "./money";

export type BasisPoints = number;

export interface VatSplit {
  gross: Cents; // amount including VAT (what the customer pays)
  net: Cents; // amount excluding VAT
  vat: Cents; // VAT amount
}

/** Splits a VAT-inclusive amount into net + VAT, rounded to whole cents. */
export function splitGross(gross: Cents, rate: BasisPoints): VatSplit {
  assertCents(gross);
  if (!Number.isInteger(rate) || rate < 0) throw new Error(`Invalid VAT rate: ${rate}`);
  const net = Math.round((gross * 10000) / (10000 + rate));
  return { gross, net, vat: gross - net };
}

/** Percentage (in basis points) of an amount, e.g. a barber's commission. */
export function percentageOf(amount: Cents, rate: BasisPoints): Cents {
  assertCents(amount);
  if (!Number.isInteger(rate) || rate < 0 || rate > 10000) throw new Error(`Invalid percentage: ${rate}`);
  return Math.round((amount * rate) / 10000);
}
