import { spawnSync } from "node:child_process";
import { join } from "node:path";
import { evaluateAdminBootstrapGate } from "../../src/features/staging-environment/admin-bootstrap-gate";
import { resolveStagingEnvironmentConfig } from "../../src/features/staging-environment/config";
const args = process.argv.slice(2);
const read = (name: string) => {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : undefined;
};
const execute = args.includes("--execute");
const config = resolveStagingEnvironmentConfig({
  env: process.env,
  target: read("--target"),
  executeRequested: execute,
  confirmStaging: args.includes("--confirm-staging"),
  humanApprovalRef: read("--approval-ref"),
  adminApprovalRef: read("--admin-approval-ref")
});
const gate = evaluateAdminBootstrapGate({ config, env: process.env });
console.log("Bootstrap admin staging protegido");
console.log(`Status: ${gate.status}`);
console.log("Nenhuma URL, senha ou credencial foi impressa.");
if (!execute) console.log("Modo check: banco e auth não foram carregados.");
else if (!gate.allowed) {
  console.error("Bootstrap staging bloqueado pelos gates obrigatórios.");
  process.exitCode = 1;
} else {
  const stagingDatabaseUrl = process.env.STAGING_DATABASE_URL?.trim();
  if (!stagingDatabaseUrl) {
    console.error(
      "Bootstrap staging bloqueado: configuração de banco ausente."
    );
    process.exitCode = 1;
  } else {
    const result = spawnSync(
      process.execPath,
      [
        join(process.cwd(), "node_modules", "tsx", "dist", "cli.mjs"),
        join(process.cwd(), "scripts", "ops", "bootstrap-admin.ts")
      ],
      {
        cwd: process.cwd(),
        env: {
          ...process.env,
          DATABASE_URL: stagingDatabaseUrl,
          ADMIN_BOOTSTRAP_TARGET: "staging",
          ADMIN_ENV_FILE: ".staging-env-loading-disabled"
        },
        encoding: "utf8",
        stdio: ["ignore", "pipe", "pipe"],
        shell: false
      }
    );
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(redactOutput(result.stderr));
    process.exitCode = result.status ?? 1;
  }
}
function redactOutput(value: string) {
  return value
    .replace(/\b(postgres|postgresql):\/\/\S+/gi, "[REDACTED]")
    .replace(/\b(sk|pk|rk)_(live|test)_\S+/gi, "[REDACTED]")
    .replace(/\bwhsec_\S+/gi, "[REDACTED]");
}
