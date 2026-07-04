import "server-only";

import { createAuth } from "./create-auth";

export const auth = createAuth();

export type BetterAuthSession = typeof auth.$Infer.Session;
