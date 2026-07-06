import { runStagingSmokeReadiness } from "./report-orchestrator";
import { writeStagingSmokeReports } from "./report-writer";

interface CliArgs {
  cwd: string;
  target?: string;
  url?: string;
  inputDir?: string;
  outputDir?: string;
  allowNetwork: boolean;
  humanApprovalRef?: string;
  migrationApprovalRef?: string;
  snapshotRef?: string;
  writeReport: boolean;
}

export async function runStagingSmokeCli(
  argv = process.argv.slice(2),
  env = process.env
) {
  const args = parseArgs(argv);
  const result = await runStagingSmokeReadiness({ ...args, env });
  const files = args.writeReport
    ? writeStagingSmokeReports(result, {
        cwd: args.cwd,
        outputDir: args.outputDir
      })
    : [];

  printSummary(result.status, result.goNoGo, files);
  return result.status === "blocked" || result.status === "failed" ? 1 : 0;
}

export function parseArgs(argv: string[]): CliArgs {
  const parsed: CliArgs = {
    cwd: process.cwd(),
    allowNetwork: false,
    writeReport: true
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === "--target") {
      parsed.target = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target=")) {
      parsed.target = arg.slice("--target=".length);
      continue;
    }

    if (arg === "--url") {
      parsed.url = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--url=")) {
      parsed.url = arg.slice("--url=".length);
      continue;
    }

    if (arg === "--input") {
      parsed.inputDir = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--input=")) {
      parsed.inputDir = arg.slice("--input=".length);
      continue;
    }

    if (arg === "--output") {
      parsed.outputDir = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      parsed.outputDir = arg.slice("--output=".length);
      continue;
    }

    if (arg === "--allow-network") {
      parsed.allowNetwork = true;
      continue;
    }

    if (arg === "--human-approval") {
      parsed.humanApprovalRef = next;
      index += 1;
      continue;
    }

    if (arg === "--migration-approval") {
      parsed.migrationApprovalRef = next;
      index += 1;
      continue;
    }

    if (arg === "--snapshot") {
      parsed.snapshotRef = next;
      index += 1;
      continue;
    }

    if (arg === "--no-report") {
      parsed.writeReport = false;
    }
  }

  return parsed;
}

function printSummary(status: string, goNoGo: string, files: string[]) {
  console.log(`Staging smoke readiness: ${status}`);
  console.log(`Go/no-go: ${goNoGo}`);
  console.log(
    "Nenhum deploy, migration, conexão com produção, Stripe live mode ou envio real foi executado."
  );
  console.log(
    "Nenhum valor de secret, DATABASE_URL, token ou credencial foi impresso."
  );
  console.log(
    `Relatórios: ${files.map((file) => file.replace(/\\/g, "/")).join(", ") || "desativados"}`
  );
}

if (process.argv[1]?.endsWith("cli.ts")) {
  runStagingSmokeCli()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        error instanceof Error
          ? error.message
          : "Falha desconhecida no staging smoke."
      );
      process.exitCode = 1;
    });
}
