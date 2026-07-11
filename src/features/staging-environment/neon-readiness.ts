import { hasEnvValue } from "./config";
import { createEnvironmentCheck } from "./readiness";
import { createPendingProviderResult } from "./pending-status";
import type { StagingEnvironmentConfig, StagingEnvironmentEnv } from "./types";

export function checkNeonStagingReadiness(input: {
  env?: StagingEnvironmentEnv;
  config: StagingEnvironmentConfig;
}) {
  const env = input.env ?? process.env;
  const connectionPresent = hasEnvValue(env, "STAGING_DATABASE_URL");
  const roleDeclared = hasEnvValue(env, "STAGING_DATABASE_ROLE");
  const targetAllowed = ["staging", "preview", "remote-dev"].includes(
    input.config.target
  );

  if (!connectionPresent || !targetAllowed) {
    const pending = createPendingProviderResult({
      id: "neon-staging",
      provider: "neon",
      label: "Neon staging/dev",
      code: "NEON_STAGING_PENDING",
      message:
        "Neon staging/dev ainda não está configurado e aprovado; nenhuma conexão foi aberta.",
      nextAction: "Criar ou aprovar um projeto/branch Neon isolado com restore."
    });
    return { connectionPresent, roleDeclared, targetAllowed, ...pending };
  }

  return {
    connectionPresent,
    roleDeclared,
    targetAllowed,
    issues: [],
    check: createEnvironmentCheck({
      id: "neon-staging",
      provider: "neon",
      label: "Neon staging/dev",
      status: "passed",
      summary:
        "Neon staging/dev possui configuração declarada; conexão continua condicionada a gate humano.",
      nextActions: roleDeclared
        ? []
        : ["Documentar a role mínima usada pelo ambiente staging."]
    })
  };
}
