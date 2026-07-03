import { APPROVED_DRY_RUN_INPUT_DIR, DRY_RUN_OUTPUT_ROOT } from "@/features/data-dry-run/input-discovery";
import type { StagingSmokeConfig, StagingSmokeEnv, StagingSmokeTargetKind } from "./types";

const targetAliases: Record<string, StagingSmokeTargetKind> = {
  staging: "staging",
  preview: "preview",
  "remote-dev": "remote-dev",
  remotedev: "remote-dev",
  dev: "remote-dev"
};

const smokeUrlNames = ["STAGING_SMOKE_URL", "STAGING_PREVIEW_URL", "PREVIEW_SMOKE_URL"];
const importSmokeUrlNames = ["STAGING_IMPORT_SMOKE_URL"];

export function resolveStagingSmokeConfig(options: {
  cwd?: string;
  env?: StagingSmokeEnv;
  target?: string;
  url?: string;
  outputDir?: string;
  inputDir?: string;
  allowNetwork?: boolean;
  humanApprovalRef?: string;
  migrationApprovalRef?: string;
  snapshotRef?: string;
} = {}): StagingSmokeConfig {
  const env = options.env ?? process.env;
  const url = options.url ?? resolveFirstPresent(env, smokeUrlNames).value;
  const urlSource = options.url ? "--url" : resolveFirstPresent(env, smokeUrlNames).name;
  const importSmoke = resolveFirstPresent(env, importSmokeUrlNames);

  return {
    cwd: options.cwd ?? process.cwd(),
    target: resolveTarget(options.target ?? env.STAGING_SMOKE_TARGET ?? env.VERCEL_ENV),
    url: normalizeVercelUrl(url),
    urlSource,
    importSmokeUrl: normalizeVercelUrl(importSmoke.value),
    importSmokeUrlSource: importSmoke.name,
    approvedInputDir: options.inputDir ?? APPROVED_DRY_RUN_INPUT_DIR,
    outputDir: options.outputDir ?? DRY_RUN_OUTPUT_ROOT,
    allowNetwork: options.allowNetwork === true,
    humanApprovalRef: options.humanApprovalRef?.trim() || null,
    migrationApprovalRef: options.migrationApprovalRef?.trim() || null,
    snapshotRef: options.snapshotRef?.trim() || null
  };
}

export function resolveTarget(value: string | undefined): StagingSmokeTargetKind {
  if (!value) {
    return "unknown";
  }

  const normalized = value.trim().toLowerCase();
  return targetAliases[normalized] ?? "unknown";
}

function resolveFirstPresent(env: StagingSmokeEnv, names: string[]) {
  for (const name of names) {
    const value = env[name]?.trim();
    if (value) {
      return { name, value };
    }
  }

  return { name: null, value: null };
}

function normalizeVercelUrl(value: string | null) {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  return `https://${value}`;
}
