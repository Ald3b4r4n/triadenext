import { afterEach, describe, expect, it, vi } from "vitest";
import { quoteWithMelhorEnvio } from "@/features/shipping/server/melhor-envio-client";
import { devProducts } from "@/features/products/dev/fixtures";
import type { CartView } from "@/features/cart/types";

const originalEnv = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnv };
  vi.restoreAllMocks();
});

describe("Melhor Envio client", () => {
  it("maps custom prices and delivery times without exposing credentials", async () => {
    configureEnv();
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify([
          {
            id: 1,
            name: "PAC",
            custom_price: "24.90",
            custom_delivery_time: 7,
            company: { name: "Correios" }
          },
          { id: 2, name: "Indisponível", error: "trecho não atendido" }
        ]),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    const result = await quoteWithMelhorEnvio({
      cart: cartFixture(),
      products: [devProducts[0]],
      destinationPostalCode: "01001000",
      fetchImpl: fetchMock
    });

    expect(result).toEqual({
      status: "success",
      options: [
        expect.objectContaining({
          id: "melhor-envio-1",
          label: "Correios — PAC",
          priceCents: 2490,
          estimatedDays: 7,
          provider: "melhor_envio",
          source: "melhor_envio"
        })
      ]
    });
    expect(fetchMock).toHaveBeenCalledOnce();
    const request = fetchMock.mock.calls[0][1];
    expect(request.headers.Authorization).toBe("Bearer sandbox-token");
    expect(JSON.parse(request.body).from.postal_code).toBe("71880631");
  });

  it("returns not_configured when mandatory environment variables are absent", async () => {
    delete process.env.MELHOR_ENVIO_TOKEN;
    const result = await quoteWithMelhorEnvio({
      cart: cartFixture(),
      products: [devProducts[0]],
      destinationPostalCode: "01001000",
      fetchImpl: vi.fn()
    });
    expect(result).toEqual({ status: "not_configured" });
  });

  it("returns a sanitized unavailable result on provider errors", async () => {
    configureEnv();
    const result = await quoteWithMelhorEnvio({
      cart: cartFixture(),
      products: [devProducts[0]],
      destinationPostalCode: "01001000",
      fetchImpl: vi.fn().mockResolvedValue(new Response("{}", { status: 401 }))
    });
    expect(result).toEqual({
      status: "unavailable",
      message: "O Melhor Envio não respondeu à cotação."
    });
  });
});

function configureEnv() {
  process.env.MELHOR_ENVIO_BASE_URL = "https://sandbox.melhorenvio.com.br";
  process.env.MELHOR_ENVIO_TOKEN = "sandbox-token";
  process.env.MELHOR_ENVIO_USER_AGENT = "Triade Teste (teste@example.com)";
  process.env.MELHOR_ENVIO_ORIGIN_POSTAL_CODE = "71880631";
}

function cartFixture(): CartView {
  return {
    id: "00000000-0000-4000-8000-000000000001",
    status: "active",
    owner: { kind: "guest", guestTokenPresent: true },
    currency: "BRL",
    items: [
      {
        id: "item-1",
        productId: devProducts[0].id,
        productNameSnapshot: devProducts[0].name,
        unitPriceSnapshotCents: devProducts[0].priceCents,
        quantity: 1,
        itemSubtotalCents: devProducts[0].priceCents
      }
    ],
    subtotalCents: devProducts[0].priceCents,
    appliedCouponId: null,
    coupon: null,
    discountCents: 0,
    shippingPostalCode: null,
    shippingQuoteId: null,
    shippingQuote: null,
    shippingOptions: [],
    shippingAmountCents: 0,
    partialTotalCents: devProducts[0].priceCents,
    partialTotalWithShippingCents: devProducts[0].priceCents,
    persistence: "real",
    messages: []
  };
}
