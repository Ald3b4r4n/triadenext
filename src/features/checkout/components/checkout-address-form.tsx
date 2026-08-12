"use client";

import { useEffect, useRef, useState } from "react";
import { Check, LoaderCircle, MapPin } from "lucide-react";
import { createPendingOrderAndRedirect } from "../server/checkout-actions";
import { formatBrazilPhone } from "../phone";
import type { CustomerAccountData } from "@/features/account/server/account-repository";

type Address = {
  state: string;
  city: string;
  district: string;
  street: string;
};

type LookupStatus = "idle" | "loading" | "success" | "error";

export function CheckoutAddressForm({
  email,
  initialPostalCode
  ,initialData
}: {
  email: string;
  initialPostalCode: string;
  initialData: CustomerAccountData | null;
}) {
  const [postalCode, setPostalCode] = useState(formatPostalCode(initialPostalCode));
  const [phone, setPhone] = useState(formatBrazilPhone(initialData?.phone ?? ""));
  const [address, setAddress] = useState<Address>({
    state: initialData?.state ?? "",
    city: initialData?.city ?? "",
    district: initialData?.district ?? "",
    street: initialData?.street ?? ""
  });
  const [lookupStatus, setLookupStatus] = useState<LookupStatus>("idle");
  const numberRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const normalized = postalCode.replace(/\D/g, "");
    if (normalized.length !== 8) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setLookupStatus("loading");
      try {
        const response = await fetch(`/api/address/cep/${normalized}`, {
          signal: controller.signal
        });
        if (!response.ok) throw new Error("postal-code-not-found");

        const result = (await response.json()) as Address;
        setAddress(result);
        setLookupStatus("success");
        window.requestAnimationFrame(() => numberRef.current?.focus());
      } catch {
        if (controller.signal.aborted) return;
        setAddress({ state: "", city: "", district: "", street: "" });
        setLookupStatus("error");
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [postalCode]);

  const updateAddress = (field: keyof Address, value: string) => {
    setAddress((current) => ({ ...current, [field]: value }));
  };

  const updatePostalCode = (value: string) => {
    const formatted = formatPostalCode(value);
    setPostalCode(formatted);
    if (formatted.replace(/\D/g, "").length !== 8) {
      setLookupStatus("idle");
      setAddress({ state: "", city: "", district: "", street: "" });
    }
  };

  return (
    <form action={createPendingOrderAndRedirect} className="checkout-form">
      <div className="checkout-form__heading">
        <MapPin aria-hidden="true" size={22} />
        <div>
          <h2>Cliente e entrega</h2>
          <p className="muted">E-mail da conta: {email}</p>
        </div>
      </div>

      <label>
        <span>Nome completo</span>
        <input name="fullName" required minLength={3} defaultValue={initialData?.fullName} autoComplete="name" />
      </label>
      <label>
        <span>Telefone</span>
        <input
          name="phone"
          required
          value={phone}
          onChange={(event) => setPhone(formatBrazilPhone(event.target.value))}
          autoComplete="tel-national"
          inputMode="tel"
          maxLength={15}
          pattern="\(\d{2}\) \d{4,5}-\d{4}"
          placeholder="(00) 00000-0000"
          title="Informe o telefone com DDD."
        />
      </label>
      <label>
        <span>Destinatário, se diferente</span>
        <input name="recipient" defaultValue={initialData?.recipient} autoComplete="shipping name" />
      </label>

      <div className="form-grid">
        <label>
          <span>CEP</span>
          <input
            name="postalCode"
            required
            value={postalCode}
            onChange={(event) => updatePostalCode(event.target.value)}
            autoComplete="shipping postal-code"
            inputMode="numeric"
            maxLength={9}
          />
        </label>
        <label>
          <span>UF</span>
          <input
            name="state"
            required
            maxLength={2}
            value={address.state}
            onChange={(event) => updateAddress("state", event.target.value.toUpperCase())}
            autoComplete="shipping address-level1"
          />
        </label>
      </div>

      <div className={`postal-code-status postal-code-status--${lookupStatus}`} role="status" aria-live="polite">
        {lookupStatus === "loading" ? (
          <><LoaderCircle aria-hidden="true" className="postal-code-status__spinner" size={17} /> Buscando endereço…</>
        ) : lookupStatus === "success" ? (
          <><Check aria-hidden="true" size={17} /> Endereço preenchido. Informe o número.</>
        ) : lookupStatus === "error" ? (
          "CEP não encontrado. Confira o número ou preencha o endereço manualmente."
        ) : (
          "Digite os 8 números do CEP para preencher o endereço."
        )}
      </div>

      <label>
        <span>Cidade</span>
        <input name="city" required value={address.city} onChange={(event) => updateAddress("city", event.target.value)} autoComplete="shipping address-level2" />
      </label>
      <label>
        <span>Bairro</span>
        <input name="district" required value={address.district} onChange={(event) => updateAddress("district", event.target.value)} autoComplete="shipping address-level3" />
      </label>
      <label>
        <span>Logradouro</span>
        <input name="street" required value={address.street} onChange={(event) => updateAddress("street", event.target.value)} autoComplete="shipping address-line1" />
      </label>
      <div className="form-grid">
        <label>
          <span>Número</span>
          <input ref={numberRef} name="number" required defaultValue={initialData?.number} autoComplete="shipping address-line2" />
        </label>
        <label>
          <span>Complemento <small>(opcional)</small></span>
          <input name="complement" defaultValue={initialData?.complement} autoComplete="shipping address-line3" />
        </label>
      </div>
      <button className="primary-action" type="submit">
        Continuar para o pagamento
      </button>
    </form>
  );
}

function formatPostalCode(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}
