import type { AuthRole } from "@/features/auth/server/session";

export type CartStatus = "active" | "converted" | "abandoned" | "expired";
export type CartPersistence = "real" | "dev_fallback" | "unavailable";

export type CartActor =
  | { kind: "guest"; guestToken: string }
  | { kind: "authenticated"; userId: string; role: AuthRole; guestToken?: string }
  | { kind: "unavailable"; reason: "missing_database" | "invalid_session" | "unsafe_environment" };

export type CartItem = {
  id: string;
  productId: string;
  productNameSnapshot: string;
  unitPriceSnapshotCents: number;
  quantity: number;
  itemSubtotalCents: number;
};

export type CartView = {
  id: string | null;
  status: CartStatus;
  owner: { kind: "guest"; guestTokenPresent: true } | { kind: "user"; userId: string };
  currency: "BRL";
  items: CartItem[];
  subtotalCents: number;
  persistence: CartPersistence;
  messages: string[];
};

export type CartActionResult =
  | { status: "success"; cart: CartView; message?: string }
  | { status: "validation_error"; message: string }
  | { status: "product_unavailable"; message: string }
  | { status: "insufficient_stock"; message: string; maxQuantity: number }
  | { status: "forbidden"; message: string }
  | { status: "fallback"; cart: CartView; message: string }
  | { status: "unavailable"; message: string }
  | { status: "error"; message: string };

export type CartWarning = {
  code: "quantity_limited" | "product_removed" | "fallback_not_persisted";
  message: string;
};
