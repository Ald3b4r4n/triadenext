import type { Coupon } from "../types";

type CouponFormProps = {
  action: (formData: FormData) => Promise<void>;
  coupon?: Coupon | null;
};

export function CouponForm({ action, coupon }: CouponFormProps) {
  return (
    <form action={action} className="product-form">
      {coupon ? <input type="hidden" name="id" value={coupon.id} /> : null}
      <section className="form-panel">
        <div className="form-panel__header">
          <h2>Dados básicos</h2>
          <p className="muted">
            Admin mínimo: sem campanhas avançadas, relatórios, limite por usuário ou restrição por produto.
          </p>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>Código</span>
            <input name="code" defaultValue={coupon?.code ?? ""} required />
          </label>
          <label className="form-field">
            <span>Tipo</span>
            <select name="type" defaultValue={coupon?.type ?? "percentage"}>
              <option value="percentage">Percentual</option>
              <option value="fixed_amount">Valor fixo em centavos</option>
              <option value="free_shipping">Frete grátis preparado</option>
            </select>
            <small>Frete grátis não calcula nem zera frete real nesta fase.</small>
          </label>
          <label className="form-field">
            <span>Valor</span>
            <input name="value" type="number" min="0" defaultValue={coupon?.value ?? 10} />
            <small>Percentual usa 1 a 100; valor fixo usa centavos.</small>
          </label>
          <label className="form-field">
            <span>Subtotal mínimo em centavos</span>
            <input
              name="minimumSubtotalCents"
              type="number"
              min="0"
              defaultValue={coupon?.minimumSubtotalCents ?? ""}
            />
          </label>
          <label className="form-field">
            <span>Início</span>
            <input name="startsAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon?.startsAt)} />
          </label>
          <label className="form-field">
            <span>Fim</span>
            <input name="endsAt" type="datetime-local" defaultValue={toDateTimeLocal(coupon?.endsAt)} />
          </label>
          <label className="form-field">
            <span>Limite global</span>
            <input name="maxUses" type="number" min="1" defaultValue={coupon?.maxUses ?? ""} />
            <small>Aplicar no carrinho não consome esse contador.</small>
          </label>
        </div>
        <label className="checkbox-field">
          <input name="isActive" type="checkbox" defaultChecked={coupon?.isActive ?? true} />
          <span>Ativo</span>
        </label>
      </section>
      <div className="form-actions">
        <button type="submit">{coupon ? "Salvar cupom" : "Criar cupom"}</button>
      </div>
    </form>
  );
}

function toDateTimeLocal(value: Date | null | undefined) {
  if (!value) {
    return "";
  }

  return value.toISOString().slice(0, 16);
}
