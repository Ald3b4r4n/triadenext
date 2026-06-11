import { getNotificationRuntimeConfig } from "../config";
import { createMockEmailProvider } from "./mock-email-provider";
import { createUnavailableEmailProvider } from "./unavailable-email-provider";
import type { EmailProvider } from "./email-provider";

export function resolveEmailProvider(): EmailProvider {
  const config = getNotificationRuntimeConfig();
  return config.provider === "mock"
    ? createMockEmailProvider()
    : createUnavailableEmailProvider();
}
