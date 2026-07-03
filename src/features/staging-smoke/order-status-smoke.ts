import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export function runOrderStatusSmoke(preflight: StagingSmokePreflight): { checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] } {
  const webhookPending = preflight.issues.some((issue) => issue.code === "STRIPE_TEST_WEBHOOK_PENDING");
  const issues: StagingSmokeIssue[] = [];

  if (webhookPending) {
    issues.push(
      pendingConfigIssue({
        code: "ORDER_STATUS_WEBHOOK_PENDING",
        category: "orders",
        message: "Verificacao pos-pagamento fica pending-config sem webhook Stripe test."
      })
    );
  }

  return {
    issues,
    checks: [
      createCheck({
        id: "order-status",
        label: "Pedido pos-pagamento",
        category: "orders",
        status: issues.length > 0 ? "pending-config" : "passed",
        summary:
          issues.length > 0
            ? "Status de pedido pos-pagamento nao foi confirmado sem webhook test."
            : "Status de pedido pos-pagamento esta liberado para smoke staging aprovado.",
        issues
      })
    ]
  };
}
