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

export async function runAdminSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "admin-protected",
          label: "Admin protegido",
          category: "admin",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const admin = await context.fetcher(new URL("/admin", context.baseUrl));
  const issues = inspectHtml(admin, {
    forbidden: [
      "DATABASE_URL",
      "STRIPE_SECRET",
      "BLOB_READ_WRITE_TOKEN",
      "secret",
      "token"
    ],
    category: "admin"
  });

  return {
    issues,
    checks: [
      createCheck({
        id: "admin-protected",
        label: "Admin protegido",
        category: "admin",
        status: issues.length > 0 ? "failed" : "passed",
        summary:
          issues.length > 0
            ? "Admin staging expôs conteúdo sensível ou falhou."
            : "Admin staging respondeu sem exposicao de secrets; auth/redirect protegido e aceitavel.",
        issues
      })
    ]
  };
}
