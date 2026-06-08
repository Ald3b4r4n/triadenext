import { describe, expect, it } from "vitest";
import { normalizeSlug } from "@/lib/slug";

describe("slug utilities", () => {
  it("normalizes accents, spaces and punctuation", () => {
    expect(normalizeSlug("Perfume Essenza Nº 01!")).toBe("perfume-essenza-n-01");
  });
});
