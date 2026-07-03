import type { EntityWriteSummary, StagingImportPlan, StagingImportStore } from "./types";

export async function upsertCatalog(store: StagingImportStore, plan: StagingImportPlan): Promise<EntityWriteSummary[]> {
  const before = await store.countEntities();
  const results = [];

  for (const category of plan.entities.categories) {
    results.push(await store.upsertCategory(category));
  }

  for (const product of plan.entities.products) {
    results.push(await store.upsertProduct(product));
    results.push(await store.ensureProductCategory(product.sku, product.categorySlug));
  }

  const after = await store.countEntities();

  return [
    summarizeEntity("categories", plan.entities.categories.length, before.categories, after.categories, results),
    summarizeEntity("products", plan.entities.products.length, before.products, after.products, results)
  ];
}

function summarizeEntity(
  entity: EntityWriteSummary["entity"],
  input: number,
  before: number,
  after: number,
  results: Array<{ entity: string; status: string }>
): EntityWriteSummary {
  const scoped = results.filter((result) => result.entity === entity);
  return {
    entity,
    input,
    before,
    after,
    inserted: scoped.filter((result) => result.status === "inserted").length,
    updated: scoped.filter((result) => result.status === "updated").length,
    skipped: scoped.filter((result) => result.status === "skipped").length
  };
}
