import { createEnvironmentCheck, pendingConfigIssue } from "./readiness";
import type { StagingEnvironmentEnv } from "./types";

export function checkAdminLoginSmokeReadiness(
  env: StagingEnvironmentEnv = process.env
) {
  const hasMaster = (env.ADMIN_MASTER_EMAILS ?? "")
    .toLowerCase()
    .split(/[;,\n]/)
    .map((item) => item.trim())
    .includes("rafasouzacruz@gmail.com");
  const authConfigured = Boolean(
    env.BETTER_AUTH_SECRET?.trim() && env.BETTER_AUTH_URL?.trim()
  );
  const issues =
    hasMaster && authConfigured
      ? []
      : [
          pendingConfigIssue({
            code: "ADMIN_LOGIN_PENDING",
            category: "auth",
            message:
              "Login master staging aguarda auth e allowlist; nenhuma credencial foi utilizada."
          })
        ];
  return {
    issues,
    check: createEnvironmentCheck({
      id: "admin-master-login",
      provider: "auth",
      label: "Login admin master staging",
      status: issues.length > 0 ? "pending-config" : "passed",
      summary:
        issues.length > 0
          ? issues[0].message
          : "Auth e allowlist master declarados; login real depende do smoke aprovado.",
      issues
    })
  };
}
