import { describe, expect, it } from "vitest";
import {
  decideRoleChange,
  isAdminMasterEmail,
  parseAdminMasterEmails
} from "@/features/admin/master-policy";

const baseInput = {
  actorEmail: "master@example.com",
  actorRole: "admin" as const,
  actorUserId: "actor-1",
  targetEmail: "customer@example.com",
  targetUserId: "target-1",
  targetRole: "customer" as const,
  nextRole: "manager" as const,
  masterEmails: ["master@example.com"]
};

describe("admin master policy", () => {
  it("normalizes and deduplicates configured master emails", () => {
    expect(
      parseAdminMasterEmails(" Master@Example.com,master@example.com; other@example.com ")
    ).toEqual(["master@example.com", "other@example.com"]);
    expect(isAdminMasterEmail("MASTER@example.com", ["master@example.com"])).toBe(true);
  });

  it("allows only admin actors in the master allowlist to change roles", () => {
    expect(decideRoleChange(baseInput)).toEqual({ allowed: true });
    expect(decideRoleChange({ ...baseInput, actorRole: "manager" })).toEqual({
      allowed: false,
      reason: "actor_not_admin"
    });
    expect(decideRoleChange({ ...baseInput, actorEmail: "admin@example.com" })).toEqual({
      allowed: false,
      reason: "actor_not_master"
    });
  });

  it("blocks unsafe self and master downgrades", () => {
    expect(
      decideRoleChange({
        ...baseInput,
        targetEmail: "master@example.com",
        targetUserId: "actor-1",
        nextRole: "manager"
      })
    ).toEqual({ allowed: false, reason: "self_downgrade" });

    expect(
      decideRoleChange({
        ...baseInput,
        targetEmail: "other-master@example.com",
        targetUserId: "target-2",
        nextRole: "customer",
        masterEmails: ["master@example.com", "other-master@example.com"]
      })
    ).toEqual({ allowed: false, reason: "master_downgrade" });
  });
});
