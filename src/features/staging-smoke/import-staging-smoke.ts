import { createCheck } from "./result";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export function runImportStagingSmokeAvailability(preflight: StagingSmokePreflight): {
  checks: StagingSmokeCheck[];
  issues: StagingSmokeIssue[];
} {
  const issues = preflight.issues.filter((issue) => issue.category === "import-staging" || issue.category === "database");
  const blocks = issues.some((issue) => issue.blocksGoLive);

  return {
    issues,
    checks: [
      createCheck({
        id: "import-staging-availability",
        label: "Import staging smoke opcional",
        category: "import-staging",
        status: blocks ? "blocked" : preflight.approvedInput.status === "pending-input" ? "pending-input" : "passed",
        summary:
          preflight.approvedInput.status === "pending-input"
            ? "Arquivos aprovados ausentes; import staging smoke permanece pending-input."
            : "Arquivos aprovados presentes para smoke opcional de import staging.",
        issues
      })
    ]
  };
}
