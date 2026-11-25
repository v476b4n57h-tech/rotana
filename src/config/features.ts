/**
 * Feature flags.
 *
 * Every major feature can be switched on or off without deleting code. They live
 * in code for now; from phase 2 they move to the database per salon (table
 * salon_features), so each salon can have its own package (important for SaaS).
 */
export const features = {
  onlineBooking: true,
  customerAccounts: true,
  staffAccounts: true,
  finance: true,
  multiBranch: true,
  onlinePayments: false, // postponed to a later phase
  loyaltyCards: false, // future
  vipTiers: false, // future
  coupons: false, // future
} as const;

export type FeatureKey = keyof typeof features;

export function isEnabled(key: FeatureKey): boolean {
  return features[key];
}
