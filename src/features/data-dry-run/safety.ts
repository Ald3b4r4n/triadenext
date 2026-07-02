import type { DryRunIssue, ParsedRecord } from "./types";

const unsafeValuePatterns = [
  /\.env\b/i,
  /\bDATABASE_URL\b/i,
  /\b[A-Z0-9_]*(SECRET|TOKEN|PRIVATE_KEY|PASSWORD)[A-Z0-9_]*\b/i,
  /\b(postgres|postgresql|mysql|mongodb|redis):\/\//i,
  /\b(sk_live|pk_live|whsec_|rk_live_)[a-z0-9_]+/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i
];

export function createIssue(input: Omit<DryRunIssue, "recommendedAction"> & Partial<Pick<DryRunIssue, "recommendedAction">>): DryRunIssue {
  return {
    recommendedAction: input.recommendedAction ?? "corrigir-origem",
    ...input
  };
}

export function hasUnsafeValue(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  const text = String(value);
  return unsafeValuePatterns.some((pattern) => pattern.test(text));
}

export function redactUnsafeValue(value: string) {
  return hasUnsafeValue(value) ? "[REDACTED_UNSAFE_VALUE]" : value;
}

export function scanPathForUnsafeValue(pathLabel: string): DryRunIssue[] {
  if (!hasUnsafeValue(pathLabel)) {
    return [];
  }

  return [
    createIssue({
      code: "UNSAFE_INPUT",
      severity: "CRITICAL",
      goLiveImpact: "bloqueador",
      message: "Caminho de entrada sugere secret, .env ou provider real.",
      field: "path",
      recommendedAction: "corrigir-origem"
    })
  ];
}

export function scanRecordsForUnsafeValues(records: ParsedRecord[], entity?: DryRunIssue["entity"]) {
  const issues: DryRunIssue[] = [];

  for (const record of records) {
    for (const [field, value] of Object.entries(record.values)) {
      if (!hasUnsafeValue(field) && !hasUnsafeValue(value)) {
        continue;
      }

      issues.push(
        createIssue({
          code: "UNSAFE_INPUT",
          entity,
          severity: "CRITICAL",
          goLiveImpact: "bloqueador",
          message: "Valor de entrada sugere secret, .env, URL real de banco ou credencial.",
          field,
          row: record.lineNumber,
          recommendedAction: "corrigir-origem"
        })
      );
    }
  }

  return issues;
}

export function recordsContainUnsafeValues(records: ParsedRecord[]) {
  return records.some((record) =>
    Object.entries(record.values).some(([field, value]) => hasUnsafeValue(field) || hasUnsafeValue(value))
  );
}
