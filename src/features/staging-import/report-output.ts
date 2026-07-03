import { existsSync, mkdirSync } from "node:fs";
import { isAbsolute, join, relative, resolve } from "node:path";
import { sanitizeForReport } from "./safety";

export const STAGING_IMPORT_OUTPUT_ROOT = "data/dry-run/output";

export function resolveStagingImportOutputDir(cwd = process.cwd(), outputDir = STAGING_IMPORT_OUTPUT_ROOT) {
  const resolved = isAbsolute(outputDir) ? resolve(outputDir) : resolve(cwd, outputDir);
  const allowedRoot = resolve(cwd, STAGING_IMPORT_OUTPUT_ROOT);
  const rel = relative(allowedRoot, resolved);

  if (rel.startsWith("..") || isAbsolute(rel)) {
    throw new Error("Relatorios staging precisam ficar dentro de data/dry-run/output/.");
  }

  return resolved;
}

export function ensureStagingReportDir(cwd: string, status: string, outputDir?: string) {
  const root = resolveStagingImportOutputDir(cwd, outputDir);
  const dir = join(root, `staging-import-${sanitizeSegment(status)}`);
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function sanitizeReportObject<T>(value: T): T {
  return sanitizeForReport(value);
}

function sanitizeSegment(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "default";
}
