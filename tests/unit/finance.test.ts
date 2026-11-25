import { describe, expect, it } from "vitest";
import { formatEuro } from "@/lib/finance/money";
import { percentageOf, splitGross } from "@/lib/finance/vat";

describe("geldbedragen", () => {
  it("toont bedragen in Nederlands formaat", () => {
    expect(formatEuro(2500).replace(/\s/g, " ")).toBe("€ 25,00");
    expect(formatEuro(123456).replace(/\s/g, " ")).toBe("€ 1.234,56");
  });

  it("weigert bedragen die geen hele centen zijn", () => {
    expect(() => formatEuro(10.5)).toThrow();
  });
});

describe("BTW", () => {
  it("splitst 21% BTW correct", () => {
    expect(splitGross(12100, 2100)).toEqual({ gross: 12100, net: 10000, vat: 2100 });
  });

  it("netto + BTW is altijd exact het brutobedrag", () => {
    for (const gross of [1, 99, 2500, 3333, 4999, 100000]) {
      for (const rate of [0, 900, 2100]) {
        const s = splitGross(gross, rate);
        expect(s.net + s.vat).toBe(gross);
      }
    }
  });

  it("weigert een ongeldig tarief", () => {
    expect(() => splitGross(1000, -1)).toThrow();
  });
});

describe("percentages (bijv. commissie kapper)", () => {
  it("berekent 40% van € 25,00", () => {
    expect(percentageOf(2500, 4000)).toBe(1000);
  });

  it("weigert meer dan 100%", () => {
    expect(() => percentageOf(2500, 10001)).toThrow();
  });
});
