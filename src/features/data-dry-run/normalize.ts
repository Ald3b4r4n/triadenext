import { normalizeCategories } from "./normalizers/categories";
import { normalizeCoupons } from "./normalizers/coupons";
import { normalizeProductImages } from "./normalizers/images";
import { normalizeProducts } from "./normalizers/products";
import { normalizeShippingRules } from "./normalizers/shipping";
import type { NormalizedDryRunData, ParsedInputDataset } from "./types";

export function normalizeDryRunDataset(dataset: ParsedInputDataset): NormalizedDryRunData {
  const categories = normalizeCategories(dataset.records.categories ?? []);
  const products = normalizeProducts(dataset.records.products ?? []);
  const productImages = normalizeProductImages(dataset.records.productImages ?? []);
  const coupons = normalizeCoupons(dataset.records.coupons ?? []);
  const shippingRules = normalizeShippingRules(dataset.records.shippingRules ?? []);

  return {
    categories: categories.records,
    products: products.records,
    productImages: productImages.records,
    coupons: coupons.records,
    shippingRules: shippingRules.records,
    issues: [
      ...dataset.issues,
      ...categories.issues,
      ...products.issues,
      ...productImages.issues,
      ...coupons.issues,
      ...shippingRules.issues
    ]
  };
}
