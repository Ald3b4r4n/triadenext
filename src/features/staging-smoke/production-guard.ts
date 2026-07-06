import { hasSensitiveValue } from "./safety";
import type {
  StagingSmokeConfig,
  StagingSmokeEnv,
  StagingSmokeIssue
} from "./types";

const productionWords = ["production", "prod", "live", "go-live", "go_live"];
const productionHosts = [
  "triadeessenzaparfum.com.br",
  "www.triadeessenzaparfum.com.br",
  "triade-essenza.com.br",
  "www.triade-essenza.com.br"
];

export function detectProductionSignals(input: {
  config?: StagingSmokeConfig;
  env?: StagingSmokeEnv;
  labels?: Record<string, string | null | undefined>;
}) {
  const env = input.env ?? process.env;
  const labels = input.labels ?? {};
  const issues: StagingSmokeIssue[] = [];

  for (const [label, value] of Object.entries(labels)) {
    if (!value) {
      continue;
    }

    if (
      hasProductionWord(label) ||
      hasProductionWord(value) ||
      hasProductionHost(value)
    ) {
      issues.push(
        productionIssue(
          "PRODUCTION_BLOCKED",
          `Sinal de produção detectado em ${label}; valor omitido.`
        )
      );
    }

    if (hasSensitiveValue(value)) {
      issues.push(
        productionIssue(
          "SECRET_REDACTED",
          `Valor sensível detectado em ${label}; valor omitido.`
        )
      );
    }
  }

  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    issues.push(
      productionIssue(
        "PRODUCTION_BLOCKED",
        "Runtime indica produção; smoke staging bloqueado antes de qualquer ação externa."
      )
    );
  }

  if (
    input.config?.target === "unknown" &&
    hasProductionWord(env.VERCEL_ENV ?? "")
  ) {
    issues.push(
      productionIssue(
        "PRODUCTION_BLOCKED",
        "Target indefinido com sinal de produção no ambiente."
      )
    );
  }

  return {
    allowed: issues.length === 0,
    productionBlocked: issues.some(
      (issue) => issue.code === "PRODUCTION_BLOCKED"
    ),
    issues
  };
}

function hasProductionWord(value: string) {
  const normalized = value.toLowerCase();
  return productionWords.some(
    (word) =>
      normalized === word ||
      normalized.includes(`-${word}`) ||
      normalized.includes(`${word}-`)
  );
}

function hasProductionHost(value: string) {
  try {
    const url = new URL(value);
    return productionHosts.includes(url.hostname.toLowerCase());
  } catch {
    return productionHosts.some((host) => value.toLowerCase().includes(host));
  }
}

function productionIssue(
  code: "PRODUCTION_BLOCKED" | "SECRET_REDACTED",
  message: string
): StagingSmokeIssue {
  return {
    code,
    severity: "CRITICAL",
    origin: "humana",
    category: "security",
    message,
    blocksGoLive: true
  };
}
