import { hasEnvValue } from "./config";
import { createEnvironmentCheck } from "./readiness";
import { createPendingProviderResult } from "./pending-status";
import type { StagingEnvironmentConfig, StagingEnvironmentEnv } from "./types";

export function checkVercelStagingReadiness(input: {
  env?: StagingEnvironmentEnv;
  config: StagingEnvironmentConfig;
}) {
  const env = input.env ?? process.env;
  const projectPresent = hasEnvValue(
    env,
    "VERCEL_PROJECT_ID",
    "VERCEL_ORG_ID",
    "VERCEL"
  );
  const urlPresent = hasEnvValue(
    env,
    "STAGING_SMOKE_URL",
    "STAGING_PREVIEW_URL",
    "PREVIEW_SMOKE_URL"
  );
  const targetAllowed = ["staging", "preview", "remote-dev"].includes(
    input.config.target
  );

  if (!projectPresent || !urlPresent || !targetAllowed) {
    const pending = createPendingProviderResult({
      id: "vercel-preview",
      provider: "vercel",
      label: "Vercel Preview/staging",
      code: "VERCEL_STAGING_PENDING",
      message:
        "Vercel Preview/staging ainda não possui projeto, target e URL aprovados; nenhum deploy foi tentado.",
      nextAction: "Concluir o checklist Vercel staging fora do Git."
    });
    return { projectPresent, urlPresent, targetAllowed, ...pending };
  }

  return {
    projectPresent,
    urlPresent,
    targetAllowed,
    issues: [],
    check: createEnvironmentCheck({
      id: "vercel-preview",
      provider: "vercel",
      label: "Vercel Preview/staging",
      status: "passed",
      summary:
        "Vercel Preview/staging possui configuração declarada; nenhuma URL ou identificação foi impressa."
    })
  };
}
