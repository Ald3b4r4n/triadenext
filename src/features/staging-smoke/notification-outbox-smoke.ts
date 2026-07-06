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

export async function runNotificationOutboxSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "notifications-outbox",
          label: "Notificacoes/outbox",
          category: "notifications",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const adminOrders = await context.fetcher(
    new URL("/admin/pedidos", context.baseUrl)
  );
  const issues = inspectHtml(adminOrders, {
    forbidden: ["DATABASE_URL", "STRIPE_SECRET", "WHATSAPP", "SMS"],
    category: "notifications"
  });

  return {
    issues,
    checks: [
      createCheck({
        id: "notifications-outbox",
        label: "Notificacoes/outbox",
        category: "notifications",
        status: issues.length > 0 ? "failed" : "passed",
        summary:
          issues.length > 0
            ? "Área de pedidos/notificações falhou ou expôs conteúdo proibido."
            : "Area de pedidos/notificacoes respondeu sem envio real e sem canal externo proibido.",
        issues
      })
    ]
  };
}
