import type { ShippingProvider } from "./types";

export type FutureProviderName = Exclude<ShippingProvider, "manual">;

export type FutureProviderQuoteRequest = {
  postalCode: string;
  cartHash: string;
  destinationState?: string | null;
};

export type FutureProviderQuoteResponse = {
  provider: FutureProviderName;
  quoteId: string;
  amountCents: number;
  estimatedDays: number | null;
};

export const futureShippingProviders: Record<FutureProviderName, { active: false; name: FutureProviderName }> = {
  correios: { active: false, name: "correios" },
  jadlog: { active: false, name: "jadlog" },
  melhor_envio: { active: false, name: "melhor_envio" }
};
