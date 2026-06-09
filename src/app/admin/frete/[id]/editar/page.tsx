import { notFound } from "next/navigation";
import { ShippingRuleForm } from "@/features/shipping/components/shipping-rule-form";
import {
  listShippingRulesAction,
  updateShippingRuleFormAction
} from "@/features/shipping/server/admin-shipping-actions";

type Params = { params: { id: string } };

export default async function EditarFretePage({ params }: Params) {
  const { id } = params;
  const result = await listShippingRulesAction();
  if (result.status !== "success") {
    notFound();
  }
  const rule = result.rules?.find((item) => item.id === id) ?? null;
  if (!rule) {
    notFound();
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin minimo</p>
        <h1>Editar regra de frete</h1>
      </section>
      <ShippingRuleForm action={updateShippingRuleFormAction} rule={rule} />
    </main>
  );
}
