"use server";

import "server-only";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { sessions, twoFactors, users } from "@/db/schema";
import { auth } from "@/features/auth/server/auth";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";
import { getCurrentSession } from "@/features/auth/server/session";
import { env } from "@/lib/env";
import { recordSecurityAuditEvent } from "@/features/security/server/audit-log";
import {
  decideRoleChange,
  isManagedUserRole,
  parseAdminMasterEmails,
  roleChangeDecisionMessage,
  type ManagedUserRole
} from "../master-policy";

export type AdminUserRow = {
  id: string;
  name: string;
  email: string;
  role: ManagedUserRole;
  emailVerified: boolean;
  twoFactorEnabled: boolean;
  lastLoginAt: Date | null;
  activeSessions: number;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminUsersResult =
  | {
      status: "success";
      users: AdminUserRow[];
      actorEmail: string;
      masterCount: number;
      message: string;
    }
  | { status: "blocked" | "forbidden"; message: string };

type MasterPolicyResult =
  | { status: "allowed"; userId: string; email: string; role: "admin"; masterEmails: string[] }
  | { status: "blocked" | "forbidden"; message: string };

export async function listAdminUsersAction(): Promise<AdminUsersResult> {
  const policy = await requireMasterAdmin();

  if (policy.status !== "allowed") {
    return policy;
  }

  if (!db) {
    return {
      status: "blocked",
      message: "Banco local indisponível. Configure DATABASE_URL antes de validar usuários admin."
    };
  }

  try {
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        emailVerified: users.emailVerified,
        twoFactorEnabled: users.twoFactorEnabled,
        lastLoginAt: users.lastLoginAt,
        createdAt: users.createdAt,
        updatedAt: users.updatedAt
      })
      .from(users)
      .orderBy(asc(users.email));
    const activeSessionRows = await db
      .select({ userId: sessions.userId })
      .from(sessions);
    const sessionCounts = activeSessionRows.reduce((counts, session) => {
      counts.set(session.userId, (counts.get(session.userId) ?? 0) + 1);
      return counts;
    }, new Map<string, number>());

    return {
      status: "success",
      users: rows.map((user) => ({
        ...user,
        activeSessions: sessionCounts.get(user.id) ?? 0
      })),
      actorEmail: policy.email,
      masterCount: policy.masterEmails.length,
      message: "Usuários carregados."
    };
  } catch {
    return {
      status: "blocked",
      message: "Não foi possível listar usuários com segurança neste ambiente."
    };
  }
}

export async function createManagedUserAction(formData: FormData): Promise<void> {
  const policy = await requireMasterAdmin();
  if (policy.status !== "allowed") redirect(toUsersRoute("error", policy.status));
  if (!db) redirect(toUsersRoute("error", "missing-db"));

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const role = formData.get("role");

  if (
    name.length < 2 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
    password.length < 12 ||
    password.length > 128 ||
    !/[A-Za-z]/.test(password) ||
    !/[0-9]/.test(password) ||
    !isManagedUserRole(role)
  ) {
    redirect(toUsersRoute("error", "invalid-user"));
  }

  try {
    const created = await auth.api.signUpEmail({ body: { name, email, password } });
    await Promise.all([
      db.update(users).set({ role, updatedAt: new Date() }).where(eq(users.id, created.user.id)),
      db.delete(sessions).where(eq(sessions.userId, created.user.id))
    ]);
    recordSecurityAuditEvent({
      action: "admin.user.created",
      actorUserId: policy.userId,
      targetUserId: created.user.id,
      metadata: { role }
    });
  } catch {
    redirect(toUsersRoute("error", "create-failed"));
  }

  revalidatePath("/admin/usuarios");
  redirect(toUsersRoute("status", "user-created"));
}

export async function revokeManagedUserSessionsAction(formData: FormData): Promise<void> {
  const policy = await requireMasterAdmin();
  if (policy.status !== "allowed") redirect(toUsersRoute("error", policy.status));
  if (!db) redirect(toUsersRoute("error", "missing-db"));
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === policy.userId) redirect(toUsersRoute("error", "self-session-revoke"));

  await db.delete(sessions).where(eq(sessions.userId, userId));
  recordSecurityAuditEvent({
    action: "admin.user.sessions_revoked",
    actorUserId: policy.userId,
    targetUserId: userId
  });
  revalidatePath("/admin/usuarios");
  redirect(toUsersRoute("status", "sessions-revoked"));
}

