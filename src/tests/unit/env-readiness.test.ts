import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

const requiredEnv = [
  "DATABASE_URL",
  "BETTER_AUTH_SECRET",
  "BETTER_AUTH_URL",
  "NEXT_PUBLIC_APP_URL",
  "NEXT_PUBLIC_SITE_NAME",
  "BLOB_READ_WRITE_TOKEN",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
];

function runCheckEnv(args: string[], env: NodeJS.ProcessEnv) {
  return execFileSync(process.execPath, ["scripts/ops/check-env-readiness.mjs", ...args], {
    cwd: process.cwd(),
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"]
  });
}

describe("env readiness script", () => {
  it("reports local presence without failing or printing values", () => {
    const output = runCheckEnv([], {
      ...process.env,
      DATABASE_URL: "postgres://safe-test-value",
      STRIPE_SECRET_KEY: "sk_test_never_print"
    });

    expect(output).toContain("DATABASE_URL: presente (opcional)");
    expect(output).toContain("STRIPE_SECRET_KEY: presente (opcional)");
    expect(output).not.toContain("postgres://safe-test-value");
    expect(output).not.toContain("sk_test_never_print");
  });

  it("fails production mode when required names are absent without printing secrets", () => {
    const env = { ...process.env };
    for (const name of requiredEnv) {
      env[name] = "";
    }

    expect(() => runCheckEnv(["--production"], env)).toThrow(/Variaveis obrigatorias ausentes/);
  });
});
