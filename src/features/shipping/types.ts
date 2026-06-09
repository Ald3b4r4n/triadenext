export type ShippingProvider = "manual" | "melhor_envio" | "jadlog" | "correios";

export type ShippingDestination = {
  postalCode: string;
  state?: string | null;
};

export type ShippingManualRule = {
  id: string;
  name: string;
  provider: "manual";
  ruleType: "uf" | "postal_range";
  uf: string | null;
  postalCodeStart: string | null;
  postalCodeEnd: string | null;
  priceCents: number;
  estimatedDays: number | null;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ShippingOption = {
  id: string;
  label: string;
  priceCents: number;
  estimatedDays: number | null;
  provider: "manual";
  source: "manual" | "fixture" | "dev_fallback";
  ruleId: string | null;
};

export type ShippingQuote = {
  id: string;
  cartId: string | null;
  postalCode: string;
  cartHash: string;
  provider: ShippingProvider;
  source: "manual" | "fixture" | "dev_fallback";
  options: ShippingOption[];
  selectedOptionId: string | null;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

export type ShippingSelection = {
  quoteId: string;
  optionId: string;
  postalCode: string;
  source: ShippingQuote["source"];
};

export type ShippingQuoteResult =
  | { status: "success"; quote: ShippingQuote; message?: string }
  | { status: "validation_error"; message: string }
  | { status: "not_found"; message: string }
  | { status: "unavailable"; message: string }
  | { status: "forbidden"; message: string };

export type ShippingRuleMutationInput = {
  name: string;
  uf: string | null;
  postalCodeStart: string | null;
  postalCodeEnd: string | null;
  priceCents: number;
  estimatedDays: number | null;
  priority: number;
  isActive: boolean;
};
