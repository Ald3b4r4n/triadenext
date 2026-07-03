export type ManagedUserRole = "customer" | "manager" | "admin";

export type RoleChangeInput = {
  actorEmail: string;
  actorRole: ManagedUserRole;
  actorUserId: string;
  targetEmail: string;
  targetUserId: string;
  targetRole: ManagedUserRole;
  nextRole: ManagedUserRole;
  masterEmails: string[];
};

export type RoleChangeDecision =
  | { allowed: true }
  | {
      allowed: false;
      reason:
        | "actor_not_admin"
        | "actor_not_master"
        | "self_downgrade"
        | "master_downgrade";
    };

export function parseAdminMasterEmails(value: string | null | undefined) {
  if (!value) {
    return [];
  }

  return Array.from(
    new Set(
      value
        .split(/[,\n;]/)
        .map((email) => normalizeEmail(email))
        .filter(Boolean)
    )
  );
}

export function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

export function isAdminMasterEmail(email: string, masterEmails: string[]) {
  return masterEmails.includes(normalizeEmail(email));
}

export function isManagedUserRole(value: unknown): value is ManagedUserRole {
  return value === "customer" || value === "manager" || value === "admin";
}

export function decideRoleChange(input: RoleChangeInput): RoleChangeDecision {
  if (input.actorRole !== "admin") {
    return { allowed: false, reason: "actor_not_admin" };
  }

  if (!isAdminMasterEmail(input.actorEmail, input.masterEmails)) {
    return { allowed: false, reason: "actor_not_master" };
  }

  if (input.actorUserId === input.targetUserId && input.nextRole !== "admin") {
    return { allowed: false, reason: "self_downgrade" };
  }

  if (isAdminMasterEmail(input.targetEmail, input.masterEmails) && input.nextRole !== "admin") {
    return { allowed: false, reason: "master_downgrade" };
  }

  return { allowed: true };
}

export function roleChangeDecisionMessage(decision: RoleChangeDecision) {
  if (decision.allowed) {
    return "Permissão alterada com segurança.";
  }

  switch (decision.reason) {
    case "actor_not_admin":
      return "Somente administradores podem alterar permissões.";
    case "actor_not_master":
      return "Somente e-mails master autorizados podem conceder ou revogar permissões administrativas.";
    case "self_downgrade":
      return "Você não pode remover a própria permissão administrativa.";
    case "master_downgrade":
      return "E-mails master autorizados devem permanecer como admin.";
  }
}
