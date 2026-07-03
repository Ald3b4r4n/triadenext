import { createCheck, pendingConfigIssue } from "./result";
import type { StagingSmokeConfig, StagingSmokeIssue, StagingSmokeTarget } from "./types";

export function resolveStagingSmokeTarget(config: StagingSmokeConfig): {
  target: StagingSmokeTarget | null;
  check: ReturnType<typeof createCheck>;
  issues: StagingSmokeIssue[];
} {
  const issues: StagingSmokeIssue[] = [];

  if (!config.url) {
    const issue = pendingConfigIssue({
      code: "STAGING_SMOKE_URL_PENDING",
      category: "environment",
      message: "STAGING_SMOKE_URL ou equivalente ausente; smoke real fica pendente."
    });
    issues.push(issue);
    return {
      target: null,
      issues,
      check: createCheck({
        id: "url-staging",
        label: "URL staging/preview",
        category: "environment",
        status: "pending-config",
        summary: "URL staging/preview nao informada.",
        issues
      })
    };
  }

  let url: URL;
  try {
    url = new URL(config.url);
  } catch {
    const issue: StagingSmokeIssue = {
      code: "STAGING_SMOKE_URL_INVALID",
      severity: "HIGH",
      origin: "humana",
      category: "environment",
      message: "URL staging/preview invalida.",
      blocksGoLive: true
    };
    issues.push(issue);
    return {
      target: null,
      issues,
      check: createCheck({
        id: "url-staging",
        label: "URL staging/preview",
        category: "environment",
        status: "blocked",
        summary: "URL invalida.",
        issues
      })
    };
  }

  if (!["http:", "https:"].includes(url.protocol) || url.username || url.password) {
    const issue: StagingSmokeIssue = {
      code: "STAGING_SMOKE_URL_UNSAFE",
      severity: "HIGH",
      origin: "humana",
      category: "environment",
      message: "URL staging/preview deve usar http(s) e nao pode conter credenciais.",
      blocksGoLive: true
    };
    issues.push(issue);
  }

  const status = issues.length > 0 ? "blocked" : "passed";
  return {
    target: status === "passed" ? { kind: config.target, url, source: config.urlSource ?? "provided" } : null,
    issues,
    check: createCheck({
      id: "url-staging",
      label: "URL staging/preview",
      category: "environment",
      status,
      summary: status === "passed" ? "URL staging/preview presente e sintaticamente segura." : "URL staging/preview bloqueada.",
      issues
    })
  };
}
