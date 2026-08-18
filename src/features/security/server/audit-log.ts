import "server-only";

type SecurityAuditEvent = {
  action:
    | "admin.user.created"
    | "admin.user.role_updated"
    | "admin.user.sessions_revoked"
    | "admin.user.two_factor_reset";
  actorUserId: string;
  targetUserId: string;
  metadata?: Record<string, string | number | boolean | null>;
};

export function recordSecurityAuditEvent(event: SecurityAuditEvent) {
  console.info(
    "[security-audit]",
    JSON.stringify({
      occurredAt: new Date().toISOString(),
      ...event
    })
  );
}
