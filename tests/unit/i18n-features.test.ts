import { describe, expect, it } from "vitest";
import { defaultLocale, locales, t } from "@/i18n";
import { features, isEnabled } from "@/config/features";

describe("language", () => {
  it("Dutch is the default locale", () => {
    expect(defaultLocale).toBe("nl");
    expect(locales).toContain("nl");
  });

  it("translates a key", () => {
    expect(t("nav.book")).toBe("Afspraak maken");
  });

  it("fills in placeholders", () => {
    expect(t("contact.socialDemo", { name: "Instagram" })).toBe(
      "Dit is een demo: de link naar Instagram volgt.",
    );
  });
});

describe("feature flags", () => {
  it("online payments are postponed", () => {
    expect(isEnabled("onlinePayments")).toBe(false);
  });

  it("future features exist but are switched off", () => {
    expect(features.loyaltyCards).toBe(false);
    expect(features.vipTiers).toBe(false);
    expect(features.coupons).toBe(false);
  });
});
