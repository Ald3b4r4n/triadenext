import { redirect } from "next/navigation";
import type { ReactNode } from "react";
import { getCurrentSession } from "@/features/auth/server/session";
import {
  policyMessage,
  requireAdminLike
} from "@/features/auth/server/policies";
import { AdminShell } from "./admin-shell";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const session = await getCurrentSession();
  const policy = await requireAdminLike(Promise.resolve(session));

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

  const userEmail =
    session.status === "authenticated" ? session.email : "admin@triade";

  return (
    <AdminShell userEmail={userEmail} userRole={policy.role}>
      {children}
    </AdminShell>
  );
}
