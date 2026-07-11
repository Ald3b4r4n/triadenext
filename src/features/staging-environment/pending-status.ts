import { createEnvironmentCheck, pendingConfigIssue } from "./readiness";
import type { StagingProvider } from "./types";

export function createPendingProviderResult(input: {
  id: string;
  provider: StagingProvider;
  label: string;
  code: string;
  message: string;
  nextAction: string;
  kind?: "pending-config" | "pending-input";
}) {
  const status = input.kind ?? "pending-config";
  const issue = pendingConfigIssue({
    code: input.code,
    category: input.provider,
    message: input.message
  });
  return {
    issues: [issue],
    check: createEnvironmentCheck({
      id: input.id,
      provider: input.provider,
      label: input.label,
      status,
      summary: input.message,
      issues: [issue],
      nextActions: [input.nextAction]
    })
  };
}
