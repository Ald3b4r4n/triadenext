import { connectApprovedStagingDatabase } from "./staging-db";
import { buildStagingImportPlan } from "./import-plan";
import { executeStagingImport } from "./importer";
import { runStagingImportPreflight } from "./preflight";
import { writePostImportReports, writePreImportReport } from "./report-writer";
import { parseBooleanFlag, resolveStagingProvider } from "./environment";
import type { ReportFormat } from "@/features/data-dry-run/types";
import type {
  StagingEnv,
  StagingImportCliOptions,
  StagingWriteMode
} from "./types";

export async function runStagingImportCli(
  argv = process.argv.slice(2),
  env: StagingEnv = process.env
) {
  const options = parseArgs(argv);
  const preflight = runStagingImportPreflight({ ...options, env });
  const preFiles = writePreImportReport(preflight, {
    cwd: options.cwd,
    outputDir: options.outputDir
  });

  if (preflight.status !== "planned" || options.mode === "check") {
    printSummary(preflight.status, [...preFiles]);
    return preflight.status === "blocked" ? 1 : 0;
  }

  const plan = buildStagingImportPlan({
    cwd: options.cwd,
    inputDir: options.inputDir
  });
  const store = connectApprovedStagingDatabase({ preflight, env });
  const execution = await executeStagingImport({
    preflight,
    plan,
    store,
    options
  });
  const postFiles = writePostImportReports(execution, {
    cwd: options.cwd,
    outputDir: options.outputDir
  });

  printSummary(execution.status, [...preFiles, ...postFiles]);
  return execution.status === "blocked" ||
    execution.status === "no-go" ||
    execution.status === "rollback-required"
    ? 1
    : 0;
}

export function parseArgs(args: string[]): StagingImportCliOptions {
  const parsed: StagingImportCliOptions = {
    cwd: process.cwd(),
    mode: "check",
    provider: "neon",
    format: "both",
    backupConfirmed: false,
    allowReset: false
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    const next = args[index + 1];

    if (arg === "--target") {
      parsed.target = next;
      index += 1;
      continue;
    }

    if (arg.startsWith("--target=")) {
      parsed.target = arg.slice("--target=".length);
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

    if (arg === "--mode") {
      parsed.mode = parseMode(next);
      index += 1;
      continue;
    }

    if (arg.startsWith("--mode=")) {
      parsed.mode = parseMode(arg.slice("--mode=".length));
      continue;
    }

    if (arg === "--provider") {
      parsed.provider = resolveStagingProvider(next);
      index += 1;
      continue;
    }

    if (arg === "--confirm-staging") {
      parsed.confirmStaging = next;
      index += 1;
      continue;
    }

    if (arg === "--human-approval") {
      parsed.humanApprovalRef = next;
      index += 1;
      continue;
    }

    if (arg === "--dry-run-approval") {
      parsed.dryRunApprovalRef = next;
      index += 1;
      continue;
    }

    if (arg === "--backup-confirmed") {
      parsed.backupConfirmed = true;
      continue;
    }

    if (arg.startsWith("--backup-confirmed=")) {
      parsed.backupConfirmed = parseBooleanFlag(
        arg.slice("--backup-confirmed=".length)
      );
      continue;
    }

    if (arg === "--allow-reset") {
      parsed.allowReset = true;
      continue;
    }

    if (arg === "--format") {
      parsed.format = parseFormat(next);
      index += 1;
      continue;
    }
  }

  return parsed;
}

function parseMode(value: string | undefined): StagingWriteMode {
  if (value === "check" || value === "upsert" || value === "reset-and-upsert") {
    return value;
  }
  throw new Error("Modo inválido. Use check, upsert ou reset-and-upsert.");
}

function parseFormat(value: string | undefined): ReportFormat {
  if (value === "json" || value === "markdown" || value === "both") {
    return value;
  }
  throw new Error("Formato inválido. Use json, markdown ou both.");
}

function printSummary(status: string, files: string[]) {
  console.log(`Approved staging import: ${status}`);
  console.log(
    "Nenhum valor de secret, DATABASE_URL, token ou credencial foi impresso."
  );
  console.log(
    `Relatórios: ${files.map((file) => file.replace(/\\/g, "/")).join(", ") || "nenhum"}`
  );
}

if (process.argv[1]?.endsWith("cli.ts")) {
  runStagingImportCli()
    .then((code) => {
      process.exitCode = code;
    })
    .catch((error) => {
      console.error(
        error instanceof Error
          ? error.message
          : "Falha desconhecida na importação staging."
      );
      process.exitCode = 1;
    });
}
