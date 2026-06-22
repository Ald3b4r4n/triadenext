import Link from "next/link";

export default function AdminFretesPage() {
  return (
    <main className="page-shell">
      <section className="placeholder-panel">
        <p className="eyebrow">Frete manual</p>
        <h1>Gestão de frete</h1>
        <p>
          A operação ativa de frete fica em regras manuais por UF ou faixa de CEP. Integrações
          com transportadoras seguem fora desta etapa.
        </p>
        <Link className="primary-action" href="/admin/frete">
          Abrir regras de frete
        </Link>
      </section>
    </main>
  );
}
