import { spawnSync } from "node:child_process";
import { expect, test } from "@playwright/test";

test.describe("Fase 18 staging environment", () => {
  test("returns pending-config offline without remote effects", () => {
    const env: NodeJS.ProcessEnv = { ...process.env, NODE_ENV: "test" };
    for (const name of [
      "STAGING_SMOKE_URL",
      "STAGING_DATABASE_URL",
      "STRIPE_SECRET_KEY",
      "STRIPE_WEBHOOK_SECRET",
      "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    ]) {
      delete env[name];
    }
    const result = spawnSync(
      process.execPath,
      ["scripts/ops/check-staging-environment.mjs"],
      {
        cwd: process.cwd(),
        env,
        encoding: "utf8",
        shell: false
      }
    );
    const output = `${result.stdout ?? ""}\n${result.stderr ?? ""}`;

    expect(result.status).toBe(0);
    expect(output).toContain("Status: pending-config");
    expect(output).toContain("Decisão: no-go");
    expect(output).toContain("Nenhuma URL ou credencial foi impressa");
    expect(output).not.toContain("postgres://");
  });

  test("remote smoke remains opt-in", async ({ page }) => {
    const url = process.env.STAGING_SMOKE_URL;
    const approved = Boolean(
      url &&
      process.env.STAGING_SMOKE_APPROVAL &&
      process.env.STAGING_HUMAN_APPROVAL
    );
    test.skip(
      !approved,
      "Smoke remoto exige URL e aprovações staging explícitas."
    );

    await page.goto(url ?? "http://127.0.0.1:3000", { waitUntil: "commit" });
    await expect(page).toHaveTitle(/Tríade Essenza Parfum/i);
  });
});
