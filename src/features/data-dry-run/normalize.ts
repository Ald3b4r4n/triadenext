import { normalizeCategories } from "./normalizers/categories";
import { normalizeCoupons } from "./normalizers/coupons";
import { normalizeProductImages } from "./normalizers/images";
import { normalizeInventory } from "./normalizers/inventory";
import { normalizeProducts } from "./normalizers/products";
import { normalizeShippingRules } from "./normalizers/shipping";
import type { NormalizedDryRunData, NormalizedInventoryItem, NormalizedProduct, ParsedInputDataset } from "./types";

export function normalizeDryRunDataset(dataset: ParsedInputDataset): NormalizedDryRunData {
  const categories = normalizeCategories(dataset.records.categories ?? []);
  const inventory = normalizeInventory(dataset.records.inventory ?? []);
  const hasInventoryInput = (dataset.records.inventory?.length ?? 0) > 0;
  const products = normalizeProducts(dataset.records.products ?? [], {
    requireStockQuantity: !hasInventoryInput,
    validatePublishedStock: !hasInventoryInput
  });
  const productImages = normalizeProductImages(dataset.records.productImages ?? []);
  const coupons = normalizeCoupons(dataset.records.coupons ?? []);
  const shippingRules = normalizeShippingRules(dataset.records.shippingRules ?? []);
  const productsWithInventory = applyInventoryToProducts(products.records, inventory.records);

  return {
    categories: categories.records,
    products: productsWithInventory,
    productImages: productImages.records,
    inventory: inventory.records,
    coupons: coupons.records,
    shippingRules: shippingRules.records,
    issues: [
      ...dataset.issues,
      ...categories.issues,
      ...products.issues,
      ...productImages.issues,
      ...inventory.issues,
      ...coupons.issues,
      ...shippingRules.issues
    ]
  };
}

function applyInventoryToProducts(products: NormalizedProduct[], inventory: NormalizedInventoryItem[]) {
  if (inventory.length === 0) {
    return products;
  }

  const inventoryBySku = new Map(inventory.map((item) => [item.productSku, item]));

  return products.map((product) => {
    const inventoryItem = inventoryBySku.get(product.sku);
    if (!inventoryItem) {
      return product;
    }

    return {
      ...product,
      stockQuantity: inventoryItem.isAvailable ? inventoryItem.availableQuantity : 0
    };
  });
}
