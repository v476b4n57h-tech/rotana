import { describe, expect, it } from "vitest";
import { formatEuro } from "@/lib/finance/money";
import { percentageOf, splitGross } from "@/lib/finance/vat";

describe("money", () => {
  it("formats amounts the Dutch way", () => {
    expect(formatEuro(2500).replace(/\s/g, " ")).toBe("€ 25,00");
    expect(formatEuro(123456).replace(/\s/g, " ")).toBe("€ 1.234,56");
  });

  it("rejects amounts that are not whole cents", () => {
    expect(() => formatEuro(10.5)).toThrow();
  });
});

describe("VAT (BTW)", () => {
  it("splits 21% VAT correctly", () => {
    expect(splitGross(12100, 2100)).toEqual({ gross: 12100, net: 10000, vat: 2100 });
  });

  it("net + VAT always equals the gross amount", () => {
    for (const gross of [1, 99, 2500, 3333, 4999, 100000]) {
      for (const rate of [0, 900, 2100]) {
        const s = splitGross(gross, rate);
        expect(s.net + s.vat).toBe(gross);
      }
    }
  });

  it("rejects an invalid rate", () => {
    expect(() => splitGross(1000, -1)).toThrow();
  });
});

describe("percentages (e.g. barber commission)", () => {
  it("40% of € 25,00 is € 10,00", () => {
    expect(percentageOf(2500, 4000)).toBe(1000);
  });

  it("rejects more than 100%", () => {
    expect(() => percentageOf(2500, 10001)).toThrow();
  });
});
