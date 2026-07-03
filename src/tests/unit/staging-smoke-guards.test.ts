import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runStagingSmokeReadiness } from "@/features/staging-smoke/report-orchestrator";
import { createStagingSmokeReport } from "@/features/staging-smoke/report-writer";
import { detectProductionSignals } from "@/features/staging-smoke/production-guard";
import { redactSensitiveValue } from "@/features/staging-smoke/safety";

function createTempCwd() {
  return mkdtempSync(join(tmpdir(), "triade-staging-smoke-"));
}

describe("staging smoke guards", () => {
  it("returns pending-config and pending-input locally without external config", async () => {
    const result = await runStagingSmokeReadiness({
      cwd: createTempCwd(),
      env: {}
    });

    expect(result.status).toBe("pending-config");
    expect(result.goNoGo).toBe("pending-config");
    expect(result.checks.some((check) => check.status === "pending-input")).toBe(true);
    expect(result.safety.productionConnectionAttempted).toBe(false);
    expect(result.safety.realMigration).toBe(false);
  });

  it("blocks production URL before remote smoke can run", () => {
    const guard = detectProductionSignals({
      labels: {
        "smoke-url": "https://triadeessenzaparfum.com.br"
      },
      env: {}
    });

    expect(guard.allowed).toBe(false);
    expect(guard.productionBlocked).toBe(true);
    expect(guard.issues.some((issue) => issue.code === "PRODUCTION_BLOCKED")).toBe(true);
  });

  it("blocks Stripe live mode and does not leak secret-like values in reports", async () => {
    const result = await runStagingSmokeReadiness({
      cwd: createTempCwd(),
      env: {
        STAGING_SMOKE_URL: "https://staging.example.test",
        STRIPE_SECRET_KEY: "sk_live_should_not_be_printed",
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_should_not_be_printed"
      }
    });
    const report = createStagingSmokeReport(result);
    const serialized = JSON.stringify(report);

    expect(result.status).toBe("blocked");
    expect(serialized).not.toContain("sk_live_should_not_be_printed");
    expect(serialized).not.toContain("pk_live_should_not_be_printed");
    expect(redactSensitiveValue("DATABASE_URL=postgres://user:pass@example/db")).toBe("[REDACTED]");
  });
});
