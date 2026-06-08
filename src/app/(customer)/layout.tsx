import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { requireCustomer } from "@/features/auth/server/policies";

export default async function CustomerLayout({ children }: { children: ReactNode }) {
  const policy = await requireCustomer();

  if (policy.status !== "allowed") {
    redirect("/login?returnTo=/minha-conta");
  }

  return children;
}
