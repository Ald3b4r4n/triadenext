import { hasSensitiveValue } from "./safety";
import type { StagingEnv, StagingImportIssue, StagingTarget } from "./types";

const productionWords = ["production", "prod", "live", "go-live", "go_live"];
const productionHostFragments = [
  "triadeessenzaparfum.com.br",
  "www.triadeessenzaparfum.com.br",
  "triade-essenza.com.br"
];

export interface ProductionGuardInput {
  target?: string | null;
  labels?: Record<string, string | undefined | null>;
  env?: StagingEnv;
}

export interface ProductionGuardResult {
  allowed: boolean;
  productionBlocked: boolean;
  issues: StagingImportIssue[];
}

export function detectProductionSignals(input: ProductionGuardInput): ProductionGuardResult {
  const issues: StagingImportIssue[] = [];

  if (input.target && !isNonProductionTarget(input.target)) {
    issues.push(productionIssue("PRODUCTION_BLOCKED", "Alvo informado nao e staging, preview ou remote-dev."));
  }

  for (const [label, value] of Object.entries(input.labels ?? {})) {
    if (!value) {
      continue;
    }

    if (hasProductionWord(label) || hasProductionWord(value) || hasProductionHost(value)) {
      issues.push(
        productionIssue(
          "PRODUCTION_BLOCKED",
          `Sinal de producao detectado em ${label}. O valor foi omitido por seguranca.`
        )
      );
    }

    if (label !== "connection-string" && hasSensitiveValue(value)) {
      issues.push(
        productionIssue(
          "SECRET_REDACTED",
          `Valor sensivel detectado em ${label}. O valor foi omitido por seguranca.`
        )
      );
    }
  }

  const env: StagingEnv = input.env ?? {};
  if (env.VERCEL_ENV === "production" || env.NODE_ENV === "production") {
    issues.push(
      productionIssue(
        "PRODUCTION_BLOCKED",
        "Ambiente runtime indica producao. Importacao staging abortada antes de conectar."
      )
    );
  }

  return {
    allowed: issues.length === 0,
    productionBlocked: issues.some((issue) => issue.code === "PRODUCTION_BLOCKED"),
    issues
  };
}

export function isNonProductionTarget(value: string): value is StagingTarget {
  return value === "staging" || value === "preview" || value === "remote-dev";
}

function hasProductionWord(value: string) {
  const normalized = value.toLowerCase();
  return productionWords.some((word) => normalized === word || normalized.includes(`-${word}`) || normalized.includes(`${word}-`));
}

function hasProductionHost(value: string) {
  try {
    const url = new URL(value);
    return productionHostFragments.some((fragment) => url.hostname.toLowerCase() === fragment);
  } catch {
    return productionHostFragments.some((fragment) => value.toLowerCase().includes(fragment));
  }
}

function productionIssue(code: "PRODUCTION_BLOCKED" | "SECRET_REDACTED", message: string): StagingImportIssue {
  return {
    code,
    severity: "CRITICAL",
    origin: "humana",
    entity: "environment",
    message,
    recommendedAction: "corrigir-origem",
    blocksImport: true
  };
}
