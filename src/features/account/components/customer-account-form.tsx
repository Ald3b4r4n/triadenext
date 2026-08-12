import { saveCustomerAccountAction } from "../server/account-actions";
import type { CustomerAccountData } from "../server/account-repository";

export function CustomerAccountForm({ data }: { data: CustomerAccountData | null }) {
  return (
    <section className="account-profile-card" aria-labelledby="account-profile-title">
      <header><div><p className="muted">Cadastro para compra</p><h2 id="account-profile-title">Dados pessoais e fiscais</h2></div><p>Usados na entrega e na emissão da nota fiscal.</p></header>
      <form action={saveCustomerAccountAction}>
        <label><span>Nome completo</span><input name="fullName" required defaultValue={data?.fullName} autoComplete="name" /></label>
        <label><span>Telefone</span><input name="phone" required defaultValue={data?.phone} placeholder="(00) 00000-0000" autoComplete="tel" /></label>
        <label><span>Tipo de documento</span><select name="documentType" defaultValue={data?.documentType ?? "cpf"}><option value="cpf">CPF</option><option value="cnpj">CNPJ</option></select></label>
        <label><span>CPF ou CNPJ</span><input name="documentNumber" required defaultValue={data?.documentNumber} inputMode="numeric" /></label>
        <label><span>Data de nascimento <small>(opcional para CNPJ)</small></span><input name="birthDate" type="date" defaultValue={data?.birthDate} /></label>
        <label><span>Destinatário</span><input name="recipient" required defaultValue={data?.recipient} /></label>
        <label><span>CEP</span><input name="postalCode" required defaultValue={data?.postalCode} inputMode="numeric" /></label>
        <label><span>UF</span><input name="state" required maxLength={2} defaultValue={data?.state} /></label>
        <label><span>Cidade</span><input name="city" required defaultValue={data?.city} /></label>
        <label><span>Bairro</span><input name="district" required defaultValue={data?.district} /></label>
        <label className="account-profile-card__wide"><span>Logradouro</span><input name="street" required defaultValue={data?.street} /></label>
        <label><span>Número</span><input name="number" required defaultValue={data?.number} /></label>
        <label><span>Complemento</span><input name="complement" defaultValue={data?.complement} /></label>
        <button className="primary-action" type="submit">Salvar dados</button>
      </form>
    </section>
  );
}
