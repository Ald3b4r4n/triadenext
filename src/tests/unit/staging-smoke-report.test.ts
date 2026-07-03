import { mkdtempSync } from "node:fs";
import { readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { runStagingSmokeReadiness } from "@/features/staging-smoke/report-orchestrator";
import { createGoLiveChecklist, createStagingSmokeReport, writeStagingSmokeReports } from "@/features/staging-smoke/report-writer";

function createTempCwd() {
  return mkdtempSync(join(tmpdir(), "triade-staging-smoke-report-"));
}

describe("staging smoke reports", () => {
  it("orchestrates report checks without database connection or migration", async () => {
    const result = await runStagingSmokeReadiness({
      cwd: createTempCwd(),
      env: {
        STAGING_SMOKE_URL: "https://staging.example.test",
        STAGING_DATABASE_URL: "postgres://user:pass@staging.example/db"
      }
    });

    expect(result.preflight.config.urlPresent).toBe(true);
    expect(result.preflight.config.importSmokeUrlPresent).toBe(false);
    expect(result.safety.databaseUrlPrinted).toBe(false);
    expect(result.safety.realMigration).toBe(false);
    expect(result.checks.some((check) => check.id === "neon-staging")).toBe(true);
  });

  it("writes sanitized reports into data/dry-run/output", async () => {
    const cwd = createTempCwd();
    const result = await runStagingSmokeReadiness({
      cwd,
      env: {
        STAGING_SMOKE_URL: "https://staging.example.test",
        STRIPE_WEBHOOK_SECRET: "whsec_should_not_be_printed"
      }
    });
    const files = writeStagingSmokeReports(result, { cwd });
    const combined = files.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(files).toHaveLength(3);
    expect(combined).not.toContain("whsec_should_not_be_printed");
    expect(combined).toContain("Staging Smoke Report");
  });

  it("creates go-live checklist as human approval artifact, not go-live execution", async () => {
    const result = await runStagingSmokeReadiness({
      cwd: createTempCwd(),
      env: {}
    });
    const checklist = createGoLiveChecklist(createStagingSmokeReport(result));

    expect(checklist.requiredBeforeGoLive.join(" ")).toContain("Aprovacao humana");
    expect(checklist.abortCriteria.join(" ")).toContain("Stripe live mode");
  });
});
