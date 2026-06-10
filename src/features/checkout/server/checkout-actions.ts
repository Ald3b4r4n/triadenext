"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { checkoutFormSchema } from "@/features/orders/schemas";
import { createPendingCheckoutOrder, reviewPendingCheckout } from "./checkout-service";

export type CheckoutActionState = {
  status: "idle" | "success" | "error";
  message: string;
  orderId?: string;
};

export async function reviewPendingCheckoutAction() {
  return reviewPendingCheckout();
}

export async function createPendingOrderAction(
  _previousState: CheckoutActionState,
  formData: FormData
): Promise<CheckoutActionState> {
  const parsed = checkoutFormSchema.safeParse({
    fullName: formData.get("fullName"),
    phone: formData.get("phone"),
    postalCode: formData.get("postalCode"),
    state: formData.get("state"),
    city: formData.get("city"),
    district: formData.get("district"),
    street: formData.get("street"),
    number: formData.get("number"),
    complement: formData.get("complement"),
    recipient: formData.get("recipient")
  });

  if (!parsed.success) {
    return {
      status: "error",
      message: parsed.error.issues[0]?.message ?? "Dados invalidos para criar pedido pendente."
    };
  }

  const result = await createPendingCheckoutOrder(parsed.data);
  if (result.status !== "success" && result.status !== "fallback") {
    return { status: "error", message: result.message };
  }

  revalidatePath("/carrinho");
  revalidatePath("/checkout");
  revalidatePath("/pedidos");
  revalidatePath("/admin/pedidos");
  return {
    status: "success",
    message: `${result.message} Nenhum pagamento real foi iniciado.`,
    orderId: result.order.id
  };
}

export async function createPendingOrderAndRedirect(formData: FormData): Promise<void> {
  const result = await createPendingOrderAction({ status: "idle", message: "" }, formData);
  if (result.status === "success" && result.orderId) {
    redirect(`/checkout?pedido=${encodeURIComponent(result.orderId)}`);
  }
}
