import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
const cwd = process.cwd();
const tsxCli = join(cwd, "node_modules", "tsx", "dist", "cli.mjs");
const cliEntry = join(cwd, "src", "features", "staging-environment", "cli.ts");
if (!existsSync(tsxCli)) {
  console.error("tsx local não encontrado. Rode pnpm install antes do check.");
  process.exitCode = 1;
} else {
  const result = spawnSync(
    process.execPath,
    [tsxCli, cliEntry, ...process.argv.slice(2)],
    { cwd, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"], shell: false }
  );
  if (result.stdout) process.stdout.write(result.stdout);
  if (result.stderr) process.stderr.write(result.stderr);
  process.exitCode = result.status ?? 1;
}
