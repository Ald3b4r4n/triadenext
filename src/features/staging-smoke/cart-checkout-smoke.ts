import { createCheck } from "./result";
import { createRemoteSmokeContext, inspectHtml, type StagingSmokeExecutionOptions } from "./storefront-smoke";
import type { StagingSmokeCheck, StagingSmokeIssue, StagingSmokePreflight } from "./types";

export async function runCartCheckoutSmoke(
  preflight: StagingSmokePreflight,
  options: StagingSmokeExecutionOptions = {}
): Promise<{ checks: StagingSmokeCheck[]; issues: StagingSmokeIssue[] }> {
  const context = createRemoteSmokeContext(preflight, options.fetcher);
  if (!context.ready) {
    return {
      issues: context.issues,
      checks: [
        createCheck({
          id: "cart-checkout",
          label: "Carrinho e checkout",
          category: "checkout",
          status: "pending-config",
          summary: context.summary,
          issues: context.issues
        })
      ]
    };
  }

  const cart = await context.fetcher(new URL("/carrinho", context.baseUrl));
  const checkout = await context.fetcher(new URL("/checkout", context.baseUrl));
  const issues = [
    ...inspectHtml(cart, { required: ["Carrinho"], forbidden: ["DATABASE_URL", "STRIPE_SECRET"], category: "cart" }),
    ...inspectHtml(checkout, { required: ["Revisao do pedido"], forbidden: ["DATABASE_URL", "STRIPE_SECRET"], category: "checkout" })
  ];

  return {
    issues,
    checks: [
      createCheck({
        id: "cart-checkout",
        label: "Carrinho e checkout",
        category: "checkout",
        status: issues.length > 0 ? "failed" : "passed",
        summary:
          issues.length > 0
            ? "Carrinho ou checkout staging falhou nos checks basicos."
            : "Carrinho e checkout staging responderam sem texto sensivel.",
        issues
      })
    ]
  };
}
