import { describe, expect, it } from "vitest";
import { resolveActiveDatabaseUrl } from "@/lib/env";
import { resolveDedicatedStagingTarget } from "@/lib/runtime-mode";

describe("dedicated staging mutation guardrail", () => {
  it("allows the explicit staging target only with its dedicated database variable", () => {
    expect(
      resolveDedicatedStagingTarget({
        STAGING_TARGET: "staging",
        STAGING_DATABASE_URL: "postgresql://staging.example/database"
      })
    ).toBe(true);
  });

  it("does not depend on DATABASE_URL when the staging contract is explicit", () => {
    expect(
      resolveDedicatedStagingTarget({
        STAGING_TARGET: "staging",
        DATABASE_URL: "postgresql://production.example/database",
        STAGING_DATABASE_URL: "postgresql://staging.example/database"
      })
    ).toBe(true);

    expect(
      resolveDedicatedStagingTarget({
        STAGING_TARGET: "staging",
        DATABASE_URL: "postgresql://production.example/database"
      })
    ).toBe(false);

    expect(
      resolveDedicatedStagingTarget({
        STAGING_TARGET: "production",
        DATABASE_URL: "postgresql://staging.example/database",
        STAGING_DATABASE_URL: "postgresql://staging.example/database"
      })
    ).toBe(false);

    expect(resolveDedicatedStagingTarget({})).toBe(false);
  });
});

describe("active database selection", () => {
  it("uses only STAGING_DATABASE_URL for an explicit staging target", () => {
    expect(
      resolveActiveDatabaseUrl({
        STAGING_TARGET: "staging",
        STAGING_DATABASE_URL: "postgresql://staging.example/database",
        DATABASE_URL: "postgresql://production.example/database"
      })
    ).toBe("postgresql://staging.example/database");
  });

  it("never falls back to DATABASE_URL when staging is explicit", () => {
    expect(
      resolveActiveDatabaseUrl({
        STAGING_TARGET: "staging",
        STAGING_DATABASE_URL: "",
        DATABASE_URL: "postgresql://production.example/database"
      })
    ).toBe("");
  });
});
