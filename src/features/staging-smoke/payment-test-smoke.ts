import { createCheck, pendingConfigIssue } from "./result";
import type {
  StagingSmokeCheck,
  StagingSmokeIssue,
  StagingSmokePreflight
} from "./types";

export function runPaymentTestSmoke(preflight: StagingSmokePreflight): {
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
} {
  const hasStripePending = preflight.issues.some(
    (issue) => issue.category === "stripe" || issue.category === "webhook"
  );
  const issues: StagingSmokeIssue[] = [];

  if (hasStripePending) {
    issues.push(
      pendingConfigIssue({
        code: "PAYMENT_TEST_PENDING",
        category: "payment",
        message:
          "Pagamento teste staging fica pending-config até Stripe test keys e webhook test estarem presentes."
      })
    );
  }

  return {
    issues,
    checks: [
      createCheck({
        id: "payment-test",
        label: "Pagamento teste",
        category: "payment",
        status: issues.length > 0 ? "pending-config" : "passed",
        summary:
          issues.length > 0
            ? "Pagamento teste não foi executado sem Stripe test/webhook."
            : "Pagamento teste pode ser executado em staging aprovado.",
        issues
      })
    ]
  };
}
