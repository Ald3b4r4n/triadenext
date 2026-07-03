import { createCheck } from "./result";
import { createRemoteSmokeContext, inspectHtml, type StagingSmokeExecutionOptions } from "./storefront-smoke";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export async function runCatalogSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "catalog-product",
          label: "Catalogo e produto",
          category: "catalog",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const catalog = await context.fetcher(new URL("/produtos", context.baseUrl));
  const issues = inspectHtml(catalog, {
    required: ["Produtos"],
    forbidden: ["Reconstrucao em andamento", "Placeholder funcional"],
    category: "catalog"
  });

  return {
    issues,
    checks: [
      createCheck({
        id: "catalog-product",
        label: "Catalogo e produto",
        category: "catalog",
        status: issues.length > 0 ? "failed" : "passed",
        summary: issues.length > 0 ? "Catalogo staging falhou nos checks basicos." : "Catalogo staging respondeu com texto esperado.",
        issues
      })
    ]
  };
}
