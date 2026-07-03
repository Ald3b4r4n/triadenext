import { describe, expect, it } from "vitest";
import { detectProductionSignals } from "@/features/staging-import/production-guard";
import { redactSensitiveValue } from "@/features/staging-import/safety";
import { runStagingImportPreflight } from "@/features/staging-import/preflight";

describe("staging import production guards", () => {
  it("blocks production targets before any connection", () => {
    const result = detectProductionSignals({
      target: "production",
      labels: {
        host: "https://triadeessenzaparfum.com.br"
      },
      env: {}
    });

    expect(result.allowed).toBe(false);
    expect(result.productionBlocked).toBe(true);
    expect(result.issues.some((issue) => issue.code === "PRODUCTION_BLOCKED")).toBe(true);
  });

  it("redacts secret-looking values", () => {
    expect(redactSensitiveValue("DATABASE_URL=postgres://user:pass@example/db")).toBe("[REDACTED]");
    expect(redactSensitiveValue("staging")).toBe("staging");
  });

  it("preflight blocks production runtime without printing env values", () => {
    const preflight = runStagingImportPreflight({
      cwd: process.cwd(),
      target: "staging",
      mode: "check",
      env: {
        NODE_ENV: "production",
        STAGING_DATABASE_URL: "postgres://user:pass@production.example/db"
      }
    });

    expect(preflight.status).toBe("blocked");
    expect(JSON.stringify(preflight)).not.toContain("user:pass");
    expect(preflight.productionBlocked).toBe(true);
  });
});
