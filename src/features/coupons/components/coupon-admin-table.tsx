import Link from "next/link";
import { formatMoney } from "@/lib/money";
import type { CouponView } from "../types";

type CouponAdminTableProps = {
  coupons: CouponView[];
};

export function CouponAdminTable({ coupons }: CouponAdminTableProps) {
  if (coupons.length === 0) {
    return (
      <div className="placeholder-panel">
        <p className="muted">Admin mínimo</p>
        <h2>Nenhum cupom cadastrado</h2>
        <p>Crie cupons básicos sem campanhas avançadas, relatórios ou restrições por produto.</p>
      </div>
    );
  }

  return (
    <div className="admin-table" role="table" aria-label="Cupons">
      <div className="admin-table__row admin-table__row--coupons admin-table__row--head" role="row">
        <span>Código</span>
        <span>Tipo</span>
        <span>Status</span>
        <span>Uso</span>
        <span>Ações</span>
      </div>
      {coupons.map((coupon) => (
        <div className="admin-table__row admin-table__row--coupons" role="row" key={coupon.id}>
          <div>
            <strong>{coupon.code}</strong>
            {coupon.minimumSubtotalCents !== null ? (
              <small>Mínimo: {formatMoney(coupon.minimumSubtotalCents)}</small>
            ) : null}
          </div>
          <div>
            {coupon.valueLabel}
            {coupon.isPreparedBenefit ? (
              <small>Preparado: não aplica frete real nesta fase.</small>
            ) : null}
          </div>
          <span className="status-badge status-badge--draft">{coupon.status}</span>
          <span>
            {coupon.usedCount}
            {coupon.maxUses !== null ? `/${coupon.maxUses}` : ""}
          </span>
          <Link className="text-action" href={`/admin/cupons/${coupon.id}/editar`}>
            Editar
          </Link>
        </div>
      ))}
    </div>
  );
}
