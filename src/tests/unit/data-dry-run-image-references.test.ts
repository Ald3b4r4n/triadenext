import { describe, expect, it } from "vitest";
import { normalizeProductImages } from "@/features/data-dry-run/normalizers/images";
import { reconcileDryRunData } from "@/features/data-dry-run/reconciliation";
import type { NormalizedDryRunData, ParsedInputDataset } from "@/features/data-dry-run/types";

describe("data dry-run image references", () => {
  it("normalizes image references without copying binaries", () => {
    const result = normalizeProductImages([
      {
        file: "product-images.csv",
        lineNumber: 2,
        values: {
          product_sku: "SKU-001",
          reference: "legacy/products/sku-001.jpg",
          alt_text: "Produto",
          sort_order: "1",
          is_cover: "true"
        }
      }
    ]);

    expect(result.records[0]).toMatchObject({
      productSku: "SKU-001",
      reference: "legacy/products/sku-001.jpg",
      isCover: true
    });
    expect(result.issues).toHaveLength(0);
  });

  it("blocks published products without cover or fallback", () => {
    const dataset: ParsedInputDataset = {
      source: { type: "local-files", pathLabel: "data/dry-run/input/test", approvedBy: "manual", containsSensitiveData: false },
      records: { products: [{ file: "products.csv", lineNumber: 2, values: { sku: "SKU-001" } }] },
      issues: []
    };
    const data: NormalizedDryRunData = {
      categories: [],
      products: [
        {
          sku: "SKU-001",
          slug: "sku-001",
          name: "Produto",
          categorySlug: "perfumes",
          priceCents: 1000,
          stockQuantity: 1,
          status: "published",
          publishedAt: "2026-01-01T03:00:00.000Z",
          description: null,
          brand: null
        }
      ],
      productImages: [],
      inventory: [],
      coupons: [],
      shippingRules: [{ ruleCode: "BR", name: "Brasil", uf: null, postalCodeStart: "00000000", postalCodeEnd: "99999999", priceCents: 1000, estimatedDays: 5, isActive: true, priority: 1 }],
      issues: []
    };

    const report = reconcileDryRunData(dataset, data);

    expect(report.summary.goNoGo).toBe("no-go");
    expect(report.divergences.some((divergence) => divergence.message.includes("capa"))).toBe(true);
  });
});
