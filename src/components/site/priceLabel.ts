import { t } from "@/i18n";
import { formatEuro } from "@/lib/finance/money";

/** Price text for a service: the original placeholder until a real price is set. */
export function priceLabel(priceCents: number | null): string {
  return priceCents === null ? t("common.pricePlaceholder") : formatEuro(priceCents);
}
