import { loadApprovedStagingInput } from "./input";
import { sanitizeForReport } from "./safety";

export function summarizeApprovedInput(options: { cwd?: string; inputDir?: string } = {}) {
  const loaded = loadApprovedStagingInput(options);
  return sanitizeForReport(loaded.summary);
}
