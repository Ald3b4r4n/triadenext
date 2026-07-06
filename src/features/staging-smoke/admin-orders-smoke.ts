import { createCheck } from "./result";
import {
  createRemoteSmokeContext,
  inspectHtml,
  type StagingSmokeExecutionOptions
} from "./storefront-smoke";
import type {
  StagingSmokeCheck,
  StagingSmokeIssue,
  StagingSmokePreflight
} from "./types";

export async function runAdminOrdersSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "admin-orders",
          label: "Pedidos admin",
          category: "orders",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const orders = await context.fetcher(
    new URL("/admin/pedidos", context.baseUrl)
  );
  const issues = inspectHtml(orders, {
    forbidden: ["DATABASE_URL", "STRIPE_SECRET", "BLOB_READ_WRITE_TOKEN"],
    category: "orders"
  });

  return {
    issues,
    checks: [
      createCheck({
        id: "admin-orders",
        label: "Pedidos admin",
        category: "orders",
        status: issues.length > 0 ? "failed" : "passed",
        summary:
          issues.length > 0
            ? "Pedidos admin falhou ou expôs conteúdo sensível."
            : "Pedidos admin respondeu sem secrets.",
        issues
      })
    ]
  };
}
