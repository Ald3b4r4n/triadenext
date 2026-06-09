import Link from "next/link";
import { ShippingRuleTable } from "@/features/shipping/components/shipping-rule-table";
import { listShippingRulesAction } from "@/features/shipping/server/admin-shipping-actions";

export default async function AdminFretePage() {
  const result = await listShippingRulesAction();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin minimo</p>
        <h1>Frete manual</h1>
        <p>Regras simples por UF ou faixa de CEP, sem transportadoras externas, contratos ou SLA avançado.</p>
        <Link className="primary-action" href="/admin/frete/novo">
          Nova regra
        </Link>
      </section>

      {result.status === "success" && result.rules ? (
        <ShippingRuleTable rules={result.rules} />
      ) : (
        <div className="form-message form-message--error" role="status">
          {result.message}
        </div>
      )}
    </main>
  );
}
