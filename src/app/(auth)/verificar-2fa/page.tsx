import { TwoFactorChallenge } from "@/features/auth/components/two-factor-challenge";
import { validateReturnTo } from "@/features/auth/server/session";

export default async function VerificarDoisFatoresPage({
  searchParams
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = searchParams ? await searchParams : {};
  const rawReturnTo = Array.isArray(params.returnTo) ? params.returnTo[0] : params.returnTo;
  return (
    <main className="page-shell security-page">
      <TwoFactorChallenge returnTo={validateReturnTo(rawReturnTo || "/minha-conta")} />
    </main>
  );
}
