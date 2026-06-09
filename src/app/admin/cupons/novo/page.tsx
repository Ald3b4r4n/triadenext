import { CouponForm } from "@/features/coupons/components/coupon-form";
import { createCouponFormAction } from "@/features/coupons/server/admin-coupon-actions";

export default function NovoCupomPage() {
  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin mínimo</p>
        <h1>Novo cupom</h1>
      </section>
      <CouponForm action={createCouponFormAction} />
    </main>
  );
}
