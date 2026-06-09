import type { ShippingManualRule } from "../types";

type Props = {
  action: (formData: FormData) => Promise<void>;
  rule?: ShippingManualRule | null;
};

export function ShippingRuleForm({ action, rule }: Props) {
  return (
    <form action={action} className="product-form">
      {rule ? <input type="hidden" name="id" value={rule.id} /> : null}
      <section className="form-panel">
        <div className="form-panel__header">
          <h2>Regra manual</h2>
          <p className="muted">Sem transportadora real, sem credenciais e sem painel avançado.</p>
        </div>
        <div className="form-grid">
          <label className="form-field">
            <span>Nome</span>
            <input name="name" defaultValue={rule?.name ?? ""} required />
          </label>
          <label className="form-field">
            <span>UF</span>
            <input name="uf" defaultValue={rule?.uf ?? ""} maxLength={2} />
          </label>
          <label className="form-field">
            <span>CEP inicial</span>
            <input name="postalCodeStart" defaultValue={rule?.postalCodeStart ?? ""} />
          </label>
          <label className="form-field">
            <span>CEP final</span>
            <input name="postalCodeEnd" defaultValue={rule?.postalCodeEnd ?? ""} />
          </label>
          <label className="form-field">
            <span>Valor em centavos</span>
            <input name="priceCents" type="number" min="0" defaultValue={rule?.priceCents ?? 1290} />
          </label>
          <label className="form-field">
            <span>Prazo em dias</span>
            <input name="estimatedDays" type="number" min="0" defaultValue={rule?.estimatedDays ?? 5} />
          </label>
          <label className="form-field">
            <span>Prioridade</span>
            <input name="priority" type="number" defaultValue={rule?.priority ?? 0} />
          </label>
        </div>
        <label className="checkbox-field">
          <input name="isActive" type="checkbox" defaultChecked={rule?.isActive ?? true} />
          <span>Ativo</span>
        </label>
      </section>
      <div className="form-actions">
        <button type="submit">{rule ? "Salvar regra" : "Criar regra"}</button>
      </div>
    </form>
  );
}
