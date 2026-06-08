import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import { loginAction } from "@/features/auth/server/actions";
import { getCurrentSession } from "@/features/auth/server/session";

export default async function LoginPage({
  searchParams
}: {
  searchParams?: Promise<{ returnTo?: string }>;
}) {
  const session = await getCurrentSession();

  if (session.status === "authenticated") {
    redirect("/");
  }

  const params = await searchParams;

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Autenticacao</p>
        <h1>Login</h1>
        <p>Acesse sua conta para continuar em areas protegidas.</p>
      </section>
      <AuthForm mode="login" action={loginAction} returnTo={params?.returnTo} />
    </main>
  );
}
