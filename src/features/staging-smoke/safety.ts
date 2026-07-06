import type { StagingSmokeIssue } from "./types";

const sensitiveNamePattern =
  /\b(database_url|secret|token|private_key|password|stripe_secret|webhook_secret|blob_read_write_token|auth_secret)\b/i;

const sensitiveValuePatterns = [
  /\b(postgres|postgresql|mysql|mongodb|redis):\/\//i,
  /\bDATABASE_URL\b/i,
  /\b[A-Z0-9_]*(SECRET|TOKEN|PRIVATE_KEY|PASSWORD)[A-Z0-9_]*\b/i,
  /\b(sk_live|pk_live|rk_live_|whsec_|sk_test|pk_test)[a-z0-9_]+/i,
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
  return hasSensitiveName(value) || hasSensitiveValue(value)
    ? "[REDACTED]"
    : value;
}

export function sanitizeForStagingSmokeReport<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (key, current) => {
      if (hasSensitiveName(key)) {
        return "[REDACTED]";
      }

      return typeof current === "string"
        ? redactSensitiveValue(current)
        : current;
    })
  ) as T;
}

export function createSecurityIssue(
  input: Pick<StagingSmokeIssue, "code" | "message"> &
    Partial<StagingSmokeIssue>
): StagingSmokeIssue {
  return {
    severity: "CRITICAL",
    origin: "humana",
    category: "security",
    blocksGoLive: true,
    ...input
  };
}

export function findSecretLikeOutput(value: unknown): StagingSmokeIssue[] {
  const serialized = JSON.stringify(value);

  if (!hasSensitiveValue(serialized)) {
    return [];
  }

  return [
    createSecurityIssue({
      code: "SECRET_REDACTED",
      message:
        "Conteúdo operacional contém valor com aparência de secret e precisa ser redigido."
    })
  ];
}
