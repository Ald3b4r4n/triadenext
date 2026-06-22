import { redirect } from "next/navigation";
import { AuthForm } from "@/features/auth/components/auth-form";
import { signupAction } from "@/features/auth/server/actions";
import { getCurrentSession } from "@/features/auth/server/session";

export default async function CadastroPage() {
  const session = await getCurrentSession();

  if (session.status === "authenticated") {
    redirect("/minha-conta");
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Cadastro</p>
        <h1>Criar conta</h1>
        <p>O cadastro público cria somente perfil de cliente.</p>
      </section>
      <AuthForm mode="signup" action={signupAction} returnTo="/minha-conta" />
    </main>
  );
}
