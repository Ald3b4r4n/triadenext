import "server-only";

import { and, eq } from "drizzle-orm";
import { db } from "@/db/client";
import { addresses, customerProfiles, users } from "@/db/schema";
import { assertCanMutateRealData } from "@/lib/runtime-mode";
import type { CustomerAccountInput } from "../schemas";

export type CustomerAccountData = {
  fullName: string;
  phone: string;
  documentType: "cpf" | "cnpj";
  documentNumber: string;
  birthDate: string;
  recipient: string;
  postalCode: string;
  state: string;
  city: string;
  district: string;
  street: string;
  number: string;
  complement: string;
};

export async function getCustomerAccountData(userId: string): Promise<CustomerAccountData | null> {
  if (!db) return null;
  const [userRow, profileRow, addressRow] = await Promise.all([
    db.select().from(users).where(eq(users.id, userId)).limit(1),
    db.select().from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1),
    db.select().from(addresses).where(and(eq(addresses.userId, userId), eq(addresses.isDefaultShipping, true))).limit(1)
  ]);
  const user = userRow[0];
  if (!user) return null;
  const profile = profileRow[0];
  const address = addressRow[0];
  return {
    fullName: user.name,
    phone: user.phone ?? "",
    documentType: profile?.documentType === "cnpj" ? "cnpj" : "cpf",
    documentNumber: profile?.cpf ?? "",
    birthDate: profile?.birthDate ?? "",
    recipient: address?.recipient ?? user.name,
    postalCode: address?.postalCode ?? "",
    state: address?.state ?? "",
    city: address?.city ?? "",
    district: address?.district ?? "",
    street: address?.street ?? "",
    number: address?.number ?? "",
    complement: address?.complement ?? ""
  };
}

export async function saveCustomerAccountData(userId: string, input: CustomerAccountInput) {
  if (!db) return { status: "blocked" as const, message: "Cadastro indisponível sem banco configurado." };
  const guardrail = assertCanMutateRealData();
  if (!guardrail.allowed) return { status: "blocked" as const, message: guardrail.message };
  const now = new Date();
  await db.transaction(async (tx) => {
    await tx.update(users).set({ name: input.fullName, phone: input.phone, updatedAt: now }).where(eq(users.id, userId));
    const [profile] = await tx.select({ id: customerProfiles.id }).from(customerProfiles).where(eq(customerProfiles.userId, userId)).limit(1);
    if (profile) {
      await tx.update(customerProfiles).set({ cpf: input.documentNumber, documentType: input.documentType, birthDate: input.birthDate || null, updatedAt: now }).where(eq(customerProfiles.id, profile.id));
    } else {
      await tx.insert(customerProfiles).values({ userId, cpf: input.documentNumber, documentType: input.documentType, birthDate: input.birthDate || null });
    }
    const [address] = await tx.select({ id: addresses.id }).from(addresses).where(and(eq(addresses.userId, userId), eq(addresses.isDefaultShipping, true))).limit(1);
    const addressData = {
      recipient: input.recipient,
      phone: input.phone,
      postalCode: input.postalCode,
      street: input.street,
      number: input.number,
      complement: input.complement || null,
      district: input.district,
      city: input.city,
      state: input.state.toUpperCase(),
      isDefaultShipping: true,
      updatedAt: now
    };
    if (address) await tx.update(addresses).set(addressData).where(eq(addresses.id, address.id));
    else await tx.insert(addresses).values({ userId, label: "Principal", ...addressData });
  });
  return { status: "success" as const, message: "Dados cadastrais e endereço principal atualizados." };
}
