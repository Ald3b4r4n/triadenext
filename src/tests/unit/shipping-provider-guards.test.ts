import { describe, expect, it } from "vitest";
import { futureShippingProviders } from "@/features/shipping/future-providers";

describe("shipping provider guards", () => {
  it("activates Melhor Envio while keeping direct carriers disabled", () => {
    expect(futureShippingProviders.correios.active).toBe(false);
    expect(futureShippingProviders.jadlog.active).toBe(false);
    expect(futureShippingProviders.melhor_envio.active).toBe(true);
  });
});
