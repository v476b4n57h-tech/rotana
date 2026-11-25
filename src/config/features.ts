/**
 * Functieschakelaars (feature flags).
 *
 * Elke grote functie kan aan of uit, zonder code te verwijderen. Nu staan ze in
 * de code; vanaf fase 2 komen ze per salon in de database (tabel salon_features),
 * zodat elke salon zijn eigen pakket kan hebben (belangrijk voor SaaS).
 */
export const features = {
  onlineBooking: true,
  customerAccounts: true,
  staffAccounts: true,
  finance: true,
  multiBranch: true,
  onlinePayments: false, // uitgesteld naar een latere fase
  loyaltyCards: false, // toekomst
  vipTiers: false, // toekomst
  coupons: false, // toekomst
} as const;

export type FeatureKey = keyof typeof features;

export function isEnabled(key: FeatureKey): boolean {
  return features[key];
}
