import { sensitiveRuntimeEnv } from "./env";

export const runtimeMessages = {
  databaseMissing:
    "Modo sem banco: DATABASE_URL ausente. O sistema usa fixtures de desenvolvimento e nao grava persistencia real.",
  devFallbackCreate:
    "Produto validado, mas nao persistido: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle.",
  devFallbackUpdate:
    "Produto validado, mas nao atualizado em banco: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle.",
  blockedMutation:
    "Mutacao real bloqueada: ate a Fase 4 de auth/policies, gravacoes reais so podem ocorrer em desenvolvimento/local-dev.",
  adminWithoutAuth:
    "Painel sem autenticacao real: use mutacoes reais somente em desenvolvimento/local-dev ate a Fase 4.",
  blobMissing: "Upload real bloqueado: BLOB_READ_WRITE_TOKEN nao esta configurado.",
  persistedCreate: "Produto criado em Neon/Drizzle.",
  persistedUpdate: "Produto atualizado em Neon/Drizzle.",
  imageMetadataPersisted: "Metadata de imagem persistida em Neon/Drizzle."
} as const;

export type RuntimeMode = {
  hasDatabase: boolean;
  hasBlobToken: boolean;
  appEnvironment: "development" | "test" | "preview" | "production";
  canMutateRealData: boolean;
  isFallbackMode: boolean;
  databaseNotice: string | null;
  adminAuthNotice: string | null;
};

export function getRuntimeMode(): RuntimeMode {
  const appEnvironment = resolveAppEnvironment();
  const canMutateRealData = appEnvironment === "development" || appEnvironment === "test";

  return {
    hasDatabase: sensitiveRuntimeEnv.hasDatabaseUrl,
    hasBlobToken: sensitiveRuntimeEnv.hasBlobToken,
    appEnvironment,
    canMutateRealData,
    isFallbackMode: !sensitiveRuntimeEnv.hasDatabaseUrl,
    databaseNotice: sensitiveRuntimeEnv.hasDatabaseUrl ? null : runtimeMessages.databaseMissing,
    adminAuthNotice: sensitiveRuntimeEnv.hasDatabaseUrl ? runtimeMessages.adminWithoutAuth : null
  };
}

export function assertCanMutateRealData() {
  const mode = getRuntimeMode();

  if (!mode.canMutateRealData) {
    return {
      allowed: false as const,
      message: runtimeMessages.blockedMutation
    };
  }

  return {
    allowed: true as const,
    message: null
  };
}

function resolveAppEnvironment(): RuntimeMode["appEnvironment"] {
  if (process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production") {
    return "production";
  }

  if (process.env.VERCEL_ENV === "preview") {
    return "preview";
  }

  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  return "development";
}
