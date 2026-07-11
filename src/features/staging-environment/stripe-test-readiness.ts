import { createEnvironmentCheck, blockingIssue } from "./readiness";
import { createPendingProviderResult } from "./pending-status";
import type { StagingEnvironmentEnv } from "./types";

export function checkStripeTestEnvironment(
  env: StagingEnvironmentEnv = process.env
) {
  const secret = env.STRIPE_SECRET_KEY?.trim() ?? "";
  const publishable = env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim() ?? "";
  const mode = env.STAGING_STRIPE_MODE?.trim().toLowerCase() ?? "";
  const liveDetected =
    secret.startsWith("sk_live_") ||
    publishable.startsWith("pk_live_") ||
    mode === "live";

  if (liveDetected) {
    const issue = blockingIssue({
      code: "STRIPE_LIVE_BLOCKED",
      category: "stripe",
      message:
        "Stripe live mode detectado e bloqueado antes de qualquer chamada."
    });
    return {
      testKeysPresent: false,
      liveDetected: true,
      issues: [issue],
      check: createEnvironmentCheck({
        id: "stripe-test",
        provider: "stripe",
        label: "Stripe test mode",
        status: "blocked",
        summary: issue.message,
        issues: [issue]
      })
    };
  }

  const testKeysPresent =
    secret.startsWith("sk_test_") && publishable.startsWith("pk_test_");
  if (!testKeysPresent) {
    const pending = createPendingProviderResult({
      id: "stripe-test",
      provider: "stripe",
      label: "Stripe test mode",
      code: "STRIPE_TEST_PENDING",
      message:
        "Stripe test mode ainda não está configurado; pagamento externo permanece bloqueado.",
      nextAction: "Configurar chaves test/sandbox fora do Git."
    });
    return { testKeysPresent, liveDetected: false, ...pending };
  }

  return {
    testKeysPresent,
    liveDetected: false,
    issues: [],
    check: createEnvironmentCheck({
      id: "stripe-test",
      provider: "stripe",
      label: "Stripe test mode",
      status: "passed",
      summary: "Stripe test/sandbox foi identificado sem imprimir chaves."
    })
  };
}
