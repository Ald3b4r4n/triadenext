import { redirect } from "next/navigation";
import { TwoFactorSettings } from "@/features/auth/components/two-factor-settings";
import { getCurrentSession, validateReturnTo } from "@/features/auth/server/session";

export default async function SegurancaPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [session, params] = await Promise.all([
    getCurrentSession(),
    searchParams
      ? searchParams
      : Promise.resolve({} as Record<string, string | string[] | undefined>)
  ]);
  if (session.status !== "authenticated") redirect("/login?returnTo=/seguranca");
  const required = session.role === "admin" || session.role === "manager";
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  const returnTo = validateReturnTo(rawReturnTo || (required ? "/admin" : "/minha-conta"));

  return (
    <main className="page-shell security-page">
      <section className="page-intro">
        <p className="muted">Segurança da conta</p>
        <h1>Autenticação em duas etapas</h1>
        <p>Adicione uma segunda confirmação ao login para proteger sua conta mesmo se a senha for descoberta.</p>
      </section>
      <TwoFactorSettings enabled={Boolean(session.twoFactorEnabled)} required={required} returnTo={returnTo} />
    </main>
  );
}
