import { emailRecipientSchema } from "./schemas";

export function normalizeEmailRecipient(value: string) {
  return value.trim().toLowerCase();
}

export function parseAdminNotificationRecipients(value: string) {
  const unique = new Set<string>();
  for (const candidate of value.split(/[,\n;]/)) {
    const normalized = normalizeEmailRecipient(candidate);
    if (!normalized) {
      continue;
    }
    const parsed = emailRecipientSchema.safeParse(normalized);
    if (parsed.success) {
      unique.add(parsed.data);
    }
  }
  return [...unique];
}

export function isValidEmailRecipient(value: string) {
  return emailRecipientSchema.safeParse(normalizeEmailRecipient(value)).success;
}

export function maskEmailRecipient(value: string) {
  const [local, domain] = value.split("@");
  if (!local || !domain) {
    return "não configurado";
  }
  return `${local.slice(0, 2)}***@${domain}`;
}
