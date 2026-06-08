import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { policyMessage, requireAdminLike } from "@/features/auth/server/policies";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const policy = await requireAdminLike();

  if (policy.status === "unauthenticated") {
    redirect("/login?returnTo=/admin");
  }

  if (policy.status !== "allowed") {
    return (
      <main className="page-shell">
        <section className="page-intro">
          <p className="muted">Admin</p>
          <h1>Acesso bloqueado</h1>
          <p>{policyMessage(policy)}</p>
        </section>
      </main>
    );
  }

  return children;
}
