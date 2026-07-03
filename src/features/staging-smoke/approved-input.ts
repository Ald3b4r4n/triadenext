import { inspectApprovedStagingInput } from "@/features/staging-import/input";
import { createCheck, pendingInputIssue } from "./result";
import type { ApprovedStagingSmokeInput, StagingSmokeIssue } from "./types";

export function inspectApprovedStagingSmokeInput(options: { cwd?: string; inputDir?: string } = {}): {
  input: ApprovedStagingSmokeInput;
  check: ReturnType<typeof createCheck>;
  issues: StagingSmokeIssue[];
} {
  const inspected = inspectApprovedStagingInput(options);
  const input: ApprovedStagingSmokeInput = {
    status: inspected.discovery.status,
    pathLabel: inspected.summary.pathLabel,
    expectedFiles: inspected.summary.expectedFiles
  };
  const issues: StagingSmokeIssue[] = [];

  if (input.status === "pending-input") {
    issues.push(
      pendingInputIssue({
        code: "APPROVED_INPUT_PENDING",
        category: "import-staging",
        message: "Arquivos aprovados ausentes ou incompletos para import staging smoke."
      })
    );
  }

  return {
    input,
    issues,
    check: createCheck({
      id: "approved-input",
      label: "Arquivos aprovados para import staging",
      category: "import-staging",
      status: input.status === "ready" ? "passed" : "pending-input",
      summary:
        input.status === "ready"
          ? "Arquivos aprovados encontrados para smoke opcional de import staging."
          : "Arquivos aprovados ausentes; import staging smoke fica pendente.",
      issues
    })
  };
}
