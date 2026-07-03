import { runCartCheckoutSmoke } from "./cart-checkout-smoke";
import { runCatalogSmoke } from "./catalog-smoke";
import { runStorefrontSmoke, type StagingSmokeExecutionOptions } from "./storefront-smoke";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export async function runStorefrontSmokeSuite(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const home = await runStorefrontSmoke(preflight, options);
  const catalog = await runCatalogSmoke(preflight, options);
  const cartCheckout = await runCartCheckoutSmoke(preflight, options);

  return {
    checks: [...home.checks, ...catalog.checks, ...cartCheckout.checks],
    issues: [...home.issues, ...catalog.issues, ...cartCheckout.issues]
  };
}
