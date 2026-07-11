import { spawnSync } from "node:child_process";
import { resolveStagingEnvironmentConfig } from "./config";
import { evaluateStagingMigrationGate } from "./migration-gate";

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
  migrationApprovalRef: read("--migration-approval-ref"),
  snapshotRef: read("--snapshot-ref"),
  migrationsReviewed: args.includes("--migrations-reviewed")
});
const gate = evaluateStagingMigrationGate({ config, env: process.env });
console.log("Migration staging protegida");
console.log(`Status: ${gate.status}`);
console.log("Nenhuma URL ou credencial foi impressa.");
if (!execute) {
  console.log("Modo check: nenhuma conexão ou migration foi iniciada.");
} else if (!gate.allowed) {
  console.error("Migration staging bloqueada pelos gates obrigatórios.");
  process.exitCode = 1;
} else {
  const stagingDatabaseUrl = process.env.STAGING_DATABASE_URL?.trim();
  if (!stagingDatabaseUrl) {
    console.error(
      "Migration staging bloqueada: configuração de banco ausente."
    );
    process.exitCode = 1;
  } else {
    const result = spawnSync(
      process.platform === "win32" ? "pnpm.cmd" : "pnpm",
      ["exec", "drizzle-kit", "migrate"],
      {
        cwd: process.cwd(),
        env: { ...process.env, DATABASE_URL: stagingDatabaseUrl },
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
    .replace(/\bDATABASE_URL\b[^\n]*/gi, "DATABASE_URL [REDACTED]");
}
