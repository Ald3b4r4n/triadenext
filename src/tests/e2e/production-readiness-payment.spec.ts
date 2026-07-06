import { expect, test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

test("payment readiness smoke never exposes live mode, card collection or secrets", async ({
  page
}) => {
  await page.goto("/pedidos/example/pagamento", { waitUntil: "commit" });

  await expect(page.locator('input[name*="card" i]')).toHaveCount(0);
  await expect(page.locator('input[name*="secret" i]')).toHaveCount(0);
  await expect(
    page.getByText(/live mode|sk_live|whsec_|cartao real|cartão real/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(
      /Pedido indisponivel|Concluir pagamento|Entre para continuar|Login/
    )
  ).toBeVisible();
});

test("notification readiness smoke does not expose external channels or real sends", async ({
  page
}) => {
  await page.goto("/admin/pedidos", { waitUntil: "commit" });

  await expectAdminProtected(page);
  await expect(
    page.getByText(/whatsapp|sms|bling|nf-e|e-mail enviado|envio real/i)
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: /reenviar/i })).toHaveCount(0);
});
