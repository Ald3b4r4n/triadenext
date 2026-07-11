import { mkdtempSync, readFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluateAdminBootstrapGate } from "@/features/staging-environment/admin-bootstrap-gate";
import { resolveStagingEnvironmentConfig } from "@/features/staging-environment/config";
import { decideStagingGoNoGo } from "@/features/staging-environment/go-no-go";
import { evaluateStagingMigrationGate } from "@/features/staging-environment/migration-gate";
import { buildStagingEnvironmentReport } from "@/features/staging-environment/report";
import { writeStagingEnvironmentReport } from "@/features/staging-environment/report-output";
import { createEnvironmentCheck } from "@/features/staging-environment/readiness";

const safeState = {
  secretsPrinted: false as const,
  urlsPrinted: false as const,
  databaseConnected: false as const,
  remoteMigrationExecuted: false as const,
  remoteBootstrapExecuted: false as const,
  deployExecuted: false as const,
  stripeLiveUsed: false as const,
  legacyTouched: false as const
};

describe("staging environment gates and report", () => {
  it("keeps migration wrapper pending in check mode", () => {
    const config = resolveStagingEnvironmentConfig({
      env: {},
      target: "staging"
    });
    const gate = evaluateStagingMigrationGate({ config, env: {} });

    expect(gate.status).toBe("pending-config");
    expect(gate.allowed).toBe(false);
  });

  it("blocks migration execution without snapshot and approvals", () => {
    const config = resolveStagingEnvironmentConfig({
      env: { STAGING_DATABASE_URL: "configured" },
      target: "staging",
      executeRequested: true,
      confirmStaging: true
    });
    const gate = evaluateStagingMigrationGate({
      config,
      env: { STAGING_DATABASE_URL: "configured" }
    });

    expect(gate.status).toBe("blocked");
    expect(gate.issues.map((issue) => issue.code)).toContain(
      "SNAPSHOT_REQUIRED"
    );
  });

  it("allows the logical migration gate only with every requirement", () => {
    const env = {
      STAGING_DATABASE_URL: "configured",
      STAGING_TARGET: "staging"
    };
    const config = resolveStagingEnvironmentConfig({
      env,
      target: "staging",
      executeRequested: true,
      confirmStaging: true,
      humanApprovalRef: "approved",
      migrationApprovalRef: "approved",
      snapshotRef: "confirmed",
      migrationsReviewed: true
    });

    expect(evaluateStagingMigrationGate({ config, env }).allowed).toBe(true);
  });

  it("requires exact master allowlist for bootstrap", () => {
    const base = {
      STAGING_DATABASE_URL: "configured",
      BETTER_AUTH_SECRET: "configured",
      BETTER_AUTH_URL: "configured",
      STAGING_TARGET: "staging"
    };
    const config = resolveStagingEnvironmentConfig({
      env: base,
      target: "staging",
      executeRequested: true,
      confirmStaging: true,
      humanApprovalRef: "approved",
      adminApprovalRef: "approved"
    });

    expect(evaluateAdminBootstrapGate({ config, env: base }).allowed).toBe(
      false
    );
    expect(
      evaluateAdminBootstrapGate({
        config,
        env: {
          ...base,
          ADMIN_MASTER_EMAILS: "rafasouzacruz@gmail.com"
        }
      }).allowed
    ).toBe(true);
  });

  it("never returns go while a required check is pending", () => {
    const pending = createEnvironmentCheck({
      id: "neon",
      provider: "neon",
      label: "Neon",
      status: "pending-config",
      summary: "Pendente."
    });
    const passed = createEnvironmentCheck({
      id: "vercel",
      provider: "vercel",
      label: "Vercel",
      status: "passed",
      summary: "Pronto."
    });

    expect(
      decideStagingGoNoGo({
        checks: [pending, passed],
        rollbackConfirmed: true,
        finalHumanApproval: true
      })
    ).toBe("no-go");
    expect(
      decideStagingGoNoGo({
        checks: [passed],
        rollbackConfirmed: true,
        finalHumanApproval: true
      })
    ).toBe("go");
  });

  it("writes reports only inside the ignored output root", () => {
    const cwd = mkdtempSync(join(tmpdir(), "triade-staging-environment-"));
    const check = createEnvironmentCheck({
      id: "env",
      provider: "environment",
      label: "Ambiente",
      status: "pending-config",
      summary: "Pendente."
    });
    const report = buildStagingEnvironmentReport({
      target: "unknown",
      status: "pending-config",
      decision: "no-go",
      checks: [check],
      issues: [],
      nextActions: [],
      safety: safeState
    });
    const files = writeStagingEnvironmentReport(report, { cwd });
    const content = files.map((file) => readFileSync(file, "utf8")).join("\n");

    expect(files).toHaveLength(2);
    expect(
      files.every(
        (file) =>
          file.includes("data\\dry-run\\output") ||
          file.includes("data/dry-run/output")
      )
    ).toBe(true);
    expect(content).not.toContain("postgres://");
  });
});
