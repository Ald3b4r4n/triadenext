import type { EntityWriteSummary, StagingImportPlan, StagingImportStore } from "./types";

export async function upsertAssetsAndInventory(store: StagingImportStore, plan: StagingImportPlan): Promise<EntityWriteSummary[]> {
  const before = await store.countEntities();
  const results = [];

  for (const image of plan.entities.productImages) {
    results.push(await store.upsertProductImage(image));
  }

  for (const item of plan.entities.inventory) {
    results.push(await store.upsertInventory(item));
  }

  const after = await store.countEntities();

  return [
    summarizeEntity("productImages", plan.entities.productImages.length, before.productImages, after.productImages, results),
    summarizeEntity("inventory", plan.entities.inventory.length, before.inventory, after.inventory, results)
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
