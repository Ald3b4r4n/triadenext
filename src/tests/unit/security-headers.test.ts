import { describe, expect, it } from "vitest";
import nextConfig, {
  contentSecurityPolicy,
  securityHeaders
} from "../../../next.config";

describe("security headers", () => {
  it("blocks framing and adds browser hardening headers", () => {
    const headers = new Map(
      securityHeaders.map((header) => [header.key, header.value])
    );

    expect(nextConfig.poweredByHeader).toBe(false);
    expect(headers.get("X-Frame-Options")).toBe("DENY");
    expect(headers.get("X-Content-Type-Options")).toBe("nosniff");
    expect(headers.get("Referrer-Policy")).toBe("strict-origin-when-cross-origin");
    expect(headers.get("Permissions-Policy")).toContain("camera=()");
    expect(contentSecurityPolicy).toContain("frame-ancestors 'none'");
    expect(contentSecurityPolicy).toContain("object-src 'none'");
    expect(contentSecurityPolicy).toContain("https://js.stripe.com");
  });
});
