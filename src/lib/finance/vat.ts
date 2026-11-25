/**
 * BTW-berekeningen.
 *
 * Tarieven staan NIET vast in de code: ze worden later per salon in de database
 * beheerd (met een geldig-vanaf-datum), omdat tarieven kunnen veranderen.
 * Een tarief wordt uitgedrukt in basispunten: 21% = 2100, 9% = 900.
 */
import { assertCents, type Cents } from "./money";

export type BasisPoints = number;

export interface VatSplit {
  gross: Cents; // bedrag inclusief BTW (wat de klant betaalt)
  net: Cents; // bedrag exclusief BTW
  vat: Cents; // BTW-bedrag
}

/** Splitst een bedrag inclusief BTW in netto + BTW. Afronding: rekenkundig op hele centen. */
export function splitGross(gross: Cents, rate: BasisPoints): VatSplit {
  assertCents(gross);
  if (!Number.isInteger(rate) || rate < 0) throw new Error(`Ongeldig BTW-tarief: ${rate}`);
  const net = Math.round((gross * 10000) / (10000 + rate));
  return { gross, net, vat: gross - net };
}

/** Berekent een percentage (in basispunten) van een bedrag, bijv. de commissie van een kapper. */
export function percentageOf(amount: Cents, rate: BasisPoints): Cents {
  assertCents(amount);
  if (!Number.isInteger(rate) || rate < 0 || rate > 10000) throw new Error(`Ongeldig percentage: ${rate}`);
  return Math.round((amount * rate) / 10000);
}
