import { beforeEach, describe, expect, it, vi } from "vitest";

const { requireAuthenticatedMock, saveCustomerAccountDataMock } = vi.hoisted(() => ({
  requireAuthenticatedMock: vi.fn(),
  saveCustomerAccountDataMock: vi.fn()
}));

vi.mock("@/features/auth/server/policies", () => ({
  requireAuthenticated: requireAuthenticatedMock,
  policyMessage: vi.fn(() => "Sessão ausente ou expirada. Faça login para continuar.")
}));

vi.mock("@/features/account/server/account-repository", () => ({
  getCustomerAccountData: vi.fn(),
  saveCustomerAccountData: saveCustomerAccountDataMock
}));

vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { saveCustomerAccountAction } from "@/features/account/server/account-actions";

const idleState = { status: "idle" as const, message: "" };

function validFormData() {
  const formData = new FormData();
  formData.set("fullName", "Cliente Teste");
  formData.set("phone", "(61) 98888-7777");
  formData.set("documentType", "cpf");
  formData.set("documentNumber", "111.444.777-35");
  formData.set("birthDate", "1990-01-01");
  formData.set("recipient", "Cliente Teste");
  formData.set("postalCode", "73340-506");
  formData.set("state", "DF");
  formData.set("city", "Brasília");
  formData.set("district", "Centro");
  formData.set("street", "Rua de Teste");
  formData.set("number", "10");
  formData.set("complement", "Casa");
  return formData;
}

describe("ações dos dados cadastrais", () => {
  beforeEach(() => vi.clearAllMocks());

  it("confirma ao cliente quando os dados são persistidos", async () => {
    requireAuthenticatedMock.mockResolvedValue({ status: "allowed", userId: "user-1" });
    saveCustomerAccountDataMock.mockResolvedValue({
      status: "success",
      message: "Dados cadastrais e endereço principal atualizados."
    });

    await expect(saveCustomerAccountAction(idleState, validFormData())).resolves.toEqual({
      status: "success",
      message: "Dados cadastrais e endereço principal atualizados."
    });
  });

  it("retorna erro legível sem expor a falha interna", async () => {
    requireAuthenticatedMock.mockResolvedValue({ status: "allowed", userId: "user-1" });
    saveCustomerAccountDataMock.mockRejectedValue(new Error("database secret detail"));

    const result = await saveCustomerAccountAction(idleState, validFormData());
    expect(result).toEqual({
      status: "error",
      message: "Não foi possível salvar seus dados agora. Tente novamente em instantes."
    });
    expect(result.message).not.toContain("database");
  });

  it("informa a validação antes de tentar persistir", async () => {
    requireAuthenticatedMock.mockResolvedValue({ status: "allowed", userId: "user-1" });
    const invalid = validFormData();
    invalid.set("postalCode", "123");

    await expect(saveCustomerAccountAction(idleState, invalid)).resolves.toMatchObject({
      status: "error",
      message: "Informe um CEP válido."
    });
    expect(saveCustomerAccountDataMock).not.toHaveBeenCalled();
  });
});
