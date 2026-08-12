import "server-only";

import type { CartView } from "@/features/cart/types";
import type { Product } from "@/features/products/types";
import type { ShippingOption } from "../types";

type MelhorEnvioConfig = {
  baseUrl: string;
  token: string;
  userAgent: string;
  originPostalCode: string;
  defaults: {
    width: number;
    height: number;
    length: number;
    weight: number;
  };
};

type MelhorEnvioProduct = {
  id: string;
  width: number;
  height: number;
  length: number;
  weight: number;
  insurance_value: number;
  quantity: number;
};

type MelhorEnvioResponseItem = {
  id?: number | string;
  name?: string;
  custom_price?: string | number;
  price?: string | number;
  custom_delivery_time?: number;
  delivery_time?: number;
  error?: string;
  company?: { name?: string };
};

export type MelhorEnvioQuoteResult =
  | { status: "success"; options: ShippingOption[] }
  | { status: "not_configured" }
  | { status: "unavailable"; message: string };

export function getMelhorEnvioConfig(): MelhorEnvioConfig | null {
  const baseUrl = process.env.MELHOR_ENVIO_BASE_URL?.trim();
  const token = process.env.MELHOR_ENVIO_TOKEN?.trim();
  const userAgent = process.env.MELHOR_ENVIO_USER_AGENT?.trim();
  const originPostalCode = process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE?.replace(/\D/g, "");

  if (!baseUrl || !token || !userAgent || originPostalCode?.length !== 8) {
    return null;
  }

  return {
    baseUrl: baseUrl.replace(/\/$/, ""),
    token,
    userAgent,
    originPostalCode,
    defaults: {
      width: positiveEnvNumber("MELHOR_ENVIO_DEFAULT_WIDTH_CM", 11),
      height: positiveEnvNumber("MELHOR_ENVIO_DEFAULT_HEIGHT_CM", 17),
      length: positiveEnvNumber("MELHOR_ENVIO_DEFAULT_LENGTH_CM", 11),
      weight: positiveEnvNumber("MELHOR_ENVIO_DEFAULT_WEIGHT_KG", 0.5)
    }
  };
}

export async function quoteWithMelhorEnvio(input: {
  cart: CartView;
  products: Product[];
  destinationPostalCode: string;
  fetchImpl?: typeof fetch;
}): Promise<MelhorEnvioQuoteResult> {
  const config = getMelhorEnvioConfig();
  if (!config) {
    return { status: "not_configured" };
  }

  const products = buildProducts(input.cart, input.products, config);
  if (products.length === 0) {
    return { status: "unavailable", message: "O carrinho não possui produtos válidos para cotação." };
  }

  try {
    const response = await (input.fetchImpl ?? fetch)(
      `${config.baseUrl}/api/v2/me/shipment/calculate`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.token}`,
          "User-Agent": config.userAgent,
          Accept: "application/json",
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          from: { postal_code: config.originPostalCode },
          to: { postal_code: input.destinationPostalCode },
          products,
          options: { receipt: false, own_hand: false }
        }),
        signal: AbortSignal.timeout(12_000)
      }
    );

    if (!response.ok) {
      return { status: "unavailable", message: "O Melhor Envio não respondeu à cotação." };
    }

    const payload: unknown = await response.json();
    const options = mapOptions(payload);
    return options.length > 0
      ? { status: "success", options }
      : { status: "unavailable", message: "Nenhum serviço do Melhor Envio atende este CEP." };
  } catch {
    return { status: "unavailable", message: "Não foi possível consultar o Melhor Envio." };
  }
}

function buildProducts(cart: CartView, products: Product[], config: MelhorEnvioConfig) {
  const byId = new Map(products.map((product) => [product.id, product]));
  return cart.items.flatMap<MelhorEnvioProduct>((item) => {
    const product = byId.get(item.productId);
    if (!product) return [];

    return [{
      id: product.sku,
      width: config.defaults.width,
      height: config.defaults.height,
      length: config.defaults.length,
      weight: config.defaults.weight,
      insurance_value: product.priceCents / 100,
      quantity: item.quantity
    }];
  });
}

function mapOptions(payload: unknown): ShippingOption[] {
  if (!Array.isArray(payload)) return [];

  return payload.flatMap<ShippingOption>((raw: MelhorEnvioResponseItem) => {
    if (raw.error || raw.id === undefined) return [];
    const price = Number(raw.custom_price ?? raw.price);
    if (!Number.isFinite(price) || price < 0) return [];

    const carrier = raw.company?.name?.trim();
    const service = raw.name?.trim() || "Serviço de entrega";
    return [{
      id: `melhor-envio-${raw.id}`,
      label: carrier ? `${carrier} — ${service}` : service,
      priceCents: Math.round(price * 100),
      estimatedDays: raw.custom_delivery_time ?? raw.delivery_time ?? null,
      provider: "melhor_envio",
      source: "melhor_envio",
      ruleId: null
    }];
  }).sort((a, b) => a.priceCents - b.priceCents || (a.estimatedDays ?? 999) - (b.estimatedDays ?? 999));
}

function positiveEnvNumber(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}
