import { ShippingRuleForm } from "./shipping-rule-form";
import type { ShippingManualRule } from "../types";

type Props = {
  action: (formData: FormData) => Promise<void>;
  rule?: ShippingManualRule | null;
};

export function ShippingRuleEditor({ action, rule }: Props) {
  return <ShippingRuleForm action={action} rule={rule ?? null} />;
}
