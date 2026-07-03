import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { describe, expect, it } from "vitest";

const cwd = process.cwd();

describe("admin env ops scripts", () => {
  it("reports pending-config without printing configured master emails", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "triade-admin-env-"));
    const envFile = path.join(tempDir, ".env.local");
    writeFileSync(
      envFile,
      [
        "ADMIN_MASTER_EMAILS=master@example.com",
        "DATABASE_URL=",
        "BETTER_AUTH_SECRET=local-secret-value",
        "BETTER_AUTH_URL=http://localhost:3000",
        "NEXT_PUBLIC_APP_URL=http://localhost:3000"
      ].join("\n")
    );

    const result = spawnSync(process.execPath, ["scripts/ops/check-admin-env.mjs"], {
      cwd,
      encoding: "utf8",
      env: buildEnv(envFile)
    });

    rmSync(tempDir, { recursive: true, force: true });

    expect(result.status).toBe(0);
    expect(result.stdout).toContain("Status: pending-config");
    expect(result.stdout).toContain("ADMIN_MASTER_EMAILS: presente");
    expect(result.stdout).not.toContain("master@example.com");
    expect(result.stdout).not.toContain("local-secret-value");
    expect(result.stderr).toBe("");
  });

  it("blocks production-like execution without printing values", () => {
    const tempDir = mkdtempSync(path.join(tmpdir(), "triade-admin-env-"));
    const envFile = path.join(tempDir, ".env.local");
    writeFileSync(
      envFile,
      [
        "ADMIN_MASTER_EMAILS=master@example.com",
        "DATABASE_URL=postgres://user:super-secret@example.com/prod",
        "BETTER_AUTH_SECRET=local-secret-value"
      ].join("\n")
    );

    const result = spawnSync(process.execPath, ["scripts/ops/check-admin-env.mjs"], {
      cwd,
      encoding: "utf8",
      env: {
        ...buildEnv(envFile),
        NODE_ENV: "production"
      }
    });

    rmSync(tempDir, { recursive: true, force: true });

    expect(result.status).toBe(1);
    expect(result.stderr).toContain("Operacao admin bloqueada em producao.");
    expect(`${result.stdout}${result.stderr}`).not.toContain("master@example.com");
    expect(`${result.stdout}${result.stderr}`).not.toContain("super-secret");
    expect(`${result.stdout}${result.stderr}`).not.toContain("local-secret-value");
  });
});

function buildEnv(envFile: string): NodeJS.ProcessEnv {
  return {
    ...process.env,
    ADMIN_ENV_FILE: envFile,
    ADMIN_MASTER_EMAILS: "",
    DATABASE_URL: "",
    BETTER_AUTH_SECRET: "",
    BETTER_AUTH_URL: "",
    NEXT_PUBLIC_APP_URL: "",
    DEV_ADMIN_PASSWORD: "",
    STAGING_DATABASE_URL: "",
    NODE_ENV: "test" as NodeJS.ProcessEnv["NODE_ENV"],
    VERCEL_ENV: ""
  };
}
