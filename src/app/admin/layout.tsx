import { redirect } from "next/navigation";
import Link from "next/link";
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

  return (
    <>
      <nav className="admin-nav" aria-label="Navegação administrativa">
        <div className="page-shell admin-nav__content">
          <Link href="/admin">Painel</Link>
          <Link href="/admin/produtos">Produtos</Link>
          <Link href="/admin/cupons">Cupons</Link>
          <Link href="/admin/frete">Frete</Link>
          <Link href="/admin/pedidos">Pedidos</Link>
        </div>
      </nav>
      {children}
    </>
  );
}
