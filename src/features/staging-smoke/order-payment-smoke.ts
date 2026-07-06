import { createCheck, pendingConfigIssue } from "./result";
import type {
  StagingSmokeCheck,
  StagingSmokeIssue,
  StagingSmokePreflight
} from "./types";

export function runOrderPaymentGate(preflight: StagingSmokePreflight): {
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
} {
  const stripeBlocking = preflight.issues.filter(
    (issue) => issue.category === "stripe" || issue.category === "webhook"
  );
  const issues: StagingSmokeIssue[] = [];

  if (
    !preflight.target ||
    !preflight.config.allowNetwork ||
    !preflight.config.humanApprovalRef
  ) {
    issues.push(
      pendingConfigIssue({
        code: "ORDER_PAYMENT_SMOKE_PENDING",
        category: "payment",
        message:
          "Smoke de pedido/pagamento exige URL staging, --allow-network e aprovação humana."
      })
    );
  }

  issues.push(...stripeBlocking);

  const blocked = issues.some((issue) => issue.blocksGoLive);
  return {
    issues,
    checks: [
      createCheck({
        id: "order-payment-gate",
        label: "Gate pedido/pagamento",
        category: "payment",
        status: blocked
          ? "blocked"
          : issues.length > 0
            ? "pending-config"
            : "passed",
        summary:
          issues.length > 0
            ? "Pedido/pagamento teste pendente de staging aprovado e Stripe test/webhook."
            : "Pedido/pagamento teste possui pré-condições declaradas.",
        issues
      })
    ]
  };
}
