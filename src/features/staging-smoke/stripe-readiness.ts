import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeEnv, StagingSmokeIssue } from "./types";

export function checkStripeTestReadiness(env: StagingSmokeEnv = process.env) {
  const issues: StagingSmokeIssue[] = [];
  const secretPresent = Boolean(env.STRIPE_SECRET_KEY?.trim());
  const publishablePresent = Boolean(env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.trim());
  const webhookPresent = Boolean(env.STRIPE_WEBHOOK_SECRET?.trim());

  if (env.STRIPE_SECRET_KEY?.startsWith("sk_live") || env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY?.startsWith("pk_live")) {
    issues.push({
      code: "STRIPE_LIVE_BLOCKED",
      severity: "CRITICAL",
      origin: "humana",
      category: "stripe",
      message: "Stripe live mode detectado; Fase 17 aceita somente test mode.",
      blocksGoLive: true
    });
  }

  if (!secretPresent || !publishablePresent) {
    issues.push(
      pendingConfigIssue({
        code: "STRIPE_TEST_KEYS_PENDING",
        category: "stripe",
        message: "Chaves Stripe test ausentes; pagamento teste staging fica pendente."
      })
    );
  }

  if (!webhookPresent) {
    issues.push(
      pendingConfigIssue({
        code: "STRIPE_TEST_WEBHOOK_PENDING",
        category: "webhook",
        message: "Webhook Stripe test ausente; confirmacao real de pagamento fica pending-config."
      })
    );
  }

  const blocked = issues.some((issue) => issue.blocksGoLive);

  return {
    testKeysPresent: secretPresent && publishablePresent,
    webhookPresent,
    issues,
    check: createCheck({
      id: "stripe-test",
      label: "Stripe test mode/webhook",
      category: "stripe",
      status: blocked ? "blocked" : issues.length > 0 ? "pending-config" : "passed",
      summary:
        issues.length > 0
          ? "Stripe test/webhook pendente ou live mode bloqueado; nenhum pagamento real foi executado."
          : "Stripe test mode e webhook test declarados por presenca.",
      issues
    })
  };
}
