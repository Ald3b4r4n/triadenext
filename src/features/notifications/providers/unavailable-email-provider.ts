import type { EmailProvider } from "./email-provider";

export function createUnavailableEmailProvider(): EmailProvider {
  return {
    async sendTransactionalEmail() {
      return {
        status: "unavailable",
        provider: "unavailable",
        safeError: "Provedor de e-mail não configurado para este ambiente."
      };
    }
  };
}
