"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { Check, LoaderCircle } from "lucide-react";
import { formatBrazilPhone } from "@/features/checkout/phone";
import {
  saveCustomerAccountAction,
  type CustomerAccountActionState
} from "../server/account-actions";
import type { CustomerAccountData } from "../server/account-repository";

type DocumentType = "cpf" | "cnpj";
type Address = Pick<CustomerAccountData, "state" | "city" | "district" | "street">;
type LookupStatus = "idle" | "loading" | "success" | "error";

export function CustomerAccountForm({
  data,
  returnTo
}: {
  data: CustomerAccountData | null;
  returnTo?: string;
}) {
  const initialActionState: CustomerAccountActionState = { status: "idle", message: "" };
  const [saveState, saveAction, savePending] = useActionState(
    saveCustomerAccountAction,
    initialActionState
  );
  const [documentType, setDocumentType] = useState<DocumentType>(data?.documentType ?? "cpf");
  const [documentNumber, setDocumentNumber] = useState(() => formatDocument(data?.documentNumber ?? "", data?.documentType ?? "cpf"));
  const [phone, setPhone] = useState(() => formatBrazilPhone(data?.phone ?? ""));
  const [postalCode, setPostalCode] = useState(() => formatPostalCode(data?.postalCode ?? ""));
  const [address, setAddress] = useState<Address>({
    state: data?.state ?? "",
    city: data?.city ?? "",
    district: data?.district ?? "",
    street: data?.street ?? ""
  });
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const numberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const normalized = postalCode.replace(/\D/g, "");
    if (normalized.length !== 8) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLookupStatus("loading");
      try {
        const response = await fetch(`/api/address/cep/${normalized}`, { signal: controller.signal });
        if (!response.ok) throw new Error("postal-code-not-found");
        const result = (await response.json()) as Address;
        setAddress(result);
        setLookupStatus("success");
        window.requestAnimationFrame(() => numberRef.current?.focus());
      } catch {
        if (controller.signal.aborted) return;
        setLookupStatus("error");
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [postalCode]);

  const updateDocumentType = (value: DocumentType) => {
    setDocumentType(value);
    setDocumentNumber((current) => formatDocument(current, value));
  };

  const updatePostalCode = (value: string) => {
    const formatted = formatPostalCode(value);
    setPostalCode(formatted);
    if (formatted.replace(/\D/g, "").length !== 8) setLookupStatus("idle");
  };

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  return (
    <section className="account-profile-card" aria-labelledby="account-profile-title">
      <header><div><p className="muted">Cadastro para compra</p><h2 id="account-profile-title">Dados pessoais e fiscais</h2></div><p>Usados na entrega e na emissão da nota fiscal.</p></header>
      <form action={saveAction}>
        {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
        <label><span>Nome completo</span><input name="fullName" required defaultValue={data?.fullName} autoComplete="name" /></label>
        <label><span>Telefone</span><input name="phone" required value={phone} onChange={(event) => setPhone(formatBrazilPhone(event.target.value))} placeholder="(00) 00000-0000" autoComplete="tel-national" inputMode="tel" maxLength={15} pattern="\(\d{2}\) \d{4,5}-\d{4}" /></label>
        <label><span>Tipo de documento</span><select name="documentType" value={documentType} onChange={(event) => updateDocumentType(event.target.value as DocumentType)}><option value="cpf">CPF</option><option value="cnpj">CNPJ</option></select></label>
        <label><span>{documentType === "cpf" ? "CPF" : "CNPJ"}</span><input name="documentNumber" required value={documentNumber} onChange={(event) => setDocumentNumber(formatDocument(event.target.value, documentType))} inputMode="numeric" maxLength={documentType === "cpf" ? 14 : 18} placeholder={documentType === "cpf" ? "000.000.000-00" : "00.000.000/0000-00"} /></label>
        <label><span>Data de nascimento <small>(opcional para CNPJ)</small></span><input name="birthDate" type="date" defaultValue={data?.birthDate} /></label>
        <label><span>Destinatário</span><input name="recipient" required defaultValue={data?.recipient} /></label>
        <label><span>CEP</span><input name="postalCode" required value={postalCode} onChange={(event) => updatePostalCode(event.target.value)} inputMode="numeric" maxLength={9} placeholder="00000-000" autoComplete="postal-code" /></label>
        <label><span>UF</span><input name="state" required maxLength={2} value={address.state} onChange={(event) => updateAddress("state", event.target.value.toUpperCase())} autoComplete="address-level1" /></label>

        <div className={`postal-code-status account-profile-card__wide postal-code-status--${lookupStatus}`} role="status" aria-live="polite">
          {lookupStatus === "loading" ? <><LoaderCircle aria-hidden="true" className="postal-code-status__spinner" size={17} /> Buscando endereço…</> : null}
          {lookupStatus === "success" ? <><Check aria-hidden="true" size={17} /> Endereço preenchido. Informe o número.</> : null}
          {lookupStatus === "error" ? "CEP não encontrado. Confira o número ou preencha o endereço manualmente." : null}
          {lookupStatus === "idle" ? "Digite os 8 números do CEP para preencher o endereço automaticamente." : null}
        </div>

        <label><span>Cidade</span><input name="city" required value={address.city} onChange={(event) => updateAddress("city", event.target.value)} autoComplete="address-level2" /></label>
        <label><span>Bairro</span><input name="district" required value={address.district} onChange={(event) => updateAddress("district", event.target.value)} autoComplete="address-level3" /></label>
        <label className="account-profile-card__wide"><span>Logradouro</span><input name="street" required value={address.street} onChange={(event) => updateAddress("street", event.target.value)} autoComplete="address-line1" /></label>
        <label><span>Número</span><input ref={numberRef} name="number" required defaultValue={data?.number} autoComplete="address-line2" /></label>
        <label><span>Complemento</span><input name="complement" defaultValue={data?.complement} autoComplete="address-line3" /></label>
        <div className="account-profile-card__actions account-profile-card__wide">
          <button className="primary-action" type="submit" disabled={savePending}>
            {savePending ? <LoaderCircle aria-hidden="true" className="postal-code-status__spinner" size={17} /> : null}
            {savePending ? "Salvando…" : "Salvar dados"}
          </button>
          {saveState.message ? (
            <p
              className={`form-message ${saveState.status === "success" ? "form-message--success" : "form-message--error"}`}
              role="status"
              aria-live="polite"
            >
              {saveState.message}
            </p>
          ) : null}
        </div>
      </form>
    </section>
  );
}

export function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

export function formatDocument(value: string, type: DocumentType) {
  const digits = value.replace(/\D/g, "").slice(0, type === "cpf" ? 11 : 14);
  if (type === "cpf") {
    return digits
      .replace(/^(\d{3})(\d)/, "$1.$2")
      .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1-$2");
  }
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\/\d{4})(\d)/, "$1-$2");
}
