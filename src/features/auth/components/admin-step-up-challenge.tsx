"use client";

import { FormEvent, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { verifyAdminStepUpAction } from "../server/admin-step-up-actions";

export function AdminStepUpChallenge({ returnTo }: { returnTo: string }) {
  const [code, setCode] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage("");

    const result = await verifyAdminStepUpAction(code, returnTo);
    if (result.status === "error") {
      setMessage(result.message);
      setPending(false);
      return;
    }

    window.location.assign(result.returnTo);
  }

  return (
    <section className="security-card security-card--challenge">
      <div className="security-card__icon"><ShieldCheck aria-hidden="true" size={26} /></div>
      <p className="muted">Proteção administrativa</p>
      <h1>Confirme seu acesso</h1>
      <p>
        Digite o código atual do aplicativo autenticador. Esta confirmação protege somente a área
        administrativa.
      </p>

      <form onSubmit={handleSubmit}>
        <label>
          <span>Código do autenticador</span>
          <input
            autoComplete="one-time-code"
            autoFocus
            inputMode="numeric"
            maxLength={8}
            name="code"
            onChange={(event) => setCode(event.target.value)}
            placeholder="000 000"
            required
            value={code}
          />
        </label>
        {message ? <p className="form-message form-message--error" role="alert">{message}</p> : null}
        <button className="primary-action" disabled={pending || !code.trim()} type="submit">
          {pending ? "Verificando..." : "Acessar painel"}
        </button>
      </form>
      <p className="security-card__note">
        Esta confirmação permanece válida até você sair da conta ou encerrar o navegador.
      </p>
    </section>
  );
}
