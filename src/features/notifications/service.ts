import "server-only";

import { getNotificationRuntimeConfig } from "./config";
import { sanitizeNotificationError } from "./errors";
import { buildNotificationIdempotencyKey } from "./idempotency";
import { isValidEmailRecipient, normalizeEmailRecipient } from "./recipients";
import { createNotificationRepository } from "./drizzle-repository";
import { resolveEmailProvider } from "./providers";
import { renderAdminOrderPaidEmail } from "./templates/admin-order-paid";
import { renderCustomerOrderPaidEmail } from "./templates/customer-order-paid";
import {
  buildAdminOrderPaidTemplateData,
  buildCustomerOrderPaidTemplateData
} from "./template-data";
import type { EmailProvider } from "./providers";
import type { NotificationRepository } from "./repository";
import type {
  NotificationDelivery,
  NotificationDeliveryDraft,
  OrderPaidContext,
  RenderedEmail
} from "./types";

export type NotificationService = {
  processOrderPaid(context: OrderPaidContext): Promise<NotificationDelivery[]>;
};

export function createNotificationService(dependencies: {
  repository?: NotificationRepository;
  provider?: EmailProvider;
  adminRecipients?: string[];
} = {}): NotificationService {
  const repository = dependencies.repository ?? createNotificationRepository();
  const provider = dependencies.provider ?? resolveEmailProvider();
  const config = getNotificationRuntimeConfig();
  const adminRecipients = dependencies.adminRecipients ?? config.adminRecipients;

  return {
    async processOrderPaid(context) {
      const deliveries: NotificationDelivery[] = [];
      const customerRecipient = normalizeEmailRecipient(
        context.order.customerSnapshot.email
      );
      if (isValidEmailRecipient(customerRecipient)) {
        deliveries.push(
          await createAndDeliver({
            repository,
            provider,
            draft: createDraft({
              context,
              type: "customer_order_paid",
              recipient: customerRecipient,
              recipientRole: "customer",
              providerName: config.provider
            }),
            rendered: renderCustomerOrderPaidEmail(
              buildCustomerOrderPaidTemplateData(context.order)
            )
          })
        );
      }

      if (adminRecipients.length === 0) {
        const draft = createDraft({
          context,
          type: "admin_order_paid",
          recipient: "unconfigured",
          recipientRole: "internal",
          providerName: config.provider
        });
        const created = await repository.createIfNew(draft);
        deliveries.push(
          created.created
            ? await repository.markSkipped({
                id: created.delivery.id,
                lastError: "Destinatarios internos nao configurados."
              })
            : created.delivery
        );
        return deliveries;
      }

      for (const recipient of adminRecipients) {
        deliveries.push(
          await createAndDeliver({
            repository,
            provider,
            draft: createDraft({
              context,
              type: "admin_order_paid",
              recipient,
              recipientRole: "internal",
              providerName: config.provider
            }),
            rendered: renderAdminOrderPaidEmail(
              buildAdminOrderPaidTemplateData(context.order)
            )
          })
        );
      }
      return deliveries;
    }
  };
}

function createDraft(input: {
  context: OrderPaidContext;
  type: NotificationDeliveryDraft["type"];
  recipient: string;
  recipientRole: NotificationDeliveryDraft["recipientRole"];
  providerName: NotificationDeliveryDraft["provider"];
}): NotificationDeliveryDraft {
  return {
    type: input.type,
    channel: "email",
    recipient: input.recipient,
    recipientRole: input.recipientRole,
    orderId: input.context.order.id,
    userId: input.context.order.userId || null,
    paymentEventId: input.context.event.paymentEventId,
    eventType: "order_paid",
    provider: input.providerName,
    idempotencyKey: buildNotificationIdempotencyKey({
      orderId: input.context.order.id,
      eventType: "order_paid",
      notificationType: input.type,
      recipient: input.recipient
    })
  };
}

async function createAndDeliver(input: {
  repository: NotificationRepository;
  provider: EmailProvider;
  draft: NotificationDeliveryDraft;
  rendered: RenderedEmail;
}) {
  const created = await input.repository.createIfNew(input.draft);
  if (!created.created) {
    return created.delivery;
  }

  await input.repository.markSending(created.delivery.id);
  try {
    const result = await input.provider.sendTransactionalEmail({
      ...input.rendered,
      to: input.draft.recipient,
      idempotencyKey: input.draft.idempotencyKey,
      metadata: {
        orderId: input.draft.orderId,
        eventType: "order_paid",
        notificationType: input.draft.type
      }
    });
    if (result.status === "sent" || result.status === "mocked") {
      return input.repository.markDelivered({
        id: created.delivery.id,
        status: result.status,
        provider: result.provider,
        providerMessageId:
          result.status === "sent" ? result.providerMessageId ?? null : null
      });
    }
    return input.repository.markFailed({
      id: created.delivery.id,
      provider: result.provider,
      lastError: sanitizeNotificationError(result.safeError)
    });
  } catch (error) {
    return input.repository.markFailed({
      id: created.delivery.id,
      provider: input.draft.provider,
      lastError: sanitizeNotificationError(error)
    });
  }
}
