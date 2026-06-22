import Link from "next/link";

export default function AdminDocumentosFiscaisPage() {
  return (
    <main className="page-shell">
      <section className="placeholder-panel">
        <p className="eyebrow">Fora da Fase 11</p>
        <h1>Documentos fiscais</h1>
        <p>
          Emissão fiscal, rotinas fiscais e integrações externas continuam planejadas para uma etapa futura.
          Nesta fase, o admin apenas valida a loja, pedidos e preparação segura de produção.
        </p>
        <Link className="secondary-action" href="/admin">
          Voltar ao painel
        </Link>
      </section>
    </main>
  );
}
