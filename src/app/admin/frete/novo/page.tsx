import { redirect } from "next/navigation";
import { ShippingRuleForm } from "@/features/shipping/components/shipping-rule-form";
import {
  createShippingRuleFormAction,
  listShippingRulesAction
} from "@/features/shipping/server/admin-shipping-actions";

export default async function NovoFretePage() {
  const result = await listShippingRulesAction();
  if (result.status === "blocked") {
    redirect("/admin/frete");
  }

  return (
    <main className="page-shell">
      <section className="page-intro">
        <p className="muted">Admin minimo</p>
        <h1>Nova regra de frete</h1>
      </section>
      <ShippingRuleForm action={createShippingRuleFormAction} />
    </main>
  );
}
