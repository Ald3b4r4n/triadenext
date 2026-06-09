import type { ShippingManualRule, ShippingOption, ShippingQuote, ShippingSelection } from "./types";

const DEFAULT_EXPIRES_MINUTES = 30;

export function normalizePostalCode(input: string) {
  const digits = input.replace(/\D/g, "");
  if (digits.length !== 8) {
    throw new Error("CEP invalido.");
  }
  return digits;
}

export function formatPostalCode(postalCode: string) {
  const normalized = normalizePostalCode(postalCode);
  return `${normalized.slice(0, 5)}-${normalized.slice(5)}`;
}

export function validatePostalCode(input: string) {
  try {
    return { status: "valid" as const, postalCode: normalizePostalCode(input) };
  } catch {
    return { status: "invalid" as const, message: "CEP invalido." };
  }
}

export function normalizeUf(input: string | null | undefined) {
  if (!input) {
    return null;
  }
  const uf = input.trim().toUpperCase();
  return uf.length === 2 ? uf : null;
}

export function isRuleApplicable(rule: ShippingManualRule, destination: { postalCode: string; state?: string | null }) {
  if (!rule.isActive || rule.provider !== "manual") {
    return false;
  }

  if (rule.ruleType === "uf") {
    return !!rule.uf && normalizeUf(destination.state) === rule.uf;
  }

  if (!rule.postalCodeStart || !rule.postalCodeEnd) {
    return false;
  }

  return destination.postalCode >= rule.postalCodeStart && destination.postalCode <= rule.postalCodeEnd;
}

export function sortApplicableRules(a: ShippingManualRule, b: ShippingManualRule) {
  return b.priority - a.priority || a.priceCents - b.priceCents || a.name.localeCompare(b.name);
}

export function buildManualShippingOptions(
  rules: ShippingManualRule[],
  destination: { postalCode: string; state?: string | null }
) {
  const applicable = rules.filter((rule) => isRuleApplicable(rule, destination)).sort(sortApplicableRules);

  return applicable.map<ShippingOption>((rule) => ({
    id: `shipping-option-${rule.id}`,
    label: rule.name,
    priceCents: rule.priceCents,
    estimatedDays: rule.estimatedDays,
    provider: "manual",
    source: "manual",
    ruleId: rule.id
  }));
}

export function createShippingQuote(input: {
  cartId: string | null;
  cartHash: string;
  postalCode: string;
  options: ShippingOption[];
  source: ShippingQuote["source"];
  provider?: ShippingQuote["provider"];
  selectedOptionId?: string | null;
}): ShippingQuote {
  const now = new Date();
  return {
    id: `quote-${input.cartHash}-${input.postalCode}`,
    cartId: input.cartId,
    postalCode: input.postalCode,
    cartHash: input.cartHash,
    provider: input.provider ?? "manual",
    source: input.source,
    options: input.options,
    selectedOptionId: input.selectedOptionId ?? input.options[0]?.id ?? null,
    expiresAt: new Date(now.getTime() + DEFAULT_EXPIRES_MINUTES * 60 * 1000),
    createdAt: now,
    updatedAt: now
  };
}

export function selectShippingOption(quote: ShippingQuote, optionId: string): ShippingSelection {
  if (!quote.options.some((option) => option.id === optionId)) {
    throw new Error("Opcao de frete invalida.");
  }

  return {
    quoteId: quote.id,
    optionId,
    postalCode: quote.postalCode,
    source: quote.source
  };
}

export function isQuoteExpired(quote: Pick<ShippingQuote, "expiresAt">, now = new Date()) {
  return quote.expiresAt.getTime() <= now.getTime();
}

export function calculateShippingAmountCents(quote: ShippingQuote, selection: ShippingSelection | null) {
  if (!selection) {
    return 0;
  }

  const option = quote.options.find((item) => item.id === selection.optionId);
  return option ? option.priceCents : 0;
}

export function toShippingRuleFormInput(rule: ShippingManualRule) {
  return {
    name: rule.name,
    uf: rule.uf,
    postalCodeStart: rule.postalCodeStart,
    postalCodeEnd: rule.postalCodeEnd,
    priceCents: rule.priceCents,
    estimatedDays: rule.estimatedDays,
    priority: rule.priority,
    isActive: rule.isActive
  };
}
