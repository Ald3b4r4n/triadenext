import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { ShippingManualRule } from "../types";

type Props = { rules: ShippingManualRule[] };

export function ShippingRuleTable({ rules }: Props) {
  if (rules.length === 0) {
    return (
      <div className="placeholder-panel">
        <p className="muted">Admin minimo</p>
        <h2>Nenhuma regra manual cadastrada</h2>
      </div>
    );
  }

  return (
    <div className="admin-table" role="table" aria-label="Frete manual">
      <div className="admin-table__row admin-table__row--shipping admin-table__row--head" role="row">
        <span>Nome</span>
        <span>UF / CEP</span>
        <span>Valor</span>
        <span>Status</span>
        <span>Acoes</span>
      </div>
      {rules.map((rule) => (
        <div className="admin-table__row admin-table__row--shipping" role="row" key={rule.id}>
          <div>
            <strong>{rule.name}</strong>
            <small>Prioridade {rule.priority}</small>
          </div>
          <div>
            {rule.uf ?? `${rule.postalCodeStart ?? "---"} - ${rule.postalCodeEnd ?? "---"}`}
          </div>
          <div>{formatMoney(rule.priceCents)}</div>
          <div className="status-badge status-badge--draft">{rule.isActive ? "ativo" : "inativo"}</div>
          <Link className="text-action" href={`/admin/frete/${rule.id}/editar`}>
            Editar
          </Link>
        </div>
      ))}
    </div>
  );
}
