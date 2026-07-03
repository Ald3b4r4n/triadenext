import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const cwd = process.cwd();
const tsxCli = join(cwd, "node_modules", "tsx", "dist", "cli.mjs");
const cliEntry = join(cwd, "src", "features", "staging-import", "cli.ts");

if (!existsSync(tsxCli)) {
  console.error("tsx local nao encontrado. Rode pnpm install antes da importacao staging.");
  process.exitCode = 1;
} else {
  const result = spawnSync(process.execPath, [tsxCli, cliEntry, ...process.argv.slice(2)], {
    cwd,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    shell: false
  });

  if (result.error) {
    console.error(result.error.message);
  }

  if (result.stdout) {
    process.stdout.write(result.stdout);
  }

  if (result.stderr) {
    process.stderr.write(result.stderr);
  }

  process.exitCode = result.status ?? 1;
}
