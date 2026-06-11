import type { EmailProvider } from "./email-provider";

export function createUnavailableEmailProvider(): EmailProvider {
  return {
    async sendTransactionalEmail() {
      return {
        status: "unavailable",
        provider: "unavailable",
        safeError: "Provider de e-mail nao configurado para este ambiente."
      };
    }
  };
}
