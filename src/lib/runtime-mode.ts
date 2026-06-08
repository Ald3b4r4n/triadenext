import { sensitiveRuntimeEnv } from "./env";

export const runtimeMessages = {
  databaseMissing:
    "Modo sem banco: DATABASE_URL ausente. O sistema usa fixtures de desenvolvimento e nao grava persistencia real.",
  devFallbackCreate:
    "Produto validado, mas nao persistido: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle.",
  devFallbackUpdate:
    "Produto validado, mas nao atualizado em banco: DATABASE_URL ausente. Persistencia real depende de Neon/Drizzle.",
  blockedMutation:
    "Mutacao real bloqueada: auth e policy admin reais sao obrigatorias para gravacoes.",
  authNotReady:
    "Auth real indisponivel: configure DATABASE_URL e BETTER_AUTH_SECRET para autenticar usuarios reais.",
  unauthenticated: "Sessao ausente ou expirada. Faca login para continuar.",
  forbidden: "Acesso negado para esta operacao.",
  adminWithoutAuth:
    "Painel protegido por auth/policies reais. Mutacoes exigem sessao admin ou manager.",
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
  hasAuthSecret: boolean;
  isAuthReady: boolean;
  isFallbackMode: boolean;
  databaseNotice: string | null;
  adminAuthNotice: string | null;
};

export function getRuntimeMode(): RuntimeMode {
  const appEnvironment = resolveAppEnvironment();
  const isAuthReady = sensitiveRuntimeEnv.hasDatabaseUrl && sensitiveRuntimeEnv.hasBetterAuthSecret;
  const canMutateRealData =
    isAuthReady && (appEnvironment === "development" || appEnvironment === "test");

  return {
    hasDatabase: sensitiveRuntimeEnv.hasDatabaseUrl,
    hasBlobToken: sensitiveRuntimeEnv.hasBlobToken,
    hasAuthSecret: sensitiveRuntimeEnv.hasBetterAuthSecret,
    isAuthReady,
    appEnvironment,
    canMutateRealData,
    isFallbackMode: !sensitiveRuntimeEnv.hasDatabaseUrl,
    databaseNotice: sensitiveRuntimeEnv.hasDatabaseUrl ? null : runtimeMessages.databaseMissing,
    adminAuthNotice: isAuthReady ? runtimeMessages.adminWithoutAuth : runtimeMessages.authNotReady
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
