import { notFound } from "next/navigation";
import { CouponForm } from "@/features/coupons/components/coupon-form";
import { updateCouponFormAction } from "@/features/coupons/server/admin-coupon-actions";
import { findCouponById } from "@/features/coupons/server/coupon-service";

type EditarCupomPageProps = {
  params: Promise<{ id: string }>;
};

export default async function EditarCupomPage({ params }: EditarCupomPageProps) {
  const { id } = await params;
  const coupon = await findCouponById(id);

  if (!coupon) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin mínimo</p>
        <h1>Editar cupom</h1>
      </section>
      <CouponForm action={updateCouponFormAction} coupon={coupon} />
    </main>
  );
}
