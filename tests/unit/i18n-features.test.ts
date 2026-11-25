import { describe, expect, it } from "vitest";
import { defaultLocale, locales, t } from "@/i18n";
import { features, isEnabled } from "@/config/features";

describe("taal", () => {
  it("Nederlands is de standaardtaal", () => {
    expect(defaultLocale).toBe("nl");
    expect(locales).toContain("nl");
  });

  it("vertaalt een sleutel", () => {
    expect(t("home.underConstruction")).toBe("De nieuwe website wordt opgebouwd.");
  });
});

describe("functieschakelaars", () => {
  it("online betalen is uitgesteld", () => {
    expect(isEnabled("onlinePayments")).toBe(false);
  });

  it("toekomstige functies staan klaar maar uit", () => {
    expect(features.loyaltyCards).toBe(false);
    expect(features.vipTiers).toBe(false);
    expect(features.coupons).toBe(false);
  });
});
