import Link from "next/link";

type PlaceholderPageProps = {
  title: string;
  domain: string;
  description?: string;
  actionHref?: string;
  actionLabel?: string;
};

export function PlaceholderPage({
  title,
  domain,
  description,
  actionHref,
  actionLabel
}: PlaceholderPageProps) {
  return (
    <main className="page-shell">
      <section className="placeholder-panel">
        <p className="eyebrow">Disponibilidade planejada</p>
        <h1>{title}</h1>
        <p>
          Esta área de {domain} ainda não tem ações completas para a primeira rodada de
          produção, mas permanece visível para orientar a navegação com segurança.
        </p>
        {description ? <p className="muted">{description}</p> : null}
        {actionHref && actionLabel ? (
          <Link className="secondary-action" href={actionHref}>
            {actionLabel}
          </Link>
        ) : null}
      </section>
    </main>
  );
}
