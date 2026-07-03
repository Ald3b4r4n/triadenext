import type { StagingImportIssue } from "./types";

const sensitiveNamePattern = /\b(database_url|secret|token|private_key|password|stripe_secret|webhook_secret|blob_read_write_token)\b/i;
const sensitiveValuePatterns = [
  /\b(postgres|postgresql|mysql|mongodb|redis):\/\//i,
  /\bDATABASE_URL\b/i,
  /\b[A-Z0-9_]*(SECRET|TOKEN|PRIVATE_KEY|PASSWORD)[A-Z0-9_]*\b/i,
  /\b(sk_live|pk_live|rk_live_|whsec_)[a-z0-9_]+/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i
];

export function hasSensitiveName(value: string) {
  return sensitiveNamePattern.test(value);
}

export function hasSensitiveValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  const text = String(value);
  return sensitiveValuePatterns.some((pattern) => pattern.test(text));
}

export function redactSensitiveValue(value: string) {
  if (hasSensitiveName(value) || hasSensitiveValue(value)) {
    return "[REDACTED]";
  }

  return value;
}

export function sanitizeForReport<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (key, current) => {
      if (hasSensitiveName(key)) {
        return "[REDACTED]";
      }

      return typeof current === "string" ? redactSensitiveValue(current) : current;
    })
  ) as T;
}

export function createSecurityIssue(input: Pick<StagingImportIssue, "code" | "message"> & Partial<StagingImportIssue>): StagingImportIssue {
  return {
    severity: "CRITICAL",
    origin: "humana",
    entity: "security",
    recommendedAction: "corrigir-origem",
    blocksImport: true,
    ...input
  };
}

export function findSecretLikeOutput(value: unknown): StagingImportIssue[] {
  const serialized = JSON.stringify(value);

  if (!hasSensitiveValue(serialized)) {
    return [];
  }

  return [
    createSecurityIssue({
      code: "SECRET_REDACTED",
      message: "Conteudo operacional contem valor com aparencia de secret e precisa ser redigido."
    })
  ];
}
