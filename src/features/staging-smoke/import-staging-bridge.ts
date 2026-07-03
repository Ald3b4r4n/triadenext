import { createCheck } from "./result";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export function bridgeStagingImportSmoke(preflight: StagingSmokePreflight): { checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] } {
  const issues: StagingSmokeIssue[] = [];

  if (preflight.approvedInput.status === "pending-input") {
    return {
      issues,
      checks: [
        createCheck({
          id: "import-staging-bridge",
          label: "Bridge ops:check-staging-import-smoke",
          category: "import-staging",
          status: "pending-input",
          summary: "Bridge nao executado sem arquivos aprovados; nenhum banco foi conectado.",
          issues
        })
      ]
    };
  }

  if (!preflight.config.importSmokeUrlPresent) {
    return {
      issues,
      checks: [
        createCheck({
          id: "import-staging-bridge",
          label: "Bridge ops:check-staging-import-smoke",
          category: "import-staging",
          status: "skipped",
          summary: "STAGING_IMPORT_SMOKE_URL ausente; bridge opcional fica skipped.",
          issues
        })
      ]
    };
  }

  return {
    issues,
    checks: [
      createCheck({
        id: "import-staging-bridge",
        label: "Bridge ops:check-staging-import-smoke",
        category: "import-staging",
        status: "passed",
        summary: "Bridge opcional esta pronto para ser executado com ambiente aprovado.",
        issues
      })
    ]
  };
}
