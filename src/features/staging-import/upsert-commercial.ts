import type { EntityWriteSummary, StagingImportPlan, StagingImportStore } from "./types";

export async function upsertCommercialRules(store: StagingImportStore, plan: StagingImportPlan): Promise<EntityWriteSummary[]> {
  const before = await store.countEntities();
  const results = [];

  for (const coupon of plan.entities.coupons) {
    results.push(await store.upsertCoupon(coupon));
  }

  for (const rule of plan.entities.shippingRules) {
    results.push(await store.upsertShippingRule(rule));
  }

  const after = await store.countEntities();

  return [
    summarizeEntity("coupons", plan.entities.coupons.length, before.coupons, after.coupons, results),
    summarizeEntity("shippingRules", plan.entities.shippingRules.length, before.shippingRules, after.shippingRules, results)
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
