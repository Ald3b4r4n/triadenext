import { execFileSync } from "node:child_process";
import { describe, expect, it } from "vitest";

function runMigrationsCheck(env: NodeJS.ProcessEnv = process.env) {
  return execFileSync(
    process.execPath,
    ["scripts/ops/check-migrations-readiness.mjs"],
    {
      cwd: process.cwd(),
      env,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"]
    }
  );
}

describe("migration readiness script", () => {
  it("reads versioned migrations without requiring or printing DATABASE_URL", () => {
    const output = runMigrationsCheck({
      ...process.env,
      DATABASE_URL: "postgres://must-not-print"
    });

    expect(output).toContain("Readiness de migrations Drizzle");
    expect(output).toContain("0000_shallow_shinko_yamashiro.sql");
    expect(output).toContain("0007_outstanding_midnight.sql");
    expect(output).toContain("Total de migrations: 8");
    expect(output).toContain("não executa migration real");
    expect(output).not.toContain("postgres://must-not-print");
  });
});
