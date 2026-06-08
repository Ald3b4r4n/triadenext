import { describe, expect, it } from "vitest";
import { requireAuthenticatedSession } from "@/features/auth/server/policies";

describe("auth policies", () => {
  it("maps authenticated sessions into allowed decisions", () => {
    expect(
      requireAuthenticatedSession({
        status: "authenticated",
        userId: "user-1",
        email: "admin@example.com",
        role: "admin"
      })
    ).toEqual({
      status: "allowed",
      userId: "user-1",
      role: "admin"
    });
  });

  it("maps unauthenticated sessions safely", () => {
    expect(requireAuthenticatedSession({ status: "unauthenticated", reason: "missing" })).toEqual(
      {
        status: "unauthenticated",
        reason: "missing"
      }
    );
  });
});
