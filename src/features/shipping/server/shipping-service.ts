import "server-only";

import { getRuntimeMode } from "@/lib/runtime-mode";
import { createShippingQuote, buildManualShippingOptions, validatePostalCode, isQuoteExpired } from "../domain";
import type { ShippingQuoteResult } from "../types";
import { createShippingRepository } from "./shipping-repository";
import { devShippingRules } from "./shipping-fixtures";

const shippingRepository = createShippingRepository();

export async function quoteShippingForCart(input: {
  cartId: string | null;
  cartHash: string;
  postalCode: string;
  destinationState?: string | null;
}): Promise<ShippingQuoteResult> {
  const validation = validatePostalCode(input.postalCode);
  if (validation.status === "invalid") {
    return { status: "validation_error", message: validation.message };
  }

  const manualRules = await shippingRepository.listManualRules();
  const rules = manualRules.length > 0 ? manualRules : devShippingRules;
  const options = buildManualShippingOptions(rules, {
    postalCode: validation.postalCode,
    state: input.destinationState
  });

  if (options.length === 0) {
    return { status: "not_found", message: "Não há cobertura manual para este CEP." };
  }

  const quote = createShippingQuote({
    cartId: input.cartId,
    cartHash: input.cartHash,
    postalCode: validation.postalCode,
    options,
    source: options.some((option) => option.source === "fixture") ? "fixture" : "manual"
  });

  return { status: "success", quote: await shippingRepository.createQuote(quote), message: "Cotação de frete calculada." };
}

export async function selectShippingQuoteOption(input: { quoteId: string; optionId: string }) {
  const quote = await shippingRepository.findQuoteById(input.quoteId);
  if (!quote) {
    return { status: "not_found" as const, message: "Cotação não encontrada." };
  }

  if (isQuoteExpired(quote)) {
    return { status: "not_found" as const, message: "Cotação expirada." };
  }

  const option = quote.options.find((item) => item.id === input.optionId);
  if (!option) {
    return { status: "validation_error" as const, message: "Opcao de frete invalida." };
  }

  const updated = await shippingRepository.selectQuoteOption(quote.id, option.id);
  return updated
    ? { status: "success" as const, quote: updated, message: "Frete selecionado." }
    : { status: "not_found" as const, message: "Cotação não encontrada." };
}

export async function removeShippingQuoteSelection(input: { quoteId: string }) {
  const quote = await shippingRepository.findQuoteById(input.quoteId);
  if (!quote) {
    return { status: "not_found" as const, message: "Cotação não encontrada." };
  }
  return {
    status: "success" as const,
    quote: { ...quote, selectedOptionId: null },
    message: "Frete removido."
  };
}

export function shippingRuntimeSummary() {
  const mode = getRuntimeMode();
  return mode.hasDatabase ? "frete manual persistido" : "frete manual em fallback dev/test";
}
