import "server-only";

import { getRuntimeMode } from "@/lib/runtime-mode";
import type { AppSession, AuthRole } from "./session";
import { getCurrentSession } from "./session";

export type PolicyDecision =
  | { status: "allowed"; userId: string; role: AuthRole }
  | {
      status: "unauthenticated";
      reason: "missing" | "expired" | "invalid" | "timeout" | "unavailable";
    }
  | { status: "forbidden"; reason: "insufficient_role" | "not_owner" }
  | { status: "blocked"; reason: "missing_database" | "environment_guardrail" | "auth_not_ready" };

export async function requireAuthenticated(session = getCurrentSession()) {
  const resolved = await session;
  return requireAuthenticatedSession(resolved);
}

export async function requireAdminLike(session = getCurrentSession()): Promise<PolicyDecision> {
  const mode = getRuntimeMode();

  if (!mode.hasDatabase) {
    return { status: "blocked", reason: "missing_database" };
  }

  if (!mode.isAuthReady) {
    return { status: "blocked", reason: "auth_not_ready" };
  }

  const authenticated = requireAuthenticatedSession(await session);

  if (authenticated.status !== "allowed") {
    return authenticated;
  }

  if (authenticated.role !== "admin" && authenticated.role !== "manager") {
    return { status: "forbidden", reason: "insufficient_role" };
  }

  return authenticated;
}

export async function requireCustomer(session = getCurrentSession()): Promise<PolicyDecision> {
  return requireAuthenticatedSession(await session);
}

export async function requireOwner(
  resourceUserId: string,
  session = getCurrentSession()
): Promise<PolicyDecision> {
  const authenticated = requireAuthenticatedSession(await session);

  if (authenticated.status !== "allowed") {
    return authenticated;
  }

  if (authenticated.userId !== resourceUserId) {
    return { status: "forbidden", reason: "not_owner" };
  }

  return authenticated;
}

export function requireAuthenticatedSession(session: AppSession): PolicyDecision {
  if (session.status !== "authenticated") {
    return {
      status: "unauthenticated",
      reason: session.reason
    };
  }

  return {
    status: "allowed",
    userId: session.userId,
    role: session.role
  };
}

export function policyMessage(decision: PolicyDecision) {
  switch (decision.status) {
    case "allowed":
      return "Autorizado.";
    case "blocked":
      if (decision.reason === "missing_database") {
        return "Operação administrativa indisponível neste ambiente.";
      }
      if (decision.reason === "auth_not_ready") {
        return "Autenticação administrativa real ainda não está ativa neste ambiente.";
      }
      return "Operação bloqueada pelo ambiente.";
    case "forbidden":
      return "Acesso negado para esta operação.";
    case "unauthenticated":
      return "Sessão ausente ou expirada. Faça login para continuar.";
  }
}
