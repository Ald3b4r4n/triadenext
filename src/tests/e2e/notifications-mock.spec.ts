import { expect, test } from "@playwright/test";
import { expectAdminProtected } from "./helpers";

test("notification surfaces stay protected and do not expose resend or external channels", async ({
  page
}) => {
  await page.goto("/admin/pedidos");

  await expectAdminProtected(page);
  await expect(page.getByRole("button", { name: /reenviar/i })).toHaveCount(0);
  await expect(page.getByRole("link", { name: /reenviar/i })).toHaveCount(0);
  await expect(page.getByText(/whatsapp|sms|bling|nf-e/i)).toHaveCount(0);
});

test("client payment return cannot trigger a paid notification", async ({
  page
}) => {
  await page.goto("/pedidos/example/pagamento", { waitUntil: "commit" });

  await expect(
    page.getByText(/notificacao enviada|e-mail enviado/i)
  ).toHaveCount(0);
  await expect(
    page.getByText(
      /Pedido indisponivel|Concluir pagamento|Entre para continuar|Login/
    )
  ).toBeVisible();
});
