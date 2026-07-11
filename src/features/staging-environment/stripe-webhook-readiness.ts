import { hasEnvValue } from "./config";
import { createEnvironmentCheck } from "./readiness";
import { createPendingProviderResult } from "./pending-status";
import type { StagingEnvironmentEnv } from "./types";

export const REQUIRED_STRIPE_TEST_EVENTS = [
  "payment_intent.succeeded",
  "payment_intent.payment_failed",
  "payment_intent.canceled"
] as const;

export function checkStripeTestWebhook(
  env: StagingEnvironmentEnv = process.env
) {
  const webhookPresent = hasEnvValue(env, "STRIPE_WEBHOOK_SECRET");
  const endpointConfigured = hasEnvValue(env, "STAGING_SMOKE_URL");

  if (!webhookPresent || !endpointConfigured) {
    const pending = createPendingProviderResult({
      id: "stripe-webhook-test",
      provider: "stripe",
      label: "Webhook Stripe test",
      code: "STRIPE_WEBHOOK_PENDING",
      message:
        "Webhook Stripe test ainda não está completo; confirmação externa de pagamento fica pendente.",
      nextAction: "Configurar endpoint HTTPS e signing secret test fora do Git."
    });
    return { webhookPresent, endpointConfigured, ...pending };
  }

  return {
    webhookPresent,
    endpointConfigured,
    issues: [],
    check: createEnvironmentCheck({
      id: "stripe-webhook-test",
      provider: "stripe",
      label: "Webhook Stripe test",
      status: "passed",
      summary:
        "Webhook Stripe test possui configuração declarada; valores e endpoint foram omitidos."
    })
  };
}
