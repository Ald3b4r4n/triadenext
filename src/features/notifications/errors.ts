const sensitivePatterns = [
  /api[_-]?key\s*[:=]\s*\S+/gi,
  /password\s*[:=]\s*\S+/gi,
  /secret\s*[:=]\s*\S+/gi,
  /token\s*[:=]\s*\S+/gi,
  /bearer\s+\S+/gi,
  /whsec_\S+/gi,
  /sk_(?:live|test)_\S+/gi
];

export function sanitizeNotificationError(error: unknown) {
  const raw = error instanceof Error ? error.message : "Falha desconhecida no provider de e-mail.";
  let safe = raw.slice(0, 500);
  for (const pattern of sensitivePatterns) {
    safe = safe.replace(pattern, "[redacted]");
  }
  return safe || "Falha segura no provider de e-mail.";
}
