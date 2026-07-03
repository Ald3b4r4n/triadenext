import { runAdminOrdersSmoke } from "./admin-orders-smoke";
import { runAdminSmoke } from "./admin-smoke";
import { bridgeStagingImportSmoke } from "./import-staging-bridge";
import { runImportStagingSmokeAvailability } from "./import-staging-smoke";
import { runNotificationOutboxSmoke } from "./notification-outbox-smoke";
import { runOrderPaymentGate } from "./order-payment-smoke";
import { runOrderStatusSmoke } from "./order-status-smoke";
import { runPaymentTestSmoke } from "./payment-test-smoke";
import { runStagingSmokePreflight } from "./preflight";
import { runStorefrontSmokeSuite } from "./smoke-runner";
import { classifyGoNoGo, classifyOverallStatus } from "./status-policy";
import type { StagingSmokeEnv, StagingSmokeRunResult } from "./types";
import type { StagingSmokeExecutionOptions } from "./storefront-smoke";

export async function runStagingSmokeReadiness(options: {
  cwd?: string;
  env?: StagingSmokeEnv;
  target?: string;
  url?: string;
  inputDir?: string;
  outputDir?: string;
  allowNetwork?: boolean;
  humanApprovalRef?: string;
  migrationApprovalRef?: string;
  snapshotRef?: string;
  fetcher?: StagingSmokeExecutionOptions["fetcher"];
} = {}): Promise<StagingSmokeRunResult> {
  const preflight = runStagingSmokePreflight(options);
  const storefront = await runStorefrontSmokeSuite(preflight, { fetcher: options.fetcher });
  const orderGate = runOrderPaymentGate(preflight);
  const payment = runPaymentTestSmoke(preflight);
  const orderStatus = runOrderStatusSmoke(preflight);
  const admin = await runAdminSmoke(preflight, { fetcher: options.fetcher });
  const adminOrders = await runAdminOrdersSmoke(preflight, { fetcher: options.fetcher });
  const notifications = await runNotificationOutboxSmoke(preflight, { fetcher: options.fetcher });
  const importAvailability = runImportStagingSmokeAvailability(preflight);
  const importBridge = bridgeStagingImportSmoke(preflight);

  const checks = [
    ...preflight.checks,
    ...storefront.checks,
    ...orderGate.checks,
    ...payment.checks,
    ...orderStatus.checks,
    ...admin.checks,
    ...adminOrders.checks,
    ...notifications.checks,
    ...importAvailability.checks,
    ...importBridge.checks
  ];
  const issues = [
    ...preflight.issues,
    ...storefront.issues,
    ...orderGate.issues,
    ...payment.issues,
    ...orderStatus.issues,
    ...admin.issues,
    ...adminOrders.issues,
    ...notifications.issues,
    ...importAvailability.issues,
    ...importBridge.issues
  ];
  const status = classifyOverallStatus(checks.map((check) => check.status), issues);

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    feature: "025-fase-17-staging-smoke",
    status,
    goNoGo: classifyGoNoGo(status, issues),
    preflight,
    checks,
    issues,
    safety: preflight.safety,
    humanApprovalRequired: true
  };
}
