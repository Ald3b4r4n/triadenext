"use server";

import { policyMessage, requireAdminLike, requireCustomer } from "@/features/auth/server/policies";
import { runtimeMessages } from "@/lib/runtime-mode";
import { createOrderRepository } from "./order-repository";
import type { OrderDetailResult, OrderReadResult } from "../types";
import { revalidatePath } from "next/cache";

const orderRepository = createOrderRepository();

export async function listCustomerPendingOrdersAction(): Promise<OrderReadResult> {
  const policy = await requireCustomer();
  if (policy.status === "unauthenticated") {
    return { status: "unauthenticated", message: policyMessage(policy) };
  }
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unavailable",
      message: policyMessage(policy)
    };
  }

  return {
    status: "success",
    orders: await orderRepository.listCustomerPendingOrders(policy.userId)
  };
}

export async function getCustomerPendingOrderAction(orderId: string): Promise<OrderDetailResult> {
  const policy = await requireCustomer();
  if (policy.status === "unauthenticated") {
    return { status: "unauthenticated", message: policyMessage(policy) };
  }
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unavailable",
      message: policyMessage(policy)
    };
  }

  const order = await orderRepository.getCustomerOrder(policy.userId, orderId);
  if (!order) {
    return { status: "not_found", message: runtimeMessages.orderForbidden };
  }

  return { status: "success", order };
}

export async function listAdminPendingOrdersAction(): Promise<OrderReadResult> {
  const policy = await requireAdminLike();
  if (policy.status === "unauthenticated") {
    return { status: "unauthenticated", message: policyMessage(policy) };
  }
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unavailable",
      message: policyMessage(policy)
    };
  }

  return {
    status: "success",
    orders: await orderRepository.listAdminPendingOrders()
  };
}

export async function getAdminPendingOrderAction(orderId: string): Promise<OrderDetailResult> {
  const policy = await requireAdminLike();
  if (policy.status === "unauthenticated") {
    return { status: "unauthenticated", message: policyMessage(policy) };
  }
  if (policy.status !== "allowed") {
    return {
      status: policy.status === "forbidden" ? "forbidden" : "unavailable",
      message: policyMessage(policy)
    };
  }

  const order = await orderRepository.getAdminOrder(orderId);
  if (!order) {
    return { status: "not_found", message: "Pedido não encontrado." };
  }

  return { status: "success", order };
}

export async function deleteExpiredOrderAction(formData: FormData): Promise<void> {
  const policy = await requireAdminLike();
  if (policy.status !== "allowed") throw new Error(policyMessage(policy));
  const orderId = String(formData.get("orderId") ?? "");
  if (!orderId) throw new Error("Pedido inválido.");
  const deleted = await orderRepository.deleteExpiredOrder(orderId);
  if (!deleted) throw new Error("Somente pedidos expirados podem ser excluídos.");
  revalidatePath("/admin/pedidos");
  revalidatePath("/admin");
}
