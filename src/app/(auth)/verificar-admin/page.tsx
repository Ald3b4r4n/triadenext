import { redirect } from "next/navigation";
import { AdminStepUpChallenge } from "@/features/auth/components/admin-step-up-challenge";
import { validateAdminReturnTo } from "@/features/auth/server/admin-step-up";
import { getCurrentSession } from "@/features/auth/server/session";

export default async function VerificarAcessoAdminPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const emptyParams: Record<string, string | string[] | undefined> = {};
  const [session, params] = await Promise.all([
    getCurrentSession(),
    searchParams ?? Promise.resolve(emptyParams)
  ]);

  if (session.status !== "authenticated") {
    redirect("/login?returnTo=/admin");
  }
  if (session.role !== "admin" && session.role !== "manager") {
    redirect("/minha-conta");
  }
  if (!session.twoFactorEnabled) {
    redirect("/seguranca?required=admin&returnTo=/admin");
  }

  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;

  return (
    <main className="page-shell security-page">
      <AdminStepUpChallenge returnTo={validateAdminReturnTo(rawReturnTo)} />
    </main>
  );
}
