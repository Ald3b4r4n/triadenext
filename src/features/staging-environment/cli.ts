import { decideStagingGoNoGo } from "./go-no-go";
import { combineEnvironmentStatus } from "./readiness";
import { buildStagingEnvironmentReport } from "./report";
import { writeStagingEnvironmentReport } from "./report-output";
import { runStagingEnvironmentSmoke } from "./smoke-orchestrator";
main().catch(() => {
  console.error("Readiness staging falhou de forma controlada.");
  process.exitCode = 1;
});

async function main() {
  const args = process.argv.slice(2);
  const read = (name: string) => {
    const index = args.indexOf(name);
    return index >= 0 ? args[index + 1] : undefined;
  };
  const execute = args.includes("--execute-smoke");
  const result = await runStagingEnvironmentSmoke({
    cwd: process.cwd(),
    env: process.env,
    target: read("--target"),
    allowNetwork: execute && args.includes("--allow-network"),
    executeRequested: execute,
    confirmStaging: args.includes("--confirm-staging"),
    humanApprovalRef: read("--approval-ref"),
    smokeApprovalRef: read("--smoke-approval-ref")
  });
  const checks = [
    ...result.inventory.checks,
    result.smoke.gate.check,
    result.admin.check
  ];
  const issues = [
    ...result.inventory.issues,
    ...result.smoke.gate.issues,
    ...result.admin.issues
  ];
  const status = combineEnvironmentStatus(checks, issues);
  const rollbackConfirmed = args.includes("--rollback-confirmed");
  const decision = decideStagingGoNoGo({
    checks,
    issues,
    rollbackConfirmed,
    finalHumanApproval: args.includes("--final-approval")
  });
  const report = buildStagingEnvironmentReport({
    target: result.inventory.target,
    status,
    decision,
    checks,
    issues,
    nextActions: result.inventory.nextActions,
    safety: result.safety,
    databaseRollbackConfirmed: rollbackConfirmed
  });
  const files = writeStagingEnvironmentReport(report, {
    cwd: process.cwd(),
    outputDir: read("--output")
  });
  console.log("Readiness do ambiente staging concluída.");
  console.log(`Status: ${report.status}`);
  console.log(`Decisão: ${report.decision}`);
  console.log(`Relatórios sanitizados: ${files.length}.`);
  console.log("Nenhuma URL ou credencial foi impressa.");
  if (report.status === "blocked" || report.status === "failed")
    process.exitCode = 1;
}
