import Link from "next/link";
import { CouponAdminTable } from "@/features/coupons/components/coupon-admin-table";
import { listCouponsAction } from "@/features/coupons/server/admin-coupon-actions";

export default async function AdminCuponsPage() {
  const result = await listCouponsAction();

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin mínimo</p>
        <h1>Cupons</h1>
        <p>
          Fundação de cupons globais para carrinho, sem campanhas avançadas, relatórios ou frete real.
        </p>
        <Link className="primary-action" href="/admin/cupons/novo">
          Novo cupom
        </Link>
      </section>

      {result.status === "success" && result.coupons ? (
        <CouponAdminTable coupons={result.coupons} />
      ) : (
        <div className="form-message form-message--error" role="status">
          {result.message}
        </div>
      )}
    </main>
  );
}
