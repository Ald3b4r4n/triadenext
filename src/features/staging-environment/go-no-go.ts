import type {
  StagingEnvironmentCheck,
  StagingEnvironmentIssue,
  StagingGoNoGo
} from "./types";
export function decideStagingGoNoGo(input: {
  checks: StagingEnvironmentCheck[];
  issues?: StagingEnvironmentIssue[];
  rollbackConfirmed?: boolean;
  finalHumanApproval?: boolean;
}): StagingGoNoGo {
  const requiredNotPassed = input.checks.some(
    (check) => check.required && check.status !== "passed"
  );
  const blocker = (input.issues ?? []).some((issue) => issue.blocksExecution);
  return !requiredNotPassed &&
    !blocker &&
    input.rollbackConfirmed === true &&
    input.finalHumanApproval === true
    ? "go"
    : "no-go";
}
