import "server-only";

import { getRuntimeMode } from "@/lib/runtime-mode";
import { parseAdminNotificationRecipients } from "./recipients";
import type { NotificationProvider } from "./types";

export type NotificationRuntimeConfig = {
  provider: NotificationProvider;
  adminRecipients: string[];
  from: string | null;
  message: string;
};

export function getNotificationRuntimeConfig(): NotificationRuntimeConfig {
  const mode = getRuntimeMode();
  const adminRecipients = parseAdminNotificationRecipients(
    process.env.ORDER_NOTIFICATION_RECIPIENTS ?? ""
  );
  const from = (process.env.EMAIL_FROM ?? "").trim() || null;

  if (mode.appEnvironment === "development" || mode.appEnvironment === "test") {
    return {
      provider: "mock",
      adminRecipients,
      from,
      message:
        "E-mail mock ativo em dev/test; nenhuma mensagem real sera enviada."
    };
  }

  return {
    provider: "unavailable",
    adminRecipients,
    from,
    message:
      "Provider de e-mail real indisponível; entrega registrada como falha segura."
  };
}
