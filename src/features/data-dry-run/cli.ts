import { formatDryRunSummary, runDataDryRun } from "./run-dry-run";
import type { ReportFormat } from "./types";

interface CliArgs {
  inputDir?: string;
  outputDir?: string;
  format: ReportFormat;
}

function parseArgs(args: string[]): CliArgs {
  const parsed: CliArgs = { format: "both" };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];

    if (arg === "--input") {
      parsed.inputDir = args[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--input=")) {
      parsed.inputDir = arg.slice("--input=".length);
      continue;
    }

    if (arg === "--output") {
      parsed.outputDir = args[index + 1];
      index += 1;
      continue;
    }

    if (arg.startsWith("--output=")) {
      parsed.outputDir = arg.slice("--output=".length);
      continue;
    }

    if (arg === "--format") {
      parsed.format = parseFormat(args[index + 1]);
      index += 1;
      continue;
    }

    if (arg.startsWith("--format=")) {
      parsed.format = parseFormat(arg.slice("--format=".length));
    }
  }

  return parsed;
}

function parseFormat(value: string | undefined): ReportFormat {
  if (value === "json" || value === "markdown" || value === "both") {
    return value;
  }
  throw new Error("Formato deve ser json, markdown ou both.");
}

try {
  const args = parseArgs(process.argv.slice(2));
  const result = runDataDryRun({
    inputDir: args.inputDir,
    outputDir: args.outputDir,
    format: args.format,
    writeReport: true
  });
  console.log(formatDryRunSummary(result));
  process.exitCode = result.report.summary.goNoGo === "no-go" ? 1 : 0;
} catch (error) {
  console.error(error instanceof Error ? error.message : "Falha desconhecida no dry-run controlado.");
  process.exitCode = 1;
}
