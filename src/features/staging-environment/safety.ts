const sensitiveName =
  /(url|host|secret|token|password|cookie|private.?key|connection|database|stripe.?key|webhook)/i;
const sensitiveValue = [
  /https?:\/\//i,
  /\b(postgres|postgresql|mysql|mongodb|redis):\/\//i,
  /\b(sk|pk|rk)_(live|test)_[a-z0-9_]+/i,
  /\bwhsec_[a-z0-9_]+/i,
  /-----BEGIN [A-Z ]*PRIVATE KEY-----/i
];

export function isSensitiveName(value: string) {
  return sensitiveName.test(value);
}

export function isSensitiveValue(value: unknown) {
  if (value === null || value === undefined) return false;
  return sensitiveValue.some((pattern) => pattern.test(String(value)));
}

export function redactStagingValue(value: unknown, key = "") {
  if (isSensitiveName(key) || isSensitiveValue(value)) {
    return key.toLowerCase().includes("url") ? "[REDACTED_URL]" : "[REDACTED]";
  }
  return value;
}

export function sanitizeStagingReport<T>(value: T): T {
  return JSON.parse(
    JSON.stringify(value, (key, current) =>
      typeof current === "string" || isSensitiveName(key)
        ? redactStagingValue(current, key)
        : current
    )
  ) as T;
}

export function containsSensitiveOutput(value: unknown) {
  const serialized = JSON.stringify(value);
  return isSensitiveValue(serialized);
}
