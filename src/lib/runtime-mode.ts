import { sensitiveRuntimeEnv } from "./env";

export const runtimeMessages = {
  databaseMissing:
    "Catálogo em modo demonstrativo seguro enquanto a base definitiva não está conectada.",
  devFallbackCreate:
    "Produto validado em modo demonstrativo seguro. A gravação definitiva depende da configuração de produção.",
  devFallbackUpdate:
    "Produto validado em modo demonstrativo seguro. A atualização definitiva depende da configuração de produção.",
  blockedMutation:
    "Alteração bloqueada neste ambiente. Acesso administrativo real é obrigatório para gravar dados.",
  authNotReady:
    "Autenticação administrativa real indisponível neste ambiente.",
  unauthenticated: "Sessao ausente ou expirada. Faca login para continuar.",
  forbidden: "Acesso negado para esta operacao.",
  adminWithoutAuth:
    "Painel protegido por auth/policies reais. Mutacoes exigem sessao admin ou manager.",
  blobMissing: "Upload definitivo indisponível neste ambiente.",
  persistedCreate: "Produto criado em Neon/Drizzle.",
  persistedUpdate: "Produto atualizado em Neon/Drizzle.",
  imageMetadataPersisted: "Metadata de imagem persistida em Neon/Drizzle."
  ,
  cartFallbackNotPersisted:
    "Carrinho em modo seguro de demonstração; revise tudo antes de finalizar um pedido real.",
  cartUnavailable:
    "Carrinho temporariamente indisponível neste ambiente.",
  cartProductUnavailable: "Produto indisponivel para compra.",
  cartInsufficientStock: "Quantidade solicitada acima do estoque disponivel.",
  cartForbidden: "Acesso negado ao carrinho solicitado.",
  cartUpdated: "Carrinho atualizado.",
  checkoutUnauthenticated: "Faca login ou crie sua conta para iniciar o checkout.",
  checkoutUnavailable:
    "Checkout indisponível neste ambiente. Nenhum pedido real foi criado.",
  checkoutFallback:
    "Pedido pendente criado em modo demonstrativo seguro.",
  checkoutValidationError: "Nao foi possivel criar o pedido pendente com os dados informados.",
  orderForbidden: "Pedido indisponivel para este usuario.",
  orderReadUnavailable: "Leitura de pedidos temporariamente indisponível neste ambiente."
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
