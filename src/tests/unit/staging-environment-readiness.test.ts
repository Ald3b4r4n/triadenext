import { describe, expect, it } from "vitest";
import { resolveStagingEnvironmentConfig } from "@/features/staging-environment/config";
import { inspectStagingEnvironmentVariables } from "@/features/staging-environment/env-readiness";
import { runStagingEnvironmentPreflight } from "@/features/staging-environment/preflight";
import { checkStripeTestEnvironment } from "@/features/staging-environment/stripe-test-readiness";
import {
  containsSensitiveOutput,
  sanitizeStagingReport
} from "@/features/staging-environment/safety";
import { checkVercelStagingReadiness } from "@/features/staging-environment/vercel-readiness";

describe("staging environment readiness", () => {
  it("returns pending-config and no-go without external configuration", () => {
    const result = runStagingEnvironmentPreflight({ env: {} });

    expect(result.status).toBe("pending-config");
    expect(result.goNoGo).toBe("no-go");
    expect(result.safety.databaseConnected).toBe(false);
    expect(result.safety.deployExecuted).toBe(false);
    expect(result.safety.remoteMigrationExecuted).toBe(false);
  });

  it("reports environment presence without returning values", () => {
    const result = inspectStagingEnvironmentVariables({
      STAGING_TARGET: "staging",
      STAGING_DATABASE_URL: "value-that-must-not-leak",
      STRIPE_SECRET_KEY: "another-value-that-must-not-leak"
    });
    const serialized = JSON.stringify(result);

    expect(serialized).toContain("STAGING_DATABASE_URL");
    expect(serialized).not.toContain("value-that-must-not-leak");
    expect(serialized).not.toContain("another-value-that-must-not-leak");
  });

  it("blocks production and Stripe live mode", () => {
    const production = runStagingEnvironmentPreflight({
      env: { NODE_ENV: "production", STAGING_TARGET: "staging" }
    });
    const stripe = checkStripeTestEnvironment({
      STRIPE_SECRET_KEY: "sk_live_synthetic",
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_live_synthetic"
    });

    expect(production.status).toBe("blocked");
    expect(stripe.check.status).toBe("blocked");
    expect(JSON.stringify(stripe)).not.toContain("sk_live_synthetic");
  });

  it("redacts URLs and secret-like values from report objects", () => {
    const sanitized = sanitizeStagingReport({
      endpoint: "https://private.example.test/path",
      databaseUrl: "postgres://user:pass@example.test/db",
      label: "staging"
    });

    expect(sanitized.endpoint).toBe("[REDACTED]");
    expect(sanitized.databaseUrl).toBe("[REDACTED_URL]");
    expect(sanitized.label).toBe("staging");
    expect(containsSensitiveOutput(sanitized)).toBe(false);
  });

  it("validates Vercel by presence only", () => {
    const config = resolveStagingEnvironmentConfig({
      env: { STAGING_TARGET: "staging" }
    });
    const pending = checkVercelStagingReadiness({ env: {}, config });
    const ready = checkVercelStagingReadiness({
      env: {
        VERCEL_PROJECT_ID: "project-value-that-must-not-leak",
        STAGING_SMOKE_URL: "url-value-that-must-not-leak"
      },
      config
    });

    expect(pending.check.status).toBe("pending-config");
    expect(ready.check.status).toBe("passed");
    expect(JSON.stringify(ready)).not.toContain(
      "project-value-that-must-not-leak"
    );
    expect(JSON.stringify(ready)).not.toContain("url-value-that-must-not-leak");
  });
});
