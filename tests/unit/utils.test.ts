import { describe, expect, it } from "vitest";
import { formatDate, slugify } from "@/lib/utils";

describe("slugify", () => {
  it("lowercases, strips punctuation and collapses separators", () => {
    expect(slugify("  Teachers' Training: Day 1 — Paikar!  ")).toBe("teachers-training-day-1-paikar");
  });

  it("returns an empty string when nothing usable remains", () => {
    expect(slugify("!!!")).toBe("");
  });
});

describe("formatDate", () => {
  it("formats ISO dates", () => {
    expect(formatDate("2023-08-15T00:00:00.000Z")).toMatch(/^August 1[45], 2023$/);
  });

  it("returns empty for null and the raw string for garbage", () => {
    expect(formatDate(null)).toBe("");
    expect(formatDate("not-a-date")).toBe("not-a-date");
  });
});
