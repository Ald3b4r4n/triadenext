import type { TransactionalEmailInput, TransactionalEmailResult } from "../types";

export type EmailProvider = {
  sendTransactionalEmail(input: TransactionalEmailInput): Promise<TransactionalEmailResult>;
};
