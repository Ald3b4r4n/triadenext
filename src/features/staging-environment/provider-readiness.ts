import { checkNeonStagingReadiness } from "./neon-readiness";
import { checkStripeTestEnvironment } from "./stripe-test-readiness";
import { checkStripeTestWebhook } from "./stripe-webhook-readiness";
import type { StagingEnvironmentConfig, StagingEnvironmentEnv } from "./types";
import { checkVercelStagingReadiness } from "./vercel-readiness";

export function inspectProviderReadiness(input: {
  env?: StagingEnvironmentEnv;
  config: StagingEnvironmentConfig;
}) {
  const env = input.env ?? process.env;
  const vercel = checkVercelStagingReadiness({ env, config: input.config });
  const neon = checkNeonStagingReadiness({ env, config: input.config });
  const stripe = checkStripeTestEnvironment(env);
  const webhook = checkStripeTestWebhook(env);

  return {
    vercel,
    neon,
    stripe,
    webhook,
    checks: [vercel.check, neon.check, stripe.check, webhook.check],
    issues: [
      ...vercel.issues,
      ...neon.issues,
      ...stripe.issues,
      ...webhook.issues
    ]
  };
}
