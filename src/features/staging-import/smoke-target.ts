import type { StagingEnv } from "./types";
import { detectProductionSignals } from "./production-guard";

export interface StagingSmokeTarget {
  url: URL;
  stripeMode: "test";
}

export function resolveStagingSmokeTarget(input: { url?: string; env?: StagingEnv } = {}): StagingSmokeTarget {
  const rawUrl = input.url ?? input.env?.STAGING_IMPORT_SMOKE_URL;

  if (!rawUrl) {
    throw new Error("STAGING_IMPORT_SMOKE_URL ausente; smoke staging fica pendente.");
  }

  const url = new URL(rawUrl);

  if (!["http:", "https:"].includes(url.protocol)) {
    throw new Error("Smoke staging exige URL http ou https.");
  }

  if (url.username || url.password) {
    throw new Error("URL de smoke staging nao pode conter credenciais.");
  }

  const guard = detectProductionSignals({
    target: "staging",
    labels: {
      "smoke-url": url.toString(),
      "stripe-mode": input.env?.STRIPE_MODE ?? "test"
    },
    env: input.env
  });

  if (!guard.allowed) {
    throw new Error("Smoke staging bloqueado por sinal de producao ou secret.");
  }

  if ((input.env?.STRIPE_MODE ?? "test") !== "test") {
    throw new Error("Smoke staging exige Stripe/test mode.");
  }

  return { url, stripeMode: "test" };
}
