import { describe, expect, it, vi } from "vitest";
import { lookupPostalCode } from "@/features/checkout/server/postal-code-service";

describe("postal-code service", () => {
  it("normalizes and maps a valid ViaCEP response", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          cep: "73340-506",
          logradouro: "Quadra de Teste",
          bairro: "Centro",
          localidade: "Brasília",
          uf: "DF"
        }),
        { status: 200, headers: { "Content-Type": "application/json" } }
      )
    );

    await expect(lookupPostalCode("73340-506", { fetcher })).resolves.toEqual({
      postalCode: "73340506",
      state: "DF",
      city: "Brasília",
      district: "Centro",
      street: "Quadra de Teste"
    });
    expect(fetcher).toHaveBeenCalledWith(
      "https://viacep.com.br/ws/73340506/json/",
      expect.objectContaining({ headers: { accept: "application/json" } })
    );
  });

  it("returns null for invalid and unknown postal codes", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ erro: true }), { status: 200 })
    );

    await expect(lookupPostalCode("123", { fetcher })).resolves.toBeNull();
    await expect(lookupPostalCode("99999-999", { fetcher })).resolves.toBeNull();
    expect(fetcher).toHaveBeenCalledOnce();
  });
});
