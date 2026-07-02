import { describe, expect, it } from "vitest";
import { normalizeCategories } from "@/features/data-dry-run/normalizers/categories";
import { normalizeProducts } from "@/features/data-dry-run/normalizers/products";
import type { ParsedRecord } from "@/features/data-dry-run/types";

describe("data dry-run catalog normalizers", () => {
  it("normalizes categories with slugs and defaults", () => {
    const result = normalizeCategories([
      {
        file: "categories.csv",
        lineNumber: 2,
        values: { name: "Perfumes Especiais", slug: "Perfumes Especiais" }
      }
    ]);

    expect(result.records[0]).toMatchObject({
      name: "Perfumes Especiais",
      slug: "perfumes-especiais",
      isActive: true
    });
    expect(result.issues).toHaveLength(0);
  });

  it("normalizes product price and blocks published product without stock", () => {
    const records: ParsedRecord[] = [
      {
        file: "products.csv",
        lineNumber: 2,
        values: {
          sku: "SKU-001",
          slug: "Flor de Teste",
          name: "Flor de Teste",
          category_slug: "Perfumes",
          price: "R$ 129,90",
          stock_quantity: "0",
          status: "published",
          published_at: "2026-01-01T00:00:00-03:00"
        }
      }
    ];

    const result = normalizeProducts(records);

    expect(result.records[0].priceCents).toBe(12990);
    expect(result.records[0].slug).toBe("flor-de-teste");
    expect(result.issues.some((issue) => issue.message.includes("estoque positivo"))).toBe(true);
  });
});