export async function resetManagedUserTwoFactorAction(formData: FormData): Promise<void> {
  const policy = await requireMasterAdmin();
  if (policy.status !== "allowed") redirect(toUsersRoute("error", policy.status));
  if (!db) redirect(toUsersRoute("error", "missing-db"));
  const userId = String(formData.get("userId") ?? "");
  if (!userId || userId === policy.userId) redirect(toUsersRoute("error", "self-2fa-reset"));

  await db.transaction(async (transaction) => {
    await transaction.delete(twoFactors).where(eq(twoFactors.userId, userId));
    await transaction.update(users).set({ twoFactorEnabled: false, updatedAt: new Date() }).where(eq(users.id, userId));
    await transaction.delete(sessions).where(eq(sessions.userId, userId));
  });
  recordSecurityAuditEvent({
    action: "admin.user.two_factor_reset",
    actorUserId: policy.userId,
    targetUserId: userId
  });
  revalidatePath("/admin/usuarios");
  redirect(toUsersRoute("status", "two-factor-reset"));
}

export async function updateAdminUserRoleAction(formData: FormData): Promise<void> {
  const policy = await requireMasterAdmin();

  if (policy.status !== "allowed") {
    redirect(toUsersRoute("error", policy.status));
  }

  if (!db) {
    redirect(toUsersRoute("error", "missing-db"));
  }

  const userId = String(formData.get("userId") ?? "");
  const nextRole = formData.get("role");

  if (!userId || !isManagedUserRole(nextRole)) {
    redirect(toUsersRoute("error", "invalid-role"));
  }

  try {
    const [target] = await db
      .select({
        id: users.id,
        email: users.email,
        role: users.role
      })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);

    if (!target) {
      redirect(toUsersRoute("error", "not-found"));
    }

    const decision = decideRoleChange({
      actorEmail: policy.email,
      actorRole: policy.role,
      actorUserId: policy.userId,
      targetEmail: target.email,
      targetUserId: target.id,
      targetRole: target.role,
      nextRole,
      masterEmails: policy.masterEmails
    });

    if (!decision.allowed) {
      redirect(toUsersRoute("error", decision.reason));
    }

    await db
      .update(users)
      .set({
        role: nextRole,
        updatedAt: new Date()
      })
      .where(eq(users.id, target.id));
    recordSecurityAuditEvent({
      action: "admin.user.role_updated",
      actorUserId: policy.userId,
      targetUserId: target.id,
      metadata: { previousRole: target.role, nextRole }
    });
  } catch (error) {
    if (isNextRedirectError(error)) {
      throw error;
    }

    redirect(toUsersRoute("error", "update-failed"));
  }

  revalidatePath("/admin/usuarios");
  redirect(toUsersRoute("status", "role-updated"));
}

export async function requireMasterAdmin(): Promise<MasterPolicyResult> {
  const sessionPromise = getCurrentSession();
  const policy = await requireAdminLike(sessionPromise);

  if (policy.status !== "allowed") {
    return toBlockedOrForbidden(policyMessage(policy));
  }

  const session = await sessionPromise;

  if (session.status !== "authenticated") {
    return { status: "forbidden", message: "Sessão administrativa não confirmada." };
  }

  const masterEmails = parseAdminMasterEmails(env.ADMIN_MASTER_EMAILS);

  if (masterEmails.length === 0) {
    return {
      status: "blocked",
      message: "ADMIN_MASTER_EMAILS não está configurado para conceder permissões."
    };
  }

  const decision = decideRoleChange({
    actorEmail: session.email,
    actorRole: session.role,
    actorUserId: session.userId,
    targetEmail: session.email,
    targetUserId: session.userId,
    targetRole: session.role,
    nextRole: "admin",
    masterEmails
  });

  if (!decision.allowed) {
    return {
      status: "forbidden",
      message: roleChangeDecisionMessage(decision)
    };
  }

  return {
    status: "allowed",
    userId: session.userId,
    email: session.email,
    role: "admin",
    masterEmails
  };
}

function toBlockedOrForbidden(message: string): MasterPolicyResult {
  return message.includes("bloqueada") || message.includes("indisponível")
    ? { status: "blocked", message }
    : { status: "forbidden", message };
}

function toUsersRoute(kind: "status" | "error", code: string) {
  return `/admin/usuarios?${kind}=${encodeURIComponent(code)}`;
}

function isNextRedirectError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "digest" in error &&
    String((error as { digest?: unknown }).digest).startsWith("NEXT_REDIRECT")
  );
}
