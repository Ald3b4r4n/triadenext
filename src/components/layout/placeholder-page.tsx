type PlaceholderPageProps = {
  title: string;
  domain: string;
  description?: string;
};

export function PlaceholderPage({ title, domain, description }: PlaceholderPageProps) {
  return (
    <main className="page-shell">
      <section className="placeholder-panel">
        <p className="muted">Reconstrucao em andamento</p>
        <h1>{title}</h1>
        <p>
          Placeholder funcional para o dominio <strong>{domain}</strong>, baseado no handoff do
          Reversa gerado a partir do legado Laravel.
        </p>
        {description ? <p className="muted">{description}</p> : null}
      </section>
    </main>
  );
}
