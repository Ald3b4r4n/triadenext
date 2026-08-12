import { describe, expect, it } from "vitest";
import { formatBrazilPhone, normalizeBrazilPhone } from "@/features/checkout/phone";
import { checkoutFormSchema } from "@/features/orders/schemas";

describe("checkout phone", () => {
  it("formats mobile and landline numbers with DDD", () => {
    expect(formatBrazilPhone("61982887294")).toBe("(61) 98288-7294");
    expect(formatBrazilPhone("6132887294")).toBe("(61) 3288-7294");
  });

  it("limits input and normalizes the value persisted by checkout", () => {
    expect(normalizeBrazilPhone("+55 (61) 98288-7294")).toBe("61982887294");

    const result = checkoutFormSchema.safeParse({
      fullName: "Cliente Teste",
      phone: "(61) 98288-7294",
      postalCode: "73340-506",
      state: "DF",
      city: "Brasília",
      district: "Centro",
      street: "Quadra de Teste",
      number: "10",
      complement: "",
      recipient: ""
    });

    expect(result.success).toBe(true);
    if (result.success) expect(result.data.phone).toBe("61982887294");
  });

  it("rejects phone numbers without a complete DDD and local number", () => {
    expect(
      checkoutFormSchema.safeParse({
        fullName: "Cliente Teste",
        phone: "1234",
        postalCode: "73340-506",
        state: "DF",
        city: "Brasília",
        district: "Centro",
        street: "Quadra de Teste",
        number: "10"
      }).success
    ).toBe(false);
  });
});
