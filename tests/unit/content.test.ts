import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { mood, people, services, work } from "@/content/rotana";

/** Checks that the content moved out of index.html matches the original word for word. */
const legacy = readFileSync("index.html", "utf8").replace(/&amp;/g, "&");

describe("content taken over from the original", () => {
  it("every service name and description appears in the original", () => {
    for (const group of [services.men, services.women]) {
      for (const s of group) {
        expect(legacy).toContain(`<h3>${s.name}</h3><div>${s.description}</div>`);
      }
    }
    expect(services.men).toHaveLength(8);
    expect(services.women).toHaveLength(6);
  });

  it("all 10 gallery photos and their captions match the original", () => {
    expect(work).toHaveLength(10);
    for (const w of work) expect(legacy).toContain(`alt: '${w.alt}', cat: '${w.group}'`);
  });

  it("all slider photos keep their original descriptions", () => {
    for (const slide of mood.flatMap((m) => m.slides)) expect(legacy).toContain(`alt="${slide.alt}"`);
  });

  it("the demo team is the same (4 men's barbers, 2 women's stylists)", () => {
    expect(people.men.map((p) => p.name)).toEqual(["Daan", "Yusuf", "Milan", "Bram"]);
    expect(people.women.map((p) => p.name)).toEqual(["Sanne", "Lotte"]);
  });
});
