import type { EmailProvider } from "./email-provider";

export function createMockEmailProvider(options: { fail?: boolean } = {}): EmailProvider {
  return {
    async sendTransactionalEmail() {
      if (options.fail) {
        return {
          status: "failed",
          provider: "mock",
          safeError: "Falha mockada de entrega."
        };
      }
      return { status: "mocked", provider: "mock" };
    }
  };
}
