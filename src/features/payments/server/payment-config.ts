import "server-only";

import { env, sensitiveRuntimeEnv } from "@/lib/env";
import { getRuntimeMode } from "@/lib/runtime-mode";

export type PaymentRuntimeConfig =
  | {
      status: "real";
      secretKey: string;
      webhookSecret: string;
      publishableKey: string;
      message: string;
    }
  | {
      status: "mock";
      publishableKey: string;
      message: string;
    }
  | {
      status: "unavailable";
      message: string;
    };

export function getPaymentRuntimeConfig(): PaymentRuntimeConfig {
  const mode = getRuntimeMode();
  const hasStripe =
    sensitiveRuntimeEnv.hasStripeSecret &&
    sensitiveRuntimeEnv.hasStripeWebhookSecret &&
    sensitiveRuntimeEnv.hasStripePublishableKey;

  if (hasStripe) {
    return {
      status: "real",
      secretKey: env.STRIPE_SECRET_KEY,
      webhookSecret: env.STRIPE_WEBHOOK_SECRET,
      publishableKey: env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      message: "Pagamento seguro configurado."
    };
  }

  if (mode.appEnvironment === "development" || mode.appEnvironment === "test") {
    return {
      status: "mock",
      publishableKey: "pk_test_triade_mock_explicit",
      message: "Modo de teste seguro ativo: nenhuma cobrança real será feita."
    };
  }

  return {
    status: "unavailable",
    message: "Pagamento real indisponível: configure o provedor de pagamento para este ambiente."
  };
}

export function isPaymentMockEnabled() {
  return getPaymentRuntimeConfig().status === "mock";
}
